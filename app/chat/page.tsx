'use client';

import { useState } from 'react';
import FilePanel from './components/FilePanel';
import ChatWindow from './components/ChatWindow';
import Header from '../components/Header';

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
        <Header />
        {/* Chat Window */}
        <ChatWindow mode={mode} onModeChange={setMode} uploadedFiles={uploadedFiles} />
      </div>
    </div>
  );
}
