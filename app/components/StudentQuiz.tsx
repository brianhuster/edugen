'use client';

import { useState } from 'react';
import { Question, StandardQuestion, THPT2025Question } from '@/lib/types';

interface StudentQuizProps {
  questions: Question[];
  onSubmit: (answers: Record<string, any>) => void;
}

export default function StudentQuiz({ questions, onSubmit }: StudentQuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  const handleAnswer = (questionId: string, answer: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmit = () => {
    // Calculate score
    let correct = 0;
    questions.forEach(q => {
      const userAnswer = answers[q.id];
      if (!userAnswer) return;

      if (q.type === 'standard') {
        if (userAnswer === q.correctAnswer) correct++;
      } else {
        const thptQ = q as THPT2025Question;
        let allCorrect = true;
        ['a', 'b', 'c', 'd'].forEach(key => {
          if (userAnswer[key] !== thptQ.correctAnswers[key as keyof typeof thptQ.correctAnswers]) {
            allCorrect = false;
          }
        });
        if (allCorrect) correct++;
      }
    });

    setScore(correct);
    setSubmitted(true);
    onSubmit(answers);
  };

  if (submitted) {
    return <ResultsView questions={questions} answers={answers} score={score} />;
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold text-gray-900">Bài thi trắc nghiệm</h2>
          <span className="text-sm text-gray-600">
            Câu {currentIndex + 1}/{questions.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Question */}
      <div className="p-6">
        {currentQuestion.type === 'standard' ? (
          <StandardQuestionView
            question={currentQuestion as StandardQuestion}
            answer={answers[currentQuestion.id]}
            onAnswer={(answer) => handleAnswer(currentQuestion.id, answer)}
          />
        ) : (
          <THPT2025QuestionView
            question={currentQuestion as THPT2025Question}
            answers={answers[currentQuestion.id] || {}}
            onAnswer={(answer) => handleAnswer(currentQuestion.id, answer)}
          />
        )}
      </div>

      {/* Navigation */}
      <div className="p-6 border-t border-gray-200 flex items-center justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Câu trước
        </button>

        <div className="text-sm text-gray-600">
          Đã trả lời: {answeredCount}/{questions.length}
        </div>

        {currentIndex === questions.length - 1 ? (
          <button
            onClick={handleSubmit}
            disabled={answeredCount < questions.length}
            className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Nộp bài
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            Câu tiếp →
          </button>
        )}
      </div>
    </div>
  );
}

function StandardQuestionView({
  question,
  answer,
  onAnswer,
}: {
  question: StandardQuestion;
  answer: string;
  onAnswer: (answer: string) => void;
}) {
  return (
    <div>
      <h3 className="text-base font-semibold text-gray-900 mb-4">
        {question.question}
      </h3>
      <div className="space-y-3">
        {Object.entries(question.options).map(([key, value]) => (
          <label
            key={key}
            className={`flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all ${
              answer === key
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <input
              type="radio"
              name={question.id}
              value={key}
              checked={answer === key}
              onChange={() => onAnswer(key)}
              className="mt-1 mr-3"
            />
            <span className="flex-1">
              <span className="font-semibold">{key}.</span> {value}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

function THPT2025QuestionView({
  question,
  answers,
  onAnswer,
}: {
  question: THPT2025Question;
  answers: Record<string, boolean>;
  onAnswer: (answers: Record<string, boolean>) => void;
}) {
  const handleToggle = (key: string, value: boolean) => {
    onAnswer({ ...answers, [key]: value });
  };

  return (
    <div>
      <div className="text-base font-semibold text-gray-900 mb-4">
        {question.context}
      </div>
      <p className="text-sm text-gray-600 mb-4">
        Đánh giá Đúng/Sai cho các mệnh đề sau:
      </p>
      <div className="space-y-3">
        {Object.entries(question.statements).map(([key, value]) => (
          <div key={key} className="p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-900 mb-3">
              <span className="font-semibold">{key})</span> {value}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleToggle(key, true)}
                className={`flex-1 py-2 px-4 rounded-lg border-2 text-sm font-medium transition-all ${
                  answers[key] === true
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                Đúng
              </button>
              <button
                onClick={() => handleToggle(key, false)}
                className={`flex-1 py-2 px-4 rounded-lg border-2 text-sm font-medium transition-all ${
                  answers[key] === false
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                Sai
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ResultsView({
  questions,
  answers,
  score,
}: {
  questions: Question[];
  answers: Record<string, any>;
  score: number;
}) {
  const percentage = (score / questions.length) * 100;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
      <div className="text-center mb-8">
        <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
          <span className="text-4xl font-bold text-white">{percentage.toFixed(0)}%</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Hoàn thành!</h2>
        <p className="text-gray-600">
          Bạn đã trả lời đúng {score}/{questions.length} câu
        </p>
      </div>

      <div className="space-y-6">
        {questions.map((q, index) => {
          const userAnswer = answers[q.id];
          let isCorrect = false;

          if (q.type === 'standard') {
            isCorrect = userAnswer === q.correctAnswer;
          } else {
            const thptQ = q as THPT2025Question;
            let allCorrect = true;
            ['a', 'b', 'c', 'd'].forEach(key => {
              if (!userAnswer || userAnswer[key] !== thptQ.correctAnswers[key as keyof typeof thptQ.correctAnswers]) {
                allCorrect = false;
              }
            });
            isCorrect = allCorrect;
          }

          return (
            <div
              key={q.id}
              className={`p-4 rounded-lg border-2 ${
                isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
              }`}
            >
              <div className="flex items-start gap-3 mb-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    isCorrect ? 'bg-green-500' : 'bg-red-500'
                  }`}
                >
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {isCorrect ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    )}
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">
                    Câu {index + 1}: {q.type === 'standard' ? (q as StandardQuestion).question : (q as THPT2025Question).context}
                  </p>
                </div>
              </div>

              {q.type === 'standard' ? (
                <div className="ml-9 text-sm">
                  <p className="text-gray-700">
                    Đáp án của bạn: <span className="font-semibold">{userAnswer || 'Không trả lời'}</span>
                  </p>
                  <p className="text-gray-700">
                    Đáp án đúng: <span className="font-semibold text-green-700">{q.correctAnswer}</span>
                  </p>
                  {q.explanation && (
                    <p className="mt-2 text-gray-600 italic">{q.explanation}</p>
                  )}
                </div>
              ) : (
                <div className="ml-9 text-sm space-y-1">
                  {Object.entries((q as THPT2025Question).statements).map(([key, stmt]) => {
                    const thptQ = q as THPT2025Question;
                    const correct = thptQ.correctAnswers[key as 'a' | 'b' | 'c' | 'd'];
                    const userAns = userAnswer?.[key];
                    return (
                      <p key={key} className="text-gray-700">
                        {key}) {stmt} - 
                        <span className={userAns === correct ? 'text-green-700' : 'text-red-700'}> Bạn: {userAns === undefined ? '?' : userAns ? 'Đúng' : 'Sai'}</span> / 
                        <span className="text-green-700"> Đáp án: {correct ? 'Đúng' : 'Sai'}</span>
                      </p>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
