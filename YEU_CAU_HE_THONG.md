# DANH SÁCH YÊU CẦU HỆ THỐNG (SYSTEM REQUIREMENTS)

## 1. Yêu cầu Chức năng (Functional Requirements - FR)

Đây là các tính năng cụ thể mà hệ thống cung cấp cho người dùng cuối.

### 1.1. Quản lý Tài khoản (User Management)
*   **FR-01: Đăng ký & Đăng nhập:** Người dùng có thể tạo tài khoản mới và đăng nhập vào hệ thống bằng Email và Mật khẩu.
*   **FR-02: Quản lý phiên làm việc:** Hệ thống duy trì trạng thái đăng nhập của người dùng qua các phiên làm việc (Session).
*   **FR-03: Cài đặt cá nhân:** Người dùng có thể bật/tắt tính năng nhận email nhắc nhở học tập.

### 1.2. Quản lý Tài liệu & Nội dung (Content Management)
*   **FR-04: Tải lên tài liệu:** Người dùng có thể tải lên các file tài liệu định dạng PDF, DOCX, TXT.
*   **FR-05: Trích xuất nội dung:** Hệ thống tự động đọc và chuyển đổi nội dung từ file tải lên thành văn bản thô có thể xử lý được.
*   **FR-06: Quản lý danh sách file:** Người dùng có thể xem danh sách các tài liệu đã tải lên kèm trạng thái học tập.

### 1.3. Học tập & Ôn luyện (Learning & Review)
*   **FR-07: Sinh câu hỏi tự động (AI Generation):** Hệ thống sử dụng AI để tạo ra bộ câu hỏi trắc nghiệm từ nội dung tài liệu (On-the-fly generation).
*   **FR-08: Chế độ ôn tập FSRS:** Hệ thống tính toán và hiển thị các tài liệu cần ôn tập trong ngày dựa trên thuật toán Lặp lại ngắt quãng.
*   **FR-09: Đánh giá kết quả:** Người dùng có thể tự đánh giá mức độ ghi nhớ (Quên, Khó, Tốt, Dễ) sau mỗi lần ôn tập.
*   **FR-10: Cập nhật tiến độ:** Hệ thống tự động cập nhật ngày ôn tập tiếp theo dựa trên đánh giá của người dùng.

### 1.4. Trợ lý ảo AI (AI Chat Assistant)
*   **FR-11: Chat với tài liệu:** Người dùng có thể đặt câu hỏi liên quan đến nội dung tài liệu và nhận câu trả lời từ AI.
*   **FR-12: Ngữ cảnh hội thoại:** Trợ lý ảo hiểu và duy trì ngữ cảnh dựa trên nội dung tài liệu đang mở.

### 1.5. Hệ thống Nhắc nhở (Notification System)
*   **FR-13: Gửi Email tự động:** Hệ thống tự động gửi email nhắc nhở vào 9:00 sáng hàng ngày nếu có bài tập đến hạn.
*   **FR-14: Xuất đề thi:** Người dùng có thể xuất bộ câu hỏi ra file DOCX để in ấn hoặc lưu trữ.

---

## 2. Yêu cầu Phi chức năng (Non-Functional Requirements - NFR)

Đây là các tiêu chí về chất lượng, hiệu năng và ràng buộc của hệ thống.

### 2.1. Hiệu năng & Tốc độ (Performance)
*   **NFR-01: Thời gian phản hồi AI:** Thời gian sinh câu hỏi từ AI phải được tối ưu (sử dụng Gemini Flash) để không làm người dùng chờ đợi quá lâu (> 10s cho tài liệu dài).
*   **NFR-02: Tải trang:** Các trang chính (Dashboard, Quiz) phải sử dụng Server-Side Rendering để hiển thị nội dung tức thì (First Contentful Paint < 1.5s).

### 2.2. Bảo mật (Security)
*   **NFR-03: Mã hóa mật khẩu:** Mật khẩu người dùng không được lưu dạng rõ (plain text) mà phải được băm (hashing) bằng thuật toán Bcrypt.
*   **NFR-04: Xác thực API:** Các API quan trọng (Cron job, User data) phải được bảo vệ bằng Token và Cron Secret.
*   **NFR-05: An toàn dữ liệu:** Dữ liệu cá nhân và tài liệu của người dùng phải được phân tách, người này không thể truy cập dữ liệu của người kia.

### 2.3. Độ tin cậy & Sẵn sàng (Reliability & Availability)
*   **NFR-06: Xử lý lỗi:** Hệ thống phải có cơ chế xử lý lỗi (Graceful Degradation) khi API AI gặp sự cố (ví dụ: thông báo lỗi thân thiện thay vì crash trang web).
*   **NFR-07: Tự động hóa:** Tác vụ gửi email nhắc nhở phải hoạt động ổn định hàng ngày mà không cần can thiệp thủ công.

### 2.4. Khả năng tương thích & Giao diện (Compatibility & UX)
*   **NFR-08: Responsive Design:** Giao diện phải hiển thị tốt trên cả máy tính (Desktop) và thiết bị di động (Mobile/Tablet).
*   **NFR-09: Dễ sử dụng:** Quy trình từ lúc upload đến lúc học không được quá 3 bước thao tác.

### 2.5. Khả năng mở rộng (Scalability)
*   **NFR-10: Kiến trúc Serverless:** Hệ thống phải được thiết kế để có thể chạy trên môi trường Serverless (như Vercel), cho phép tự động mở rộng tài nguyên khi lượng truy cập tăng đột biến.
*   **NFR-11: Quản lý kết nối DB:** Phải áp dụng cơ chế Connection Pooling để tránh quá tải kết nối Database.
