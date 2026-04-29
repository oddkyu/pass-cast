import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ExamResultPage = ({ result, isDarkMode, isPremium, onHome, onRetry, user }) => {
  const [reviewIndex, setReviewIndex] = useState(null);
  const isGuest = !user;
  const showAds = !isPremium;

  if (!result || !result.questions) {
    return (
      <div className="min-h-screen flex items-center justify-center font-black text-2xl">
        결과 데이터를 분석 중입니다...
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

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className={`min-h-screen flex flex-col noise-texture transition-all duration-500 overflow-x-hidden ${isDarkMode ? 'mesh-bg text-white' : 'bg-offwhite text-midnight'}`}
    >
      <main className="flex-1 max-w-5xl mx-auto w-full px-8 md:px-16 py-12 md:py-24 space-y-12">
        
        {/* 📢 728x90 Ad Area (Hidden for Premium) */}
        {showAds && (
          <section className="flex justify-center">
             <div className={`w-full max-w-[728px] h-[90px] rounded-2xl flex flex-col items-center justify-center border-2 border-dashed relative overflow-hidden transition-all
               ${isDarkMode ? 'bg-white/5 border-white/10 text-white/20' : 'bg-slate-50 border-slate-200 text-slate-300'}
             `}>
               <div className="absolute top-2 left-4 px-2 py-0.5 bg-midnight/10 rounded-full text-[8px] font-black tracking-widest uppercase">AD</div>
               <p className="text-sm font-bold opacity-50 text-center uppercase tracking-widest">728 x 90 Advertising Area</p>
               <p className="text-[10px] font-black opacity-30 mt-1 uppercase">유료 구독 시 이 광고가 제거됩니다.</p>
             </div>
          </section>
        )}

        {/* 🏆 Result Card */}
        <section className={`rounded-[4rem] p-12 md:p-24 relative overflow-hidden flex flex-col items-center justify-center text-center ${isDarkMode ? 'glass-card border-white/10' : 'bg-white shadow-2xl shadow-slate-200 border-white'}`}>
          <div className="relative z-10 space-y-10">
            <div className="flex flex-col items-center space-y-2">
               <p className="text-xl font-black opacity-40 uppercase tracking-[0.4em]">{isGuest ? 'Guest Analysis' : (isPremium ? 'Premium Analysis' : 'Free Analysis')}</p>
               {isPremium && <span className="px-4 py-1 bg-gold text-midnight text-[10px] font-black rounded-full uppercase tracking-widest">Premium Member</span>}
            </div>
            <div className="flex items-baseline justify-center space-x-6">
              <span className={`text-[150px] md:text-[240px] font-black leading-none tracking-tighter ${isPass ? 'text-gold glow-gold' : 'text-slate-400'}`}>{score}</span>
              <span className="text-5xl md:text-8xl font-black text-gold">점</span>
            </div>
            <div className="inline-flex items-center space-x-6 px-12 py-5 bg-midnight text-gold rounded-full font-black text-2xl shadow-2xl">
              <span>{isPass ? '🎊 합격 안정권입니다!' : '💪 오답 분석으로 약점을 보완하세요'}</span>
            </div>
          </div>
          <div className={`absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full blur-[150px] opacity-20 ${isPass ? 'bg-gold' : 'bg-slate-400'}`} />
        </section>

        {/* 📋 Analysis Grid */}
        <section className={`rounded-[4rem] p-12 md:p-20 space-y-12 transition-all duration-500 ${isDarkMode ? 'glass-card border-white/5' : 'bg-white border-white shadow-2xl shadow-slate-200'}`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
             <h3 className="text-3xl font-black tracking-tight">전체 문항 분석표</h3>
             <div className="flex space-x-8">
                <div className="flex items-center space-x-3 text-lg font-black text-green-500">
                   <div className="w-4 h-4 rounded-full bg-green-500" />
                   <span>정답</span>
                </div>
                <div className="flex items-center space-x-3 text-lg font-black text-red-500">
                   <div className="w-4 h-4 rounded-full bg-red-500" />
                   <span>오답</span>
                </div>
             </div>
          </div>
          
          <div className="grid grid-cols-4 md:grid-cols-10 gap-6">
            {questions.map((q, i) => {
              const isCorrect = answers[i] === q.answer;
              const isUnanswered = answers[i] === undefined;
              return (
                <motion.button 
                  key={i} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setReviewIndex(i)}
                  className={`aspect-square rounded-[1.5rem] flex items-center justify-center font-black text-2xl border-2 transition-all
                    ${isUnanswered ? (isDarkMode ? 'border-white/5 text-white/10' : 'border-slate-100 text-slate-200') : 
                      isCorrect ? 'border-green-500/30 bg-green-500/5 text-green-500' : 
                      'border-red-500/30 bg-red-500/5 text-red-500'}
                  `}
                >
                  {i + 1}
                </motion.button>
              );
            })}
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <button onClick={onRetry} className={`p-12 rounded-[3.5rem] flex flex-col items-center justify-center space-y-6 transition-all hover:scale-[1.02] active:scale-95 ${isDarkMode ? 'bg-white/5 text-white border border-white/5' : 'bg-white text-midnight border border-slate-100 shadow-xl shadow-slate-100'}`}>
            <h4 className="text-3xl font-black">다시 풀어보기</h4>
          </button>
          <button onClick={onHome} className="p-12 bg-midnight text-gold rounded-[3.5rem] flex flex-col items-center justify-center space-y-6 transition-all hover:scale-[1.02] active:scale-95 shadow-2xl">
            <h4 className="text-3xl font-black">대시보드로 이동</h4>
          </button>
        </section>
      </main>

      {/* 🔍 Details Modal */}
      <AnimatePresence>
        {reviewIndex !== null && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setReviewIndex(null)} className="absolute inset-0 bg-midnight/90 backdrop-blur-2xl" />
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className={`relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[4rem] shadow-2xl p-12 md:p-20 space-y-12 scrollbar-hide ${isDarkMode ? 'bg-midnight border border-white/10 text-white' : 'bg-white text-midnight'}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-black text-gold tracking-widest uppercase">{year}년 {subject} 문항 해설</span>
                <button onClick={() => setReviewIndex(null)} className="w-12 h-12 rounded-full hover:bg-white/5 flex items-center justify-center text-gold">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>

              <div className="space-y-10">
                <h2 className="text-[28px] md:text-[36px] font-black leading-tight break-keep">{questions[reviewIndex].question_text}</h2>
                <div className="space-y-6">
                  {questions[reviewIndex].options.map((opt, idx) => {
                    const isCorrect = idx === questions[reviewIndex].answer;
                    const isUserChoice = idx === answers[reviewIndex];
                    return (
                      <div key={idx} className={`p-8 rounded-[2rem] border-2 flex items-center space-x-6 transition-all ${isCorrect ? 'border-green-500 bg-green-500/5 text-green-500 shadow-lg' : isUserChoice ? 'border-red-500 bg-red-500/5 text-red-500 shadow-lg' : 'border-slate-50 opacity-30'}`}>
                        <span className="font-black text-2xl w-8 text-center">{idx + 1}</span>
                        <span className="font-bold text-2xl md:text-3xl flex-1">{opt}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className={`p-12 rounded-[2.5rem] space-y-6 border-l-8 border-gold ${isDarkMode ? 'bg-white/5' : 'bg-gold/5'}`}>
                <div className="flex items-center space-x-4 text-gold">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M9.663 17h4.674M12 3v1m0 16v1m5.657-13.657l-.707.707m-10.606 8.485l-.707.707M3 12h1m16 0h1M5.657 5.657l.707.707m8.485 10.606l.707.707M12 7a5 5 0 0 0-5 5 5 5 0 0 0 5 5 5 5 0 0 0 5-5 5 5 0 0 0-5-5z"/></svg>
                  <h4 className="text-2xl font-black">비공개 정답 해설</h4>
                </div>
                <p className="font-bold text-2xl leading-relaxed opacity-80 break-keep">{questions[reviewIndex].explanation || "상세 해설을 불러오는 중입니다."}</p>
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
