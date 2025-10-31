import React from 'react';
import { SavedResult } from '../types';

interface HistoryScreenProps {
  results: SavedResult[];
  onBack: () => void;
}

const HistoryScreen: React.FC<HistoryScreenProps> = ({ results, onBack }) => {
  const sortedResults = [...results].sort((a, b) => b.timestamp - a.timestamp);

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-500';
    if (score >= 5) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="bg-white p-8 rounded-3xl w-full animate-fade-in" style={{ boxShadow: 'var(--shadow-lg)'}}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-extrabold" style={{ color: 'var(--c-text-header)' }}>Bảng thành tích</h1>
        <button onClick={onBack} className="text-sm font-bold py-2 px-4 rounded-lg transition btn-bounce" style={{ backgroundColor: '#F1F5F9', color: 'var(--c-text-body)' }}>
            &larr; Quay lại
        </button>
      </div>

      {sortedResults.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-2xl" style={{ color: 'var(--c-text-muted)'}}>
          <div className="text-5xl mb-4">📚</div>
          <p className="font-bold">Chưa có bài đọc nào được lưu.</p>
          <p>Hoàn thành một bài đọc để xem thành tích ở đây nhé!</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 -mr-2">
          {sortedResults.map((item) => (
            <div key={item.timestamp} className="bg-slate-50 p-5 rounded-2xl border" style={{ borderColor: 'var(--c-border)' }}>
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="font-bold text-lg" style={{ color: 'var(--c-primary)'}}>{item.lessonTitle}</h2>
                        <p className="text-sm" style={{ color: 'var(--c-text-muted)' }}>
                            {new Date(item.timestamp).toLocaleString('vi-VN', {
                                day: '2-digit', month: '2-digit', year: 'numeric',
                                hour: '2-digit', minute: '2-digit',
                            })}
                        </p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                        <p className="text-sm font-semibold" style={{ color: 'var(--c-text-muted)' }}>Tổng điểm</p>
                        <p className={`font-extrabold text-3xl ${getScoreColor(item.resultData.scores.overall)}`}>{item.resultData.scores.overall}/10</p>
                    </div>
                </div>
                 <div className="mt-4 border-t border-slate-200 pt-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <p><span style={{ color: 'var(--c-text-muted)' }}>Lưu loát:</span> <strong className="font-bold" style={{ color: 'var(--c-text-body)'}}>{item.resultData.scores.fluency}</strong></p>
                    <p><span style={{ color: 'var(--c-text-muted)' }}>Phát âm:</span> <strong className="font-bold" style={{ color: 'var(--c-text-body)'}}>{item.resultData.scores.pronunciation}</strong></p>
                    <p><span style={{ color: 'var(--c-text-muted)' }}>Chính xác:</span> <strong className="font-bold" style={{ color: 'var(--c-text-body)'}}>{item.resultData.scores.accuracy}</strong></p>
                    <p>
                        <span style={{ color: 'var(--c-text-muted)' }}>Số lỗi:</span> 
                        <strong className={item.resultData.errors.length > 0 ? "font-bold text-red-500" : "font-bold text-green-600"}>
                            {item.resultData.errors.length}
                        </strong>
                    </p>
                 </div>
                 {item.resultData.errors && item.resultData.errors.length > 0 && (
                    <details className="mt-3 group">
                      <summary className="cursor-pointer text-sm font-semibold text-blue-600">Xem các lỗi sai</summary>
                      <div className="mt-2 border-t border-slate-200 pt-3">
                          <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
                              {item.resultData.errors.map((error, index) => (
                                  <li key={index}>
                                      Từ đúng <span className="font-semibold text-green-600">{error.originalWord || '(thêm từ)'}</span>, con đọc thành <span className="font-semibold text-red-500">{error.studentWord || '(bỏ qua)'}</span>
                                  </li>
                              ))}
                          </ul>
                      </div>
                    </details>
                 )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryScreen;