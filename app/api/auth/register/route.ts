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
    
    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    const hashedPassword = await bcrypt.hash(password, 10);

    let user;

    if (existingUser) {
      if (existingUser.isVerified) {
        return NextResponse.json(
          { error: "Email đã được sử dụng" },
          { status: 409 }
        );
      } else {
        // User exists but not verified -> Update info and resend OTP
        existingUser.password = hashedPassword;
        existingUser.name = name || email.split("@")[0];
        existingUser.verificationToken = otp;
        existingUser.verificationTokenExpires = otpExpires;
        // Refresh TTL index by updating createdAt effectively? 
        // No, TTL is based on createdAt. If we want to extend their time, we might need to recreate 
        // or just accept they have whatever time is left from the original hour, 
        // OR standard approach: The TTL cleans up eventually, but here we just revived them.
        // Actually, to extend TTL, we can reset createdAt if we really wanted, but for 1 hour TTL it's usually fine.
        await existingUser.save();
        user = existingUser;
      }
    } else {
      // Create new user (Unverified)
      user = await User.create({
        email,
        password: hashedPassword,
        name: name || email.split("@")[0],
        isVerified: false,
        verificationToken: otp,
        verificationTokenExpires: otpExpires,
      });
    }

    // Send verification email
    try {
      const { sendVerificationEmail } = await import("@/lib/email");
      await sendVerificationEmail(email, otp);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
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
