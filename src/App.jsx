import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
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

const AuthGatingModal = ({ isDarkMode, onClose, onLogin }) => (
  <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 md:p-12">
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-midnight/90 backdrop-blur-2xl" />
    <motion.div 
      initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
      className={`relative w-full max-w-lg rounded-[3rem] p-12 md:p-16 text-center space-y-10 overflow-hidden ${isDarkMode ? 'bg-midnight border border-white/10 text-white' : 'bg-white text-midnight'}`}
    >
      <div className="w-20 h-20 bg-gold rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl shadow-gold/30">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="midnightblue" strokeWidth="3"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
      </div>
      <div className="space-y-4">
        <h3 className="text-3xl font-black tracking-tight leading-tight break-keep text-gold">합격생만 아는 오답 관리 비법, <br/> 로그인 후 시작하세요.</h3>
        <p className="text-lg font-bold opacity-40 break-keep">지금 가입하면 나만의 분석 데이터를 평생 소장할 수 있습니다.</p>
      </div>
      <div className="space-y-4">
        <button onClick={onLogin} className="w-full py-6 bg-gold text-midnight rounded-2xl font-black text-xl shadow-xl hover:scale-105 active:scale-95 transition-all">무료 회원가입 / 로그인</button>
        <button onClick={onClose} className="text-sm font-black opacity-30 hover:opacity-100 transition-opacity uppercase tracking-widest">나중에 하기</button>
      </div>
    </motion.div>
  </div>
);

const App = () => {
  const [user, setUser] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedExam, setSelectedExam] = useState({ year: null, subject: null });
  const [examResult, setExamResult] = useState(null);
  const [wrongAnswers, setWrongAnswers] = useState([]);
  const [showGatingModal, setShowGatingModal] = useState(false);

  // 🔀 브라우저 히스토리에 페이지를 쌓는 헬퍼 함수
  const navigate = useCallback((page, state = {}) => {
    window.history.pushState({ page, ...state }, '', `#${page}`);
    setCurrentPage(page);
    window.scrollTo(0, 0);
    // 추가 상태 동기화
    if (state.selectedExam) setSelectedExam(state.selectedExam);
    if (state.examResult) setExamResult(state.examResult);
  }, []);

  // 🔙 브라우저 뒤로 가기 버튼 감지 (popstate)
  useEffect(() => {
    const handlePopState = (e) => {
      const page = e.state?.page || 'home';
      setCurrentPage(page);
      if (e.state?.selectedExam) setSelectedExam(e.state.selectedExam);
      if (e.state?.examResult) setExamResult(e.state.examResult);
    };
    window.addEventListener('popstate', handlePopState);

    // 초기 진입 시 home 상태를 히스토리에 세팅
    if (!window.history.state) {
      window.history.replaceState({ page: 'home' }, '', '#home');
    }

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // 🔐 Auth State Monitoring
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setIsPremium(session.user.user_metadata?.is_premium || false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setIsPremium(session.user.user_metadata?.is_premium || false);
      } else {
        setIsPremium(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

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
    navigate('full_exam', { selectedExam: { year, subject } });
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
    navigate('exam_result', { examResult: results });
  };

  const requireAuth = (callback) => {
    if (!user) {
      setShowGatingModal(true);
    } else {
      callback();
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'login':
        return <LoginPage isDarkMode={isDarkMode} onBack={() => navigate('home')} onLoginSuccess={(u) => { setUser(u); navigate('home'); }} />;
      case 'home':
        return (
          <>
            <HomePage 
              key="home" user={user} isPremium={isPremium} isDarkMode={isDarkMode} onToggleTheme={toggleDarkMode}
              onGoToExamSelection={() => navigate('exam_selection')}
              onGoToWrongNote={() => requireAuth(() => navigate('wrong_note'))}
              onGoToPremium={() => navigate('premium')}
              onLogout={async () => { await supabase.auth.signOut(); setUser(null); }}
              onLogin={() => navigate('login')}
              wrongCount={wrongAnswers.length}
            />
            <AnimatePresence>
              {showGatingModal && (
                <AuthGatingModal 
                  isDarkMode={isDarkMode} 
                  onClose={() => setShowGatingModal(false)}
                  onLogin={() => { setShowGatingModal(false); navigate('login'); }}
                />
              )}
            </AnimatePresence>
          </>
        );
      case 'exam_selection':
        return <ExamSelectionPage key="exam_selection" isDarkMode={isDarkMode} onBack={() => navigate('home')} onSelectExam={handleStartFullExam} />;
      case 'full_exam':
        return <FullExamPage key="full_exam" year={selectedExam.year} subject={selectedExam.subject} isDarkMode={isDarkMode} onBack={() => navigate('exam_selection')} onFinish={handleFinishExam} />;
      case 'exam_result':
        return <ExamResultPage key="exam_result" result={examResult} isDarkMode={isDarkMode} isPremium={isPremium} onHome={() => navigate('home')} onRetry={() => navigate('full_exam')} user={user} />;
      case 'wrong_note':
        return <WrongAnswerNotePage key="wrong_note" wrongAnswers={wrongAnswers} isDarkMode={isDarkMode} onBack={() => navigate('home')} onRemove={(id) => setWrongAnswers(prev => prev.filter(q => q.id !== id))} />;
      case 'premium':
        return <PremiumPage key="premium" isDarkMode={isDarkMode} onBack={() => navigate('home')} onUpgrade={() => { setIsPremium(true); navigate('home'); }} />;
      default:
        return <HomePage key="default" isDarkMode={isDarkMode} onToggleTheme={toggleDarkMode} onGoToExamSelection={() => navigate('exam_selection')} onGoToWrongNote={() => requireAuth(() => navigate('home'))} />;
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
