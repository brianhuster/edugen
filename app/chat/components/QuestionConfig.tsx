'use client';

import { useState } from 'react';

interface QuestionConfigProps {
  onApply: (config: {
    numberOfQuestions: number;
    difficultyLevel?: 'easy' | 'medium' | 'hard';
  }) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function QuestionConfig({ onApply, isOpen, onClose }: QuestionConfigProps) {
  const [numberOfQuestions, setNumberOfQuestions] = useState(10);
  const [difficultyLevel, setDifficultyLevel] = useState<'easy' | 'medium' | 'hard' | ''>('');

  const handleApply = () => {
    onApply({
      numberOfQuestions,
      difficultyLevel: difficultyLevel || undefined,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Cấu hình câu hỏi</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Number of Questions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số câu hỏi: <span className="text-indigo-600 font-bold">{numberOfQuestions}</span>
            </label>
            <input
              type="range"
              min="5"
              max="50"
              step="5"
              value={numberOfQuestions}
              onChange={(e) => setNumberOfQuestions(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>5</span>
              <span>25</span>
              <span>50</span>
            </div>
          </div>

          {/* Difficulty Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Độ khó
            </label>
            <div className="grid grid-cols-4 gap-3">
              <button
                onClick={() => setDifficultyLevel('')}
                className={`p-4 rounded-lg border-2 text-center transition-all ${
                  difficultyLevel === ''
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-1">🎯</div>
                <div className="font-medium text-sm">Tất cả</div>
              </button>
              <button
                onClick={() => setDifficultyLevel('easy')}
                className={`p-4 rounded-lg border-2 text-center transition-all ${
                  difficultyLevel === 'easy'
                    ? 'border-green-600 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-1">😊</div>
                <div className="font-medium text-sm text-green-600">Dễ</div>
              </button>
              <button
                onClick={() => setDifficultyLevel('medium')}
                className={`p-4 rounded-lg border-2 text-center transition-all ${
                  difficultyLevel === 'medium'
                    ? 'border-yellow-600 bg-yellow-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-1">🤔</div>
                <div className="font-medium text-sm text-yellow-600">Trung bình</div>
              </button>
              <button
                onClick={() => setDifficultyLevel('hard')}
                className={`p-4 rounded-lg border-2 text-center transition-all ${
                  difficultyLevel === 'hard'
                    ? 'border-red-600 bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-1">🔥</div>
                <div className="font-medium text-sm text-red-600">Khó</div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleApply}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            Áp dụng
          </button>
        </div>
      </div>
    </div>
  );
}
