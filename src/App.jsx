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

const AuthGatingModal = ({ isDarkMode, onClose, onLogin }) => {
  const [loading, setLoading] = useState(false);

  const handleKakao = async () => {
    alert('준비 중입니다');
  };

  return (
  <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 md:p-12">
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-midnight/90 backdrop-blur-2xl" />
    <motion.div 
      initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
      className={`relative w-full max-w-lg rounded-[3rem] p-10 md:p-14 text-center space-y-8 overflow-hidden ${isDarkMode ? 'bg-midnight border border-white/10 text-white' : 'bg-white text-midnight'}`}
    >
      <div className="w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl" style={{ backgroundColor: '#FEE500' }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="#191919">
          <path d="M12 3C6.48 3 2 6.58 2 11c0 2.83 1.72 5.3 4.33 6.82l-.9 3.35 3.87-2.55C10.04 18.87 11 19 12 19c5.52 0 10-3.58 10-8S17.52 3 12 3z"/>
        </svg>
      </div>
      <div className="space-y-3">
        <h3 className="text-2xl md:text-3xl font-black tracking-tight leading-tight break-keep">합격자의 90%가 활용하는 오답노트!</h3>
        <p className="text-base font-bold opacity-50 break-keep">1초 가입하고 나만의 오답 저장하기</p>
      </div>
      <div className="space-y-4">
        <button
          onClick={handleKakao}
          className="w-full py-5 rounded-2xl font-black text-[17px] flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 shadow-lg"
          style={{ backgroundColor: '#FEE500', color: '#191919' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#191919">
            <path d="M12 3C6.48 3 2 6.58 2 11c0 2.83 1.72 5.3 4.33 6.82l-.9 3.35 3.87-2.55C10.04 18.87 11 19 12 19c5.52 0 10-3.58 10-8S17.52 3 12 3z"/>
          </svg>
          카카오로 시작하기
        </button>
        <button onClick={onClose} className="text-sm font-black opacity-30 hover:opacity-100 transition-opacity uppercase tracking-widest">나중에 하기</button>
      </div>
    </motion.div>
  </div>
  );
};

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

    // ✅ 초기 로드: OAuth 콜백 해시(access_token) 감지 → home으로 정리
    const hash = window.location.hash;
    if (hash.includes('access_token')) {
      // Supabase가 세션을 자동 처리하므로 해시만 제거
      window.history.replaceState({ page: 'home' }, '', window.location.pathname);
      setCurrentPage('home');
    } else if (!window.history.state) {
      window.history.replaceState({ page: 'home' }, '', '#home');
    }

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // 🔐 Auth State Monitoring
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchMembership(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchMembership(session.user.id);
        // ✅ OAuth(카카오) 로그인 성공 시 홈으로 이동
        if (event === 'SIGNED_IN') {
          setCurrentPage('home');
          window.history.replaceState({ page: 'home' }, '', '#home');
          window.scrollTo(0, 0);
        }
      } else {
        setIsPremium(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 👑 membership_type 조회 (profiles 테이블 → 폴백: user_metadata)
  const fetchMembership = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('membership_type')
        .eq('id', userId)
        .single();
      if (!error && data) {
        setIsPremium(data.membership_type === 'premium');
      } else {
        // 테이블 미생성 시 user_metadata 폴백
        const { data: { user } } = await supabase.auth.getUser();
        setIsPremium(user?.user_metadata?.is_premium || false);
      }
    } catch {
      setIsPremium(false);
    }
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
