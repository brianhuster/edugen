# EduGen VN - Hệ sinh thái Tạo đề thi & Ôn tập Thông minh

Ứng dụng web giúp chuyển đổi tài liệu học tập PDF thành nội dung tương tác với AI Engine Google Gemini.

## 🎯 Tính năng chính

### Module 1: Quản lý Đầu vào & Cấu hình
- ✅ Upload file PDF (hỗ trợ kéo thả)
- ✅ Trích xuất văn bản từ PDF
- ✅ Chọn chế độ thi:
  - Trắc nghiệm Tiêu chuẩn (4 đáp án A, B, C, D)
  - Format THPT 2025 (Câu hỏi chùm Đúng/Sai)
- ✅ Bật/tắt chế độ ôn tập (Anki Mode)

### Module 2: Xử lý Thông minh (Google Gemini AI)
- ✅ Tự động tạo câu hỏi từ nội dung PDF
- ✅ Đầu ra cấu trúc JSON
- ✅ Tạo giải thích chi tiết và gợi ý (khi bật Study Mode)

### Module 3: Trình soạn thảo & Xuất bản
- ✅ Hiển thị danh sách câu hỏi
- ✅ Chỉnh sửa thủ công câu hỏi và đáp án
- ✅ Xóa câu hỏi không mong muốn
- ✅ Xuất file Word (.docx) với định dạng chuyên nghiệp
  - Phần đề thi (không hiện đáp án)
  - Phần đáp án và hướng dẫn chấm (có ngắt trang)

### Module 4: Góc Ôn tập (Flashcard)
- ✅ Giao diện flashcard lật thẻ
- ✅ Hiển thị câu hỏi và đáp án
- ✅ Hệ thống đánh giá Anki-style:
  - Quên (Again)
  - Khó (Hard)
  - Được (Good)
  - Dễ (Easy)

### Module 5: Yêu cầu Phi chức năng
- ✅ API Key được bảo mật phía server
- ✅ Loading state rõ ràng
- ✅ Giao diện sạch sẽ, tối giản
- ✅ Responsive design

## 🚀 Cài đặt

### Yêu cầu hệ thống
- Node.js 18+ 
- NPM hoặc Yarn

### Bước 1: Clone hoặc tải project

```bash
cd do-an-vr-ar
```

### Bước 2: Cài đặt dependencies

```bash
npm install
```

### Bước 3: Cấu hình API Key

1. Lấy API Key từ Google AI Studio: https://makersuite.google.com/app/apikey
2. Tạo file `.env.local` từ template:

```bash
cp .env.local.example .env.local
```

3. Mở file `.env.local` và thêm API key:

```env
GEMINI_API_KEY=your_actual_api_key_here
```

### Bước 4: Chạy ứng dụng

```bash
npm run dev
```

Mở trình duyệt và truy cập: http://localhost:3000

## 📖 Hướng dẫn sử dụng

### Dành cho Giáo viên (Tạo đề thi)

1. **Tải tài liệu PDF** lên hệ thống
2. **Chọn chế độ thi**: Trắc nghiệm Tiêu chuẩn hoặc THPT 2025
3. **Đặt số lượng câu hỏi** mong muốn
4. **Nhấn "Tạo câu hỏi bằng AI"** và chờ 5-10 giây
5. **Chỉnh sửa câu hỏi** nếu cần (sửa lỗi chính tả, đáp án)
6. **Xuất file Word** để in ấn

### Dành cho Người học (Ôn tập)

1. **Tải tài liệu PDF** lên hệ thống
2. **Bật "Chế độ Ôn tập"** (toggle Anki Mode)
3. **Tạo câu hỏi** như bình thường
4. **Sử dụng Flashcard**:
   - Nhấp vào thẻ để lật và xem đáp án
   - Đánh giá mức độ nhớ: Quên/Khó/Được/Dễ
   - Hệ thống sẽ lưu lại đánh giá của bạn

## 🛠️ Công nghệ sử dụng

- **Framework**: Next.js 15+ (React 19)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI Engine**: Google Gemini API (@google/generative-ai)
- **Document Generator**: docx
- **Deployment**: Vercel (khuyến nghị)

## 📁 Cấu trúc thư mục

```
├── app/
│   ├── api/
│   │   ├── upload/route.ts       # API xử lý upload PDF
│   │   ├── generate/route.ts     # API tạo câu hỏi với Gemini
│   │   └── export/route.ts       # API xuất file Word
│   ├── components/
│   │   ├── FileUpload.tsx        # Component upload file
│   │   ├── ConfigPanel.tsx       # Component cấu hình
│   │   ├── QuestionEditor.tsx    # Component chỉnh sửa câu hỏi
│   │   └── FlashcardStudy.tsx    # Component flashcard
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Main page
├── lib/
│   ├── types.ts                  # TypeScript type definitions
│   ├── gemini.ts                 # Gemini AI integration
│   └── docx-generator.ts         # Word document generator
├── public/                       # Static files
├── .env.local.example           # Environment variables template
├── .gitignore
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

## 🔐 Bảo mật

- API Key được lưu trong biến môi trường `.env.local` (không được commit lên Git)
- API Key chỉ được sử dụng ở server-side (API routes)
- Client không bao giờ truy cập trực tiếp vào API Key

## 🐛 Xử lý lỗi thường gặp

### Lỗi: "Gemini API key not configured"
- Kiểm tra file `.env.local` đã tồn tại và có chứa `GEMINI_API_KEY`
- Restart server sau khi thêm API key

### Lỗi: "Could not extract text from PDF"
- PDF có thể là ảnh scan chất lượng thấp
- Gemini không thể đọc được nội dung
- Thử sử dụng PDF khác có văn bản rõ ràng hơn

### Lỗi: "Failed to generate questions from AI"
- Kiểm tra kết nối internet
- Kiểm tra API Key còn hạn sử dụng
- Thử lại sau vài giây

## 📝 To-do / Tính năng tương lai

- [ ] Xuất file Anki (.apkg) để import vào ứng dụng Anki
- [ ] Lưu trữ lịch sử ôn tập dài hạn
- [ ] Hỗ trợ nhiều ngôn ngữ
- [ ] Hỗ trợ các loại file khác (DOCX, TXT)
- [ ] Tạo báo cáo tiến độ học tập
- [ ] Chia sẻ bộ câu hỏi với người khác

## 📄 License

MIT License - Tự do sử dụng cho mục đích học tập và thương mại.

## 👨‍💻 Đóng góp

Mọi đóng góp đều được chào đón! Vui lòng tạo Pull Request hoặc Issue trên GitHub.

## 📧 Liên hệ

Nếu có thắc mắc hoặc cần hỗ trợ, vui lòng tạo Issue trên GitHub repository.

---

**EduGen VN** - Powered by Google Gemini AI 🚀
