# 🚀 EduGen VN - Complete Redesign Plan

## 📋 Overview
Transform EduGen VN into a chat-based AI assistant with authentication and file management.

## 🎯 New Features

### 1. Authentication System ✅
- **NextAuth.js v5** (latest)
- **Login/Register** pages
- **Session management**
- **Protected routes**
- **MongoDB** for user storage

### 2. Database Schema (MongoDB + Prisma)
```prisma
model User {
  id            String    @id @default(auto()) @map("_id") @db.ObjectId
  email         String    @unique
  name          String?
  password      String
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  files         File[]
  conversations Conversation[]
}

model File {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  userId      String   @db.ObjectId
  user        User     @relation(fields: [userId], references: [id])
  filename    String
  content     String   // Extracted text
  uploadedAt  DateTime @default(now())
}

model Conversation {
  id        String    @id @default(auto()) @map("_id") @db.ObjectId
  userId    String    @db.ObjectId
  user      User      @relation(fields: [userId], references: [id])
  messages  Message[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}

model Message {
  id             String       @id @default(auto()) @map("_id") @db.ObjectId
  conversationId String       @db.ObjectId
  conversation   Conversation @relation(fields: [conversationId], references: [id])
  role           String       // 'user' | 'assistant'
  content        String
  metadata       Json?        // For storing questions, mode, etc.
  createdAt      DateTime     @default(now())
}
```

### 3. Chat-Based UI (ChatGPT Style)
```
┌─────────────────────────────────────────────────┐
│  [EduGen VN]  [Mode: Ôn tập ▼]  [Avatar ▼]    │
├─────────────────────────────────────────────────┤
│                                                 │
│  [User] Tôi muốn tạo 10 câu hỏi từ file ABC   │
│                                                 │
│  [AI] Đã tạo 10 câu hỏi trắc nghiệm:          │
│       [Questions appear here...]                │
│       [Làm bài] [Xem đáp án] [Xuất Word]      │
│                                                 │
│  [User] Giải thích câu 1                       │
│                                                 │
│  [AI] Câu 1: Explanation here...               │
│                                                 │
├─────────────────────────────────────────────────┤
│  [Nhập tin nhắn...]              [📎] [Send]   │
└─────────────────────────────────────────────────┘
```

### 4. Modes (Like ChatGPT)
- **Ôn tập trắc nghiệm**: Generate questions → Student quiz mode
- **Xuất đề thi**: Generate questions → Show answers → Export Word
- **Chat tự do**: General Q&A about content

### 5. File Management
```
Sidebar:
├─ Conversations
│  ├─ Today
│  ├─ Yesterday
│  └─ Last 7 days
├─ My Files
│  ├─ file1.pdf (uploaded)
│  ├─ file2.txt
│  └─ [+ Upload]
└─ Settings
```

## 🏗️ Implementation Steps

### Step 1: Database Setup (15 min)
- [x] Install Prisma + MongoDB
- [ ] Create schema
- [ ] Generate Prisma client
- [ ] Setup MongoDB connection

### Step 2: Authentication (20 min)
- [ ] NextAuth config
- [ ] Login/Register pages
- [ ] API routes for auth
- [ ] Protected routes middleware

### Step 3: Chat UI (30 min)
- [ ] ChatWindow component
- [ ] MessageList component
- [ ] ChatInput component
- [ ] Mode selector dropdown
- [ ] Sidebar with conversations

### Step 4: File Management (20 min)
- [ ] File upload API
- [ ] File list component
- [ ] File storage in MongoDB
- [ ] Use files in chat context

### Step 5: Integration (15 min)
- [ ] Connect chat to existing generation logic
- [ ] Migrate QuestionEditor to chat responses
- [ ] Mode-based routing
- [ ] Session persistence

## 📁 New File Structure
```
app/
├── (auth)/
│   ├── login/page.tsx
│   └── register/page.tsx
├── (chat)/
│   ├── layout.tsx              # Chat layout with sidebar
│   └── page.tsx                # Main chat interface
├── api/
│   ├── auth/[...nextauth]/route.ts
│   ├── files/
│   │   ├── upload/route.ts
│   │   └── list/route.ts
│   ├── chat/route.ts           # Handle chat messages
│   └── [existing APIs...]
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   ├── chat/
│   │   ├── ChatWindow.tsx
│   │   ├── MessageBubble.tsx
│   │   ├── ChatInput.tsx
│   │   ├── ModeSelector.tsx
│   │   └── Sidebar.tsx
│   └── [existing components...]
└── lib/
    ├── auth.ts                 # NextAuth config
    ├── db.ts                   # Prisma client
    └── [existing libs...]
```

## 🎨 UI Mockup Description

### Login Page
- Clean form (email + password)
- "Đăng ký" link
- Social login buttons (optional)

### Chat Interface
- **Header**: Logo, Mode selector, User avatar
- **Sidebar** (collapsible):
  - Recent conversations
  - My files
  - New chat button
- **Main area**: Chat messages
- **Input**: Text field + File attach + Send

### Mode-Specific Behaviors

#### Mode: "Ôn tập trắc nghiệm"
1. User asks to create questions
2. AI generates questions
3. Shows [Bắt đầu làm bài] button
4. Quiz interface (no answers shown)
5. Submit → Show results

#### Mode: "Xuất đề thi"
1. User asks to create exam
2. AI generates questions with answers
3. Shows [Chỉnh sửa] [Xuất Word] buttons
4. Can edit inline
5. Export to Word

## ⏱️ Estimated Total Time: ~2 hours

## 🔧 Environment Variables Needed
```env
MONGODB_URI=mongodb://localhost:27017/edugen
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000
GEMINI_API_KEY=existing-key
```

## ✅ Ready to Implement?
This is a complete overhaul. Confirm to proceed!
