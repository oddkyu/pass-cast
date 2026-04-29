import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FullExamPage = ({ year, subject, isDarkMode, onBack, onFinish, isPremium = false }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [heldQuestions, setHeldQuestions] = useState(new Set());
  const [timeLeft, setTimeLeft] = useState(150 * 60);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const showAds = !isPremium;

  // Mock Questions (Actual implementation should fetch from DB)
  const questions = useMemo(() => Array.from({ length: 40 }, (_, i) => ({
    id: i + 1,
    question_text: `[제${year}회 ${subject}] ${i + 1}번 문제입니다. 공인중개사법에 관한 설명으로 옳은 것을 모두 고른 것은? (예시)`,
    options: ["① 법인인 개업공인중개사", "② 소속공인중개사", "③ 중개보조원", "④ 개업공인중개사", "⑤ 소속공인중개사 및 중개보조원"],
    answer: 2,
    explanation: "해당 문항의 정답은 ②번입니다. 관련 법령 제15조에 의거합니다."
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
    if (currentIndex < questions.length - 1) {
      setTimeout(() => setCurrentIndex(prev => prev + 1), 300);
    }
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
    <div className={`min-h-screen flex flex-col transition-all duration-500 noise-texture ${isDarkMode ? 'mesh-bg text-white' : 'bg-offwhite text-midnight'}`}>
      
      {/* 🏛️ Sticky Exam Header */}
      <header className={`sticky top-0 z-50 border-b flex items-center justify-between px-8 h-20 transition-all ${isDarkMode ? 'bg-midnight/90 border-white/5 backdrop-blur-2xl' : 'bg-white/90 border-slate-100 backdrop-blur-md'}`}>
        <div className="flex items-center space-x-6">
          <button onClick={() => setShowExitConfirm(true)} className="w-10 h-10 glass-button rounded-xl flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <div className="flex flex-col">
             <span className="text-xs font-black text-gold uppercase tracking-widest">{year} {subject}</span>
             <h1 className="text-lg font-black tracking-tight">실전 기출 모드</h1>
          </div>
        </div>

        <div className="flex items-center space-x-10">
           <div className="flex items-center space-x-3 bg-midnight text-gold px-5 py-2.5 rounded-full font-black text-sm shadow-lg">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span>{formatTime(timeLeft)}</span>
           </div>
           <div className="hidden md:flex items-center space-x-2 text-gold opacity-60">
              <span className="text-[11px] font-black uppercase">보류 문항</span>
              <span className="w-6 h-6 bg-gold/10 rounded flex items-center justify-center text-xs font-black">{heldQuestions.size}</span>
           </div>
        </div>
      </header>

      {/* 🏁 Main Exam Layout (With Sidebar Ad Support) */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full px-4 md:px-8 py-10 gap-10">
        
        {/* 📢 Side Ad Slot (PC Only, Guest/Free Only) */}
        {showAds && (
          <aside className="hidden lg:flex w-64 flex-col space-y-6 flex-shrink-0">
             <div className={`h-[600px] rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center text-center p-6 transition-all
               ${isDarkMode ? 'bg-white/5 border-white/10 text-white/20' : 'bg-white border-slate-200 text-slate-300'}
             `}>
                <div className="px-2 py-0.5 bg-midnight/10 rounded text-[9px] font-black uppercase tracking-widest mb-4">AD Slot</div>
                <p className="text-sm font-bold opacity-40 leading-relaxed">이 영역은 <br/> Google AdSense <br/> 공간입니다.</p>
                <div className="mt-8 pt-8 border-t border-current w-full">
                   <p className="text-[10px] font-black opacity-30 italic">유료 회원은 광고 없이 <br/> 공부에만 집중합니다.</p>
                </div>
             </div>
          </aside>
        )}

        {/* 📝 Question Content */}
        <main className="flex-1 space-y-12">
          <section className="space-y-8">
             <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-gold">Q{currentIndex + 1}.</span>
                <button 
                  onClick={() => toggleHold(currentIndex)}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all
                    ${isHeld ? 'bg-gold text-midnight' : 'bg-midnight/5 text-gold border border-gold/20'}
                  `}
                >
                  {isHeld ? '보류 중' : '보류하기'}
                </button>
             </div>
             <h2 className="text-2xl md:text-3xl font-black leading-tight break-keep">{currentQuestion.question_text}</h2>
          </section>

          <section className="grid grid-cols-1 gap-4">
            {currentQuestion.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectAnswer(idx)}
                className={`p-6 md:p-8 rounded-[2rem] text-left transition-all duration-300 flex items-center space-x-6 border-2
                  ${answers[currentIndex] === idx ? 'bg-gold border-gold text-midnight shadow-xl' : (isDarkMode ? 'bg-white/5 border-white/5 hover:border-white/20' : 'bg-white border-slate-100 hover:border-slate-300 shadow-sm')}
                `}
              >
                <span className="w-10 h-10 rounded-full bg-midnight/5 flex items-center justify-center font-black text-lg">{idx + 1}</span>
                <span className="text-lg md:text-xl font-bold">{opt}</span>
              </button>
            ))}
          </section>

          {/* 📢 Bottom Ad Slot (Mobile/Guest/Free Only) */}
          {showAds && (
            <section className="lg:hidden w-full h-[100px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all
              ${isDarkMode ? 'bg-white/5 border-white/10 text-white/20' : 'bg-white border-slate-200 text-slate-300'}
            ">
               <span className="text-[9px] font-black uppercase tracking-widest mb-1">Mobile AD Slot</span>
               <p className="text-xs font-bold opacity-30 tracking-tight text-center px-4">문제 풀이에 최적화된 광고 레이아웃입니다.</p>
            </section>
          )}
        </main>
      </div>

      {/* 📱 Full-width Navigation / Status Bar (Fixed at bottom) */}
      <footer className={`sticky bottom-0 z-50 border-t transition-all ${isDarkMode ? 'bg-midnight/90 border-white/5 backdrop-blur-2xl' : 'bg-white/90 border-slate-100 backdrop-blur-md'}`}>
        <div className="max-w-7xl mx-auto px-8 h-24 flex items-center justify-between">
           <div className="flex items-center space-x-4">
             <button onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))} disabled={currentIndex === 0} className="w-12 h-12 glass-button rounded-xl flex items-center justify-center disabled:opacity-20 transition-all">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M15 18l-6-6 6-6"/></svg>
             </button>
             <div className="flex items-center space-x-2 px-6 h-12 bg-midnight/5 rounded-xl border border-white/5">
                <span className="text-xl font-black text-gold">{currentIndex + 1}</span>
                <span className="text-sm font-bold opacity-30">/ {questions.length}</span>
             </div>
             <button onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))} disabled={currentIndex === questions.length - 1} className="w-12 h-12 glass-button rounded-xl flex items-center justify-center disabled:opacity-20 transition-all">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M9 18l6-6-6-6"/></svg>
             </button>
           </div>

           <button 
             onClick={() => onFinish({ questions, answers, year, subject })}
             className="px-10 py-4 bg-midnight text-gold rounded-2xl font-black text-lg shadow-2xl hover:scale-105 active:scale-95 transition-all"
           >
             답안 제출하기
           </button>
        </div>
      </footer>

      {/* 🔍 Exit Confirmation Modal */}
      <AnimatePresence>
        {showExitConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowExitConfirm(false)} className="absolute inset-0 bg-midnight/80 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className={`relative w-full max-w-md rounded-[2.5rem] p-12 text-center space-y-10 ${isDarkMode ? 'bg-midnight border border-white/10 text-white' : 'bg-white text-midnight'}`}>
              <h3 className="text-2xl font-black tracking-tight leading-tight">시험을 종료하시겠습니까?<br/><span className="text-sm opacity-40 font-bold">현재까지 기록된 답안은 저장되지 않습니다.</span></h3>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setShowExitConfirm(false)} className="py-4 rounded-xl font-black opacity-40 hover:opacity-100 transition-opacity">계속 풀기</button>
                <button onClick={onBack} className="py-4 bg-red-500 text-white rounded-xl font-black shadow-lg">시험 종료</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .break-keep { word-break: keep-all; }
      `}</style>
    </div>
  );
};

export default FullExamPage;
