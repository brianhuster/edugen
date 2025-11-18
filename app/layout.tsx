import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EduGen VN - Hệ sinh thái Tạo đề thi & Ôn tập Thông minh',
  description: 'Tạo đề thi trắc nghiệm và flashcard từ tài liệu PDF với AI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
