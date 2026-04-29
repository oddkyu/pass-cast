import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import HomePage from './components/HomePage';
import QuizPage from './components/QuizPage';
import LandingPage from './components/LandingPage';
import ExamSelectionPage from './components/ExamSelectionPage';
import FullExamPage from './components/FullExamPage';
import ExamResultPage from './components/ExamResultPage';

const App = () => {
  const [currentPage, setCurrentPage] = useState('landing');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedExam, setSelectedExam] = useState({ year: null, subject: null });
  const [examResult, setExamResult] = useState(null);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const handleStartFullExam = (year, subject) => {
    setSelectedExam({ year, subject });
    setCurrentPage('full_exam');
  };

  const handleFinishExam = (results) => {
    setExamResult(results);
    setCurrentPage('exam_result');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage key="landing" onBack={() => setCurrentPage('home')} />;
      case 'home':
        return (
          <HomePage 
            key="home" 
            isDarkMode={isDarkMode}
            onToggleTheme={toggleDarkMode}
            onStartQuiz={() => setCurrentPage('quiz')} 
            onGoToLanding={() => setCurrentPage('landing')}
            onGoToExamSelection={() => setCurrentPage('exam_selection')}
          />
        );
      case 'exam_selection':
        return (
          <ExamSelectionPage 
            key="exam_selection"
            isDarkMode={isDarkMode}
            onBack={() => setCurrentPage('home')}
            onSelectExam={handleStartFullExam}
          />
        );
      case 'full_exam':
        return (
          <FullExamPage 
            key="full_exam"
            year={selectedExam.year}
            subject={selectedExam.subject}
            isDarkMode={isDarkMode}
            onBack={() => setCurrentPage('exam_selection')}
            onFinish={handleFinishExam}
          />
        );
      case 'exam_result':
        return (
          <ExamResultPage 
            key="exam_result"
            result={examResult}
            isDarkMode={isDarkMode}
            onHome={() => setCurrentPage('home')}
            onRetry={() => setCurrentPage('full_exam')}
          />
        );
      case 'quiz':
        return (
          <div key="quiz" className="max-w-md mx-auto min-h-screen shadow-2xl">
            <QuizPage onBack={() => setCurrentPage('home')} />
          </div>
        );
      default:
        return <LandingPage key="default" onBack={() => setCurrentPage('home')} />;
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      <AnimatePresence mode="wait">
        {renderPage()}
      </AnimatePresence>
    </div>
  );
};

export default App;
