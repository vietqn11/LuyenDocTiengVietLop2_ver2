import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Lesson, ReadingResult, User } from '../types';
import { generateTextToSpeech, analyzeReading } from '../services/geminiService';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import SpeakerIcon from './icons/SpeakerIcon';
import MicIcon from './icons/MicIcon';
import StopIcon from './icons/StopIcon';
import Spinner from './Spinner';
import { AUDIO_SAMPLES } from '../constants/audioSamples';

interface ReadingScreenProps {
  user: User;
  lesson: Lesson;
  onFinish: (result: ReadingResult) => void;
  onBack: () => void;
}

// Helper function to encode audio bytes to base64, avoiding call stack errors.
function encode(bytes: Uint8Array): string {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

function createBlob(data: Float32Array): Blob {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
        int16[i] = Math.max(-32768, Math.min(32767, data[i] * 32768));
    }
    return {
        data: encode(new Uint8Array(int16.buffer)),
        mimeType: 'audio/pcm;rate=16000',
    };
}


const ReadingScreen: React.FC<ReadingScreenProps> = ({ user, lesson, onFinish, onBack }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSamplePlaying, setIsSamplePlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { play, isPlaying } = useAudioPlayer();
  const transcriptRef = useRef<string>('');

  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null); 

  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Trình duyệt của bạn không hỗ trợ ghi âm.');
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream; 
      transcriptRef.current = '';
      setIsRecording(true);
      setError(null);
      
      const keyToUse = user.apiKey || process.env.API_KEY;
      if (!keyToUse) {
        throw new Error('Không tìm thấy API Key. Vui lòng cung cấp API Key cá nhân.');
      }
      const ai = new GoogleGenAI({ apiKey: keyToUse });

      sessionPromiseRef.current = ai.live.connect({
          model: 'gemini-2.5-flash-native-audio-preview-09-2025',
          callbacks: {
              onopen: () => {
                  audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
                  mediaStreamSourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
                  scriptProcessorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);
                  scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                      const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                      const pcmBlob = createBlob(inputData);
                      sessionPromiseRef.current!.then((session) => {
                         session.sendRealtimeInput({ media: pcmBlob });
                      });
                  };
                  mediaStreamSourceRef.current.connect(scriptProcessorRef.current);
                  scriptProcessorRef.current.connect(audioContextRef.current.destination);
              },
              onmessage: (message: LiveServerMessage) => {
                  if (message.serverContent?.inputTranscription) {
                      transcriptRef.current += message.serverContent.inputTranscription.text;
                  }
              },
              onerror: (e) => {
                console.error("Live API Connection Error:", e);
                setError('Lỗi kết nối ghi âm. Vui lòng kiểm tra đường truyền mạng và thử lại.');
              },
              onclose: (e) => {},
          },
          config: {
              inputAudioTranscription: {},
              responseModalities: [Modality.AUDIO],
          },
      });

    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'Không thể truy cập micro. Vui lòng cấp quyền và thử lại.';
      setError(errorMessage);
      setIsRecording(false);
    }
  };

    const stopRecordingAndAnalyze = useCallback(async () => {
      setIsRecording(false);
      setIsAnalyzing(true);

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      if (scriptProcessorRef.current) scriptProcessorRef.current.disconnect();
      if (mediaStreamSourceRef.current) mediaStreamSourceRef.current.disconnect();
      scriptProcessorRef.current = null;
      mediaStreamSourceRef.current = null;
      
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
          await audioContextRef.current.close();
      }
      
      if (sessionPromiseRef.current) {
          const session = await sessionPromiseRef.current;
          session.close();
          sessionPromiseRef.current = null;
      }
      
      setTimeout(async () => {
        const finalTranscript = transcriptRef.current.trim();
        if (finalTranscript) {
          let result = await analyzeReading(lesson.text, finalTranscript, user.apiKey);
          if (result) {
            // Client-side filter to prevent incorrect error reporting (e.g., "hai" -> "hai")
            const normalize = (word: string | null) => word ? word.toLowerCase().trim().replace(/[.,!?]/g, '') : '';
            result.errors = result.errors.filter(error => {
                if (error.type === 'skipped' || error.type === 'added') return true;
                return normalize(error.originalWord) !== normalize(error.studentWord);
            });
            onFinish(result);
          } else {
            setError("Rất tiếc, đã có lỗi xảy ra khi AI chấm điểm. Con vui lòng thử lại nhé.");
          }
        } else {
          onFinish({
            scores: { accuracy: 0, fluency: 0, pronunciation: 0, overall: 0 },
            overallFeedback: "Không ghi nhận được giọng đọc. Con hãy thử đọc to và rõ hơn nhé.",
            errors: []
          });
        }
        setIsAnalyzing(false);
      }, 500);

    }, [lesson.text, onFinish, user.apiKey]);

  const handlePlaySample = async () => {
    setIsSamplePlaying(true);
    setError(null);
    
    const placeholderAudio = 'UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';
    let audio: string | null = AUDIO_SAMPLES[lesson.id] || null;

    // Nếu không có âm thanh tạo sẵn hoặc đó là dữ liệu placeholder, gọi API.
    if (!audio || audio === placeholderAudio) {
      if (audio === placeholderAudio) {
        console.warn(`Âm thanh mẫu cho bài ${lesson.id} là placeholder. Sẽ gọi API để tạo âm thanh mới.`);
      } else {
        console.warn(`Không có âm thanh tạo sẵn cho bài ${lesson.id}. Gọi API...`);
      }
      audio = await generateTextToSpeech(lesson.text, user.apiKey);
    }

    if (audio) {
      await play(audio);
    } else {
      setError("Không thể phát bài đọc mẫu. Vui lòng kiểm tra API Key và thử lại.");
    }
    setIsSamplePlaying(false);
  };

  return (
    <div className="bg-white p-8 rounded-3xl w-full animate-fade-in" style={{ boxShadow: 'var(--shadow-lg)'}}>
        <button onClick={onBack} className="text-sm font-bold text-blue-600 hover:underline mb-4">&larr; Chọn bài khác</button>
      <h1 className="text-3xl font-extrabold mb-2" style={{ color: 'var(--c-text-header)' }}>{lesson.title}</h1>
      <div className="bg-slate-50 border p-6 rounded-2xl my-6 max-h-60 overflow-y-auto" style={{ borderColor: 'var(--c-border)' }}>
        <p className="text-lg leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--c-text-body)' }}>{lesson.text}</p>
      </div>

      {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded-r-lg" role="alert"><p>{error}</p></div>}
      
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
        <button 
          onClick={handlePlaySample}
          disabled={isSamplePlaying || isRecording || isPlaying}
          className="flex items-center justify-center gap-3 w-full sm:w-auto font-bold py-3 px-6 rounded-xl transition-transform transform disabled:opacity-60 disabled:scale-100 btn-bounce"
          style={{ color: 'var(--c-text-body)', backgroundColor: '#E2E8F0', boxShadow: 'var(--shadow-sm)' }}
        >
          {isSamplePlaying || isPlaying ? <Spinner /> : <SpeakerIcon />}
          <span>Nghe cô đọc mẫu</span>
        </button>

        {!isRecording ? (
          <button 
            onClick={startRecording}
            disabled={isSamplePlaying || isPlaying || isAnalyzing}
            className={`flex items-center justify-center gap-3 w-full sm:w-auto text-white font-bold py-3 px-8 rounded-xl transition-transform transform disabled:opacity-60 disabled:scale-100 btn-bounce ${!isSamplePlaying && !isPlaying && !isAnalyzing ? 'animate-pulse-slow' : ''}`}
            style={{ backgroundColor: 'var(--c-primary)', boxShadow: 'var(--shadow-md)' }}
          >
            <MicIcon />
            <span>Bắt đầu đọc</span>
          </button>
        ) : (
          <button 
            onClick={stopRecordingAndAnalyze}
            className="flex items-center justify-center gap-3 w-full sm:w-auto bg-red-500 text-white font-bold py-3 px-8 rounded-xl transition-transform transform btn-bounce animate-shake"
            style={{boxShadow: 'var(--shadow-md)'}}
          >
            <StopIcon />
            <span>Dừng & Chấm điểm</span>
          </button>
        )}
      </div>

      {isAnalyzing && (
        <div className="mt-8 text-center flex flex-col items-center">
            <Spinner />
            <p className="mt-2" style={{ color: 'var(--c-text-muted)' }}>Cô giáo AI đang lắng nghe và chấm điểm...</p>
        </div>
      )}
    </div>
  );
};

export default ReadingScreen;