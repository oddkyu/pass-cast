import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FullExamPage = ({ year, subject, isDarkMode, onBack, onFinish, isPremium = false }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [heldQuestions, setHeldQuestions] = useState(new Set());
  const [timeLeft, setTimeLeft] = useState(150 * 60);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [isGridOpen, setIsGridOpen] = useState(true); // 한눈에 보기 상태 유지
  const showAds = !isPremium;

  // Mock Questions
  const questions = useMemo(() => Array.from({ length: 40 }, (_, i) => ({
    id: i + 1,
    question_text: `[제${year}회 ${subject}] ${i + 1}번 문제입니다. 공인중개사법령상 중개대상물에 관한 설명으로 옳은 것을 모두 고른 것은?`,
    options: ["① 법령상 중개대상물에는 토지, 건물 그 밖의 토지의 정착물이 포함된다.", "② 입목에 관한 법률에 따른 입목은 중개대상물에 해당하지 않는다.", "③ 공장 및 광업재단 저당법에 따른 공장재단은 중개대상물이다.", "④ 중개보조원은 중개대상물의 확인·설명의 의무가 있다.", "⑤ 개업공인중개사는 소속공인중개사의 행위에 대해 책임을 지지 않는다."],
    answer: 2,
    explanation: "해당 문항의 정답은 ③번입니다."
  })), [year, subject]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSelectAnswer = (idx) => {
    setAnswers(prev => ({ ...prev, [currentIndex]: idx }));
  };

  const toggleHold = (idx) => {
    setHeldQuestions(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  return (
    <div className={`min-h-screen flex flex-col transition-all duration-500 noise-texture pb-24 ${isDarkMode ? 'mesh-bg text-white' : 'bg-offwhite text-midnight'}`}>
      
      {/* 🏛️ Sticky Top Area (Header + Integrated Grid) */}
      <div className="sticky top-0 z-50">
        <header className={`border-b flex items-center justify-between px-6 h-16 transition-all ${isDarkMode ? 'bg-midnight/95 border-white/5 backdrop-blur-3xl' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="flex items-center space-x-4">
            <button onClick={() => setShowExitConfirm(true)} className="w-8 h-8 border border-gold/30 rounded-lg flex items-center justify-center text-gold">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            </button>
            <div className="flex flex-col">
               <span className="text-[9px] font-black text-gold uppercase tracking-widest">{year} {subject}</span>
               <h1 className="text-sm font-black tracking-tight">실전 기출 모드</h1>
            </div>
          </div>

          <div className="flex items-center space-x-6">
             <div className="flex items-center space-x-2 bg-midnight text-gold px-4 py-1.5 rounded-lg font-black text-[12px] border border-gold/30">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <span>{formatTime(timeLeft)}</span>
             </div>
             <button onClick={() => setIsGridOpen(!isGridOpen)} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isGridOpen ? 'bg-gold text-midnight' : 'border border-gold/30 text-gold'}`}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
             </button>
          </div>
        </header>

        {/* 🔢 Question Grid (Visible at a glance) */}
        <AnimatePresence>
          {isGridOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className={`border-b overflow-hidden px-4 py-4 transition-all ${isDarkMode ? 'bg-midnight/80 border-white/5' : 'bg-slate-50 border-slate-100'}`}
            >
               <div className="grid grid-cols-10 gap-1.5 md:gap-3 max-w-2xl mx-auto">
                  {questions.map((q, i) => {
                    const isSelected = currentIndex === i;
                    const isAnswered = answers[i] !== undefined;
                    const isItemHeld = heldQuestions.has(i);
                    return (
                      <button
                        key={i}
                        onClick={() => setCurrentIndex(i)}
                        className={`aspect-square rounded-md font-black text-[10px] md:text-xs relative transition-all border
                          ${isSelected ? 'bg-midnight text-gold border-gold scale-110 z-10 shadow-lg' : isAnswered ? 'bg-gold/20 text-gold border-gold/30' : 'bg-white border-slate-200 opacity-40'}
                        `}
                      >
                        {i + 1}
                        {isItemHeld && <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-orange-500 rounded-full border-2 border-white shadow-sm" />}
                      </button>
                    );
                  })}
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 🏁 Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full px-4 md:px-8 py-8 gap-10">
        
        {/* 📢 Sidebar Ad (PC) */}
        {showAds && (
          <aside className="hidden lg:flex w-64 flex-col flex-shrink-0">
             <div className={`h-[600px] sticky top-64 rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center p-8 transition-all
               ${isDarkMode ? 'bg-white/5 border-white/10 text-white/20' : 'bg-white border-slate-200 text-slate-300'}
             `}>
                <span className="text-[9px] font-black opacity-30 uppercase tracking-widest mb-2">AD Space</span>
                <p className="text-xs font-bold opacity-30 text-center">Google AdSense Area</p>
             </div>
          </aside>
        )}

        <main className="flex-1 space-y-10">
          <section className="space-y-6">
             <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-gold tracking-tighter">QUESTION {currentIndex + 1}</span>
                <button 
                  onClick={() => toggleHold(currentIndex)}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all
                    ${heldQuestions.has(currentIndex) ? 'bg-gold text-midnight' : 'bg-midnight/5 text-gold border border-gold/20'}
                  `}
                >
                  보류 표시
                </button>
             </div>
             <h2 className="text-xl md:text-2xl font-black leading-tight break-keep">{questions[currentIndex].question_text}</h2>
          </section>

          <section className="grid grid-cols-1 gap-3">
            {questions[currentIndex].options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectAnswer(idx)}
                className={`p-5 md:p-6 rounded-2xl text-left transition-all duration-200 flex items-center space-x-5 border-2
                  ${answers[currentIndex] === idx 
                    ? 'bg-gold border-gold text-midnight shadow-md' 
                    : (isDarkMode ? 'bg-white/5 border-white/5 hover:border-gold/30' : 'bg-white border-slate-100 hover:border-gold/30 shadow-sm')}
                `}
              >
                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm
                   ${answers[currentIndex] === idx ? 'bg-midnight/10' : 'bg-midnight/5'}
                `}>{idx + 1}</span>
                <span className="text-base md:text-lg font-bold break-keep">{opt}</span>
              </button>
            ))}
          </section>
        </main>
      </div>

      {/* 🧭 Action Bar (Fixed Bottom) */}
      <footer className={`fixed bottom-0 left-0 w-full z-50 border-t transition-all ${isDarkMode ? 'bg-midnight/95 border-white/5 backdrop-blur-3xl' : 'bg-white border-slate-200 shadow-md'}`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
           <div className="flex space-x-3">
              <button onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))} disabled={currentIndex === 0} className="px-5 py-2 bg-midnight/5 rounded-lg font-black text-xs disabled:opacity-10 transition-all hover:bg-midnight/10">이전</button>
              <button onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))} disabled={currentIndex === questions.length - 1} className="px-5 py-2 bg-midnight/5 rounded-lg font-black text-xs disabled:opacity-10 transition-all hover:bg-midnight/10">다음</button>
           </div>
           <button onClick={() => onFinish({ questions, answers, year, subject })} className="px-8 py-2.5 bg-midnight text-gold rounded-lg font-black text-sm shadow-lg hover:scale-105 active:scale-95 transition-all">답안 제출</button>
        </div>
      </footer>

      <style>{`
        .break-keep { word-break: keep-all; }
      `}</style>
    </div>
  );
};

export default FullExamPage;
