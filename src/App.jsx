import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import HomePage from './components/HomePage';
import QuizPage from './components/QuizPage';
import LandingPage from './components/LandingPage';
import ExamSelectionPage from './components/ExamSelectionPage';
import FullExamPage from './components/FullExamPage';
import ExamResultPage from './components/ExamResultPage';
import WrongAnswerNotePage from './components/WrongAnswerNotePage';

const App = () => {
  const [currentPage, setCurrentPage] = useState('landing');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedExam, setSelectedExam] = useState({ year: null, subject: null });
  const [examResult, setExamResult] = useState(null);
  
  // 📝 오답노트 데이터 상태 (로컬 스토리지에서 초기화)
  const [wrongAnswers, setWrongAnswers] = useState(() => {
    const saved = localStorage.getItem('pass-cast-wrong-answers');
    return saved ? JSON.parse(saved) : [];
  });

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  // 오답 데이터 저장 로직
  useEffect(() => {
    localStorage.setItem('pass-cast-wrong-answers', JSON.stringify(wrongAnswers));
  }, [wrongAnswers]);

  const handleStartFullExam = (year, subject) => {
    setSelectedExam({ year, subject });
    setCurrentPage('full_exam');
  };

  const handleFinishExam = (results) => {
    const { questions, answers, year, subject } = results;
    
    // 틀린 문제 필터링하여 오답노트에 추가
    const newWrongOnes = questions
      .filter((q, idx) => answers[idx] !== undefined && answers[idx] !== q.answer)
      .map(q => ({ ...q, year, subject, savedAt: new Date().toISOString() }));

    if (newWrongOnes.length > 0) {
      setWrongAnswers(prev => {
        // 중복 제거 (ID 기준)
        const existingIds = new Set(prev.map(item => item.id));
        const uniqueNewOnes = newWrongOnes.filter(item => !existingIds.has(item.id));
        return [...prev, ...uniqueNewOnes];
      });
    }

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
            onGoToWrongNote={() => setCurrentPage('wrong_note')}
            wrongCount={wrongAnswers.length}
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
      case 'wrong_note':
        return (
          <WrongAnswerNotePage 
            key="wrong_note"
            wrongAnswers={wrongAnswers}
            isDarkMode={isDarkMode}
            onBack={() => setCurrentPage('home')}
            onRemove={(id) => setWrongAnswers(prev => prev.filter(q => q.id !== id))}
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
