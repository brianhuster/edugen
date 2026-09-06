import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

interface FileInput {
  name: string;
  content?: string;       // For .txt files
  geminiFileUri?: string; // For PDF/DOCX/etc
  mimeType?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, mode, files, config } = body as {
      message: string;
      mode: string;
      files?: FileInput[];
      config?: { numberOfQuestions?: number; difficultyLevel?: 'easy' | 'medium' | 'hard' };
    };

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    // Extract config
    const numberOfQuestions = config?.numberOfQuestions || 10;
    const difficultyLevel = config?.difficultyLevel;
    const difficultyText = difficultyLevel
      ? `\n- Độ khó: ${difficultyLevel === 'easy' ? 'Dễ (câu hỏi cơ bản, nhận biết)' : difficultyLevel === 'medium' ? 'Trung bình (yêu cầu hiểu và vận dụng)' : 'Khó (yêu cầu phân tích, tổng hợp)'}`
      : '';

    // Separate files into txt (embed in prompt) and Gemini files (use fileData parts)
    const txtContent = (files || [])
      .filter(f => f.content)
      .map(f => `=== ${f.name} ===\n${f.content}`)
      .join('\n\n');

    const geminiFileParts = (files || [])
      .filter(f => f.geminiFileUri && f.mimeType)
      .map(f => ({ fileData: { mimeType: f.mimeType!, fileUri: f.geminiFileUri! } }));

    const hasFile = txtContent.length > 0 || geminiFileParts.length > 0;
    const fileRef = hasFile
      ? geminiFileParts.length > 0
        ? 'tài liệu được đính kèm'
        : `TÀI LIỆU HỌC TẬP:\n${txtContent}\n\n`
      : '';

    let textPrompt = '';
    let responseType = 'text';

    if (mode === 'quiz') {
      textPrompt = `Bạn là một giáo viên chuyên nghiệp người Việt Nam.

YÊU CẦU CỦA HỌC SINH: ${message}

${txtContent ? `TÀI LIỆU HỌC TẬP:\n${txtContent}\n\n` : ''}
Hãy tạo ${numberOfQuestions} câu hỏi trắc nghiệm để học sinh ôn tập.${difficultyText}

QUY TẮC:
- Tạo CHÍNH XÁC ${numberOfQuestions} câu hỏi trắc nghiệm tiêu chuẩn với 4 đáp án A, B, C, D
- KHÔNG được hiển thị đáp án đúng ngay (học sinh sẽ làm bài)
- Các đáp án phải hợp lý, không quá hiển nhiên
- Câu hỏi phải bám sát nội dung ${geminiFileParts.length > 0 ? fileRef : 'tài liệu (nếu có)'}${difficultyLevel ? `\n- Đảm bảo độ khó ${difficultyLevel === 'easy' ? 'DỄ' : difficultyLevel === 'medium' ? 'TRUNG BÌNH' : 'KHÓ'}` : ''}

ĐỊNH DẠNG ĐẦU RA (JSON):
Trả về mảng JSON với cấu trúc:
[
  {
    "id": "q1",
    "question": "Câu hỏi ở đây?",
    "options": {
      "A": "Đáp án A",
      "B": "Đáp án B", 
      "C": "Đáp án C",
      "D": "Đáp án D"
    },
    "correctAnswer": "A",
    "explanation": "Giải thích chi tiết tại sao đáp án này đúng"
  }
]

CHỈ trả về mảng JSON, không thêm text nào khác.`;
      responseType = 'quiz';
    } else if (mode === 'exam') {
      textPrompt = `Bạn là một giáo viên chuyên nghiệp người Việt Nam.

YÊU CẦU: ${message}

${txtContent ? `TÀI LIỆU HỌC TẬP:\n${txtContent}\n\n` : ''}
Hãy tạo đề thi trắc nghiệm chuẩn Bộ GD&ĐT với ${numberOfQuestions} câu hỏi.${difficultyText}

QUY TẮC:
- Tạo CHÍNH XÁC ${numberOfQuestions} câu hỏi trắc nghiệm với 4 đáp án A, B, C, D
- Bao gồm đáp án đúng và giải thích chi tiết
- Câu hỏi phải có độ khó phù hợp${difficultyLevel ? ` (${difficultyLevel === 'easy' ? 'DỄ' : difficultyLevel === 'medium' ? 'TRUNG BÌNH' : 'KHÓ'})` : ''}
- Các đáp án sai phải hợp lý

ĐỊNH DẠNG ĐẦU RA (JSON):
[
  {
    "id": "q1",
    "question": "Câu hỏi ở đây?",
    "options": {
      "A": "Đáp án A",
      "B": "Đáp án B",
      "C": "Đáp án C", 
      "D": "Đáp án D"
    },
    "correctAnswer": "A",
    "explanation": "Giải thích chi tiết"
  }
]

CHỈ trả về mảng JSON, không thêm text nào khác.`;
      responseType = 'exam';
    } else {
      // Free chat
      textPrompt = txtContent
        ? `Dựa trên tài liệu sau:\n\n${txtContent}\n\nCâu hỏi: ${message}`
        : message;
      responseType = 'text';
    }

    // Build content parts: Gemini file parts first, then text prompt
    const contentParts = [
      ...geminiFileParts,
      { text: textPrompt },
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: [{ role: 'user', parts: contentParts }],
    });
    const text = response.text ?? '';

    if (responseType === 'quiz' || responseType === 'exam') {
      try {
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const questions = JSON.parse(jsonMatch[0]);
          return NextResponse.json({
            type: responseType,
            questions,
            rawText: text,
          });
        }
      } catch (e) {
        console.error('Failed to parse JSON:', e);
      }
    }

    return NextResponse.json({
      type: 'text',
      content: text,
    });

  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
