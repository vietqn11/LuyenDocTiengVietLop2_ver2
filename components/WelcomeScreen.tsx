import React, { useState } from 'react';
import { User } from '../types';
import UserIcon from './icons/UserIcon';
import TrashIcon from './icons/TrashIcon';
import XCircleIcon from './icons/XCircleIcon';
import WelcomeIllustration from './icons/WelcomeIllustration';


interface WelcomeScreenProps {
  onStart: (name: string, className:string, apiKey: string) => void;
  savedUsers: User[];
  onSelectUser: (user: User) => void;
  onDeleteUser: (user: User) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart, savedUsers, onSelectUser, onDeleteUser }) => {
  const [name, setName] = useState('');
  const [className, setClassName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showApiHelp, setShowApiHelp] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && className.trim()) {
      onStart(name.trim(), className.trim(), apiKey.trim());
    }
  };

  return (
    <>
      <div className="bg-white p-8 rounded-3xl shadow-lg max-w-2xl mx-auto text-center animate-fade-in flex flex-col md:flex-row items-center gap-8" style={{ boxShadow: 'var(--shadow-lg)' }}>
        <div className="md:w-2/5">
          <WelcomeIllustration />
        </div>
        <div className="w-full md:w-3/5">
          <h1 className="text-4xl font-extrabold text-blue-800 mb-2 whitespace-nowrap" style={{ color: 'var(--c-text-header)'}}>Luyện đọc Tiếng Việt</h1>
          <p style={{ color: 'var(--c-text-muted)' }} className="mb-6">Dành cho học sinh lớp 2</p>
          
          <div className="bg-yellow-100 border-l-4 border-yellow-400 text-yellow-800 p-3 rounded-r-lg mb-5 text-left text-sm">
            <p>
              <strong>Lưu ý nhỏ:</strong> Các con hãy điền họ tên và lớp thật chính xác để cô giáo AI có thể theo dõi và chấm bài cho con thật tốt nhé! ❤️
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Họ và tên của con"
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                required
              />
            </div>
            <div>
              <input
                id="className"
                type="text"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="Lớp của con"
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                required
              />
            </div>
            <div>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="apiKey" className="text-sm font-semibold" style={{ color: 'var(--c-text-body)'}}>
                    API Key cá nhân (Tùy chọn)
                  </label>
                   <button type="button" onClick={() => setShowApiHelp(true)} className="text-xs text-blue-600 hover:underline">
                    Lấy API Key ở đâu?
                  </button>
                </div>
                <input
                  id="apiKey"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Dán API Key vào đây (nếu có)"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                />
                <p className="text-xs text-slate-500 mt-2 text-left px-1">
                  Sử dụng API cá nhân sẽ giúp cô giáo AI hoạt động ổn định và nhanh hơn, tránh bị gián đoạn khi có nhiều bạn cùng học.
                </p>
            </div>
            <button 
              type="submit" 
              className="w-full text-white font-bold py-3 px-6 rounded-xl text-lg transition-transform transform btn-bounce"
              style={{ backgroundColor: 'var(--c-primary)', boxShadow: 'var(--shadow-md)' }}
            >
              Vào học thôi!
            </button>
          </form>
        </div>
      </div>
        
      {savedUsers.length > 0 && (
          <div className="max-w-2xl mx-auto mt-8 animate-fade-in">
            <div className="relative">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-slate-300" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-2 text-sm" style={{ backgroundColor: 'var(--c-bg)', color: 'var(--c-text-muted)'}}>Hoặc chọn bạn đã học</span>
              </div>
            </div>
            
            <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedUsers.map((user, index) => (
                <li key={index} className="relative group">
                  <button onClick={() => onSelectUser(user)} className="flex items-center gap-3 text-left w-full bg-white p-4 rounded-xl shadow-md transition-all transform hover:-translate-y-1 hover:shadow-lg">
                    <span className="flex-shrink-0 bg-blue-100 text-blue-600 p-3 rounded-full"><UserIcon /></span>
                    <div>
                      <p className="font-bold" style={{ color: 'var(--c-text-header)'}}>{user.name}</p>
                      <p className="text-sm" style={{ color: 'var(--c-text-muted)'}}>Lớp: {user.className}</p>
                    </div>
                  </button>
                  <button 
                    onClick={() => onDeleteUser(user)}
                    className="absolute -top-2 -right-2 p-1.5 bg-white text-slate-400 hover:text-red-500 hover:bg-red-100 rounded-full transition-opacity opacity-0 group-hover:opacity-100 shadow-md"
                    aria-label={`Xóa hồ sơ ${user.name}`}
                  >
                    <TrashIcon />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

      {showApiHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 animate-fade-in-fast" onClick={() => setShowApiHelp(false)}>
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full relative text-left" style={{ boxShadow: 'var(--shadow-lg)' }} onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setShowApiHelp(false)} 
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition"
              aria-label="Đóng"
            >
              <XCircleIcon />
            </button>
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--c-text-header)'}}>Hướng dẫn lấy API Key của Google AI</h2>
            <p className="mb-6" style={{ color: 'var(--c-text-muted)'}}>Làm theo các bước sau để có API Key cá nhân miễn phí:</p>
            <ol className="list-decimal list-inside space-y-4" style={{ color: 'var(--c-text-body)'}}>
              <li>
                Truy cập trang Google AI Studio tại đây: 
                <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-600 hover:underline ml-1">
                  aistudio.google.com
                </a>.
                (Bạn sẽ cần đăng nhập bằng tài khoản Google).
              </li>
              <li>
                Nhấn vào nút <strong className="text-blue-600">"Create API key"</strong> (Tạo khóa API).
              </li>
              <li>
                Một khóa API mới sẽ được tạo ra. Hãy nhấn vào biểu tượng sao chép (copy) để chép toàn bộ mã khóa này.
              </li>
              <li>
                Quay lại ứng dụng, đóng cửa sổ này và dán (paste) mã khóa bạn vừa chép vào ô "API Key cá nhân".
              </li>
            </ol>
            <div className="mt-6 p-4 bg-yellow-100 border-l-4 border-yellow-400 text-yellow-800 rounded-r-lg">
                <h4 className="font-bold">Lưu ý quan trọng:</h4>
                <ul className="list-disc list-inside text-sm mt-2">
                    <li>Hãy giữ API Key của bạn cẩn thận và không chia sẻ công khai.</li>
                    <li>Google cung cấp một lượng sử dụng miễn phí khá lớn, phù hợp cho việc học. Nếu sử dụng vượt mức, có thể sẽ phát sinh chi phí. Phụ huynh có thể xem bảng giá chi tiết 
                    <a href="https://ai.google.dev/pricing" target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline ml-1">tại đây</a>.
                    </li>
                </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WelcomeScreen;