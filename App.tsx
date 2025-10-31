import React, { useState, useEffect } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import LessonSelectionScreen from './components/LessonSelectionScreen';
import ReadingScreen from './components/ReadingScreen';
import ResultsScreen from './components/ResultsScreen';
import HistoryScreen from './components/HistoryScreen';
import { Page, User, Lesson, ReadingResult, SavedResult } from './types';
import { saveResultToGoogleSheet } from './services/googleSheetService';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.Welcome);
  const [user, setUser] = useState<User | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [readingResult, setReadingResult] = useState<ReadingResult | null>(null);
  const [savedUsers, setSavedUsers] = useState<User[]>([]);
  const [savedResults, setSavedResults] = useState<SavedResult[]>([]);

  useEffect(() => {
    try {
      const storedUsers = localStorage.getItem('reading-app-users');
      if (storedUsers) {
        setSavedUsers(JSON.parse(storedUsers));
      }
      const storedResults = localStorage.getItem('reading-app-results');
      if (storedResults) {
        setSavedResults(JSON.parse(storedResults));
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
    }
  }, []);

  const updateSavedUsers = (newUsers: User[]) => {
    setSavedUsers(newUsers);
    localStorage.setItem('reading-app-users', JSON.stringify(newUsers));
  };
  
  const updateSavedResults = (newResults: SavedResult[]) => {
    setSavedResults(newResults);
    localStorage.setItem('reading-app-results', JSON.stringify(newResults));
  }

  const handleStart = (name: string, className: string, apiKey: string) => {
    const newUser: User = { name, className, apiKey: apiKey || undefined };
    const userExists = savedUsers.find(u => u.name === name && u.className === className);
    if (!userExists) {
      updateSavedUsers([...savedUsers, newUser]);
    }
    setUser(newUser);
    setCurrentPage(Page.LessonSelection);
  };
  
  const handleSelectUser = (selectedUser: User) => {
    setUser(selectedUser);
    setCurrentPage(Page.LessonSelection);
  };

  const handleDeleteUser = (userToDelete: User) => {
    const newUsers = savedUsers.filter(u => u.name !== userToDelete.name || u.className !== userToDelete.className);
    updateSavedUsers(newUsers);
  };

  const handleGoToWelcome = () => {
    setUser(null);
    setSelectedLesson(null);
    setReadingResult(null);
    setCurrentPage(Page.Welcome);
  };

  const handleFinishReading = (result: ReadingResult) => {
    if (user && selectedLesson) {
        const newSavedResult: SavedResult = {
            user,
            lessonId: selectedLesson.id,
            lessonTitle: selectedLesson.title,
            timestamp: Date.now(),
            resultData: result
        };
        // Save to local storage
        updateSavedResults([...savedResults, newSavedResult]);
        // Save to Google Sheet
        saveResultToGoogleSheet(newSavedResult);
    }
    setReadingResult(result);
    setCurrentPage(Page.Results);
  };

  const handleTryAgain = () => {
    setReadingResult(null);
    setCurrentPage(Page.Reading);
  };

  const handleBackToLessons = () => {
    setSelectedLesson(null);
    setReadingResult(null);
    setCurrentPage(Page.LessonSelection);
  };

   const handleSelectLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setCurrentPage(Page.Reading);
  };
  
  const handleViewHistory = () => {
    setCurrentPage(Page.History);
  }

  const renderPage = () => {
    const welcomeScreen = <WelcomeScreen 
      onStart={handleStart} 
      savedUsers={savedUsers}
      onSelectUser={handleSelectUser}
      onDeleteUser={handleDeleteUser}
    />;
    
    const lessonSelectionScreen = user ? <LessonSelectionScreen 
      user={user} 
      onSelectLesson={handleSelectLesson} 
      onSwitchUser={handleGoToWelcome} 
      onViewHistory={handleViewHistory}
    /> : welcomeScreen;

    switch (currentPage) {
      case Page.Welcome:
        return welcomeScreen;
      case Page.LessonSelection:
        return lessonSelectionScreen;
      case Page.Reading:
        if (!user || !selectedLesson) return lessonSelectionScreen;
        return <ReadingScreen user={user} lesson={selectedLesson} onFinish={handleFinishReading} onBack={handleBackToLessons} />;
      case Page.Results:
        if (!user || !selectedLesson || !readingResult) return lessonSelectionScreen;
        return <ResultsScreen user={user} result={readingResult} lesson={selectedLesson} onTryAgain={handleTryAgain} onChooseAnother={handleBackToLessons} />;
      case Page.History:
        if (!user) return lessonSelectionScreen;
        // Filter results for the current user
        const userResults = savedResults.filter(r => r.user.name === user.name && r.user.className === user.className);
        return <HistoryScreen results={userResults} onBack={handleBackToLessons} />;
      default:
        return welcomeScreen;
    }
  };

  return (
    <div className="min-h-screen text-slate-800 flex items-center justify-center p-4" style={{ backgroundColor: 'var(--c-bg)' }}>
      <div className="w-full max-w-4xl mx-auto">
        {renderPage()}
      </div>
    </div>
  );
};

export default App;