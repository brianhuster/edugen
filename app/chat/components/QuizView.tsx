'use client';

import { useState } from 'react';

interface QuizQuestion {
  id: string;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: string;
  explanation: string;
}

interface QuizViewProps {
  questions: QuizQuestion[];
  mode: 'quiz' | 'exam'; // quiz = học sinh làm, exam = giáo viên xem đáp án
}

export default function QuizView({ questions, mode }: QuizViewProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);

  const handleSelectAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmit = () => {
    setShowResults(true);
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) correct++;
    });
    return { correct, total: questions.length };
  };

  const score = showResults ? calculateScore() : null;

  if (mode === 'exam') {
    // Giáo viên - Hiển thị đề thi với đáp án
    return (
      <div className="space-y-6">
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <h3 className="font-semibold text-indigo-900">📝 Đề thi đã tạo (Chế độ Giáo viên)</h3>
          <p className="text-sm text-indigo-700 mt-1">
            Tổng số câu: {questions.length} • Đáp án và giải thích được hiển thị đầy đủ
          </p>
        </div>

        {questions.map((q, idx) => (
          <div key={q.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold text-sm">
                {idx + 1}
              </span>
              <div className="flex-1">
                <p className="font-medium text-gray-900 mb-4">{q.question}</p>
                
                <div className="space-y-2 mb-4">
                  {Object.entries(q.options).map(([key, value]) => (
                    <div
                      key={key}
                      className={`p-3 rounded-lg border-2 ${
                        key === q.correctAnswer
                          ? 'bg-green-50 border-green-500'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <span className="font-semibold mr-2">{key}.</span>
                      {value}
                      {key === q.correctAnswer && (
                        <span className="ml-2 text-green-600 font-semibold">✓ Đáp án đúng</span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-blue-900 mb-1">💡 Giải thích:</p>
                  <p className="text-sm text-blue-800">{q.explanation}</p>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
          <button
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
            onClick={() => {
              // TODO: Implement export to Word
              alert('Tính năng xuất Word đang được phát triển');
            }}
          >
            📄 Xuất file Word
          </button>
        </div>
      </div>
    );
  }

  // Học sinh - Làm bài trắc nghiệm
  return (
    <div className="space-y-6">
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
        <h3 className="font-semibold text-indigo-900">📝 Bài tập trắc nghiệm</h3>
        <p className="text-sm text-indigo-700 mt-1">
          Tổng số câu: {questions.length} • Hãy chọn đáp án đúng nhất cho mỗi câu hỏi
        </p>
      </div>

      {showResults && score && (
        <div className={`border-2 rounded-xl p-6 text-center ${
          score.correct / score.total >= 0.7 
            ? 'bg-green-50 border-green-500' 
            : score.correct / score.total >= 0.5 
            ? 'bg-yellow-50 border-yellow-500'
            : 'bg-red-50 border-red-500'
        }`}>
          <div className="text-4xl mb-2">
            {score.correct / score.total >= 0.7 ? '🎉' : score.correct / score.total >= 0.5 ? '😊' : '📚'}
          </div>
          <h3 className="text-2xl font-bold mb-2">
            Điểm: {score.correct}/{score.total}
          </h3>
          <p className="text-gray-700">
            Tỷ lệ đúng: {Math.round((score.correct / score.total) * 100)}%
          </p>
        </div>
      )}

      {questions.map((q, idx) => {
        const userAnswer = answers[q.id];
        const isCorrect = userAnswer === q.correctAnswer;
        const showAnswer = showResults;

        return (
          <div key={q.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex gap-3">
              <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                showAnswer
                  ? isCorrect
                    ? 'bg-green-100 text-green-700'
                    : userAnswer
                    ? 'bg-red-100 text-red-700'
                    : 'bg-gray-100 text-gray-700'
                  : 'bg-indigo-100 text-indigo-700'
              }`}>
                {idx + 1}
              </span>
              <div className="flex-1">
                <p className="font-medium text-gray-900 mb-4">{q.question}</p>
                
                <div className="space-y-2 mb-4">
                  {Object.entries(q.options).map(([key, value]) => {
                    const isSelected = userAnswer === key;
                    const isCorrectAnswer = key === q.correctAnswer;
                    
                    let bgColor = 'bg-gray-50 hover:bg-gray-100';
                    let borderColor = 'border-gray-200';
                    let textColor = 'text-gray-900';
                    
                    if (showAnswer) {
                      if (isCorrectAnswer) {
                        bgColor = 'bg-green-50';
                        borderColor = 'border-green-500';
                        textColor = 'text-green-900';
                      } else if (isSelected) {
                        bgColor = 'bg-red-50';
                        borderColor = 'border-red-500';
                        textColor = 'text-red-900';
                      }
                    } else if (isSelected) {
                      bgColor = 'bg-indigo-50';
                      borderColor = 'border-indigo-500';
                      textColor = 'text-indigo-900';
                    }

                    return (
                      <button
                        key={key}
                        onClick={() => !showAnswer && handleSelectAnswer(q.id, key)}
                        disabled={showAnswer}
                        className={`w-full text-left p-3 rounded-lg border-2 transition-all ${bgColor} ${borderColor} ${textColor} ${
                          !showAnswer ? 'cursor-pointer' : 'cursor-default'
                        }`}
                      >
                        <span className="font-semibold mr-2">{key}.</span>
                        {value}
                        {showAnswer && isCorrectAnswer && (
                          <span className="ml-2 text-green-600 font-semibold">✓</span>
                        )}
                        {showAnswer && isSelected && !isCorrectAnswer && (
                          <span className="ml-2 text-red-600 font-semibold">✗</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {showAnswer && (
                  <div className={`border rounded-lg p-4 ${
                    isCorrect ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'
                  }`}>
                    <p className="text-sm font-semibold mb-1">
                      {isCorrect ? '✅ Chính xác!' : '💡 Giải thích:'}
                    </p>
                    <p className="text-sm">{q.explanation}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      <div className="bg-white border border-gray-200 rounded-xl p-6 text-center space-y-3">
        {!showResults ? (
          <>
            <p className="text-sm text-gray-600 mb-2">
              Đã trả lời: {Object.keys(answers).length}/{questions.length}
            </p>
            <button
              onClick={handleSubmit}
              disabled={Object.keys(answers).length !== questions.length}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ✓ Nộp bài
            </button>
          </>
        ) : (
          <button
            onClick={() => {
              setAnswers({});
              setShowResults(false);
            }}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
          >
            🔄 Làm lại
          </button>
        )}
      </div>
    </div>
  );
}
