import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/lib/models";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email và mật khẩu là bắt buộc" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Email không hợp lệ" },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Mật khẩu phải có ít nhất 6 ký tự" },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email đã được sử dụng" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create user (Unverified)
    const user = await User.create({
      email,
      password: hashedPassword,
      name: name || email.split("@")[0],
      isVerified: false,
      verificationToken: otp,
      verificationTokenExpires: otpExpires,
    });

    // Send verification email
    // Note: In production, you might want to use a queue, but here we await for simplicity
    // or run it in background without await if we don't want to block response
    try {
      const { sendVerificationEmail } = await import("@/lib/email");
      await sendVerificationEmail(email, otp);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // We still return success but maybe warn client? 
      // For now, let's assume it works or user can resend later.
    }

    return NextResponse.json(
      {
        message: "Đăng ký thành công. Vui lòng kiểm tra email để lấy mã xác thực.",
        requiresVerification: true,
        email: user.email,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi đăng ký" },
      { status: 500 }
    );
  }
}
