'use client';

import { useState, useCallback } from 'react';
import FileUpload from './components/FileUpload';
import ConfigPanel from './components/ConfigPanel';
import QuestionEditor from './components/QuestionEditor';
import FlashcardStudy from './components/FlashcardStudy';
import { Question, ExamMode, ExamConfig } from '@/lib/types';

export default function Home() {
  const [pdfText, setPdfText] = useState<string>('');
  const [config, setConfig] = useState<ExamConfig>({
    mode: 'standard',
    studyMode: false,
    numberOfQuestions: 10,
  });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string>('');
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; date: Date }[]>([]);

  const handleConfigChange = useCallback(
    (mode: ExamMode, studyMode: boolean, numQuestions: number) => {
      setConfig({ mode, studyMode, numberOfQuestions: numQuestions });
    },
    []
  );

  const handleFileProcessed = useCallback((text: string, fileName: string) => {
    setPdfText(text);
    setError('');
    setUploadedFiles(prev => [...prev, { name: fileName, date: new Date() }]);
  }, []);

  const handleError = useCallback((err: string) => {
    setError(err);
    setPdfText('');
  }, []);

  const handleGenerateQuestions = async () => {
    if (!pdfText) {
      setError('Vui lòng tải tài liệu PDF lên trước');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: pdfText,
          config,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate questions');
      }

      const data = await response.json();
      setQuestions(data.questions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tạo câu hỏi');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (questions.length === 0) {
      return;
    }

    setExporting(true);

    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questions,
          title: 'ĐỀ THI TRẮC NGHIỆM',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to export document');
      }

      // Download file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `de-thi-${Date.now()}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi xuất file');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                EduGen VN
              </h1>
              <p className="text-sm text-gray-600">
                Tạo đề thi & Ôn tập thông minh với AI
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 animate-slide-up">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-red-900">{error}</p>
              </div>
              <button
                onClick={() => setError('')}
                className="flex-shrink-0 text-red-400 hover:text-red-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Upload & Config */}
          <div className="lg:col-span-1 space-y-6">
            <FileUpload 
              onFileProcessed={handleFileProcessed} 
              onError={handleError}
              uploadedFiles={uploadedFiles}
            />
            <ConfigPanel onConfigChange={handleConfigChange} />

            {/* Generate Button */}
            {pdfText && (
              <button
                onClick={handleGenerateQuestions}
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-4 rounded-2xl font-semibold text-base shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group animate-slide-up"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Đang xử lý với AI...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-6 h-6 group-hover:scale-110 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    Tạo câu hỏi
                  </>
                )}
              </button>
            )}
          </div>

          {/* Right Column - Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* Question Editor */}
            {questions.length > 0 && (
              <>
                <QuestionEditor
                  questions={questions}
                  onQuestionsChange={setQuestions}
                  onExport={handleExport}
                  exporting={exporting}
                />

                {/* Flashcard Study Mode */}
                {config.studyMode && (
                  <FlashcardStudy questions={questions} />
                )}
              </>
            )}

            {/* Instructions */}
            {!pdfText && !loading && questions.length === 0 && (
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200 p-8 shadow-sm animate-fade-in">
                <div className="text-center mb-8">
                  <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Hướng dẫn sử dụng
                  </h2>
                  <p className="text-gray-600">
                    Làm theo các bước sau để bắt đầu
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { num: '1', title: 'Tải tài liệu PDF', desc: 'Chọn file PDF chứa nội dung cần tạo câu hỏi', icon: 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12' },
                    { num: '2', title: 'Cấu hình', desc: 'Chọn loại câu hỏi và bật chế độ ôn tập nếu cần', icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4' },
                    { num: '3', title: 'Tạo câu hỏi', desc: 'Nhấn "Tạo câu hỏi" và đợi AI xử lý', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
                    { num: '4', title: 'Xuất file', desc: 'Chỉnh sửa và xuất file Word để sử dụng', icon: 'M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
                  ].map((step) => (
                    <div key={step.num} className="flex gap-4 p-4 rounded-xl bg-gradient-to-br from-gray-50 to-white hover:shadow-md transition-shadow">
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-sm">
                        {step.num}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">{step.title}</h3>
                        <p className="text-sm text-gray-600">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-md mt-16 py-6 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-gray-600">
            © 2024 EduGen VN · Powered by{' '}
            <span className="font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Google Gemini AI
            </span>
          </p>
        </div>
      </footer>
    </div>
  );
}
