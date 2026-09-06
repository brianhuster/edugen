import nodemailer from 'nodemailer';
import type { FSRSState } from './models/File';

interface DueFile {
  _id: string;
  fileName: string;
  fsrsState: FSRSState;
  daysOverdue?: number;
}

/**
 * Create email transporter using Gmail SMTP
 */
function createTransporter() {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    throw new Error('Gmail credentials not configured. Please set GMAIL_USER and GMAIL_APP_PASSWORD in .env');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

/**
 * Generate HTML email body for reminder
 */
function generateReminderEmail(
  userName: string,
  dueFiles: DueFile[],
  appUrl: string
): string {
  const filesList = dueFiles
    .map((file) => {
      const overdueText = file.daysOverdue
        ? ` <span style="color: #dc2626; font-size: 12px; font-weight: bold; background: #fee2e2; padding: 3px 8px; border-radius: 12px; margin-left: 8px;">Quá hạn ${file.daysOverdue} ngày</span>`
        : '';
      return `<li style="margin-bottom: 12px; list-style: none;">
        <a href="${appUrl}/chat?fileId=${file._id}" style="display: block; padding: 16px; background: white; border: 1px solid #e5e7eb; border-radius: 8px; text-decoration: none; color: #374151;">
          <strong style="display: block; margin-bottom: 4px; color: #667eea; font-size: 16px;">${file.fileName}</strong>
          <span style="font-size: 14px;">Bấm vào đây để ôn tập ➔</span>${overdueText}
        </a>
      </li>`;
    })
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">📚 Nhắc nhở ôn tập</h1>
  </div>

  <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px; margin-bottom: 20px;">
      Xin chào <strong>${userName}</strong>,
    </p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      Bạn có <strong style="color: #667eea;">${dueFiles.length} tài liệu</strong> cần ôn tập hôm nay:
    </p>
    
    <ul style="padding: 0; margin: 0;">
      ${filesList}
    </ul>
    
    <p style="font-size: 16px; margin-top: 30px; margin-bottom: 20px; text-align: center;">
      Hãy dành một chút thời gian để ôn tập và củng cố kiến thức nhé! 💪
    </p>
    
    <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
    
    <p style="font-size: 14px; color: #6c757d; text-align: center; margin: 0;">
      Đây là email tự động từ <strong>EduGen VN</strong>.<br>
      Bạn có thể thay đổi cài đặt thông báo trong phần <a href="${appUrl}/settings" style="color: #667eea;">Cài đặt</a>.
    </p>
  </div>
</body>
</html>
  `.trim();
}

function generateVerificationEmail(otp: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">🔐 Xác thực tài khoản</h1>
  </div>
  
  <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px; margin-bottom: 20px;">
      Xin chào,
    </p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      Cảm ơn bạn đã đăng ký tài khoản tại <strong>EduGen VN</strong>. Để hoàn tất quá trình đăng ký, vui lòng sử dụng mã xác thực dưới đây:
    </p>
    
    <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
      <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #667eea;">${otp}</span>
    </div>
    
    <p style="font-size: 14px; color: #666; text-align: center;">
      Mã xác thực này sẽ hết hạn trong vòng 10 phút.
    </p>
    
    <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
    
    <p style="font-size: 14px; color: #6c757d; text-align: center; margin: 0;">
      Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.
    </p>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Send verification email
 */
export async function sendVerificationEmail(email: string, otp: string): Promise<boolean> {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"EduGen VN" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `Mã xác thực đăng ký: ${otp}`,
      html: generateVerificationEmail(otp),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Verification email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Failed to send verification email:', error);
    return false;
  }
}

/**
 * Send reminder email to user
 */
export async function sendReminderEmail(
  userEmail: string,
  userName: string,
  dueFiles: DueFile[]
): Promise<boolean> {
  try {
    const transporter = createTransporter();
    const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

    const mailOptions = {
      from: `"EduGen VN" <${process.env.GMAIL_USER}>`,
      to: userEmail,
      subject: `📚 Bạn có ${dueFiles.length} tài liệu cần ôn tập hôm nay`,
      html: generateReminderEmail(userName, dueFiles, appUrl),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Reminder email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Failed to send reminder email:', error);
    return false;
  }
}

/**
 * Test email configuration
 */
export async function testEmailConfig(): Promise<boolean> {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('Email configuration is valid');
    return true;
  } catch (error) {
    console.error('Email configuration is invalid:', error);
    return false;
  }
}
