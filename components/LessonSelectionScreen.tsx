import React, { useState } from 'react';
import { User, Lesson } from '../types';
import { LESSONS } from '../constants/lessons';
import BookOpenIcon from './icons/BookOpenIcon';
import Spinner from './Spinner';
import { getQuickSuggestion } from '../services/geminiService';
import HistoryIcon from './icons/HistoryIcon';

interface LessonSelectionScreenProps {
  user: User;
  onSelectLesson: (lesson: Lesson) => void;
  onSwitchUser: () => void;
  onViewHistory: () => void;
}

const LessonSelectionScreen: React.FC<LessonSelectionScreenProps> = ({ user, onSelectLesson, onSwitchUser, onViewHistory }) => {
    const [suggestion, setSuggestion] = useState('');
    const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);

    const lessonsVol1 = LESSONS.filter(l => l.volume === 1);
    const lessonsVol2 = LESSONS.filter(l => l.volume === 2);
    
    const handleGetSuggestion = async () => {
        setIsLoadingSuggestion(true);
        setSuggestion('');
        const lessonTitles = LESSONS.map(l => l.title);
        const result = await getQuickSuggestion(user.name, lessonTitles, user.apiKey);
        setSuggestion(result);
        setIsLoadingSuggestion(false);
    }
    
    const renderLessonList = (lessons: Lesson[]) => (
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lessons.map(lesson => (
          <button 
            key={lesson.id} 
            onClick={() => onSelectLesson(lesson)} 
            className="bg-white p-6 rounded-2xl text-left transition-all duration-300 transform hover:-translate-y-2"
            style={{ boxShadow: 'var(--shadow-md)', border: '1px solid var(--c-border)' }}
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 p-3 rounded-full" style={{ backgroundColor: 'var(--c-primary)', color: 'white' }}>
                <BookOpenIcon />
              </div>
              <div>
                <h2 className="text-lg font-extrabold" style={{ color: 'var(--c-text-header)' }}>{lesson.title}</h2>
                <p className="text-sm mt-1 line-clamp-2" style={{ color: 'var(--c-text-muted)' }}>{lesson.text}</p>
                 <div className="mt-3 flex items-center gap-1 text-sm font-bold" style={{ color: 'var(--c-secondary)' }}>
                    {'★'.repeat(lesson.level)}{'☆'.repeat(3 - lesson.level)}
                 </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    );

  return (
    <div className="bg-white p-8 rounded-3xl w-full animate-fade-in" style={{ boxShadow: 'var(--shadow-lg)'}}>
        <div className="flex justify-between items-start mb-6 gap-2 flex-wrap">
            <div>
                 <h1 className="text-2xl md:text-3xl font-extrabold" style={{ color: 'var(--c-text-header)' }}>Chào <span className="text-pink-500">{user.name}</span>!</h1>
                 <p className="mt-1" style={{ color: 'var(--c-text-muted)' }}>Mình cùng luyện đọc bài mới nhé!</p>
            </div>
            <div className="flex-shrink-0 flex flex-col sm:flex-row gap-2">
                <button onClick={onViewHistory} className="text-sm bg-slate-100 font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2 btn-bounce" style={{ color: 'var(--c-text-body)', boxShadow: 'var(--shadow-sm)'}}>
                    <HistoryIcon />
                    <span>Lịch sử đọc</span>
                </button>
                <button onClick={onSwitchUser} className="text-sm bg-slate-100 font-semibold py-2 px-4 rounded-lg transition btn-bounce" style={{ color: 'var(--c-text-body)', boxShadow: 'var(--shadow-sm)'}}>
                  Đổi bạn khác
                </button>
            </div>
        </div>
      
      <div className="bg-blue-50 p-4 rounded-xl mb-8 relative">
          <div className="absolute -left-2 -top-2 text-3xl">💬</div>
          <div className="ml-8">
              <div className="flex items-center justify-between">
                  <div className="text-sm" style={{ color: 'var(--c-text-body)' }}>
                      {isLoadingSuggestion && <div className="flex items-center gap-2"><Spinner/> Cô đang nghĩ xem...</div>}
                      {suggestion && (
                        <p className="font-semibold text-blue-800">
                          {suggestion.split(/\*\*(.*?)\*\*/g).map((part, i) =>
                            i % 2 === 1 ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>
                          )}
                        </p>
                      )}
                      {!suggestion && !isLoadingSuggestion && <p>Hôm nay đọc bài nào nhỉ?</p>}
                  </div>
                  <button onClick={handleGetSuggestion} disabled={isLoadingSuggestion} className="whitespace-nowrap font-bold text-blue-600 hover:text-blue-800 disabled:opacity-50 text-sm transition btn-bounce">
                      Cô gợi ý nhé!
                  </button>
              </div>
          </div>
      </div>
      
        <div>
            <h2 className="text-2xl font-bold mb-4 text-blue-700 border-b-2 border-blue-200 pb-2">Sách Tiếng Việt 2 - Tập 1</h2>
            {renderLessonList(lessonsVol1)}

            <h2 className="text-2xl font-bold mt-10 mb-4 text-blue-700 border-b-2 border-blue-200 pb-2">Sách Tiếng Việt 2 - Tập 2</h2>
            {renderLessonList(lessonsVol2)}
        </div>
    </div>
  );
};

export default LessonSelectionScreen;