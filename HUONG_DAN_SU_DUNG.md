# 📖 HƯỚNG DẪN SỬ DỤNG EDUGEN VN

## 🚀 Cài đặt & Chạy ứng dụng

### Bước 1: Cài đặt thư viện
Mở terminal/command prompt và chạy:
```bash
npm install
```

### Bước 2: Lấy API Key từ Google
1. Truy cập: https://makersuite.google.com/app/apikey
2. Đăng nhập bằng tài khoản Google
3. Nhấn "Create API Key" 
4. Copy API key vừa tạo

### Bước 3: Cấu hình API Key
Mở file `.env.local` và điền API key:
```
GEMINI_API_KEY=AIzaSy... (dán key của bạn vào đây)
```

### Bước 4: Chạy ứng dụng
```bash
npm run dev
```

Mở trình duyệt và vào: http://localhost:3000

## 📝 Cách sử dụng

### Dành cho Giáo viên - Tạo đề thi

#### 1. Upload tài liệu
- Kéo thả file PDF vào ô "Tải tài liệu lên"
- Hoặc click vào ô để chọn file
- File PDF phải có text (không phải ảnh scan)

#### 2. Chọn cấu hình
**Chế độ thi:**
- ✓ Trắc nghiệm Tiêu chuẩn: Câu hỏi 4 đáp án A, B, C, D
- ✓ Format THPT 2025: Câu hỏi dạng Đúng/Sai với 4 mệnh đề

**Số lượng câu hỏi:**
- Nhập số từ 1-50 (mặc định: 10)

**Chế độ ôn tập:**
- Tắt: Chỉ tạo câu hỏi để in
- Bật: Có thêm giải thích và flashcard

#### 3. Tạo câu hỏi
- Nhấn nút "Tạo câu hỏi bằng AI"
- Chờ 5-10 giây để AI xử lý
- Câu hỏi sẽ hiện ra bên dưới

#### 4. Chỉnh sửa (nếu cần)
- Nhấn "Sửa" để chỉnh sửa câu hỏi
- Nhấn "Xóa" để xóa câu không mong muốn
- Có thể chọn lại đáp án đúng

#### 5. Xuất file Word
- Nhấn "Xuất file Word"
- File .docx sẽ tự động tải về
- Mở file bằng Microsoft Word để kiểm tra
- In hoặc gửi cho học sinh

**Cấu trúc file Word:**
- Trang 1: Đề thi (không có đáp án)
- Trang 2: Đáp án và hướng dẫn giải

### Dành cho Học sinh - Ôn tập

#### 1. Upload tài liệu cần học
- Upload file PDF như hướng dẫn trên

#### 2. Bật chế độ ôn tập
- Bật công tắc "Kích hoạt Ôn tập (Anki Mode)"

#### 3. Tạo flashcard
- Chọn loại câu hỏi
- Nhấn "Tạo câu hỏi bằng AI"

#### 4. Học bằng Flashcard
- Thẻ học sẽ hiện ở dưới cùng
- Click vào thẻ để lật và xem đáp án
- Đọc giải thích và gợi ý

#### 5. Đánh giá mức độ nhớ
Sau khi xem đáp án, chọn 1 trong 4 nút:
- **Quên**: Không nhớ gì, cần học lại
- **Khó**: Nhớ được nhưng mất thời gian
- **Được**: Nhớ khá nhanh
- **Dễ**: Nhớ rất rõ, như in

## 💡 Mẹo sử dụng

### Để có câu hỏi chất lượng cao:
1. Chọn PDF có nội dung rõ ràng, có cấu trúc
2. Tránh PDF quá ngắn (dưới 1 trang)
3. Nên tạo 5-10 câu một lần (không nên quá 20)
4. Luôn xem lại và chỉnh sửa câu hỏi AI tạo ra

### Để học hiệu quả với Flashcard:
1. Bật chế độ Ôn tập trước khi tạo câu hỏi
2. Đọc kỹ giải thích và gợi ý
3. Đánh giá trung thực mức độ nhớ
4. Ôn lại những thẻ đánh "Quên" hoặc "Khó"
5. Ôn đều đặn mỗi ngày 15-30 phút

### Để xuất file Word đẹp:
1. Kiểm tra và sửa lỗi chính tả trước khi xuất
2. Xóa các câu hỏi trùng lặp hoặc không phù hợp
3. Đảm bảo đáp án đã chọn đúng
4. Có thể copy nội dung từ file Word sang template khác nếu muốn

## ⚠️ Xử lý lỗi thường gặp

### Lỗi: "Gemini API key not configured"
**Nguyên nhân:** Chưa cấu hình API key
**Giải pháp:** 
1. Kiểm tra file `.env.local` đã tồn tại
2. Đảm bảo có dòng `GEMINI_API_KEY=...`
3. Restart lại server (Ctrl+C rồi chạy `npm run dev` lại)

### Lỗi: "Could not extract text from PDF"
**Nguyên nhân:** PDF chất lượng thấp, hoặc Gemini không đọc được
**Giải pháp:**
1. Sử dụng PDF có văn bản rõ ràng
2. Tránh PDF ảnh scan chất lượng thấp
3. Thử file PDF khác

### Lỗi: "Failed to generate questions"
**Nguyên nhân:** 
- API key hết hạn hoặc không hợp lệ
- Mất kết nối internet
- PDF quá dài

**Giải pháp:**
1. Kiểm tra kết nối internet
2. Thử lại sau vài giây
3. Kiểm tra API key còn hiệu lực
4. Nếu PDF dài, thử giảm số câu hỏi xuống

### Upload file không thành công
**Giải pháp:**
1. Chỉ upload file PDF (không phải Word, PowerPoint, ảnh)
2. File không quá lớn (dưới 10MB)
3. Đảm bảo file không bị hỏng (mở thử trước)

## 📞 Hỗ trợ

Nếu gặp vấn đề khác, vui lòng:
1. Đọc file README.md để biết thêm chi tiết
2. Kiểm tra file TECHNICAL.md cho thông tin kỹ thuật
3. Tạo issue trên GitHub repository

## 📌 Lưu ý quan trọng

1. **API Key**: Giữ bí mật, không chia sẻ API key
2. **Internet**: Cần kết nối internet để AI hoạt động
3. **Chất lượng**: Luôn kiểm tra lại câu hỏi AI tạo ra
4. **Bản quyền**: Chỉ sử dụng tài liệu có quyền sử dụng

---

🎓 Chúc bạn sử dụng EduGen VN thành công!
Powered by Google Gemini AI ✨
