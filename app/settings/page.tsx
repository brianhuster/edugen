'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Header from '../components/Header';

export default function SettingsPage() {
  const { data: session } = useSession();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [notificationTime, setNotificationTime] = useState('09:00');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/settings');
      
      if (response.ok) {
        const data = await response.json();
        setEmailNotifications(data.emailNotifications ?? true);
        setNotificationTime(data.notificationTime ?? '09:00');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);

      const response = await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailNotifications,
          notificationTime,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      setMessage({ type: 'success', text: '✅ Đã lưu cài đặt thành công!' });
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: '❌ Không thể lưu cài đặt. Vui lòng thử lại.' });
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    try {
      setMessage(null);
      const response = await fetch('/api/user/test-email', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to send test email');
      }

      setMessage({ type: 'success', text: '✅ Email thử nghiệm đã được gửi! Kiểm tra hộp thư của bạn.' });
    } catch (error) {
      console.error('Error sending test email:', error);
      setMessage({ type: 'error', text: '❌ Không thể gửi email. Vui lòng kiểm tra cấu hình.' });
    }
  };

  const handleTestReminder = async () => {
    try {
      setMessage(null);
      const response = await fetch('/api/trigger-reminder', {
        method: 'POST',
      });

      const data = await response.json();

      if (!data.success) {
        if (data.message === 'No files due for review today') {
          const nextInfo = data.nextDueFile 
            ? `File tiếp theo: "${data.nextDueFile.fileName}" sẽ đến hạn sau ${data.nextDueFile.daysUntil} ngày.`
            : 'Không có file nào.';
          setMessage({ 
            type: 'error', 
            text: `⚠️ Không có file nào cần ôn hôm nay. ${nextInfo}` 
          });
        } else {
          throw new Error(data.error || data.message || 'Failed to send reminder');
        }
        return;
      }

      const filesList = data.filesIncluded.map((f: any) => {
        const overdueText = f.daysOverdue ? ` (quá hạn ${f.daysOverdue} ngày)` : '';
        return `"${f.fileName}"${overdueText}`;
      }).join(', ');

      setMessage({ 
        type: 'success', 
        text: `✅ ${data.message}. Files: ${filesList}` 
      });
    } catch (error) {
      console.error('Error sending test reminder:', error);
      setMessage({ type: 'error', text: '❌ Không thể gửi email nhắc nhở. Vui lòng thử lại.' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto p-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gray-100 flex items-center justify-center">
                <svg className="animate-spin w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <p className="text-sm text-gray-500">Đang tải cài đặt...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">⚙️ Cài đặt</h1>
          <p className="text-gray-600">Quản lý tài khoản và thông báo của bạn</p>
        </div>

        {/* Success/Error Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg border ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        {/* Account Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">👤 Thông tin tài khoản</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 w-24">Email:</span>
              <span className="text-sm font-medium text-gray-900">{session?.user?.email || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 w-24">Tên:</span>
              <span className="text-sm font-medium text-gray-900">{session?.user?.name || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Email Notifications */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">📧 Thông báo Email</h2>
          
          <div className="space-y-6">
            {/* Enable/Disable Notifications */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">
                  Nhận email nhắc nhở ôn tập
                </h3>
                <p className="text-xs text-gray-500">
                  Bạn sẽ nhận email khi có tài liệu cần ôn tập
                </p>
              </div>
              <button
                onClick={() => setEmailNotifications(!emailNotifications)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  emailNotifications ? 'bg-indigo-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    emailNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Notification Time */}
            {emailNotifications && (
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Thời gian nhận thông báo
                </label>
                <input
                  type="time"
                  value={notificationTime}
                  onChange={(e) => setNotificationTime(e.target.value)}
                  className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Email sẽ được gửi mỗi ngày vào thời gian này
                </p>
              </div>
            )}

            {/* Test Email Button */}
            {emailNotifications && (
              <div className="space-y-3">
                <div>
                  <button
                    onClick={handleTestEmail}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    📮 Gửi email thử nghiệm
                  </button>
                  <p className="text-xs text-gray-500 mt-2">
                    Gửi một email thử để kiểm tra cấu hình
                  </p>
                </div>
                
                <div>
                  <button
                    onClick={handleTestReminder}
                    className="px-4 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    🔔 Gửi email nhắc nhở ngay
                  </button>
                  <p className="text-xs text-gray-500 mt-2">
                    Gửi email nhắc nhở cho các file đến hạn ôn tập hôm nay
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* FSRS Info */}
        <div className="bg-indigo-50 rounded-xl border border-indigo-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-indigo-900 mb-3">🧠 Về hệ thống ôn tập</h2>
          <div className="text-sm text-indigo-800 space-y-2">
            <p>
              <strong>EduGen VN</strong> sử dụng thuật toán <strong>FSRS</strong> (Free Spaced Repetition Scheduler) 
              để tối ưu hóa quá trình ghi nhớ của bạn.
            </p>
            <p>
              Sau mỗi lần ôn tập, hãy đánh giá độ nhớ của bạn. Hệ thống sẽ tự động tính toán 
              thời điểm ôn tập tiếp theo dựa trên kết quả đánh giá.
            </p>
            <div className="mt-3 pt-3 border-t border-indigo-300">
              <p className="font-semibold mb-2">Cách đánh giá:</p>
              <ul className="space-y-1 text-xs">
                <li>• <strong>Again (1):</strong> Không nhớ gì → Ôn lại rất sớm</li>
                <li>• <strong>Hard (2):</strong> Nhớ khó khăn → Ôn lại sớm</li>
                <li>• <strong>Good (3):</strong> Nhớ tốt → Khoảng cách bình thường</li>
                <li>• <strong>Easy (4):</strong> Nhớ rất dễ → Khoảng cách dài hơn</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
          >
            {saving ? '⏳ Đang lưu...' : '💾 Lưu cài đặt'}
          </button>
          
          <a
            href="/chat"
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors text-center"
          >
            ← Quay lại
          </a>
        </div>
      </div>
    </div>
  );
}
