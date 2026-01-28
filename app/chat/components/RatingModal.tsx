'use client';

import { useState } from 'react';

interface RatingModalProps {
  fileId: string;
  fileName: string;
  onClose: () => void;
  onSuccess: (nextReviewDate: Date) => void;
}

const RATING_OPTIONS = [
  {
    value: 1,
    label: 'Again',
    description: 'Không nhớ gì cả',
    emoji: '❌',
    color: 'red',
  },
  {
    value: 2,
    label: 'Hard',
    description: 'Nhớ khó khăn',
    emoji: '😓',
    color: 'orange',
  },
  {
    value: 3,
    label: 'Good',
    description: 'Nhớ tốt',
    emoji: '✅',
    color: 'green',
  },
  {
    value: 4,
    label: 'Easy',
    description: 'Nhớ rất dễ dàng',
    emoji: '🎉',
    color: 'blue',
  },
];

export default function RatingModal({ fileId, fileName, onClose, onSuccess }: RatingModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRating = async (rating: 1 | 2 | 3 | 4) => {
    try {
      setSubmitting(true);
      setError(null);

      const response = await fetch('/api/files/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileId, rating }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit rating');
      }

      const data = await response.json();
      
      // Extract next review date from the response
      const nextReviewDate = new Date(data.newState.due);
      onSuccess(nextReviewDate);
    } catch (err) {
      console.error('Error submitting rating:', err);
      setError(err instanceof Error ? err.message : 'Không thể gửi đánh giá');
      setSubmitting(false);
    }
  };

  const getColorClasses = (color: string) => {
    const colors = {
      red: 'bg-red-50 hover:bg-red-100 border-red-300 text-red-900 hover:border-red-500',
      orange: 'bg-orange-50 hover:bg-orange-100 border-orange-300 text-orange-900 hover:border-orange-500',
      green: 'bg-green-50 hover:bg-green-100 border-green-300 text-green-900 hover:border-green-500',
      blue: 'bg-blue-50 hover:bg-blue-100 border-blue-300 text-blue-900 hover:border-blue-500',
    };
    return colors[color as keyof typeof colors] || colors.green;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">📚 Đánh giá ôn tập</h2>
              <p className="text-indigo-100 text-sm">{fileName}</p>
            </div>
            <button
              onClick={onClose}
              disabled={submitting}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Bạn nhớ nội dung này như thế nào?
            </h3>
            <p className="text-sm text-gray-600">
              Đánh giá của bạn giúp hệ thống lên lịch ôn tập hiệu quả hơn
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Rating Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {RATING_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handleRating(option.value as 1 | 2 | 3 | 4)}
                disabled={submitting}
                className={`p-6 rounded-xl border-2 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${getColorClasses(option.color)}`}
              >
                <div className="text-center">
                  <div className="text-4xl mb-2">{option.emoji}</div>
                  <div className="font-bold text-lg mb-1">{option.label}</div>
                  <div className="text-sm opacity-80">{option.description}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Info Box */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">💡 Cách chọn đánh giá:</p>
                <ul className="space-y-1 text-xs">
                  <li><strong>Again:</strong> Chọn nếu bạn không nhớ hoặc trả lời sai nhiều</li>
                  <li><strong>Hard:</strong> Nhớ được nhưng phải suy nghĩ lâu</li>
                  <li><strong>Good:</strong> Nhớ tốt, trả lời đúng hầu hết câu hỏi</li>
                  <li><strong>Easy:</strong> Nhớ rất rõ, trả lời đúng tất cả một cách dễ dàng</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
