import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

const FullExamPage = ({ year, subject, isDarkMode, onBack }) => {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  
  const [timeLeft, setTimeLeft] = useState(3000);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  const generateMockQuestions = () => {
    return Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      question_text: `[${year}년 ${subject}] 제${i+1}번 문항 예시입니다. 현재 서버 데이터를 불러오는 중이거나 데이터가 없습니다.`,
      options: ["1번 선택지", "2번 선택지", "3번 선택지", "4번 선택지", "5번 선택지"],
      answer: 0,
      subject: subject
    }));
  };

  const fetchFullExam = async () => {
    setIsLoading(true);
    try {
      // 🛡️ Supabase 객체가 없으면 즉시 가상 데이터로 전환
      if (!supabase) {
        console.warn('Supabase not initialized');
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
      
      if (!data || data.length === 0) {
        setQuestions(generateMockQuestions());
      } else {
        setQuestions(data);
      }
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

  const currentQuestion = questions[currentIndex];

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
              <span className="text-[10px] font-black text-gold uppercase tracking-[0.3em] mb-0.5">{year} REAA EXAMINATION</span>
              <h1 className="text-xl md:text-2xl font-black tracking-tighter">{subject}</h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-8">
            <div className={`flex items-center space-x-3 px-6 py-3 rounded-2xl border transition-all duration-300 ${timeLeft < 300 ? 'bg-red-500/10 border-red-500/50 text-red-500 animate-pulse' : 'bg-midnight/5 border-gold/20 text-gold'}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span className="text-2xl font-black font-mono tracking-wider">{formatTime(timeLeft)}</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-4">
               <div className="px-4 py-2 rounded-xl bg-gold/10 text-gold text-sm font-black border border-gold/20">
                 {Object.keys(answers).length} / {questions.length} 완료
               </div>
               <button className="px-6 py-2.5 bg-midnight text-gold rounded-xl text-sm font-black tracking-widest hover:scale-105 transition-transform border border-gold/30 shadow-lg shadow-gold/10">
                 최종 제출
               </button>
            </div>
          </div>
        </div>

        <div className={`border-t transition-all ${isDarkMode ? 'border-white/5' : 'border-slate-50'}`}>
          <div className="max-w-7xl mx-auto px-8 md:px-12 py-4 overflow-x-auto scrollbar-hide flex items-center space-x-3">
            {questions.map((_, i) => {
              const isAnswered = answers[i] !== undefined;
              const isCurrent = i === currentIndex;
              return (
                <button
                  key={i}
                  onClick={() => {
                    setCurrentIndex(i);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`flex-shrink-0 w-10 h-10 rounded-xl font-black text-sm transition-all duration-300 border
                    ${isCurrent ? (isDarkMode ? 'bg-white text-midnight border-white scale-110 shadow-lg' : 'bg-midnight text-white border-midnight scale-110 shadow-lg') : 
                      isAnswered ? (isDarkMode ? 'bg-gold/20 text-gold border-gold/30' : 'bg-gold text-midnight border-gold') : 
                      (isDarkMode ? 'bg-white/5 text-white/30 border-white/5' : 'bg-slate-100 text-slate-400 border-slate-100')}
                  `}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-8 md:px-12 py-12 md:py-20 flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`flex-1 flex flex-col glass-card rounded-[3.5rem] p-10 md:p-20 relative overflow-hidden transition-all duration-500 ${isDarkMode ? 'border-white/10' : 'border-white'}`}
          >
            <div className="absolute top-0 right-0 p-10 opacity-10 font-black text-[150px] pointer-events-none select-none">
              {currentIndex + 1}
            </div>

            <div className="relative z-10 space-y-12">
              <div className="space-y-4">
                <span className="text-[12px] font-black text-gold uppercase tracking-[0.4em] mb-4 inline-block">{year}년 기출</span>
                <h2 className="text-[26px] md:text-[32px] font-black leading-snug break-keep">
                  {currentQuestion?.question_text || "문제를 불러올 수 없습니다."}
                </h2>
              </div>

              <div className="space-y-4 pt-12">
                {currentQuestion?.options?.map((option, idx) => {
                  const isSelected = answers[currentIndex] === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelect(idx)}
                      className={`w-full text-left p-6 md:p-8 rounded-[2.5rem] border-2 transition-all duration-300 flex items-center group
                        ${isSelected ? 
                          (isDarkMode ? 'bg-white text-midnight border-white shadow-2xl' : 'bg-midnight text-white border-midnight shadow-2xl') : 
                          (isDarkMode ? 'bg-white/5 border-white/5 text-white/60 hover:bg-white/10 hover:border-gold/30' : 'bg-white border-slate-100 text-midnight hover:border-gold/30 shadow-sm')}
                      `}
                    >
                      <span className={`w-12 h-12 rounded-full flex items-center justify-center mr-8 font-black text-xl transition-all
                        ${isSelected ? (isDarkMode ? 'bg-gold text-midnight' : 'bg-gold text-midnight') : 'bg-slate-50 border border-slate-100 text-slate-300 group-hover:bg-gold/20 group-hover:text-gold'}
                      `}>
                        {idx + 1}
                      </span>
                      <span className="flex-1 font-bold text-[22px] md:text-[24px] leading-tight">
                        {option}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-24 pt-12 border-t border-white/5 flex justify-between items-center relative z-10">
              <button 
                onClick={() => {
                   setCurrentIndex(prev => Math.max(0, prev - 1));
                   window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                disabled={currentIndex === 0}
                className={`px-10 py-5 rounded-[2rem] font-black tracking-widest transition-all ${currentIndex === 0 ? 'opacity-20' : 'glass-button hover:scale-105 active:scale-95'}`}
              >
                이전 문항
              </button>
              <div className="flex items-center space-x-3 text-gold font-black">
                 <span className="text-3xl">{currentIndex + 1}</span>
                 <span className="text-xl opacity-30">/</span>
                 <span className="text-xl opacity-30">{questions.length}</span>
              </div>
              <button 
                onClick={() => {
                   setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1));
                   window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                disabled={currentIndex === questions.length - 1}
                className={`px-10 py-5 bg-gold text-midnight rounded-[2rem] font-black tracking-widest shadow-xl shadow-gold/20 transition-all ${currentIndex === questions.length - 1 ? 'opacity-20' : 'hover:scale-105 active:scale-95'}`}
              >
                다음 문항
              </button>
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
