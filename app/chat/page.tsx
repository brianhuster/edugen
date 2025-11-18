'use client';

import { useState } from 'react';
import FilePanel from './components/FilePanel';
import ChatWindow from './components/ChatWindow';

export type ChatMode = 'quiz' | 'exam' | 'chat';

export default function ChatPage() {
  const [mode, setMode] = useState<ChatMode>('quiz');
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ id: string; name: string; size: number; uploadedAt: Date; content?: string }>>([]);

  const handleFileUpload = (file: { id: string; name: string; size: number; uploadedAt: Date; content?: string }) => {
    setUploadedFiles(prev => [...prev, file]);
  };

  const handleFileDelete = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Panel - File Management */}
      <FilePanel 
        files={uploadedFiles}
        onFileUpload={handleFileUpload}
        onFileDelete={handleFileDelete}
      />

      {/* Right Panel - Chat */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-gray-900">EduGen VN</h1>
            </div>
          </div>
        </header>

        {/* Chat Window */}
        <ChatWindow mode={mode} onModeChange={setMode} uploadedFiles={uploadedFiles} />
      </div>
    </div>
  );
}
