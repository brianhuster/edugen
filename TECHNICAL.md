# EduGen VN - Tài liệu Kỹ thuật

## Tổng quan Kiến trúc

### Stack Công nghệ
- **Framework**: Next.js 15 (App Router)
- **UI Framework**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **AI Engine**: Google Gemini API
- **PDF Processing**: pdf-parse
- **Document Generation**: docx

### Cấu trúc Thư mục

```
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes (Server-side)
│   │   ├── upload/route.ts       # Xử lý upload & parse PDF
│   │   ├── generate/route.ts     # Tạo câu hỏi với Gemini AI
│   │   └── export/route.ts       # Xuất file Word
│   ├── components/               # React Components
│   │   ├── FileUpload.tsx        # Component upload file
│   │   ├── ConfigPanel.tsx       # Panel cấu hình
│   │   ├── QuestionEditor.tsx    # Editor câu hỏi
│   │   └── FlashcardStudy.tsx    # Flashcard học tập
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Homepage
├── lib/                          # Utilities & Core Logic
│   ├── types.ts                  # TypeScript definitions
│   ├── gemini.ts                 # Gemini AI integration
│   └── docx-generator.ts         # Word document generator
└── public/                       # Static assets
```

## Luồng Hoạt động

### 1. Upload & Parse PDF
```
User Upload PDF
    ↓
FileUpload Component
    ↓
POST /api/upload
    ↓
Send PDF to Gemini API (with base64 encoding)
    ↓
Gemini extracts text from PDF
    ↓
Return text to frontend
```

### 2. Generate Questions
```
User clicks "Tạo câu hỏi"
    ↓
Send: { text, config } to POST /api/generate
    ↓
Build prompt based on config (standard/thpt2025, studyMode)
    ↓
Call Gemini API with prompt
    ↓
Parse JSON response from AI
    ↓
Return Question[] to frontend
```

### 3. Edit & Export
```
User edits questions (optional)
    ↓
User clicks "Xuất file Word"
    ↓
POST /api/export with questions
    ↓
Generate DOCX with docx library
    ↓
Return file as download
```

### 4. Flashcard Study (Optional)
```
If studyMode enabled
    ↓
FlashcardStudy component shows
    ↓
User flips cards & rates memory
    ↓
Track ratings (Again/Hard/Good/Easy)
```

## API Endpoints

### POST /api/upload
**Request**: FormData with `file` field (PDF)
**Response**: 
```json
{
  "text": "extracted text from PDF..."
}
```
**Errors**: 400 (invalid file), 500 (parsing error)

### POST /api/generate
**Request**:
```json
{
  "text": "document content...",
  "config": {
    "mode": "standard" | "thpt2025",
    "studyMode": true/false,
    "numberOfQuestions": 10
  }
}
```
**Response**:
```json
{
  "questions": [
    {
      "type": "standard",
      "id": "q1",
      "question": "...",
      "options": { "A": "...", "B": "...", "C": "...", "D": "..." },
      "correctAnswer": "A",
      "explanation": "...",
      "hint": "..."
    }
  ]
}
```

### POST /api/export
**Request**:
```json
{
  "questions": [...],
  "title": "ĐỀ THI TRẮC NGHIỆM"
}
```
**Response**: Binary DOCX file stream

## Data Models

### Question Types

#### StandardQuestion
```typescript
{
  type: 'standard',
  id: string,
  question: string,
  options: { A: string, B: string, C: string, D: string },
  correctAnswer: 'A' | 'B' | 'C' | 'D',
  explanation?: string,
  hint?: string
}
```

#### THPT2025Question
```typescript
{
  type: 'thpt2025',
  id: string,
  context: string,
  statements: { a: string, b: string, c: string, d: string },
  correctAnswers: { a: boolean, b: boolean, c: boolean, d: boolean },
  explanation?: string,
  hint?: string
}
```

## Gemini AI Integration

### Prompt Engineering

#### Standard Mode Prompt Structure
```
Bạn là một giáo viên chuyên nghiệp người Việt Nam.
TÀI LIỆU: [document text]

YÊU CẦU:
- Tạo N câu hỏi trắc nghiệm
- 4 đáp án A, B, C, D
- Chỉ 1 đáp án đúng
- Đáp án sai phải hợp lý
[+ explanation & hint if studyMode]

ĐỊNH DẠNG: JSON array
```

#### THPT 2025 Mode Prompt Structure
```
Bạn là một giáo viên chuyên nghiệp người Việt Nam.
TÀI LIỆU: [document text]

YÊU CẦU:
- Tạo N câu hỏi format THPT 2025
- 1 ngữ cảnh + 4 mệnh đề a,b,c,d
- Đánh giá Đúng/Sai cho mỗi mệnh đề
[+ explanation & hint if studyMode]

ĐỊNH DẠNG: JSON array
```

### Response Parsing
- Extract JSON from AI response using regex: `/\[[\s\S]*\]/`
- Parse JSON to Question[]
- Validate structure

## Word Document Generation

### Document Structure
```
Page 1+:
- Header: "ĐỀ THI TRẮC NGHIỆM"
- Student info
- Questions (no answers highlighted)

[PAGE BREAK]

Answer Section:
- "PHẦN ĐÁP ÁN VÀ HƯỚNG DẪN CHẤM"
- Answer table
- Detailed explanations
```

### DOCX Library Usage
```typescript
Document({
  sections: [{
    children: [
      Paragraph(title),
      ...generateQuestionsSection(),
      PageBreak(),
      ...generateAnswerKeySection()
    ]
  }]
})
```

## Component Architecture

### FileUpload
- Drag & drop support
- File type validation (PDF only)
- Progress indicator
- Error handling

### ConfigPanel
- Radio buttons for exam mode
- Number input for question count
- Toggle switch for study mode
- Real-time config updates

### QuestionEditor
- List view of all questions
- Inline editing capability
- Delete functionality
- Export button
- Separate views for Standard & THPT2025

### FlashcardStudy
- Card flip animation
- Progress bar
- 4-button rating system (Anki-style)
- Navigation controls
- Separate front/back views

## Security & Best Practices

### API Key Security
- Stored in `.env.local` (git-ignored)
- Only accessed server-side (API routes)
- Never exposed to client

### File Upload Security
- File type validation (PDF only)
- Size limit handled by Next.js config
- Server-side processing only

### Error Handling
- Try-catch in all API routes
- User-friendly error messages
- Console logging for debugging

## Performance Considerations

### AI Processing
- Loading states during generation (5-10s)
- Timeout handling
- Retry mechanism (optional)

### File Processing
- Buffer-based PDF parsing
- No file storage (process in memory)
- Streaming for large files

### Frontend Optimization
- Component-level state management
- Callback memoization
- Conditional rendering
- No unnecessary re-renders

## Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
GEMINI_API_KEY=your_key
```

### Other Platforms
- Ensure Node.js 18+ runtime
- Set environment variables
- Configure build command: `npm run build`
- Configure start command: `npm run start`

## Testing Checklist

### Manual Testing
- [ ] Upload valid PDF
- [ ] Upload invalid file type
- [ ] Generate standard questions
- [ ] Generate THPT 2025 questions
- [ ] Generate with study mode ON
- [ ] Generate with study mode OFF
- [ ] Edit question inline
- [ ] Delete question
- [ ] Export Word document
- [ ] Flashcard flip functionality
- [ ] Flashcard rating buttons
- [ ] Navigation between cards

### Edge Cases
- [ ] Empty PDF
- [ ] Very large PDF (>10MB)
- [ ] Non-English content
- [ ] Special characters in text
- [ ] Invalid API key
- [ ] Network timeout
- [ ] AI returns invalid JSON

## Future Enhancements

### Phase 2
- [ ] Anki .apkg export
- [ ] Database for storing history
- [ ] User authentication
- [ ] Question bank management
- [ ] Sharing capabilities

### Phase 3
- [ ] Multiple file formats (DOCX, TXT)
- [ ] Image/diagram support in questions
- [ ] Advanced scheduling algorithm
- [ ] Statistics & analytics
- [ ] Mobile app

## Troubleshooting

### Common Issues

**Build fails with Tailwind error**
- Solution: Use `@tailwindcss/postcss` plugin
- Check `postcss.config.js` configuration

**pdf-parse import error**
- Solution: Use `import * as pdfParse` instead of default import
- Handle both default and named exports

**DOCX type errors**
- Solution: Use TextRun for text formatting
- Wrap formatted text in children array

**API Key not working**
- Check `.env.local` exists
- Restart dev server after adding key
- Verify key is valid on Google AI Studio

## Maintenance

### Regular Tasks
- Update dependencies monthly
- Monitor Gemini API usage & costs
- Review user feedback
- Fix reported bugs
- Optimize prompts based on results

### Monitoring
- API response times
- Error rates
- File upload success rates
- User engagement metrics

---

**Version**: 1.0.0
**Last Updated**: 2024
**Maintained by**: EduGen VN Team
