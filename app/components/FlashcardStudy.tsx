'use client';

import { useState } from 'react';
import { Question, StandardQuestion, THPT2025Question } from '@/lib/types';

interface FlashcardStudyProps {
  questions: Question[];
}

export default function FlashcardStudy({ questions }: FlashcardStudyProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [reviews, setReviews] = useState<Record<string, string>>({});

  if (questions.length === 0) {
    return null;
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const handleRate = (rating: 'again' | 'hard' | 'good' | 'easy') => {
    setReviews({ ...reviews, [currentQuestion.id]: rating });
    setShowAnswer(false);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // All done
      alert('Hoàn thành ôn tập! 🎉');
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowAnswer(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold text-gray-800">Góc Ôn tập (Flashcard)</h2>
          <span className="text-sm text-gray-600">
            {currentIndex + 1} / {questions.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <div
        className="min-h-[300px] bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-8 mb-4 cursor-pointer transition-all hover:shadow-lg"
        onClick={() => setShowAnswer(!showAnswer)}
      >
        {!showAnswer ? (
          <FlashcardFront question={currentQuestion} />
        ) : (
          <FlashcardBack question={currentQuestion} />
        )}
      </div>

      <div className="text-center text-sm text-gray-500 mb-4">
        {!showAnswer ? 'Nhấp vào thẻ để xem đáp án' : 'Đánh giá mức độ ghi nhớ của bạn'}
      </div>

      {showAnswer ? (
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => handleRate('again')}
            className="bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-medium transition-colors"
          >
            Quên
            <div className="text-xs opacity-80">Again</div>
          </button>
          <button
            onClick={() => handleRate('hard')}
            className="bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-medium transition-colors"
          >
            Khó
            <div className="text-xs opacity-80">Hard</div>
          </button>
          <button
            onClick={() => handleRate('good')}
            className="bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-medium transition-colors"
          >
            Được
            <div className="text-xs opacity-80">Good</div>
          </button>
          <button
            onClick={() => handleRate('easy')}
            className="bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-medium transition-colors"
          >
            Dễ
            <div className="text-xs opacity-80">Easy</div>
          </button>
        </div>
      ) : (
        <div className="flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Trước
          </button>
          <button
            onClick={handleNext}
            disabled={currentIndex === questions.length - 1}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Sau →
          </button>
        </div>
      )}
    </div>
  );
}

function FlashcardFront({ question }: { question: Question }) {
  if (question.type === 'standard') {
    const q = question as StandardQuestion;
    return (
      <div>
        <div className="text-lg font-bold text-gray-800 mb-4">{q.question}</div>
        <div className="space-y-2">
          {Object.entries(q.options).map(([key, value]) => (
            <div key={key} className="bg-white rounded-lg p-3 text-gray-700">
              <span className="font-medium">{key}.</span> {value}
            </div>
          ))}
        </div>
      </div>
    );
  } else {
    const q = question as THPT2025Question;
    return (
      <div>
        <div className="text-lg font-bold text-gray-800 mb-4">{q.context}</div>
        <p className="text-sm text-gray-600 mb-3">
          Đánh giá Đúng/Sai cho các mệnh đề:
        </p>
        <div className="space-y-2">
          {Object.entries(q.statements).map(([key, value]) => (
            <div key={key} className="bg-white rounded-lg p-3 text-gray-700">
              <span className="font-medium">{key})</span> {value}
            </div>
          ))}
        </div>
      </div>
    );
  }
}

function FlashcardBack({ question }: { question: Question }) {
  if (question.type === 'standard') {
    const q = question as StandardQuestion;
    return (
      <div>
        <div className="text-center mb-6">
          <div className="inline-block bg-green-500 text-white px-6 py-3 rounded-full text-2xl font-bold">
            Đáp án: {q.correctAnswer}
          </div>
        </div>
        {q.explanation && (
          <div className="bg-white rounded-lg p-4 mb-4">
            <div className="text-sm font-medium text-gray-700 mb-2">💡 Giải thích:</div>
            <p className="text-gray-600">{q.explanation}</p>
          </div>
        )}
        {q.hint && (
          <div className="bg-blue-100 rounded-lg p-4">
            <div className="text-sm font-medium text-blue-800 mb-2">✨ Gợi ý:</div>
            <p className="text-blue-700">{q.hint}</p>
          </div>
        )}
      </div>
    );
  } else {
    const q = question as THPT2025Question;
    return (
      <div>
        <div className="mb-4">
          <div className="text-lg font-bold text-gray-800 mb-3">Đáp án:</div>
          <div className="space-y-2">
            {Object.entries(q.statements).map(([key, value]) => (
              <div
                key={key}
                className={`rounded-lg p-3 ${
                  q.correctAnswers[key as keyof typeof q.correctAnswers]
                    ? 'bg-green-100 border border-green-300'
                    : 'bg-red-100 border border-red-300'
                }`}
              >
                <span className="font-medium">{key})</span> {value}{' '}
                <span
                  className={
                    q.correctAnswers[key as keyof typeof q.correctAnswers]
                      ? 'text-green-700 font-bold'
                      : 'text-red-700 font-bold'
                  }
                >
                  [
                  {q.correctAnswers[key as keyof typeof q.correctAnswers]
                    ? 'ĐÚNG'
                    : 'SAI'}
                  ]
                </span>
              </div>
            ))}
          </div>
        </div>
        {q.explanation && (
          <div className="bg-white rounded-lg p-4 mb-4">
            <div className="text-sm font-medium text-gray-700 mb-2">💡 Giải thích:</div>
            <p className="text-gray-600">{q.explanation}</p>
          </div>
        )}
        {q.hint && (
          <div className="bg-blue-100 rounded-lg p-4">
            <div className="text-sm font-medium text-blue-800 mb-2">✨ Gợi ý:</div>
            <p className="text-blue-700">{q.hint}</p>
          </div>
        )}
      </div>
    );
  }
}
