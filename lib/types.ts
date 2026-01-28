// Type definitions for EduGen VN

export type ExamMode = 'standard' | 'thpt2025';

export interface StandardQuestion {
  type: 'standard';
  id: string;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation?: string;
  hint?: string;
}

export interface THPT2025Question {
  type: 'thpt2025';
  id: string;
  context: string;
  statements: {
    a: string;
    b: string;
    c: string;
    d: string;
  };
  correctAnswers: {
    a: boolean;
    b: boolean;
    c: boolean;
    d: boolean;
  };
  explanation?: string;
  hint?: string;
}

export type Question = StandardQuestion | THPT2025Question;

export interface ExamConfig {
  mode: ExamMode;
  studyMode: boolean;
  numberOfQuestions?: number;
  difficultyLevel?: 'easy' | 'medium' | 'hard';
}

export interface GenerateRequest {
  text: string;
  config: ExamConfig;
}

export interface GenerateResponse {
  questions: Question[];
}

export interface FlashcardReview {
  questionId: string;
  rating: 'again' | 'hard' | 'good' | 'easy';
  timestamp: number;
}
