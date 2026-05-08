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
import TestPreviewPage from './components/TestPreviewPage';
import RoutineSelectionPage from './components/RoutineSelectionPage';

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
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [user, setUser] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedExam, setSelectedExam] = useState({ year: 2025, subject: '부동산학개론', isRoutine: false, setIndex: null });
  const [examResult, setExamResult] = useState(null);
  const [wrongAnswers, setWrongAnswers] = useState([]);
  const [examHistory, setExamHistory] = useState([]);
  const [routineTodayCount, setRoutineTodayCount] = useState(0);
  const [showGatingModal, setShowGatingModal] = useState(false);

  // 🔀 브라우저 히스토리에 페이지를 쌓는 헬퍼 함수
  const navigate = useCallback((page, state = {}, options = {}) => {
    const isReplace = options.replace || page === 'home';
    const method = isReplace ? 'replaceState' : 'pushState';

    window.history[method]({ page, ...state }, '', `#${page}`);
    setCurrentPage(page);
    window.scrollTo(0, 0);
    if (state.selectedExam) setSelectedExam(state.selectedExam);
    if (state.examResult) setExamResult(state.examResult);
  }, []);

  useEffect(() => {
    const handlePopState = (e) => {
      const page = e.state?.page || 'home';
      setCurrentPage(page);
      if (e.state?.selectedExam) setSelectedExam(e.state.selectedExam);
      if (e.state?.examResult) setExamResult(e.state.examResult);
    };
    window.addEventListener('popstate', handlePopState);

    const hash = window.location.hash;
    if (hash.includes('access_token')) {
      window.history.replaceState({ page: 'home' }, '', window.location.pathname);
      setCurrentPage('home');
    } else if (!window.history.state) {
      window.history.replaceState({ page: 'home' }, '', '#home');
    }

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

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
        const { data: { user } } = await supabase.auth.getUser();
        setIsPremium(user?.user_metadata?.is_premium || false);
      }
    } catch {
      setIsPremium(false);
    }
  };

  useEffect(() => {
    const loadWrongAnswers = async () => {
      if (!user || !isPremium) {
        const saved = localStorage.getItem(user ? `pass-cast-wrong-${user.id}` : 'pass-cast-wrong-guest');
        try {
          setWrongAnswers(saved ? JSON.parse(saved) : []);
        } catch (e) {
          setWrongAnswers([]);
        }
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_incorrect_questions')
          .select(`
            id,
            question:questions (
              id,
              number,
              title,
              content_box,
              options,
              answer,
              explanation,
              subject,
              exam:exams ( year )
            )
          `)
          .eq('user_id', user.id);

        if (error) throw error;

        const formatted = data.map(item => ({
          ...item.question,
          db_id: item.id,
          year: item.question.exam.year,
          savedAt: new Date().toISOString()
        }));
        setWrongAnswers(formatted);
      } catch (err) {
        console.error('Failed to fetch DB wrong answers:', err);
        const saved = localStorage.getItem(`pass-cast-wrong-${user.id}`);
        setWrongAnswers(saved ? JSON.parse(saved) : []);
      }
    };

    loadWrongAnswers();

    const fetchTodayRoutine = async () => {
      if (!user) return;
      const today = new Date().toISOString().split('T')[0];
      const { count, error } = await supabase
        .from('user_routine_history')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('completed_at', today);
      
      if (!error) setRoutineTodayCount(count || 0);
    };
    fetchTodayRoutine();

    const fetchExamHistory = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('user_exam_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (!error && data) setExamHistory(data);
    };
    fetchExamHistory();
  }, [user, isPremium, currentPage]);

  useEffect(() => {
    if (isPremium && user) return; 
    const key = user ? `pass-cast-wrong-${user.id}` : 'pass-cast-wrong-guest';
    localStorage.setItem(key, JSON.stringify(wrongAnswers));
  }, [wrongAnswers, user, isPremium]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const handleStartFullExam = (year, subject) => {
    setExamResult(null);
    setSelectedExam({ year, subject, isRoutine: false, setIndex: null });
    navigate('full_exam');
  };

  const handleStartRoutine = (year, subject, setIndex) => {
    setExamResult(null);
    setSelectedExam({ year, subject, isRoutine: true, setIndex });
    navigate('full_exam');
  };

  const handleFinishExam = async (results) => {
    const { questions, answers, year, subject } = results;
    const isRoutine = selectedExam?.isRoutine;
    const setIndex = selectedExam?.setIndex;

    const newWrongOnes = questions
      .filter((q, idx) => String(answers[idx]) !== String(q.answer))
      .map(q => ({ ...q, year, subject, savedAt: new Date().toISOString() }));

    if (newWrongOnes.length > 0) {
      setWrongAnswers(prev => {
        const existingIds = new Set(prev.map(item => item.id));
        const uniqueNewOnes = newWrongOnes.filter(item => !existingIds.has(item.id));
        return [...prev, ...uniqueNewOnes];
      });

      if (user) {
        try {
          const wrongDbPayload = newWrongOnes.map(q => ({
            user_id: user.id,
            question_id: q.id
          }));
          const { error } = await supabase
            .from('user_incorrect_questions')
            .upsert(wrongDbPayload, { onConflict: 'user_id,question_id' });
          if (error) console.error('Auto save incorrect answers error:', error);
        } catch (err) {
          console.error('Auto save incorrect answers error:', err);
        }
      }
    }

    if (isRoutine && user && setIndex !== null) {
      try {
        const { error } = await supabase
          .from('user_routine_history')
          .upsert({
            user_id: user.id,
            year,
            subject,
            set_index: setIndex
          }, { onConflict: 'user_id,year,subject,set_index' });
        
        if (error) throw error;
      } catch (err) {
        console.error('Routine save error:', err);
      }
    }

    if (user) {
      const correctCount = questions.filter((q, idx) => String(answers[idx]) === String(q.answer)).length;
      const wrongQuestionNumbers = questions
        .filter((q, idx) => String(answers[idx]) !== String(q.answer))
        .map(q => q.number);

      try {
        const { data, error } = await supabase
          .from('user_exam_history')
          .insert({
            user_id: user.id,
            year,
            subject,
            is_routine: !!isRoutine,
            set_index: setIndex,
            answers,
            memo: results.memo || '',
            score: Math.round((correctCount / questions.length) * 100),
            total_questions: questions.length,
            wrong_question_numbers: wrongQuestionNumbers
          })
          .select()
          .single();
        
        if (!error && data) {
          setExamHistory(prev => [data, ...prev]);
        }
      } catch (err) {
        console.error('Exam history save error:', err);
      }
    }

    setExamResult({ ...results, isRoutine });
    navigate('exam_result', {}, { replace: true });
  };

  const handleRemoveHistory = async (historyId) => {
    try {
      const { error } = await supabase
        .from('user_exam_history')
        .delete()
        .eq('id', historyId);
      
      if (error) throw error;
      setExamHistory(prev => prev.filter(h => h.id !== historyId));
    } catch (err) {
      console.error('Failed to delete exam history:', err);
      alert('기록 삭제 중 오류가 발생했습니다.');
    }
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
          <HomePage 
            key="home" user={user} isPremium={isPremium} isDarkMode={isDarkMode} onToggleTheme={toggleDarkMode}
            onGoToExamSelection={() => navigate('exam_selection')}
            onGoToWrongNote={() => requireAuth(() => navigate('wrong_note'))}
            onGoToPremium={() => navigate('premium')}
            onGoToTestPage={() => navigate('test_preview')}
            onGoToQuiz={() => navigate('routine_selection')}
            onLogout={async () => { await supabase.auth.signOut(); setUser(null); }}
            onLogin={() => navigate('login')}
            wrongCount={wrongAnswers.length}
            routineCount={routineTodayCount}
          />
        );
      case 'test_preview':
        return <TestPreviewPage key="test_preview" isDarkMode={isDarkMode} onBack={() => navigate('home')} />;
      case 'exam_selection':
        return <ExamSelectionPage key="exam_selection" isDarkMode={isDarkMode} onBack={() => navigate('home')} onSelectExam={handleStartFullExam} />;
      case 'routine_selection':
        return <RoutineSelectionPage key="routine_selection" isDarkMode={isDarkMode} onBack={() => navigate('home')} onStartRoutine={handleStartRoutine} user={user} />;
      case 'full_exam':
        return (
          <FullExamPage 
            key="full_exam" 
            year={selectedExam?.year || examResult?.year} 
            subject={selectedExam?.subject || examResult?.subject} 
            isRoutine={selectedExam?.isRoutine || examResult?.isRoutine}
            setIndex={selectedExam?.setIndex || examResult?.setIndex}
            isDarkMode={isDarkMode} 
            isPremium={isPremium}
            onBack={() => {
              if (examResult?.isReview) {
                navigate(examResult?.questions?.length > 0 ? 'exam_result' : 'wrong_note');
              } else {
                navigate('home');
              }
            }} 
            onFinish={handleFinishExam} 
            mode={examResult?.isReview ? 'review' : 'practice'}
            userAnswers={examResult?.answers}
            savedMemo={examResult?.memo}
            initialQuestions={examResult?.questions}
            user={user}
            onlyMistakes={examResult?.onlyMistakes}
          />
        );
      case 'exam_result':
        return (
          <ExamResultPage 
            key="exam_result" 
            result={examResult} 
            isRoutine={examResult?.isRoutine}
            isDarkMode={isDarkMode} 
            isPremium={isPremium} 
            onHome={() => navigate('home')} 
            onRetry={() => {
              setExamResult(null);
              navigate('full_exam', {}, { replace: true });
            }} 
            onReview={() => {
              setExamResult(prev => ({ ...prev, isReview: true }));
              navigate('full_exam', {}, { replace: true });
            }}
            user={user} 
            onRequireAuthForSave={() => setShowGatingModal(true)} 
          />
        );
      case 'quiz':
        return <QuizPage key="quiz" onBack={() => navigate('home')} isDarkMode={isDarkMode} />;
      case 'wrong_note':
        return (
          <WrongAnswerNotePage 
            key="wrong_note" 
            wrongAnswers={wrongAnswers} 
            examHistory={examHistory}
            isDarkMode={isDarkMode} 
            isPremium={isPremium}
            onBack={() => navigate('home')} 
            onRemove={async (id) => {
              const target = wrongAnswers.find(q => q.id === id);
              if (isPremium && user && target?.db_id) {
                const { error } = await supabase
                  .from('user_incorrect_questions')
                  .delete()
                  .eq('id', target.db_id);
                if (error) {
                  alert('DB 삭제 중 오류가 발생했습니다.');
                  return;
                }
              }
              setWrongAnswers(prev => prev.filter(q => q.id !== id));
            }}
            onRemoveHistory={handleRemoveHistory}
            onReviewAttempt={(attempt, onlyMistakes = false) => {
              setExamResult({
                answers: attempt.answers,
                memo: attempt.memo,
                year: attempt.year,
                subject: attempt.subject,
                isReview: true,
                onlyMistakes: onlyMistakes
              });
              setSelectedExam({
                year: attempt.year,
                subject: attempt.subject,
                isRoutine: attempt.is_routine,
                setIndex: attempt.set_index
              });
              navigate('full_exam');
            }}
          />
        );
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

      <AnimatePresence>
        {showGatingModal && (
          <AuthGatingModal 
            isDarkMode={isDarkMode} 
            onClose={() => setShowGatingModal(false)}
            onLogin={() => { setShowGatingModal(false); navigate('login'); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
