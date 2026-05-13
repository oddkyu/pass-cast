import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import settings from '../configs/settings.json';

export const useExamData = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [user, setUser] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedExam, setSelectedExam] = useState({ 
    year: settings.exam_settings.default_year, 
    subject: settings.exam_settings.default_subject, 
    isRoutine: false, 
    setIndex: null 
  });
  const [examResult, setExamResult] = useState(null);
  const [wrongAnswers, setWrongAnswers] = useState([]);
  const [examHistory, setExamHistory] = useState([]);
  const [routineTodayCount, setRoutineTodayCount] = useState(0);
  const [showGatingModal, setShowGatingModal] = useState(false);

  // 🔀 Navigation helper
  const navigate = useCallback((page, state = {}, options = {}) => {
    const isReplace = options.replace || page === 'home';
    const method = isReplace ? 'replaceState' : 'pushState';

    window.history[method]({ page, ...state }, '', `#${page}`);
    setCurrentPage(page);
    window.scrollTo(0, 0);
    if (state.selectedExam) setSelectedExam(state.selectedExam);
    if (state.examResult) setExamResult(state.examResult);
  }, []);

  // Sync with browser history
  useEffect(() => {
    const handlePopState = (e) => {
      const page = e.state?.page || 'home';
      setCurrentPage(page);
      if (e.state?.selectedExam) setSelectedExam(e.state.selectedExam);
      if (e.state?.examResult) setExamResult(e.state.examResult);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Auth & Membership
  useEffect(() => {
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
          const { data: { user: authUser } } = await supabase.auth.getUser();
          setIsPremium(authUser?.user_metadata?.is_premium || false);
        }
      } catch {
        setIsPremium(false);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchMembership(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchMembership(session.user.id);
        if (event === 'SIGNED_IN') {
          navigate('home', {}, { replace: true });
        }
      } else {
        setIsPremium(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Load Data (Wrong Answers & History)
  useEffect(() => {
    const loadData = async () => {
      // Local/Guest storage fallback
      const getLocal = (prefix) => {
        const key = user ? `${prefix}-${user.id}` : `${prefix}-guest`;
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : [];
      };

      if (!user) {
        setWrongAnswers(getLocal('pass-cast-wrong'));
        setExamHistory(getLocal('pass-cast-history'));
        return;
      }

      try {
        // Load Wrong Answers
        const { data: wrongData } = await supabase
          .from('user_incorrect_questions')
          .select(`id, question:questions (*)`)
          .eq('user_id', user.id);
        
        if (wrongData) {
          setWrongAnswers(wrongData.map(item => ({ ...item.question, db_id: item.id })));
        }

        // Load History
        const { data: histData } = await supabase
          .from('user_exam_history')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (histData) setExamHistory(histData);
      } catch (err) {
        console.error('Failed to load cloud data:', err);
      }
    };

    loadData();
  }, [user, isPremium, currentPage]);

  // Persist Local Storage (for Guest/Basic)
  useEffect(() => {
    if (isPremium && user) return;
    const keyPrefix = user ? `pass-cast` : `pass-cast`; // can be refined
    localStorage.setItem(user ? `pass-cast-wrong-${user.id}` : 'pass-cast-wrong-guest', JSON.stringify(wrongAnswers));
    localStorage.setItem(user ? `pass-cast-history-${user.id}` : 'pass-cast-history-guest', JSON.stringify(examHistory));
  }, [wrongAnswers, examHistory, user, isPremium]);

  // Routine Today Count
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayRoutines = examHistory.filter(h => h.is_routine && h.created_at.startsWith(today));
    setRoutineTodayCount(todayRoutines.length);
  }, [examHistory]);

  // Action Handlers
  const handleFinishExam = async (results) => {
    const { questions, answers, score, year, subject, isRoutine, setIndex, timeSpent, memo } = results;

    const isCorrect = (q, ans) => {
      return ans !== null && ans !== undefined && ans !== '' && String(ans) === String(q.answer);
    };

    const wrongQuestions = questions.filter((q, idx) => !isCorrect(q, answers[idx]));
    const wrongQuestionNumbers = wrongQuestions.map(q => q.number);

    const newHistory = {
      id: crypto.randomUUID(),
      user_id: user?.id || null,
      year,
      subject,
      is_routine: isRoutine,
      set_index: setIndex,
      answers,
      score,
      total_questions: questions.length,
      time_spent: timeSpent,
      memo: memo || '',
      wrong_question_numbers: wrongQuestionNumbers,
      created_at: new Date().toISOString()
    };

    if (user) {
      try {
        console.log('Attempting to save to cloud for user:', user.id);
        
        // 데이터 전송 객체 최적화
        const historyPayload = {
          user_id: user.id,
          year: Number(year),
          subject: String(subject),
          is_routine: Boolean(isRoutine),
          set_index: isRoutine ? Number(setIndex) : null,
          answers: answers,
          score: Number(score),
          memo: String(memo || ''),
          wrong_question_numbers: wrongQuestionNumbers,
        };

        const { data: savedHist, error: histError } = await supabase
          .from('user_exam_history')
          .insert([historyPayload])
          .select();

        if (histError) {
          console.error('Supabase History Insert Error Detailed:', histError);
          throw histError;
        }

        if (wrongQuestions.length > 0) {
          try {
            // 1. 이미 DB에 등록된 오답인지 확인 (중복 저장으로 인한 Conflict/Forbidden 방지)
            const { data: existingWrongs } = await supabase
              .from('user_incorrect_questions')
              .select('question_id')
              .eq('user_id', user.id)
              .in('question_id', wrongQuestions.map(q => q.id));

            const existingIds = new Set(existingWrongs?.map(w => w.question_id) || []);
            const newToSave = wrongQuestions.filter(q => !existingIds.has(q.id));

            if (newToSave.length > 0) {
              const payload = newToSave.map(q => ({ 
                user_id: user.id, 
                question_id: q.id 
              }));
              
              const { error: insertError } = await supabase
                .from('user_incorrect_questions')
                .insert(payload);
              
              if (insertError) throw insertError;
              console.log(`${newToSave.length} new wrong answers saved to cloud.`);
            } else {
              console.log('No new unique wrong answers to save.');
            }
          } catch (innerErr) {
            console.error('Failed to save wrong answers to cloud:', innerErr);
          }
        }
        console.log('Cloud save process completed successfully');
      } catch (err) {
        console.error('Final Cloud save failed:', err);
      }
    }
    
    // 로컬 상태 즉시 반영 (기존 코드 유지)
    setExamHistory(prev => [newHistory, ...prev]);
    if (wrongQuestions.length > 0) {
      setWrongAnswers(prev => {
        const existingIds = new Set(prev.map(q => q.id));
        const uniqueNew = wrongQuestions.filter(q => !existingIds.has(q.id));
        return [...uniqueNew, ...prev];
      });
    }

    setExamResult(results);
    navigate('exam_result');
  };

  const handleRemoveHistory = async (historyId) => {
    if (!user) return;
    const target = examHistory.find(h => String(h.id) === String(historyId));
    if (!target) return;

    try {
      const { data } = await supabase.from('user_exam_history').delete().eq('id', historyId).eq('user_id', user.id).select();
      if (data?.length > 0) {
        const { year, subject, wrong_question_numbers } = target;
        const itemsToRemove = wrongAnswers.filter(q => 
          q.year === year && q.subject === subject && wrong_question_numbers?.includes(q.number)
        );

        if (itemsToRemove.length > 0) {
          const dbIds = itemsToRemove.map(i => i.db_id).filter(Boolean);
          if (dbIds.length > 0) {
            await supabase.from('user_incorrect_questions').delete().in('id', dbIds).eq('user_id', user.id);
          }
        }
        setWrongAnswers(prev => prev.filter(q => !itemsToRemove.some(rem => rem.id === q.id)));
        setExamHistory(prev => prev.filter(h => String(h.id) !== String(historyId)));
      }
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleRemoveWrongQuestion = async (id) => {
    const target = wrongAnswers.find(q => q.id === id);
    if (isPremium && user && target?.db_id) {
      try {
        const { data } = await supabase.from('user_incorrect_questions').delete().eq('id', target.db_id).eq('user_id', user.id).select();
        if (data?.length > 0) setWrongAnswers(prev => prev.filter(q => q.id !== id));
      } catch (err) {
        console.error('Remove mistake failed:', err);
      }
    } else {
      setWrongAnswers(prev => prev.filter(q => q.id !== id));
    }
  };

  const handleReviewAttempt = (history, onlyMistakes = true) => {
    navigate('full_exam', { 
      selectedExam: { 
        ...history, 
        isRoutine: history.is_routine,
        setIndex: history.set_index,
        reviewMode: true, 
        onlyMistakes, 
        historyAnswers: history.answers, 
        historyId: history.id 
      }
    });
  };

  return {
    isDarkMode, setIsDarkMode,
    user, setUser,
    isPremium,
    currentPage,
    selectedExam, setSelectedExam,
    examResult, setExamResult,
    wrongAnswers,
    examHistory,
    routineTodayCount,
    showGatingModal, setShowGatingModal,
    navigate,
    handleFinishExam,
    handleRemoveHistory,
    handleRemoveWrongQuestion,
    handleReviewAttempt
  };
};
