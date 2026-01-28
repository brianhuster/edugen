import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/lib/models";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email và mã xác thực là bắt buộc" },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { error: "Người dùng không tồn tại" },
        { status: 404 }
      );
    }

    if (user.isVerified) {
      return NextResponse.json(
        { message: "Tài khoản đã được xác thực trước đó" },
        { status: 200 }
      );
    }

    if (user.verificationToken !== otp) {
      return NextResponse.json(
        { error: "Mã xác thực không chính xác" },
        { status: 400 }
      );
    }

    if (user.verificationTokenExpires && user.verificationTokenExpires < new Date()) {
      return NextResponse.json(
        { error: "Mã xác thực đã hết hạn" },
        { status: 400 }
      );
    }

    // Verify user
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    return NextResponse.json(
      { message: "Xác thực tài khoản thành công" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi xác thực" },
      { status: 500 }
    );
  }
}
