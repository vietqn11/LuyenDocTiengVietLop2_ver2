import React, { useState, useMemo } from 'react';
import { ReadingResult, Lesson, User, ReadingError } from '../types';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { generateTextToSpeech } from '../services/geminiService';
import SpeakerIcon from './icons/SpeakerIcon';
import Spinner from './Spinner';
import ScoreBar from './ScoreBar';
import ErrorIcon from './icons/ErrorIcon';
import Confetti from './Confetti';

interface ResultsScreenProps {
  user: User;
  result: ReadingResult;
  lesson: Lesson;
  onTryAgain: () => void;
  onChooseAnother: () => void;
}

const highlightErrorsInSentence = (sentence: string, errorsInSentence: ReadingError[]) => {
    const wordsToHighlight = errorsInSentence
        .map(e => e.originalWord)
        .filter((word): word is string => !!word);

    if (wordsToHighlight.length === 0) {
        return <span>{sentence}</span>;
    }

    const escapedWords = wordsToHighlight.map(word => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const regex = new RegExp(`(${escapedWords.join('|')})`, 'gi');
    const parts = sentence.split(regex);

    return (
        <span>
            {parts.map((part, index) => {
                const isHighlight = wordsToHighlight.some(w => w.toLowerCase() === part.toLowerCase());
                return isHighlight ? (
                    <strong key={index} className="text-blue-600 bg-blue-100 px-1 rounded">{part}</strong>
                ) : (
                    <span key={index}>{part}</span>
                );
            })}
        </span>
    );
};

interface AudioCacheItem {
  loading: boolean;
  data: string | null;
  error: boolean;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({ user, result, lesson, onTryAgain, onChooseAnother }) => {
  const { play, isPlaying } = useAudioPlayer();
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audioCache, setAudioCache] = useState<Record<string, AudioCacheItem>>({});
  const showConfetti = result.scores.overall >= 8;

  const groupedErrors = useMemo(() => {
    return result.errors.reduce((acc, error) => {
      const sentence = error.contextSentence;
      if (!acc[sentence]) {
        acc[sentence] = [];
      }
      acc[sentence].push(error);
      return acc;
    }, {} as Record<string, ReadingError[]>);
  }, [result.errors]);
  
  const handlePlayAudio = async (id: string, sentence: string) => {
    const currentAudioState = audioCache[id];

    // Don't do anything if this specific audio is already loading
    if (currentAudioState?.loading) return;

    setPlayingId(id); // Set as active to show spinner

    // If audio data is in cache, play it directly
    if (currentAudioState?.data) {
        await play(currentAudioState.data);
        setPlayingId(null);
        return;
    }

    // Otherwise, fetch the audio data
    setAudioCache(prev => ({ ...prev, [id]: { loading: true, data: null, error: false } }));
    const audioData = await generateTextToSpeech(sentence, user.apiKey);

    if (audioData) {
        setAudioCache(prev => ({ ...prev, [id]: { loading: false, data: audioData, error: false } }));
        await play(audioData);
    } else {
        setAudioCache(prev => ({ ...prev, [id]: { loading: false, data: null, error: true } }));
    }

    setPlayingId(null); // Unset after playing or error
  };

  return (
    <div className="bg-white p-8 rounded-3xl w-full animate-fade-in relative overflow-hidden" style={{ boxShadow: 'var(--shadow-lg)'}}>
      {showConfetti && <Confetti />}
      <h1 className="text-3xl font-extrabold mb-1" style={{ color: 'var(--c-text-header)' }}>Kết quả bài đọc</h1>
      <p className="text-sm font-semibold text-green-600 mb-6">✓ Cô đã lưu kết quả vào lịch sử rồi nhé.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 my-8">
        <div className="md:col-span-2">
            <h2 className="text-xl font-bold" style={{ color: 'var(--c-text-header)' }}>Nhận xét của cô giáo AI:</h2>
            <p className="text-lg mt-2 bg-slate-50 p-4 rounded-xl italic" style={{ color: 'var(--c-text-body)' }}>"{result.overallFeedback}"</p>
        </div>
        <ScoreBar label="Độ lưu loát" score={result.scores.fluency} />
        <ScoreBar label="Phát âm" score={result.scores.pronunciation} />
        <ScoreBar label="Độ chính xác" score={result.scores.accuracy} />
        <ScoreBar label="Điểm tổng kết" score={result.scores.overall} isOverall={true} />
      </div>

      {result.errors.length > 0 && (
        <div>
          <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--c-text-header)' }}>Mình cùng sửa lỗi nhé</h3>
          <ul className="space-y-4">
            {Object.entries(groupedErrors).map(([sentence, errorsInSentence], index) => {
              const id = `sent-group-${index}`;
              const audioState = audioCache[id];
              return (
              <li key={id} className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                 <div className="flex justify-between items-start flex-wrap gap-2">
                    <p className="text-slate-700 italic text-lg flex-grow">
                        {highlightErrorsInSentence(sentence, errorsInSentence)}
                    </p>
                    <div className="flex-shrink-0">
                      {audioState?.error ? (
                        <span className="text-sm text-red-500 flex items-center gap-1.5" aria-live="polite">
                            <ErrorIcon size={16} />
                            Lỗi âm thanh
                        </span>
                        ) : (
                        <button 
                            onClick={() => handlePlayAudio(id, sentence)} 
                            disabled={isPlaying && playingId !== id} // Disable other buttons while one is playing
                            className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                        >
                            {playingId === id ? <Spinner size="sm" /> : <SpeakerIcon size={16}/>} Nghe lại câu
                        </button>
                        )}
                    </div>
                </div>

                <div className="mt-3 border-t border-slate-200 pt-3 space-y-2">
                    {errorsInSentence.map((error, errorIndex) => (
                        <div key={errorIndex} className="flex items-center flex-wrap gap-x-6 gap-y-1">
                            <div className="flex flex-col">
                                <span className="text-sm text-slate-500">Con đọc là</span>
                                <span className="font-bold text-red-500 text-lg">{error.studentWord || '(bỏ qua)'}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm text-slate-500">Đọc đúng là</span>
                                <span className="font-bold text-green-600 text-lg">{error.originalWord || '(thêm từ)'}</span>
                            </div>
                        </div>
                    ))}
                </div>
              </li>
            )})}
          </ul>
        </div>
      )}
      {result.errors.length === 0 && (
         <div className="text-center bg-green-50 p-6 rounded-2xl border-2 border-green-200">
            <div className="text-5xl mb-2">🎉</div>
            <h3 className="text-2xl font-extrabold text-green-700">Tuyệt vời!</h3>
            <p className="text-green-600 mt-2 font-semibold">Con đã đọc rất tốt và không mắc lỗi nào. Cố gắng phát huy nhé!</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
        <button onClick={onChooseAnother} className="w-full sm:w-auto font-bold py-3 px-6 rounded-xl transition-transform transform btn-bounce" style={{ color: 'var(--c-text-body)', backgroundColor: '#E2E8F0', boxShadow: 'var(--shadow-sm)' }}>
          Chọn bài khác
        </button>
        <button onClick={onTryAgain} className="w-full sm:w-auto text-white font-bold py-3 px-6 rounded-xl transition-transform transform btn-bounce" style={{ backgroundColor: 'var(--c-primary)', boxShadow: 'var(--shadow-md)' }}>
          Con muốn đọc lại
        </button>
      </div>
    </div>
  );
};

export default ResultsScreen;