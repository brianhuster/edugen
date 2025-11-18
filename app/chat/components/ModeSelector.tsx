'use client';

import { ChatMode } from '../page';

interface ModeSelectorProps {
  mode: ChatMode;
  onModeChange: (mode: ChatMode) => void;
}

export default function ModeSelector({ mode, onModeChange }: ModeSelectorProps) {
  const modes = [
    { id: 'quiz' as ChatMode, name: 'Ôn tập trắc nghiệm', icon: '📝' },
    { id: 'exam' as ChatMode, name: 'Xuất đề thi', icon: '📄' },
    { id: 'chat' as ChatMode, name: 'Chat tự do', icon: '💬' },
  ];

  const currentMode = modes.find((m) => m.id === mode);

  return (
    <div className="relative group">
      <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
        <span>{currentMode?.icon}</span>
        <span className="text-sm font-medium text-gray-900">{currentMode?.name}</span>
        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
        {modes.map((m) => (
          <button
            key={m.id}
            onClick={() => onModeChange(m.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
              mode === m.id ? 'bg-indigo-50' : ''
            }`}
          >
            <span className="text-xl">{m.icon}</span>
            <div className="flex-1 text-left">
              <div className={`text-sm font-medium ${mode === m.id ? 'text-indigo-600' : 'text-gray-900'}`}>
                {m.name}
              </div>
              <div className="text-xs text-gray-500">
                {m.id === 'quiz' && 'Tạo câu hỏi và làm bài'}
                {m.id === 'exam' && 'Tạo và xuất đề thi'}
                {m.id === 'chat' && 'Trò chuyện tự do'}
              </div>
            </div>
            {mode === m.id && (
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
