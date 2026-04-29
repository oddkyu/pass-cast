import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import HomePage from './components/HomePage';
import QuizPage from './components/QuizPage';
import LandingPage from './components/LandingPage';
import ExamSelectionPage from './components/ExamSelectionPage';
import FullExamPage from './components/FullExamPage';
import ExamResultPage from './components/ExamResultPage';
import WrongAnswerNotePage from './components/WrongAnswerNotePage';
import PremiumPage from './components/PremiumPage';

const App = () => {
  const [currentPage, setCurrentPage] = useState('landing');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedExam, setSelectedExam] = useState({ year: null, subject: null });
  const [examResult, setExamResult] = useState(null);
  
  const [wrongAnswers, setWrongAnswers] = useState(() => {
    try {
      const saved = localStorage.getItem('pass-cast-wrong-answers');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load wrong answers from localStorage", e);
      return [];
    }
  });

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  useEffect(() => {
    localStorage.setItem('pass-cast-wrong-answers', JSON.stringify(wrongAnswers));
  }, [wrongAnswers]);

  const handleStartFullExam = (year, subject) => {
    setSelectedExam({ year, subject });
    setCurrentPage('full_exam');
  };

  const handleFinishExam = (results) => {
    const { questions, answers, year, subject } = results;
    const newWrongOnes = questions
      .filter((q, idx) => answers[idx] !== undefined && answers[idx] !== q.answer)
      .map(q => ({ ...q, year, subject, savedAt: new Date().toISOString() }));

    if (newWrongOnes.length > 0) {
      setWrongAnswers(prev => {
        const existingIds = new Set(prev.map(item => item.id));
        const uniqueNewOnes = newWrongOnes.filter(item => !existingIds.has(item.id));
        return [...prev, ...uniqueNewOnes];
      });
    }

    setExamResult(results);
    setCurrentPage('exam_result');
  };

  // 🔊 AI 오디오 재생 로직 (기초 연결)
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      // 진행 중인 모든 음성 중지
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
      utterance.rate = 0.9; // 조금 천천히 (시니어 배려)
      window.speechSynthesis.speak(utterance);
    } else {
      alert('이 브라우저는 음성 재생을 지원하지 않습니다.');
    }
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
            onGoToPremium={() => setCurrentPage('premium')}
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
            onSpeak={speakText}
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
            onSpeak={speakText}
          />
        );
      case 'premium':
        return <PremiumPage key="premium" isDarkMode={isDarkMode} onBack={() => setCurrentPage('home')} />;
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
