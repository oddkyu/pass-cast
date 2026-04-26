import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import HomePage from './components/HomePage';
import QuizPage from './components/QuizPage';
import LandingPage from './components/LandingPage';

const App = () => {
  const [currentPage, setCurrentPage] = useState('landing');

  return (
    <div className="min-h-screen font-sans text-gray-900">
      <AnimatePresence mode="wait">
        {currentPage === 'landing' ? (
          <LandingPage key="landing" onBack={() => setCurrentPage('home')} />
        ) : currentPage === 'home' ? (
          <div className="mobile-container overflow-hidden">
            <HomePage 
              key="home" 
              onStartQuiz={() => setCurrentPage('quiz')} 
              onGoToLanding={() => setCurrentPage('landing')}
            />
          </div>
        ) : (
          <div className="mobile-container overflow-hidden">
            <QuizPage key="quiz" onBack={() => setCurrentPage('home')} />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
