# Hướng Dẫn Sử Dụng Tính Năng Đăng Nhập/Đăng Ký

## Tổng Quan

Tính năng authentication đã được implement hoàn chỉnh với các chức năng:

- ✅ Đăng ký tài khoản mới
- ✅ Đăng nhập với email và password
- ✅ Đăng xuất
- ✅ Bảo vệ các routes yêu cầu authentication
- ✅ Quản lý session với NextAuth.js
- ✅ Hash password với bcryptjs

## Cấu Trúc Files Đã Tạo

### Authentication Core
- `lib/auth.ts` - NextAuth configuration với Credentials provider
- `types/next-auth.d.ts` - TypeScript type definitions cho NextAuth
- `middleware.ts` - Middleware để protect routes
- `app/components/providers/AuthProvider.tsx` - Session provider wrapper

### API Routes
- `app/api/auth/[...nextauth]/route.ts` - NextAuth API handler
- `app/api/auth/register/route.ts` - Đăng ký tài khoản mới

### UI Pages
- `app/login/page.tsx` - Trang đăng nhập
- `app/register/page.tsx` - Trang đăng ký
- `app/components/Header.tsx` - Header component với logout button

## Cách Sử Dụng

### 1. Đăng Ký Tài Khoản Mới

1. Truy cập http://localhost:3000/register
2. Nhập thông tin:
   - Họ tên (optional)
   - Email
   - Mật khẩu (tối thiểu 6 ký tự)
   - Xác nhận mật khẩu
3. Click "Đăng ký"
4. Sau khi đăng ký thành công, bạn sẽ được chuyển đến trang đăng nhập

### 2. Đăng Nhập

1. Truy cập http://localhost:3000/login
2. Nhập email và password
3. Click "Đăng nhập"
4. Sau khi đăng nhập thành công, bạn sẽ được chuyển đến /chat

### 3. Đăng Xuất

1. Trong trang /chat, click nút "Đăng xuất" ở góc trên bên phải
2. Bạn sẽ được đăng xuất và chuyển về trang đăng nhập

## Protected Routes

Các routes sau yêu cầu authentication:
- `/chat` - Trang chat chính
- Tất cả các routes khác ngoại trừ `/`, `/login`, `/register`

Nếu người dùng chưa đăng nhập và cố truy cập protected route, họ sẽ tự động được chuyển về `/login`.

## Environment Variables

Đảm bảo file `.env.local` có các biến sau:

```env
MONGODB_URI=mongodb://localhost:27017/edugen
NEXTAUTH_SECRET=edugen-secret-key-change-this-in-production
NEXTAUTH_URL=http://localhost:3000
GEMINI_API_KEY=your-api-key
```

## Các Vấn Đề Đã Fix

### 1. Global is not defined error
- **Vấn đề**: NextAuth v5 và Next.js 15+ sử dụng Edge Runtime mặc định, không hỗ trợ `global`
- **Giải pháp**: Đã thay `global` bằng `globalThis` trong `lib/mongodb.ts`
- **Giải pháp**: Thêm `export const runtime = "nodejs"` cho các API routes cần dùng MongoDB

### 2. Middleware với NextAuth v5
- **Vấn đề**: Middleware không thể truy cập database trực tiếp trên Edge Runtime
- **Giải pháp**: Sử dụng `authorized` callback trong NextAuth config thay vì custom middleware

## Start Development Server

```bash
npm run dev
```

Truy cập http://localhost:3000

## Test Flow

1. Start MongoDB: `mongod`
2. Start dev server: `npm run dev`
3. Mở browser và truy cập http://localhost:3000/register
4. Đăng ký tài khoản mới
5. Đăng nhập với tài khoản vừa tạo
6. Kiểm tra trang /chat
7. Test logout

## Security Features

- Password được hash với bcryptjs (10 rounds)
- Session được quản lý bằng JWT
- Email validation
- Password minimum length validation
- Protected routes với middleware
- Duplicate email check

## Notes

- Password phải có ít nhất 6 ký tự
- Email phải đúng định dạng
- Session sẽ tự động expire sau một thời gian
- Middleware sẽ redirect người dùng đã đăng nhập từ /login hoặc /register về /chat
