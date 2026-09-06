'use client';

import { useState, useEffect } from 'react';
import FilePanel from './components/FilePanel';
import ChatWindow from './components/ChatWindow';
import Header from '../components/Header';

export type ChatMode = 'quiz' | 'exam' | 'chat';

export default function ChatPage() {
  const [mode, setMode] = useState<ChatMode>('quiz');
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ id: string; name: string; size: number; uploadedAt: Date; content?: string; geminiFileUri?: string; mimeType?: string }>>([]);

  // Auto load file from URL parameter ?fileId=xxx
  useEffect(() => {
    const loadFileFromUrl = async () => {
      if (typeof window === 'undefined') return;
      const params = new URLSearchParams(window.location.search);
      const fileId = params.get('fileId');
      if (fileId) {
        try {
          const response = await fetch(`/api/files?id=${fileId}`);
          if (response.ok) {
            const data = await response.json();
            const file = data.file;
            setUploadedFiles(prev => {
              if (prev.some(f => f.id === file._id)) return prev;
              return [...prev, {
                id: file._id,
                name: file.fileName,
                size: file.sizeBytes || 0,
                uploadedAt: new Date(file.createdAt),
                content: file.content,
                geminiFileUri: file.uri,
                mimeType: file.mimeType,
              }];
            });
            // Clean up URL without reloading page
            window.history.replaceState({}, '', '/chat');
          }
        } catch (error) {
          console.error('Error auto-loading file from URL:', error);
        }
      }
    };
    
    loadFileFromUrl();
  }, []);

  const handleFileUpload = (file: { id: string; name: string; size: number; uploadedAt: Date; content?: string; geminiFileUri?: string; mimeType?: string }) => {
    setUploadedFiles(prev => [...prev, file]);
  };

  const handleFileSelect = (file: { id: string; name: string; size: number; uploadedAt: Date; content?: string; geminiFileUri?: string; mimeType?: string }) => {
    // Avoid adding duplicate files to the active session list
    setUploadedFiles(prev => {
      if (prev.some(f => f.id === file.id)) return prev;
      return [...prev, file];
    });
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
        onFileSelect={handleFileSelect}
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
