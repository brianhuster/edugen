'use client';

import { useState, useCallback } from 'react';

interface FileUploadProps {
  onFileProcessed: (text: string, fileName: string) => void;
  onError: (error: string) => void;
  uploadedFiles: { name: string; date: Date }[];
}

export default function FileUpload({ onFileProcessed, onError, uploadedFiles }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = useCallback(
    async (file: File) => {
      setUploading(true);

      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Upload failed');
        }

        const data = await response.json();
        onFileProcessed(data.text, file.name);
      } catch (error) {
        onError(error instanceof Error ? error.message : 'Lỗi xử lý file');
      } finally {
        setUploading(false);
      }
    },
    [onFileProcessed, onError]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFile(e.dataTransfer.files[0]);
      }
    },
    [handleFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();
      if (e.target.files && e.target.files[0]) {
        handleFile(e.target.files[0]);
      }
    },
    [handleFile]
  );

  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  return (
    <div>
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-xl transition-all ${
          dragActive
            ? 'border-indigo-500 bg-indigo-50'
            : 'border-gray-300 hover:border-indigo-300'
        } ${uploading ? 'opacity-60 pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload"
          onChange={handleChange}
          disabled={uploading}
          className="hidden"
        />

        <label htmlFor="file-upload" className="block cursor-pointer p-8">
          {uploading ? (
            <div className="flex flex-col items-center">
              <div className="relative w-12 h-12 mb-4">
                <div className="absolute inset-0 rounded-full border-3 border-indigo-200"></div>
                <div className="absolute inset-0 rounded-full border-3 border-indigo-600 border-t-transparent animate-spin"></div>
              </div>
              <p className="text-sm font-medium text-gray-700">Đang xử lý file...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 mb-4 rounded-xl bg-indigo-100 flex items-center justify-center">
                <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-gray-900 mb-1">
                Upload tài liệu
              </p>
              <p className="text-xs text-gray-500">Mọi định dạng · Tối đa 10MB</p>
            </div>
          )}
        </label>
      </div>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="mt-4 space-y-2 animate-slide-in">
          {uploadedFiles.slice(-3).reverse().map((file, index) => {
            const getFileStyle = (fileName: string) => {
              const ext = fileName.split('.').pop()?.toLowerCase();
              if (ext === 'pdf') return { bg: 'bg-red-100', icon: 'text-red-600' };
              if (ext === 'txt') return { bg: 'bg-blue-100', icon: 'text-blue-600' };
              if (ext === 'doc' || ext === 'docx') return { bg: 'bg-indigo-100', icon: 'text-indigo-600' };
              if (ext === 'ppt' || ext === 'pptx') return { bg: 'bg-orange-100', icon: 'text-orange-600' };
              if (ext === 'xls' || ext === 'xlsx') return { bg: 'bg-green-100', icon: 'text-green-600' };
              return { bg: 'bg-gray-100', icon: 'text-gray-600' };
            };

            const style = getFileStyle(file.name);

            return (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200"
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-lg ${style.bg} flex items-center justify-center`}>
                  <svg className={`w-4 h-4 ${style.icon}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {file.date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
