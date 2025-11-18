# EduGen VN - Quick Start Guide

## 🚀 Bắt đầu nhanh

### 1. Cài đặt dependencies
```bash
npm install
```

### 2. Cấu hình Google Gemini API Key

Lấy API key miễn phí từ: https://makersuite.google.com/app/apikey

Tạo file `.env.local`:
```bash
GEMINI_API_KEY=your_api_key_here
```

### 3. Chạy development server
```bash
npm run dev
```

Mở trình duyệt: http://localhost:3000

## 📝 Hướng dẫn sử dụng ngắn gọn

1. **Tải PDF** - Kéo thả file PDF vào ô upload
2. **Chọn chế độ** - Trắc nghiệm hoặc THPT 2025
3. **Bật Study Mode** (tùy chọn) - Để có giải thích và flashcard
4. **Tạo câu hỏi** - Nhấn nút "Tạo câu hỏi bằng AI"
5. **Chỉnh sửa** - Sửa câu hỏi nếu cần
6. **Xuất file** - Nhấn "Xuất file Word" để download

## 🎯 Tính năng

✅ Upload PDF và trích xuất text
✅ Tạo câu hỏi tự động với Google Gemini AI
✅ 2 loại format: Tiêu chuẩn (A,B,C,D) & THPT 2025 (Đúng/Sai)
✅ Chỉnh sửa câu hỏi trực tiếp
✅ Xuất file Word (.docx) định dạng chuyên nghiệp
✅ Flashcard học tập (Anki-style)
✅ Đánh giá mức độ nhớ: Quên/Khó/Được/Dễ

## 🛠️ Commands

```bash
npm run dev      # Chạy development server
npm run build    # Build production
npm run start    # Chạy production server
npm run lint     # Kiểm tra lỗi code
```

## ⚙️ Yêu cầu hệ thống

- Node.js 18+
- NPM hoặc Yarn
- Trình duyệt hiện đại (Chrome, Firefox, Safari, Edge)

## 📦 Công nghệ

- Next.js 15 + React 19
- TypeScript
- Tailwind CSS 4
- Google Gemini API
- pdf-parse
- docx

## 🐛 Xử lý lỗi

**API Key không hoạt động?**
- Kiểm tra `.env.local` file
- Restart development server sau khi thêm API key

**PDF không đọc được?**
- Đảm bảo PDF có text (không phải ảnh scan)
- Thử file PDF khác

**Build lỗi?**
- Chạy `npm install` lại
- Xóa folder `.next` và build lại

## 📄 License

MIT License - Free to use

---

Made with ❤️ using Google Gemini AI
