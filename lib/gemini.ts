import { GoogleGenerativeAI } from '@google/generative-ai';
import { ExamConfig, Question } from './types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function generateQuestions(
  text: string,
  config: ExamConfig
): Promise<Question[]> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });

  const prompt = buildPrompt(text, config);

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const generatedText = response.text();

    // Parse JSON response
    const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from AI');
    }

    const questions: Question[] = JSON.parse(jsonMatch[0]);
    return questions;
  } catch (error) {
    console.error('Error generating questions:', error);
    throw new Error('Failed to generate questions from AI');
  }
}

function buildPrompt(text: string, config: ExamConfig): string {
  const baseInstructions = `Bạn là một giáo viên chuyên nghiệp người Việt Nam. Nhiệm vụ của bạn là tạo câu hỏi từ tài liệu học tập được cung cấp.

TÀI LIỆU HỌC TẬP:
${text}

`;

  if (config.mode === 'standard') {
    return (
      baseInstructions +
      `YÊU CẦU:
- Tạo ${config.numberOfQuestions || 10} câu hỏi trắc nghiệm tiêu chuẩn
- Mỗi câu hỏi có 4 đáp án A, B, C, D với chỉ 1 đáp án đúng
- Câu hỏi phải bám sát nội dung tài liệu
- Các đáp án sai phải hợp lý, không quá hiển nhiên
${
  config.studyMode
    ? '- Bao gồm giải thích chi tiết tại sao đáp án đó đúng/sai\n- Bao gồm gợi ý để nhớ câu trả lời'
    : ''
}

ĐỊNH DẠNG ĐẦU RA (JSON):
Trả về một mảng JSON với cấu trúc sau:
[
  {
    "type": "standard",
    "id": "q1",
    "question": "Câu hỏi ở đây?",
    "options": {
      "A": "Đáp án A",
      "B": "Đáp án B",
      "C": "Đáp án C",
      "D": "Đáp án D"
    },
    "correctAnswer": "A",
    ${config.studyMode ? '"explanation": "Giải thích chi tiết...",\n    "hint": "Gợi ý ghi nhớ..."' : ''}
  }
]

Chỉ trả về mảng JSON, không thêm text nào khác.`
    );
  } else {
    // THPT 2025 format
    return (
      baseInstructions +
      `YÊU CẦU:
- Tạo ${config.numberOfQuestions || 5} câu hỏi theo format THPT 2025
- Mỗi câu hỏi có 1 đoạn ngữ cảnh, theo sau là 4 mệnh đề a, b, c, d
- Người học phải đánh giá Đúng/Sai cho từng mệnh đề
- Các mệnh đề phải yêu cầu phân tích, không quá hiển nhiên
${
  config.studyMode
    ? '- Bao gồm giải thích chi tiết cho từng mệnh đề\n- Bao gồm gợi ý để phân tích đúng'
    : ''
}

ĐỊNH DẠNG ĐẦU RA (JSON):
Trả về một mảng JSON với cấu trúc sau:
[
  {
    "type": "thpt2025",
    "id": "q1",
    "context": "Đoạn ngữ cảnh cung cấp thông tin...",
    "statements": {
      "a": "Mệnh đề a",
      "b": "Mệnh đề b",
      "c": "Mệnh đề c",
      "d": "Mệnh đề d"
    },
    "correctAnswers": {
      "a": true,
      "b": false,
      "c": true,
      "d": false
    }${config.studyMode ? ',\n    "explanation": "Giải thích từng mệnh đề...",\n    "hint": "Gợi ý phân tích..."' : ''}
  }
]

Chỉ trả về mảng JSON, không thêm text nào khác.`
    );
  }
}
