import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

const FullExamPage = ({ year, subject, isDarkMode, onBack, onFinish }) => {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [heldQuestions, setHeldQuestions] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [showHoldTooltip, setShowHoldTooltip] = useState(false);
  
  const [timeLeft, setTimeLeft] = useState(3000);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  const generateMockQuestions = () => {
    return Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      question_text: `[${year}년 ${subject}] 제${i+1}번 문항 예시입니다. 3050 사장님들을 위해 글자 크기와 간격을 시원하게 키웠습니다.`,
      options: ["1번 선택지 예시입니다.", "2번 선택지 예시입니다.", "3번 선택지 예시입니다.", "4번 선택지 예시입니다.", "5번 선택지 예시입니다."],
      answer: 0,
      subject: subject,
      explanation: "이 문제에 대한 상세 해설입니다."
    }));
  };

  const fetchFullExam = async () => {
    setIsLoading(true);
    try {
      if (!supabase) {
        setQuestions(generateMockQuestions());
        return;
      }
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('year', year)
        .eq('subject', subject)
        .order('id', { ascending: true });

      if (error) throw error;
      setQuestions(!data || data.length === 0 ? generateMockQuestions() : data);
    } catch (err) {
      console.error('Error fetching exam:', err);
      setQuestions(generateMockQuestions());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFullExam();
  }, [year, subject]);

  useEffect(() => {
    if (!isLoading && !isPaused && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsPaused(true);
    }
    return () => clearInterval(timerRef.current);
  }, [isLoading, isPaused, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelect = (optionIndex) => {
    setAnswers(prev => ({ ...prev, [currentIndex]: optionIndex }));
  };

  const navigateTo = (newIndex) => {
    if (answers[currentIndex] === undefined) {
      const newHeld = new Set(heldQuestions);
      newHeld.add(currentIndex);
      setHeldQuestions(newHeld);
    }
    setCurrentIndex(newIndex);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleHold = () => {
    const newHeld = new Set(heldQuestions);
    if (newHeld.has(currentIndex)) {
      newHeld.delete(currentIndex);
    } else {
      newHeld.add(currentIndex);
    }
    setHeldQuestions(newHeld);
  };

  const goToNextHeld = () => {
    const heldList = Array.from(heldQuestions).sort((a, b) => a - b);
    const nextHeld = heldList.find(idx => idx > currentIndex) ?? heldList[0];
    if (nextHeld !== undefined) {
      navigateTo(nextHeld);
    }
  };

  const handleSubmit = () => {
    const unansweredCount = questions.length - Object.keys(answers).length;
    const message = unansweredCount > 0 
      ? `아직 풀지 않은 문제가 ${unansweredCount}개 있습니다. 정말 제출하시겠습니까?`
      : "시험을 마치고 최종 제출하시겠습니까?";
    
    if (window.confirm(message)) {
      onFinish({ questions, answers, year, subject });
    }
  };

  const currentQuestion = questions[currentIndex];
  const isCurrentHeld = heldQuestions.has(currentIndex);

  if (isLoading) {
    return (
      <div className={`flex-1 flex flex-col items-center justify-center min-h-screen ${isDarkMode ? 'mesh-bg text-white' : 'bg-offwhite text-midnight'}`}>
        <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin mb-8"></div>
        <p className="text-2xl font-black tracking-tight">{year}년 {subject} 시험지를 준비 중입니다...</p>
      </div>
    );
  }

  return (
    <div className={`flex-1 flex flex-col min-h-screen transition-all duration-500 ${isDarkMode ? 'mesh-bg text-white' : 'bg-offwhite text-midnight'}`}>
      <header className={`sticky top-0 z-50 border-b transition-all duration-500 ${isDarkMode ? 'bg-midnight/60 border-white/5 backdrop-blur-2xl' : 'bg-white/90 border-slate-100 backdrop-blur-md'}`}>
        <div className="max-w-7xl mx-auto px-8 md:px-12 h-20 md:h-24 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button onClick={onBack} className="w-10 h-10 glass-button rounded-xl flex items-center justify-center">
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-gold uppercase tracking-[0.3em] mb-0.5">{year} EXAMINATION</span>
              <h1 className="text-xl md:text-2xl font-black tracking-tighter">{subject}</h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className={`flex items-center space-x-3 px-6 py-3 rounded-2xl border ${timeLeft < 300 ? 'bg-red-500/10 border-red-500/50 text-red-500 animate-pulse' : 'bg-midnight/5 border-gold/20 text-gold'}`}>
              <span className="text-2xl font-black font-mono tracking-wider">{formatTime(timeLeft)}</span>
            </div>
            
            <button onClick={handleSubmit} className="hidden sm:block px-6 py-2.5 bg-midnight text-gold rounded-xl text-sm font-black tracking-widest hover:scale-105 transition-transform border border-gold/30 shadow-lg shadow-gold/10">최종 제출</button>
          </div>
        </div>

        <div className={`border-t transition-all ${isDarkMode ? 'border-white/5' : 'border-slate-50'}`}>
          <div className="max-w-7xl mx-auto px-8 md:px-12 py-4 overflow-x-auto scrollbar-hide flex items-center space-x-3">
            {questions.map((_, i) => (
              <button
                key={i}
                onClick={() => navigateTo(i)}
                className={`flex-shrink-0 w-10 h-10 rounded-xl font-black text-sm transition-all duration-300 border relative
                  ${currentIndex === i ? (isDarkMode ? 'bg-white text-midnight border-white scale-110 shadow-lg' : 'bg-midnight text-white border-midnight scale-110 shadow-lg') : 
                    heldQuestions.has(i) ? 'bg-amber-500/20 text-amber-500 border-amber-500/50' :
                    answers[i] !== undefined ? (isDarkMode ? 'bg-gold/20 text-gold border-gold/30' : 'bg-gold text-midnight border-gold') : 
                    (isDarkMode ? 'bg-white/5 text-white/30 border-white/5' : 'bg-slate-100 text-slate-400 border-slate-100')}
                `}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-8 md:px-16 py-12 md:py-24 flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`flex-1 flex flex-col glass-card rounded-[4rem] p-12 md:p-24 relative overflow-hidden transition-all duration-500 ${isDarkMode ? 'border-white/10' : 'border-white bg-white shadow-2xl shadow-slate-100'}`}
          >
            <div className="relative z-10 space-y-16">
              <div className="flex justify-between items-start gap-8">
                <div className="space-y-6 flex-1">
                  <span className="text-[14px] font-black text-gold uppercase tracking-[0.5em] mb-4 inline-block">{year}년 기출</span>
                  <h2 className="text-[28px] md:text-[36px] font-black leading-tight break-keep tracking-tight">
                    {currentQuestion?.question_text}
                  </h2>
                </div>
                <button onClick={toggleHold} className={`flex-shrink-0 w-20 h-20 rounded-[2rem] flex items-center justify-center transition-all border-2 ${isCurrentHeld ? 'bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/30' : 'border-slate-100 text-slate-200 hover:border-amber-500/50 hover:text-amber-500'}`}>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill={isCurrentHeld ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                </button>
              </div>

              <div className="space-y-8 pt-12 border-t border-slate-50 dark:border-white/5">
                {currentQuestion?.options?.map((option, idx) => {
                  const isSelected = answers[currentIndex] === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelect(idx)}
                      className={`w-full text-left p-8 md:p-10 rounded-[2.5rem] border-2 transition-all duration-300 flex items-center group
                        ${isSelected ? 
                          (isDarkMode ? 'bg-white text-midnight border-white shadow-2xl scale-[1.02]' : 'bg-midnight text-white border-midnight shadow-2xl scale-[1.02]') : 
                          (isDarkMode ? 'bg-white/5 border-white/5 text-white/60 hover:bg-white/10 hover:border-gold/30' : 'bg-white border-slate-100 text-midnight hover:border-gold/30 shadow-sm')}
                      `}
                    >
                      <span className={`w-14 h-14 rounded-full flex items-center justify-center mr-10 font-black text-2xl transition-all
                        ${isSelected ? 'bg-gold text-midnight' : 'bg-slate-50 border border-slate-100 text-slate-300 group-hover:bg-gold/20 group-hover:text-gold'}
                      `}>
                        {idx + 1}
                      </span>
                      <span className="flex-1 font-bold text-[24px] md:text-[28px] leading-tight tracking-tight">
                        {option}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-24 pt-12 border-t border-white/5 flex justify-between items-center relative z-10">
              <button onClick={() => navigateTo(Math.max(0, currentIndex - 1))} disabled={currentIndex === 0} className={`px-12 py-6 rounded-[2rem] font-black tracking-widest transition-all ${currentIndex === 0 ? 'opacity-20' : 'glass-button hover:scale-105 active:scale-95'}`}>이전 문항</button>
              <div className="flex items-center space-x-4 text-gold font-black">
                 <span className="text-4xl">{currentIndex + 1}</span>
                 <span className="text-2xl opacity-30">/</span>
                 <span className="text-2xl opacity-30">{questions.length}</span>
              </div>
              <button onClick={() => navigateTo(Math.min(questions.length - 1, currentIndex + 1))} disabled={currentIndex === questions.length - 1} className={`px-12 py-6 bg-gold text-midnight rounded-[2rem] font-black tracking-widest shadow-xl shadow-gold/20 transition-all ${currentIndex === questions.length - 1 ? 'opacity-20' : 'hover:scale-105 active:scale-95'}`}>다음 문항</button>
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .break-keep { word-break: keep-all; }
      `}</style>
    </div>
  );
};

export default FullExamPage;
