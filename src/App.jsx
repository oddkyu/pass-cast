import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import HomePage from './components/HomePage';
import QuizPage from './components/QuizPage';
import LandingPage from './components/LandingPage';

const App = () => {
  const [currentPage, setCurrentPage] = useState('landing');
  const [isDarkMode, setIsDarkMode] = useState(false); // 기본은 라이트 모드 (false)

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      <AnimatePresence mode="wait">
        {currentPage === 'landing' ? (
          <LandingPage key="landing" onBack={() => setCurrentPage('home')} />
        ) : currentPage === 'home' ? (
          <HomePage 
            key="home" 
            isDarkMode={isDarkMode}
            onToggleTheme={toggleDarkMode}
            onStartQuiz={() => setCurrentPage('quiz')} 
            onGoToLanding={() => setCurrentPage('landing')}
          />
        ) : (
          <div className="max-w-md mx-auto min-h-screen shadow-2xl">
            <QuizPage key="quiz" onBack={() => setCurrentPage('home')} />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
