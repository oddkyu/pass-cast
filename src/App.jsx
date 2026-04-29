import React, { useState } from 'react';
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
    setCurrentPage('exam_selection_loading'); // 로딩 상태를 거쳐가도록 유도
    setTimeout(() => setCurrentPage('full_exam'), 10);
  };

  const handleFinishExam = (results) => {
    console.log("Finishing Exam with results:", results);
    setExamResult(results);
    setCurrentPage('exam_result');
  };

  // 렌더링 로직을 가장 단순하게 변경
  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      {currentPage === 'landing' && (
        <LandingPage onBack={() => setCurrentPage('home')} />
      )}
      
      {currentPage === 'home' && (
        <HomePage 
          isDarkMode={isDarkMode}
          onToggleTheme={toggleDarkMode}
          onStartQuiz={() => setCurrentPage('quiz')} 
          onGoToLanding={() => setCurrentPage('landing')}
          onGoToExamSelection={() => setCurrentPage('exam_selection')}
        />
      )}

      {currentPage === 'exam_selection' && (
        <ExamSelectionPage 
          isDarkMode={isDarkMode}
          onBack={() => setCurrentPage('home')}
          onSelectExam={handleStartFullExam}
        />
      )}

      {currentPage === 'full_exam' && (
        <FullExamPage 
          year={selectedExam.year}
          subject={selectedExam.subject}
          isDarkMode={isDarkMode}
          onBack={() => setCurrentPage('exam_selection')}
          onFinish={handleFinishExam}
        />
      )}

      {currentPage === 'exam_result' && examResult && (
        <ExamResultPage 
          result={examResult}
          isDarkMode={isDarkMode}
          onHome={() => setCurrentPage('home')}
          onRetry={() => setCurrentPage('full_exam')}
        />
      )}

      {currentPage === 'quiz' && (
        <div className="max-w-md mx-auto min-h-screen shadow-2xl">
          <QuizPage onBack={() => setCurrentPage('home')} />
        </div>
      )}
    </div>
  );
};

export default App;
