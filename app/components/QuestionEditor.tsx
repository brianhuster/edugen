'use client';

import { useState } from 'react';
import { Question, StandardQuestion, THPT2025Question } from '@/lib/types';

interface QuestionEditorProps {
  questions: Question[];
  onQuestionsChange: (questions: Question[]) => void;
  onExport: () => void;
  exporting: boolean;
}

export default function QuestionEditor({
  questions,
  onQuestionsChange,
  onExport,
  exporting,
}: QuestionEditorProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    onQuestionsChange(questions.filter((q) => q.id !== id));
  };

  const handleEdit = (updatedQuestion: Question) => {
    onQuestionsChange(
      questions.map((q) => (q.id === updatedQuestion.id ? updatedQuestion : q))
    );
    setEditingId(null);
  };

  if (questions.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">
          Danh sách câu hỏi ({questions.length})
        </h2>
        <button
          onClick={onExport}
          disabled={exporting}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {exporting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Đang xuất...
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Xuất file Word
            </>
          )}
        </button>
      </div>

      <div className="space-y-4">
        {questions.map((question, index) => (
          <div key={question.id} className="border border-gray-200 rounded-lg p-4">
            {question.type === 'standard' ? (
              <StandardQuestionView
                question={question}
                index={index}
                isEditing={editingId === question.id}
                onEdit={() => setEditingId(question.id)}
                onSave={handleEdit}
                onCancel={() => setEditingId(null)}
                onDelete={() => handleDelete(question.id)}
              />
            ) : (
              <THPT2025QuestionView
                question={question}
                index={index}
                isEditing={editingId === question.id}
                onEdit={() => setEditingId(question.id)}
                onSave={handleEdit}
                onCancel={() => setEditingId(null)}
                onDelete={() => handleDelete(question.id)}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

interface QuestionViewProps {
  question: Question;
  index: number;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (question: Question) => void;
  onCancel: () => void;
  onDelete: () => void;
}

function StandardQuestionView({
  question,
  index,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onDelete,
}: QuestionViewProps) {
  const q = question as StandardQuestion;
  const [editedQuestion, setEditedQuestion] = useState(q);

  if (isEditing) {
    return (
      <div>
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Câu hỏi {index + 1}
          </label>
          <textarea
            value={editedQuestion.question}
            onChange={(e) =>
              setEditedQuestion({ ...editedQuestion, question: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
          />
        </div>
        {(['A', 'B', 'C', 'D'] as const).map((option) => (
          <div key={option} className="mb-2">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name={`correct-${q.id}`}
                checked={editedQuestion.correctAnswer === option}
                onChange={() =>
                  setEditedQuestion({ ...editedQuestion, correctAnswer: option })
                }
              />
              <span className="font-medium">{option}.</span>
              <input
                type="text"
                value={editedQuestion.options[option]}
                onChange={(e) =>
                  setEditedQuestion({
                    ...editedQuestion,
                    options: { ...editedQuestion.options, [option]: e.target.value },
                  })
                }
                className="flex-1 px-2 py-1 border border-gray-300 rounded"
              />
            </label>
          </div>
        ))}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => onSave(editedQuestion)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded text-sm"
          >
            Lưu
          </button>
          <button
            onClick={onCancel}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-1 rounded text-sm"
          >
            Hủy
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-start mb-3">
        <p className="font-medium text-gray-800">
          <span className="text-blue-600">Câu {index + 1}:</span> {q.question}
        </p>
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Sửa
          </button>
          <button
            onClick={onDelete}
            className="text-red-600 hover:text-red-800 text-sm"
          >
            Xóa
          </button>
        </div>
      </div>
      <div className="space-y-1 text-sm">
        {Object.entries(q.options).map(([key, value]) => (
          <p
            key={key}
            className={key === q.correctAnswer ? 'font-medium text-green-600' : ''}
          >
            {key}. {value}
          </p>
        ))}
      </div>
      {q.explanation && (
        <p className="mt-2 text-sm text-gray-600 italic">
          💡 {q.explanation}
        </p>
      )}
    </div>
  );
}

function THPT2025QuestionView({
  question,
  index,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onDelete,
}: QuestionViewProps) {
  const q = question as THPT2025Question;
  const [editedQuestion, setEditedQuestion] = useState(q);

  if (isEditing) {
    return (
      <div>
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ngữ cảnh {index + 1}
          </label>
          <textarea
            value={editedQuestion.context}
            onChange={(e) =>
              setEditedQuestion({ ...editedQuestion, context: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        </div>
        {(['a', 'b', 'c', 'd'] as const).map((key) => (
          <div key={key} className="mb-2">
            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={editedQuestion.correctAnswers[key]}
                onChange={(e) =>
                  setEditedQuestion({
                    ...editedQuestion,
                    correctAnswers: {
                      ...editedQuestion.correctAnswers,
                      [key]: e.target.checked,
                    },
                  })
                }
                className="mt-1"
              />
              <span className="font-medium">{key})</span>
              <input
                type="text"
                value={editedQuestion.statements[key]}
                onChange={(e) =>
                  setEditedQuestion({
                    ...editedQuestion,
                    statements: { ...editedQuestion.statements, [key]: e.target.value },
                  })
                }
                className="flex-1 px-2 py-1 border border-gray-300 rounded"
              />
            </label>
          </div>
        ))}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => onSave(editedQuestion)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded text-sm"
          >
            Lưu
          </button>
          <button
            onClick={onCancel}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-1 rounded text-sm"
          >
            Hủy
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-start mb-3">
        <p className="font-medium text-gray-800">
          <span className="text-blue-600">Câu {index + 1}:</span> {q.context}
        </p>
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Sửa
          </button>
          <button
            onClick={onDelete}
            className="text-red-600 hover:text-red-800 text-sm"
          >
            Xóa
          </button>
        </div>
      </div>
      <p className="text-sm text-gray-600 mb-2">
        Đánh giá Đúng/Sai cho các mệnh đề:
      </p>
      <div className="space-y-1 text-sm">
        {Object.entries(q.statements).map(([key, value]) => (
          <p key={key}>
            {key}) {value}{' '}
            <span
              className={
                q.correctAnswers[key as keyof typeof q.correctAnswers]
                  ? 'text-green-600 font-medium'
                  : 'text-red-600 font-medium'
              }
            >
              [
              {q.correctAnswers[key as keyof typeof q.correctAnswers]
                ? 'Đúng'
                : 'Sai'}
              ]
            </span>
          </p>
        ))}
      </div>
      {q.explanation && (
        <p className="mt-2 text-sm text-gray-600 italic">
          💡 {q.explanation}
        </p>
      )}
    </div>
  );
}
