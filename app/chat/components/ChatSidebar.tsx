'use client';

interface ChatSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function ChatSidebar({ isOpen, onToggle }: ChatSidebarProps) {
  if (!isOpen) return null;

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-gray-700">
        <button
          onClick={onToggle}
          className="p-2 hover:bg-gray-800 rounded-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Chat mới
        </button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="space-y-2">
          <div className="text-xs font-semibold text-gray-400 px-3 py-2">HÔM NAY</div>
          <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-800 text-sm">
            <div className="font-medium truncate">Tạo 10 câu hỏi Toán học</div>
            <div className="text-xs text-gray-400">5 phút trước</div>
          </button>
          <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-800 text-sm">
            <div className="font-medium truncate">Ôn tập Hóa học lớp 10</div>
            <div className="text-xs text-gray-400">2 giờ trước</div>
          </button>
        </div>

        <div className="space-y-2 mt-6">
          <div className="text-xs font-semibold text-gray-400 px-3 py-2">HÔM QUA</div>
          <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-800 text-sm">
            <div className="font-medium truncate">Đề thi Văn học</div>
            <div className="text-xs text-gray-400">Hôm qua</div>
          </button>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-700">
        <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-semibold">
            U
          </div>
          <div className="flex-1 text-left">
            <div className="text-sm font-medium">User</div>
            <div className="text-xs text-gray-400">test@edugen.vn</div>
          </div>
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12M8 12h12M8 17h12M3 7h.01M3 12h.01M3 17h.01" />
          </svg>
        </button>
      </div>
    </div>
  );
}
