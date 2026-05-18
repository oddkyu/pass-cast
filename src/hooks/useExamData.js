import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import settings from '../configs/settings.json';

export const useExamData = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [currentPage, setCurrentPage] = useState(() => {
    const hash = window.location.hash.replace('#', '');
    const savedPage = sessionStorage.getItem('pass-cast-currentPage');
    return hash || savedPage || 'home';
  });
  const [selectedExam, setSelectedExam] = useState(() => {
    const savedExam = sessionStorage.getItem('pass-cast-selectedExam');
    if (savedExam) {
      try {
        return JSON.parse(savedExam);
      } catch (e) {
        console.error('Failed to parse saved selectedExam:', e);
      }
    }
    return { 
      year: settings.exam_settings.default_year, 
      subject: settings.exam_settings.default_subject, 
      isRoutine: false, 
      setIndex: null 
    };
  });
  const [examResult, setExamResult] = useState(() => {
    const savedResult = sessionStorage.getItem('pass-cast-examResult');
    if (savedResult) {
      try {
        return JSON.parse(savedResult);
      } catch (e) {
        console.error('Failed to parse saved examResult:', e);
      }
    }
    return null;
  });
  const [wrongAnswers, setWrongAnswers] = useState([]);
  const [examHistory, setExamHistory] = useState([]);
  const [routineTodayCount, setRoutineTodayCount] = useState(0);
  const [showGatingModal, setShowGatingModal] = useState(false);
  const [appSettings, setAppSettings] = useState({
    show_ads: false,
    enable_memo: true,
    routine_question_count: 10,
    force_gating: false
  });

  const [activePopups, setActivePopups] = useState([]);

  // Sync state to sessionStorage
  useEffect(() => {
    sessionStorage.setItem('pass-cast-currentPage', currentPage);
  }, [currentPage]);

  useEffect(() => {
    sessionStorage.setItem('pass-cast-selectedExam', JSON.stringify(selectedExam));
  }, [selectedExam]);

  useEffect(() => {
    if (examResult) {
      sessionStorage.setItem('pass-cast-examResult', JSON.stringify(examResult));
    } else {
      sessionStorage.removeItem('pass-cast-examResult');
    }
  }, [examResult]);

  // Fetch & Subscribe App Settings (Realtime)
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase.from('app_settings').select('*').single();
        if (data && !error) {
          setAppSettings({
            show_ads: data.show_ads,
            enable_memo: data.enable_memo,
            routine_question_count: data.routine_question_count,
            force_gating: data.force_gating || false
          });
        }
      } catch (err) {
        console.error('Failed to load initial app_settings:', err);
      }
    };
    fetchSettings();

    const channel = supabase.channel('public:app_settings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'app_settings' }, (payload) => {
        if (payload.new) {
          setAppSettings({
            show_ads: payload.new.show_ads,
            enable_memo: payload.new.enable_memo,
            routine_question_count: payload.new.routine_question_count,
            force_gating: payload.new.force_gating || false
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Fetch & Subscribe Popups (Realtime)
  useEffect(() => {
    const fetchPopups = async () => {
      try {
        const { data, error } = await supabase
          .from('popups')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });
        if (data && !error) {
          setActivePopups(data);
        }
      } catch (err) {
        console.error('Error fetching popups:', err);
      }
    };

    fetchPopups();

    const popupSubscription = supabase.channel('popups_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'popups' }, () => {
        fetchPopups(); // 변경 발생 시 전체 리스트 재조회
      })
      .subscribe();

    return () => {
      supabase.removeChannel(popupSubscription);
    };
  }, []);

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
      const hashPage = window.location.hash.replace('#', '');
      const page = e.state?.page || hashPage || 'home';
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
        
        let isUserPremium = false;
        
        if (!error && data) {
          isUserPremium = data.membership_type === 'premium';
          
          // PREMIUM 유저인 경우 추가로 만료기한 검증 후 자동 강등 수행
          if (isUserPremium) {
            const { data: subs, error: subError } = await supabase
              .from('subscriptions')
              .select('expires_at')
              .eq('user_id', userId)
              .eq('status', 'active')
              .order('created_at', { ascending: false })
              .limit(1);
            
            if (!subError && subs && subs.length > 0) {
              const expiry = new Date(subs[0].expires_at);
              if (expiry < new Date()) {
                console.log(`[Auto-Downgrade] User premium expired at ${expiry}. Downgrading to basic.`);
                
                // 1. 프로필 강등
                await supabase
                  .from('profiles')
                  .update({ membership_type: 'basic' })
                  .eq('id', userId);
                
                // 2. 구독 정보 종료 처리
                await supabase
                  .from('subscriptions')
                  .update({ status: 'ended' })
                  .eq('id', subs[0].id);
                
                isUserPremium = false;
              }
            }
          }
          
          setIsPremium(isUserPremium);
        } else {
          const { data: { user: authUser } } = await supabase.auth.getUser();
          setIsPremium(authUser?.user_metadata?.is_premium || false);
        }
      } catch (err) {
        console.error('Fetch membership error:', err);
        setIsPremium(false);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchMembership(session.user.id);
      setIsAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchMembership(session.user.id);
      } else {
        setIsPremium(false);
      }
      setIsAuthLoading(false);
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
    // 1. 보안을 위한 입력값 정제 (XSS 방지)
    const sanitize = (text) => {
      if (typeof text !== 'string') return '';
      return text.replace(/<[^>]*>?/gm, '').trim(); 
    };

    const { questions, answers, year, subject, isRoutine, setIndex, timeSpent, memo } = results;
    const cleanMemo = sanitize(memo);

    // 2. 클라이언트 점수 조작 방지 (내부 재계산)
    const totalQuestions = questions?.length || 0;
    let correctCount = 0;
    
    const isCorrect = (q, ans) => {
      return ans !== null && ans !== undefined && ans !== '' && String(ans) === String(q.answer);
    };

    questions.forEach((q, idx) => {
      if (isCorrect(q, answers[idx])) correctCount++;
    });

    const verifiedScore = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const wrongQuestions = questions.filter((q, idx) => !isCorrect(q, answers[idx]));
    const wrongQuestionNumbers = wrongQuestions.map(q => q.number);

    // 3. 로컬 상태용 객체 (엄격한 타입 캐스팅)
    const newHistory = {
      id: crypto.randomUUID(),
      user_id: user?.id || null,
      year: Number(year),
      subject: String(subject),
      is_routine: Boolean(isRoutine),
      set_index: isRoutine ? Number(setIndex) : null,
      answers: answers || {},
      score: verifiedScore,
      total_questions: totalQuestions,
      time_spent: Number(timeSpent) || 0,
      memo: cleanMemo,
      wrong_question_numbers: wrongQuestionNumbers,
      created_at: new Date().toISOString()
    };

    if (user) {
      try {
        console.log('Attempting to save to cloud for user:', user.id);
        
        // 4. Supabase 페이로드 (보안 및 타입 안정성 확보)
        const historyPayload = {
          user_id: user.id,
          year: Number(year),
          subject: String(subject),
          is_routine: Boolean(isRoutine),
          set_index: isRoutine ? Number(setIndex) : null,
          answers: answers,
          score: verifiedScore, // 검증된 점수 사용
          memo: cleanMemo,
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
            // 오답 중복 저장 방지 로직
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
    
    // 5. 로컬 상태 즉시 반영
    setExamHistory(prev => [newHistory, ...prev]);
    if (wrongQuestions.length > 0) {
      setWrongAnswers(prev => {
        const existingIds = new Set(prev.map(q => q.id));
        const uniqueNew = wrongQuestions.filter(q => !existingIds.has(q.id));
        return [...uniqueNew, ...prev];
      });
    }

    setExamResult({ ...results, score: verifiedScore, memo: cleanMemo }); 
    navigate('home', {}, { replace: true });
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

  const userStatus = !user ? 'guest' : (isPremium ? 'premium' : 'basic');

  return {
    isDarkMode, setIsDarkMode,
    user, setUser,
    isAuthLoading,
    isPremium,
    userStatus,
    currentPage,
    selectedExam, setSelectedExam,
    examResult, setExamResult,
    wrongAnswers,
    examHistory,
    routineTodayCount,
    showGatingModal, setShowGatingModal,
    appSettings,
    activePopups,
    navigate,
    handleFinishExam,
    handleRemoveHistory,
    handleRemoveWrongQuestion,
    handleReviewAttempt
  };
};
