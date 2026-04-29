import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FullExamPage = ({ year, subject, isDarkMode, onBack, onFinish, isPremium = false }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [heldQuestions, setHeldQuestions] = useState(new Set());
  const [timeLeft, setTimeLeft] = useState(150 * 60);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const showAds = !isPremium;

  // Mock Questions
  const questions = useMemo(() => Array.from({ length: 40 }, (_, i) => ({
    id: i + 1,
    question_text: `[제${year}회 ${subject}] ${i + 1}번 문제입니다. 공인중개사법령상 중개대상물에 관한 설명으로 옳은 것을 모두 고른 것은?`,
    options: ["① 법령상 중개대상물에는 토지, 건물 그 밖의 토지의 정착물이 포함된다.", "② 입목에 관한 법률에 따른 입목은 중개대상물에 해당하지 않는다.", "③ 공장 및 광업재단 저당법에 따른 공장재단은 중개대상물이다.", "④ 중개보조원은 중개대상물의 확인·설명의 의무가 있다.", "⑤ 개업공인중개사는 소속공인중개사의 행위에 대해 책임을 지지 않는다."],
    answer: 2,
    explanation: "해당 문항의 정답은 ③번입니다. 공장재단 및 광업재단은 법령상 중개대상물에 해당합니다."
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

  const currentQuestion = questions[currentIndex];
  const isHeld = heldQuestions.has(currentIndex);

  return (
    <div className={`min-h-screen flex flex-col transition-all duration-500 noise-texture pb-24 ${isDarkMode ? 'mesh-bg text-white' : 'bg-offwhite text-midnight'}`}>
      
      {/* 🏛️ Exam Header & Navigation Bar (TOP) */}
      <div className="sticky top-0 z-50">
        <header className={`border-b flex items-center justify-between px-8 h-20 transition-all ${isDarkMode ? 'bg-midnight/95 border-white/5 backdrop-blur-3xl' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="flex items-center space-x-6">
            <button onClick={() => setShowExitConfirm(true)} className="w-10 h-10 border border-gold/30 rounded-xl flex items-center justify-center hover:bg-gold/5 transition-all text-gold">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            </button>
            <div className="flex flex-col">
               <span className="text-[10px] font-black text-gold uppercase tracking-widest">{year} YEAR • {subject}</span>
               <h1 className="text-lg font-black tracking-tight">실전 기출 모드</h1>
            </div>
          </div>

          <div className="flex items-center space-x-8">
             <div className="flex items-center space-x-3 bg-midnight text-gold px-5 py-2 rounded-lg font-black text-sm border border-gold/30">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <span>{formatTime(timeLeft)}</span>
             </div>
             <div className="hidden md:flex items-center space-x-3">
                <span className="text-[10px] font-black uppercase opacity-40">보류</span>
                <div className="px-3 py-1 bg-gold/10 text-gold rounded-md text-xs font-black border border-gold/20">{heldQuestions.size}</div>
             </div>
          </div>
        </header>

        {/* 🔢 Number Grid Bar (TOP - Restored to top location) */}
        <div className={`border-b px-4 py-3 transition-all flex overflow-x-auto scrollbar-hide space-x-2 ${isDarkMode ? 'bg-midnight/80 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
           {questions.map((q, i) => {
             const isSelected = currentIndex === i;
             const isAnswered = answers[i] !== undefined;
             const isItemHeld = heldQuestions.has(i);
             return (
               <button
                 key={i}
                 onClick={() => setCurrentIndex(i)}
                 className={`flex-shrink-0 w-10 h-10 rounded-lg font-black text-xs relative transition-all
                   ${isSelected ? 'bg-midnight text-gold scale-110 z-10 border border-gold/50' : isAnswered ? 'bg-gold/20 text-gold' : 'bg-white border border-slate-200 opacity-40'}
                 `}
               >
                 {i + 1}
                 {isItemHeld && <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-orange-500 rounded-full border-2 border-white" />}
               </button>
             );
           })}
        </div>
      </div>

      {/* 🏁 Main Content with Responsive Sidebar Ads */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full px-4 md:px-8 py-10 gap-12">
        
        {/* 📢 Sidebar Ad Slot (PC) */}
        {showAds && (
          <aside className="hidden lg:flex w-64 flex-col flex-shrink-0">
             <div className={`h-[600px] sticky top-48 rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center p-8 transition-all
               ${isDarkMode ? 'bg-white/5 border-white/10 text-white/20' : 'bg-white border-slate-200 text-slate-300'}
             `}>
                <span className="text-[9px] font-black uppercase tracking-widest mb-4">AD Slot</span>
                <p className="text-sm font-bold opacity-40 text-center leading-relaxed italic text-gold">AD Space</p>
             </div>
          </aside>
        )}

        {/* 📝 Question Engine */}
        <main className="flex-1 space-y-12">
          <section className="space-y-8">
             <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                   <span className="text-3xl font-black text-gold">Q{currentIndex + 1}</span>
                </div>
                <button 
                  onClick={() => toggleHold(currentIndex)}
                  className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                    ${isHeld ? 'bg-gold text-midnight shadow-lg' : 'bg-midnight/5 text-gold border border-gold/20 hover:bg-gold/10'}
                  `}
                >
                  {isHeld ? '보류 중' : '보류 표시'}
                </button>
             </div>
             <h2 className="text-2xl md:text-3xl font-black leading-tight break-keep">{currentQuestion.question_text}</h2>
          </section>

          <section className="grid grid-cols-1 gap-5">
            {currentQuestion.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectAnswer(idx)}
                className={`p-6 md:p-8 rounded-[2rem] text-left transition-all duration-300 flex items-center space-x-6 border-2
                  ${answers[currentIndex] === idx 
                    ? 'bg-gold border-gold text-midnight shadow-xl' 
                    : (isDarkMode ? 'bg-white/5 border-white/5 hover:border-gold/30' : 'bg-white border-slate-100 hover:border-gold/30 shadow-sm')}
                `}
              >
                <span className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg
                   ${answers[currentIndex] === idx ? 'bg-midnight/10' : 'bg-midnight/5'}
                `}>{idx + 1}</span>
                <span className="text-lg md:text-xl font-bold break-keep">{opt}</span>
              </button>
            ))}
          </section>

          {/* 📢 Bottom Ad Slot (Mobile) */}
          {showAds && (
            <section className="lg:hidden w-full h-[100px] mt-12 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all
              ${isDarkMode ? 'bg-white/5 border-white/10 text-white/20' : 'bg-white border-slate-200 text-slate-300'}
            ">
               <span className="text-[9px] font-black uppercase tracking-widest mb-1">Mobile Ad Area</span>
            </section>
          )}
        </main>
      </div>

      {/* 🧭 Action Bar (Fixed Bottom) */}
      <footer className={`fixed bottom-0 left-0 w-full z-50 border-t transition-all ${isDarkMode ? 'bg-midnight/95 border-white/5 backdrop-blur-3xl' : 'bg-white border-slate-200 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]'}`}>
        <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between gap-4">
           <div className="flex space-x-3">
              <button 
                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="px-8 py-3 bg-midnight/5 rounded-xl font-black text-sm disabled:opacity-10 transition-all hover:bg-midnight/10"
              >
                이전 문항
              </button>
              <button 
                onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                disabled={currentIndex === questions.length - 1}
                className="px-8 py-3 bg-midnight/5 rounded-xl font-black text-sm disabled:opacity-10 transition-all hover:bg-midnight/10"
              >
                다음 문항
              </button>
           </div>

           <button 
             onClick={() => onFinish({ questions, answers, year, subject })}
             className="px-12 py-3.5 bg-midnight text-gold rounded-xl font-black text-sm shadow-xl hover:scale-105 active:scale-95 transition-all"
           >
             답안 제출 및 채점
           </button>
        </div>
      </footer>

      {/* 🔍 Exit Confirmation Modal */}
      <AnimatePresence>
        {showExitConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowExitConfirm(false)} className="absolute inset-0 bg-midnight/80 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className={`relative w-full max-w-md rounded-[2.5rem] p-12 text-center space-y-10 ${isDarkMode ? 'bg-midnight border border-white/10 text-white' : 'bg-white text-midnight'}`}>
              <h3 className="text-2xl font-black tracking-tight leading-tight">시험을 종료하시겠습니까?</h3>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setShowExitConfirm(false)} className="py-4 rounded-xl font-black opacity-40 hover:opacity-100 transition-opacity">취소</button>
                <button onClick={onBack} className="py-4 bg-red-500 text-white rounded-xl font-black shadow-lg">종료</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .break-keep { word-break: keep-all; }
      `}</style>
    </div>
  );
};

export default FullExamPage;
