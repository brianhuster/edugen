'use client';

import { useState, useCallback } from 'react';
import { ExamMode } from '@/lib/types';

interface ConfigPanelProps {
  onConfigChange: (mode: ExamMode, studyMode: boolean, numQuestions: number) => void;
}

export default function ConfigPanel({ onConfigChange }: ConfigPanelProps) {
  const [examMode, setExamMode] = useState<ExamMode>('standard');
  const [studyMode, setStudyMode] = useState(false);
  const [numQuestions, setNumQuestions] = useState(10);

  const handleChange = useCallback(() => {
    onConfigChange(examMode, studyMode, numQuestions);
  }, [examMode, studyMode, numQuestions, onConfigChange]);

  useState(() => {
    handleChange();
  });

  return (
    <div className="space-y-6">
      {/* Exam Mode */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          Loại câu hỏi
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => {
              setExamMode('standard');
              setTimeout(handleChange, 0);
            }}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              examMode === 'standard'
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="font-semibold text-sm text-gray-900 mb-1">Tiêu chuẩn</div>
            <div className="text-xs text-gray-500">4 đáp án (A, B, C, D)</div>
          </button>

          <button
            onClick={() => {
              setExamMode('thpt2025');
              setTimeout(handleChange, 0);
            }}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              examMode === 'thpt2025'
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="font-semibold text-sm text-gray-900 mb-1">THPT 2025</div>
            <div className="text-xs text-gray-500">Đúng/Sai (4 mệnh đề)</div>
          </button>
        </div>
      </div>

      {/* Number of Questions */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          Số câu hỏi
        </label>
        <input
          type="number"
          min="1"
          max="50"
          value={numQuestions}
          onChange={(e) => {
            setNumQuestions(parseInt(e.target.value) || 10);
            setTimeout(handleChange, 0);
          }}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      {/* Study Mode */}
      <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
        <div>
          <div className="font-semibold text-sm text-gray-900 mb-1">Chế độ ôn tập</div>
          <div className="text-xs text-gray-500">Bao gồm giải thích & flashcard</div>
        </div>
        <button
          onClick={() => {
            setStudyMode(!studyMode);
            setTimeout(handleChange, 0);
          }}
          className={`relative w-12 h-6 rounded-full transition-colors ${
            studyMode ? 'bg-indigo-600' : 'bg-gray-300'
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
              studyMode ? 'translate-x-6' : ''
            }`}
          />
        </button>
      </div>
    </div>
  );
}
