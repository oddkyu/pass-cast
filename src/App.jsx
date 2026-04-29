import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import HomePage from './components/HomePage';
import QuizPage from './components/QuizPage';
import LandingPage from './components/LandingPage';
import ExamSelectionPage from './components/ExamSelectionPage';
import FullExamPage from './components/FullExamPage';

const App = () => {
  const [currentPage, setCurrentPage] = useState('landing');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedYear, setSelectedYear] = useState(null);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const handleStartFullExam = (year) => {
    setSelectedYear(year);
    setCurrentPage('full_exam');
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      <AnimatePresence mode="wait">
        {currentPage === 'landing' && (
          <LandingPage key="landing" onBack={() => setCurrentPage('home')} />
        )}
        
        {currentPage === 'home' && (
          <HomePage 
            key="home" 
            isDarkMode={isDarkMode}
            onToggleTheme={toggleDarkMode}
            onStartQuiz={() => setCurrentPage('quiz')} 
            onGoToLanding={() => setCurrentPage('landing')}
            onGoToExamSelection={() => setCurrentPage('exam_selection')}
          />
        )}

        {currentPage === 'exam_selection' && (
          <ExamSelectionPage 
            key="exam_selection"
            isDarkMode={isDarkMode}
            onBack={() => setCurrentPage('home')}
            onSelectYear={handleStartFullExam}
          />
        )}

        {currentPage === 'full_exam' && (
          <FullExamPage 
            key="full_exam"
            year={selectedYear}
            isDarkMode={isDarkMode}
            onBack={() => setCurrentPage('exam_selection')}
          />
        )}

        {currentPage === 'quiz' && (
          <div className="max-w-md mx-auto min-h-screen shadow-2xl">
            <QuizPage key="quiz" onBack={() => setCurrentPage('home')} />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
