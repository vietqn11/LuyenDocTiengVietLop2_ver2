export enum Page {
  Welcome,
  LessonSelection,
  Reading,
  Results,
  History,
}

export interface User {
  name: string;
  className: string;
  apiKey?: string;
}

export interface Lesson {
  id: string;
  title: string;
  text: string;
  level: number;
  volume: number;
}

export interface ReadingError {
  type: 'mispronounced' | 'skipped' | 'added';
  originalWord: string | null;
  studentWord: string | null;
  contextSentence: string;
}

export interface ReadingScores {
  fluency: number;
  pronunciation: number;
  accuracy: number;
  overall: number;
}

export interface ReadingResult {
  overallFeedback: string;
  scores: ReadingScores;
  errors: ReadingError[];
}

export interface SavedResult {
  user: User;
  lessonId: string;
  lessonTitle: string;
  timestamp: number;
  resultData: ReadingResult;
}