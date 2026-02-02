'use client';

import { useState, useRef, useEffect } from 'react';
import { ChatMode } from '../page';
import QuizView from './QuizView';
import QuestionConfig from './QuestionConfig';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  questions?: any[];
  type?: 'text' | 'quiz' | 'exam';
  fileId?: string; // For FSRS tracking
  fileName?: string; // For display
}

interface ChatWindowProps {
  mode: ChatMode;
  onModeChange: (mode: ChatMode) => void;
  uploadedFiles: Array<{ id: string; name: string; size: number; uploadedAt: Date; content?: string }>;
}

export default function ChatWindow({ mode, onModeChange, uploadedFiles }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Xin chào! Tôi là trợ lý AI của EduGen VN. 

Bạn đang ở chế độ: **${mode === 'quiz' ? 'Ôn tập trắc nghiệm' : mode === 'exam' ? 'Xuất đề thi' : 'Chat tự do'}**

Bạn có thể:
- Upload file tài liệu
- Yêu cầu tạo câu hỏi
- Đặt các câu hỏi về nội dung

Hãy bắt đầu bằng cách upload file hoặc nhập yêu cầu!`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [questionConfig, setQuestionConfig] = useState<{
    numberOfQuestions: number;
    difficultyLevel?: 'easy' | 'medium' | 'hard';
  }>({ numberOfQuestions: 10 });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    // Allow sending without input in quiz/exam mode
    const canSendWithoutInput = (mode === 'quiz' || mode === 'exam') && uploadedFiles.length > 0;
    
    if (!input.trim() && !canSendWithoutInput) return;

    // Generate default message for quiz/exam mode if no input
    let messageContent = input.trim();
    if (!messageContent && canSendWithoutInput) {
      const difficultyText = questionConfig.difficultyLevel 
        ? ` mức độ ${questionConfig.difficultyLevel === 'easy' ? 'dễ' : questionConfig.difficultyLevel === 'medium' ? 'trung bình' : 'khó'}` 
        : '';
      messageContent = `Tạo ${questionConfig.numberOfQuestions} câu hỏi trắc nghiệm${difficultyText}`;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = messageContent;
    setInput('');
    setIsTyping(true);

    try {
      // Combine content from all uploaded files
      const fileContent = uploadedFiles
        .filter(f => f.content)
        .map(f => `=== ${f.name} ===\n${f.content}`)
        .join('\n\n');

      // Call API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentInput,
          mode: mode,
          fileContent: fileContent || null,
          config: questionConfig,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw errorData;
      }

      const data = await response.json();

      // Get the first uploaded file for FSRS tracking (if any)
      const firstFile = uploadedFiles.length > 0 ? uploadedFiles[0] : null;

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content || 'Đã tạo câu hỏi thành công!',
        timestamp: new Date(),
        type: data.type,
        questions: data.questions,
        fileId: firstFile?.id,
        fileName: firstFile?.name,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error calling API:', error);
      console.error('Error stringified:', JSON.stringify(error, null, 2));
      console.error('Error type:', typeof error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '❌ Đã xảy ra lỗi khi xử lý yêu cầu. Vui lòng thử lại.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const modes = [
    { id: 'quiz' as ChatMode, name: 'Ôn tập trắc nghiệm', icon: '📝', desc: 'Tạo câu hỏi và làm bài' },
    { id: 'exam' as ChatMode, name: 'Xuất đề thi', icon: '📄', desc: 'Tạo và xuất đề thi' },
    { id: 'chat' as ChatMode, name: 'Chat tự do', icon: '💬', desc: 'Trò chuyện tự do' },
  ];

  const currentMode = modes.find(m => m.id === mode);

  return (
    <div className="flex-1 flex flex-col">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((message) => (
          <div key={message.id}>
            <div
              className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
              )}

              <div
                className={`max-w-3xl ${
                  message.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-sm'
                    : 'bg-white border border-gray-200 rounded-2xl rounded-tl-sm'
                } px-6 py-4 shadow-sm`}
              >
                <div
                  className={`text-sm leading-relaxed whitespace-pre-wrap ${
                    message.role === 'user' ? 'text-white' : 'text-gray-900'
                  }`}
                  dangerouslySetInnerHTML={{
                    __html: message.content
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\n/g, '<br />'),
                  }}
                />
                <div
                  className={`text-xs mt-2 ${
                    message.role === 'user' ? 'text-indigo-200' : 'text-gray-400'
                  }`}
                >
                  {message.timestamp.toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>

              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0 text-white text-sm font-semibold">
                  U
                </div>
              )}
            </div>

            {/* Render Quiz/Exam Questions */}
            {message.role === 'assistant' && message.questions && message.questions.length > 0 && (
              <div className="ml-12 mt-4">
                <QuizView 
                  questions={message.questions} 
                  mode={message.type === 'exam' ? 'exam' : 'quiz'}
                  fileId={message.fileId}
                  fileName={message.fileName}
                />
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-6 py-4 shadow-sm">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white p-6">
        <div className="max-w-4xl mx-auto">
          {/* Mode Selector */}
          <div className="mb-4 flex items-center gap-2">
            <span className="text-sm text-gray-600">Chế độ:</span>
            <div className="flex gap-2">
              {modes.map((m) => (
                <button
                  key={m.id}
                  onClick={() => onModeChange(m.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    mode === m.id
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  title={m.desc}
                >
                  <span className="mr-1">{m.icon}</span>
                  {m.name}
                </button>
              ))}
            </div>
          </div>

          {/* Selected Files Info */}
          {uploadedFiles.length > 0 && (
            <div className="mb-4 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-indigo-800">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="font-medium">{uploadedFiles.length} file đã upload</span>
                <span className="text-indigo-600">•</span>
                <span className="text-xs">{uploadedFiles[uploadedFiles.length - 1]?.name}</span>
              </div>
            </div>
          )}

          {/* Input Row */}
          <div className="flex gap-3 items-end">
            {/* Config Button */}
            {(mode === 'quiz' || mode === 'exam') && (
              <button
                onClick={() => setShowConfig(true)}
                className="p-3 border border-gray-300 hover:border-indigo-500 hover:bg-indigo-50 text-gray-700 rounded-xl transition-colors"
                title="Cấu hình câu hỏi"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            )}
            
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={
                  mode === 'quiz' || mode === 'exam'
                    ? `Nhấn Enter hoặc nút gửi để tạo câu hỏi (có thể để trống)\n\nMặc định: Tạo ${questionConfig.numberOfQuestions} câu hỏi${questionConfig.difficultyLevel ? ` mức độ ${questionConfig.difficultyLevel === 'easy' ? 'dễ' : questionConfig.difficultyLevel === 'medium' ? 'trung bình' : 'khó'}` : ''}\n\nHoặc nhập yêu cầu tùy chỉnh...`
                    : `Nhập tin nhắn... (Shift + Enter để xuống dòng)`
                }
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                rows={3}
              />
            </div>

            <button
              onClick={handleSend}
              disabled={(!input.trim() && mode !== 'quiz' && mode !== 'exam') || isTyping || (mode !== 'chat' && uploadedFiles.length === 0)}
              className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title={
                uploadedFiles.length === 0 && mode !== 'chat'
                  ? 'Vui lòng upload file trước'
                  : mode === 'quiz' || mode === 'exam'
                  ? 'Tạo câu hỏi (có thể để trống)'
                  : 'Gửi tin nhắn'
              }
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            EduGen VN có thể mắc lỗi. Hãy kiểm tra thông tin quan trọng.
          </p>
        </div>
      </div>

      {/* Question Config Modal */}
      <QuestionConfig
        isOpen={showConfig}
        onClose={() => setShowConfig(false)}
        onApply={(config) => setQuestionConfig(config)}
      />
    </div>
  );
}
