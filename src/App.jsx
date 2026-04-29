import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { supabase } from './lib/supabase';
import HomePage from './components/HomePage';
import QuizPage from './components/QuizPage';
import LandingPage from './components/LandingPage';
import ExamSelectionPage from './components/ExamSelectionPage';
import FullExamPage from './components/FullExamPage';
import ExamResultPage from './components/ExamResultPage';
import WrongAnswerNotePage from './components/WrongAnswerNotePage';
import PremiumPage from './components/PremiumPage';
import LoginPage from './components/LoginPage';

const App = () => {
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('home'); // 시작 페이지를 바로 메인으로 변경
  const [showLandingPopup, setShowLandingPopup] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedExam, setSelectedExam] = useState({ year: null, subject: null });
  const [examResult, setExamResult] = useState(null);
  const [wrongAnswers, setWrongAnswers] = useState([]);

  // 🔐 Auth State Monitoring
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 📢 팝업 노출 로직: 처음 접속 시 한 번만 노출
  useEffect(() => {
    const hasSeenPopup = localStorage.getItem('pass-cast-hide-popup');
    const today = new Date().toDateString();
    if (hasSeenPopup !== today) {
      setShowLandingPopup(true);
    }
  }, []);

  const handleClosePopup = (dontShowAgain = false) => {
    if (dontShowAgain) {
      localStorage.setItem('pass-cast-hide-popup', new Date().toDateString());
    }
    setShowLandingPopup(false);
  };

  // 📊 Load User Specific Data
  useEffect(() => {
    const saved = localStorage.getItem(user ? `pass-cast-wrong-${user.id}` : 'pass-cast-wrong-guest');
    try {
      setWrongAnswers(saved ? JSON.parse(saved) : []);
    } catch (e) {
      setWrongAnswers([]);
    }
  }, [user]);

  useEffect(() => {
    const key = user ? `pass-cast-wrong-${user.id}` : 'pass-cast-wrong-guest';
    localStorage.setItem(key, JSON.stringify(wrongAnswers));
  }, [wrongAnswers, user]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

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

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const requireAuth = (callback) => {
    if (!user) {
      if (window.confirm("사장님, 이 기능은 회원 전용입니다.\n지금 로그인하고 체계적인 관리를 시작하시겠습니까?")) {
        setCurrentPage('login');
      }
    } else {
      callback();
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'login':
        return <LoginPage isDarkMode={isDarkMode} onBack={() => setCurrentPage('home')} onLoginSuccess={(u) => { setUser(u); setCurrentPage('home'); }} />;
      case 'home':
        return (
          <>
            <HomePage 
              key="home" 
              user={user}
              isDarkMode={isDarkMode}
              onToggleTheme={toggleDarkMode}
              onGoToLanding={() => setShowLandingPopup(true)} // 랜딩페이지를 팝업으로 호출
              onGoToExamSelection={() => setCurrentPage('exam_selection')}
              onGoToWrongNote={() => requireAuth(() => setCurrentPage('wrong_note'))}
              onGoToPremium={() => setCurrentPage('premium')}
              onLogout={async () => { await supabase.auth.signOut(); setUser(null); }}
              onLogin={() => setCurrentPage('login')}
              wrongCount={wrongAnswers.length}
            />
            {/* 🎁 Landing Page Popup Overlay */}
            <AnimatePresence>
              {showLandingPopup && (
                <LandingPage 
                  isDarkMode={isDarkMode} 
                  onClose={handleClosePopup}
                  isPopup={true}
                />
              )}
            </AnimatePresence>
          </>
        );
      case 'exam_selection':
        return <ExamSelectionPage key="exam_selection" isDarkMode={isDarkMode} onBack={() => setCurrentPage('home')} onSelectExam={handleStartFullExam} />;
      case 'full_exam':
        return <FullExamPage key="full_exam" year={selectedExam.year} subject={selectedExam.subject} isDarkMode={isDarkMode} onBack={() => setCurrentPage('exam_selection')} onFinish={handleFinishExam} />;
      case 'exam_result':
        return <ExamResultPage key="exam_result" result={examResult} isDarkMode={isDarkMode} onHome={() => setCurrentPage('home')} onRetry={() => setCurrentPage('full_exam')} onSpeak={speakText} user={user} />;
      case 'wrong_note':
        return <WrongAnswerNotePage key="wrong_note" wrongAnswers={wrongAnswers} isDarkMode={isDarkMode} onBack={() => setCurrentPage('home')} onRemove={(id) => setWrongAnswers(prev => prev.filter(q => q.id !== id))} onSpeak={speakText} />;
      case 'premium':
        return <PremiumPage key="premium" isDarkMode={isDarkMode} onBack={() => setCurrentPage('home')} />;
      default:
        return <HomePage key="default" isDarkMode={isDarkMode} onToggleTheme={toggleDarkMode} onGoToExamSelection={() => setCurrentPage('exam_selection')} onGoToWrongNote={() => requireAuth(() => setCurrentPage('home'))} />;
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
