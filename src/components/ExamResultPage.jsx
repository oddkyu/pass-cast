import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ExamResultPage = ({ result, isDarkMode, onHome, onRetry }) => {
  const [reviewIndex, setReviewIndex] = useState(null); // 현재 검토 중인 문항 인덱스

  if (!result || !result.questions) {
    return (
      <div className="min-h-screen flex items-center justify-center font-black">
        데이터를 찾을 수 없습니다. 다시 시도해 주세요.
      </div>
    );
  }

  const { questions, answers, year, subject } = result;
  
  let correctCount = 0;
  questions.forEach((q, idx) => {
    if (answers[idx] === q.answer) {
      correctCount++;
    }
  });

  const score = correctCount * (100 / questions.length);
  const isPass = score >= 60;
  const unansweredCount = questions.length - Object.keys(answers).length;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`min-h-screen flex flex-col noise-texture transition-all duration-500 overflow-x-hidden ${isDarkMode ? 'mesh-bg text-white' : 'bg-offwhite text-midnight'}`}
    >
      <main className="flex-1 max-w-5xl mx-auto w-full px-8 md:px-16 py-16 md:py-32 space-y-16">
        
        {/* 🏆 Result Header */}
        <section className="text-center space-y-6">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="space-y-4">
            <span className="text-[14px] font-black text-gold uppercase tracking-[0.6em] mb-4 inline-block">Professional Intelligence Report</span>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none break-keep">
              {year}년 {subject} <br/> 
              <span className="text-gold">시험 결과 리포트</span>
            </h1>
          </motion.div>
        </section>

        {/* 📊 Score Dashboard */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <motion.div 
            initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }}
            className={`lg:col-span-7 rounded-[4rem] p-12 md:p-20 relative overflow-hidden flex flex-col justify-center ${isDarkMode ? 'glass-card border-white/10' : 'bg-white shadow-2xl shadow-slate-200 border-white'}`}
          >
            <div className="relative z-10">
              <p className="text-sm font-black opacity-40 uppercase tracking-widest mb-4">Total Score</p>
              <div className="flex items-baseline space-x-4">
                <span className={`text-[120px] md:text-[180px] font-black leading-none tracking-tighter ${isPass ? 'text-gold glow-gold' : 'text-slate-400'}`}>{score}</span>
                <span className="text-4xl md:text-6xl font-black text-gold">점</span>
              </div>
              <div className="mt-12 flex items-center space-x-4">
                <div className={`px-8 py-3 rounded-full font-black text-xl flex items-center space-x-3 ${isPass ? 'bg-gold text-midnight shadow-xl shadow-gold/30' : 'bg-slate-200 text-slate-500'}`}>
                  <span>{isPass ? '🎊 합격권 진입' : '💪 다음 도전에 합격'}</span>
                </div>
              </div>
            </div>
            <div className={`absolute -bottom-20 -right-20 w-96 h-96 rounded-full blur-[120px] opacity-30 ${isPass ? 'bg-gold' : 'bg-slate-400'}`} />
          </motion.div>

          <motion.div 
            initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.5 }}
            className="lg:col-span-5 grid grid-cols-1 gap-8"
          >
            <div className={`rounded-[3rem] p-10 flex flex-col justify-between ${isDarkMode ? 'bg-white/5 border border-white/5' : 'bg-white shadow-xl shadow-slate-100 border-white'}`}>
              <span className="text-[12px] font-black opacity-30 uppercase tracking-[0.3em]">Correct Answers</span>
              <div className="flex items-end justify-between mt-4">
                <span className="text-6xl font-black text-green-500">{correctCount}</span>
                <span className="text-xl font-bold opacity-20">/ {questions.length}문항</span>
              </div>
            </div>
            <div className={`rounded-[3rem] p-10 flex flex-col justify-between ${isDarkMode ? 'bg-white/5 border border-white/5' : 'bg-white shadow-xl shadow-slate-100 border-white'}`}>
              <span className="text-[12px] font-black opacity-30 uppercase tracking-[0.3em]">Quick Stats</span>
              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-center">
                  <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">Wrong</p>
                  <p className="text-2xl font-black text-red-500">{questions.length - correctCount - unansweredCount}</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                  <p className="text-[10px] font-black opacity-30 uppercase tracking-widest mb-1">Skipped</p>
                  <p className="text-2xl font-black opacity-50">{unansweredCount}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* 📋 Quick Review Grid */}
        <section className={`rounded-[4rem] p-12 md:p-20 space-y-12 transition-all duration-500 ${isDarkMode ? 'glass-card border-white/5' : 'bg-white border-white shadow-2xl shadow-slate-200'}`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
             <div>
                <h3 className="text-2xl font-black tracking-tight">전체 문항 정오표</h3>
                <p className="text-sm font-bold opacity-30 mt-1">번호를 클릭하면 상세 해설을 볼 수 있습니다.</p>
             </div>
             <div className="flex space-x-6">
                <div className="flex items-center space-x-2 text-sm font-bold text-green-500">
                   <div className="w-3 h-3 rounded-full bg-green-500" />
                   <span>정답</span>
                </div>
                <div className="flex items-center space-x-2 text-sm font-bold text-red-500">
                   <div className="w-3 h-3 rounded-full bg-red-500" />
                   <span>오답</span>
                </div>
             </div>
          </div>
          
          <div className="grid grid-cols-5 md:grid-cols-10 gap-4 md:gap-6">
            {questions.map((q, i) => {
              const isCorrect = answers[i] === q.answer;
              const isUnanswered = answers[i] === undefined;
              return (
                <motion.button 
                  key={i} 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setReviewIndex(i)}
                  className={`aspect-square rounded-[1.2rem] flex items-center justify-center font-black text-lg border-2 transition-all
                    ${isUnanswered ? (isDarkMode ? 'border-white/5 text-white/10' : 'border-slate-100 text-slate-200') : 
                      isCorrect ? 'border-green-500/30 bg-green-500/5 text-green-500 shadow-lg shadow-green-500/10' : 
                      'border-red-500/30 bg-red-500/5 text-red-500 shadow-lg shadow-red-500/10'}
                  `}
                >
                  {i + 1}
                </motion.button>
              );
            })}
          </div>
        </section>

        {/* 🚀 Action Area */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <button onClick={onRetry} className={`group p-10 rounded-[3rem] flex flex-col items-center justify-center space-y-4 transition-all hover:scale-[1.02] active:scale-95 ${isDarkMode ? 'bg-white/5 text-white border border-white/5 hover:bg-white/10' : 'bg-white text-midnight border border-slate-100 shadow-xl shadow-slate-100'}`}>
            <div className="w-16 h-16 rounded-2xl bg-gold/10 text-gold flex items-center justify-center group-hover:scale-110 transition-transform">
               <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
            </div>
            <h4 className="text-2xl font-black">다시 도전하기</h4>
          </button>
          <button onClick={onHome} className="group p-10 bg-midnight text-gold rounded-[3rem] flex flex-col items-center justify-center space-y-4 transition-all hover:scale-[1.02] active:scale-95 shadow-2xl shadow-midnight/30">
            <div className="w-16 h-16 rounded-2xl bg-gold/20 text-gold flex items-center justify-center group-hover:scale-110 transition-transform">
               <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
            <h4 className="text-2xl font-black">홈으로 이동</h4>
          </button>
        </section>
      </main>

      {/* 🔍 Explanation Modal */}
      <AnimatePresence>
        {reviewIndex !== null && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setReviewIndex(null)}
              className="absolute inset-0 bg-midnight/80 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className={`relative w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-[3.5rem] shadow-2xl p-10 md:p-16 space-y-10 scrollbar-hide
                ${isDarkMode ? 'bg-midnight border border-white/10 text-white' : 'bg-white text-midnight'}
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl
                    ${answers[reviewIndex] === questions[reviewIndex].answer ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}
                  `}>
                    {reviewIndex + 1}
                  </div>
                  <span className="text-sm font-black text-gold tracking-widest uppercase">{year} 기출 해설</span>
                </div>
                <button onClick={() => setReviewIndex(null)} className="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>

              <div className="space-y-6">
                <h2 className="text-2xl md:text-3xl font-black leading-tight break-keep">
                  {questions[reviewIndex].question_text}
                </h2>
                <div className="space-y-3">
                  {questions[reviewIndex].options.map((opt, idx) => {
                    const isCorrect = idx === questions[reviewIndex].answer;
                    const isUserChoice = idx === answers[reviewIndex];
                    return (
                      <div 
                        key={idx}
                        className={`p-5 rounded-2xl border-2 flex items-center space-x-4 transition-all
                          ${isCorrect ? 'border-green-500 bg-green-500/5 text-green-500' : 
                            isUserChoice ? 'border-red-500 bg-red-500/5 text-red-500' : 'border-transparent opacity-40'}
                        `}
                      >
                        <span className="font-black w-6 text-center">{idx + 1}</span>
                        <span className="font-bold flex-1">{opt}</span>
                        {isCorrect && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12"/></svg>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 💡 Professional Explanation Box */}
              <div className={`p-8 rounded-[2rem] space-y-4 border-l-8 border-gold
                ${isDarkMode ? 'bg-white/5' : 'bg-gold/5'}
              `}>
                <div className="flex items-center space-x-3 text-gold">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9.663 17h4.674M12 3v1m0 16v1m5.657-13.657l-.707.707m-10.606 8.485l-.707.707M3 12h1m16 0h1M5.657 5.657l.707.707m8.485 10.606l.707.707M12 7a5 5 0 0 0-5 5 5 5 0 0 0 5 5 5 5 0 0 0 5-5 5 5 0 0 0-5-5z"/></svg>
                  <h4 className="text-lg font-black tracking-tighter">정답 해설</h4>
                </div>
                <p className="font-bold leading-relaxed opacity-80 break-keep">
                  {questions[reviewIndex].explanation || "이 문항에 대한 상세 해설이 준비 중입니다. 기본 이론서의 해당 파트를 참고하여 개념을 다시 한번 정리해 보세요."}
                </p>
              </div>

              <div className="flex justify-between items-center pt-4">
                <button 
                  onClick={(e) => { e.stopPropagation(); setReviewIndex(prev => Math.max(0, prev - 1)); }}
                  className="px-6 py-3 rounded-xl font-black text-sm hover:bg-white/5"
                >이전 해설</button>
                <button 
                  onClick={(e) => { e.stopPropagation(); setReviewIndex(prev => Math.min(questions.length - 1, prev + 1)); }}
                  className="px-6 py-3 bg-gold text-midnight rounded-xl font-black text-sm hover:scale-105 transition-transform"
                >다음 해설</button>
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
    </motion.div>
  );
};

export default ExamResultPage;
