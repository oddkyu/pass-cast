import React from 'react';
import { motion } from 'framer-motion';

const ExamResultPage = ({ result, isDarkMode, onHome, onRetry }) => {
  // 🛡️ 결과 데이터가 없을 경우를 대비한 안전 장치
  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl font-black">결과 데이터를 불러오는 중입니다...</p>
      </div>
    );
  }

  const { questions, answers, year, subject } = result;
  
  // 점수 계산 (40문항 기준, 한 문제당 2.5점)
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
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`min-h-screen flex flex-col noise-texture transition-all duration-500 ${isDarkMode ? 'mesh-bg text-white' : 'bg-offwhite text-midnight'}`}
    >
      <main className="flex-1 max-w-4xl mx-auto w-full px-8 md:px-12 py-16 md:py-24 space-y-12">
        
        {/* 🏆 Result Card */}
        <section className={`glass-card rounded-[4rem] p-12 md:p-20 text-center relative overflow-hidden transition-all duration-500 ${isDarkMode ? 'border-white/10' : 'bg-white border-white shadow-2xl shadow-slate-200'}`}>
          <div className="relative z-10 space-y-8">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <span className="text-[14px] font-black text-gold uppercase tracking-[0.5em] mb-4 inline-block">Examination Result</span>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-2">{year}년 {subject}</h1>
              <p className={`text-lg font-bold opacity-40`}>수고하셨습니다. 사장님의 합격 리포트입니다.</p>
            </motion.div>

            <div className="py-12 relative">
               <motion.div 
                 initial={{ scale: 0.5, opacity: 0 }}
                 animate={{ scale: 1, opacity: 1 }}
                 transition={{ type: 'spring', damping: 12, delay: 0.4 }}
                 className={`text-[120px] md:text-[180px] font-black tracking-tighter leading-none transition-colors ${isPass ? 'text-gold glow-gold' : 'text-slate-400'}`}
               >
                 {score}
                 <span className="text-4xl md:text-6xl text-gold ml-2 font-black">점</span>
               </motion.div>
               {isPass && (
                 <motion.div 
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.8 }}
                   className="mt-6 inline-flex items-center space-x-3 px-8 py-3 bg-gold text-midnight rounded-full font-black text-xl shadow-xl shadow-gold/30"
                 >
                   <span>🎊 합격권입니다!</span>
                 </motion.div>
               )}
            </div>

            <div className="grid grid-cols-3 gap-6 pt-12 border-t border-white/5">
              <div className="space-y-2">
                <p className="text-[12px] font-black opacity-30 uppercase tracking-widest">Correct</p>
                <p className="text-3xl font-black text-green-500">{correctCount}</p>
              </div>
              <div className="space-y-2">
                <p className="text-[12px] font-black opacity-30 uppercase tracking-widest">Wrong</p>
                <p className="text-3xl font-black text-red-500">{questions.length - correctCount - unansweredCount}</p>
              </div>
              <div className="space-y-2">
                <p className="text-[12px] font-black opacity-30 uppercase tracking-widest">Skipped</p>
                <p className="text-3xl font-black opacity-30">{unansweredCount}</p>
              </div>
            </div>
          </div>

          {/* Background Decorative Element */}
          <div className={`absolute -bottom-20 -right-20 w-80 h-80 rounded-full blur-[100px] transition-colors ${isPass ? 'bg-gold/20' : 'bg-slate-500/10'}`} />
        </section>

        {/* 📋 Action Buttons */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button 
            onClick={onRetry}
            className={`p-8 rounded-[2.5rem] flex items-center justify-center space-x-4 transition-all hover:scale-105 active:scale-95
              ${isDarkMode ? 'bg-white/5 text-white border border-white/5' : 'bg-white text-midnight border border-slate-100 shadow-xl shadow-slate-100'}
            `}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
            <span className="text-xl font-black tracking-tight">다시 풀기</span>
          </button>
          <button 
            onClick={onHome}
            className="p-8 bg-midnight text-gold rounded-[2.5rem] flex items-center justify-center space-x-4 transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-midnight/20"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            <span className="text-xl font-black tracking-tight">홈으로 돌아가기</span>
          </button>
        </section>

        {/* 📊 Detailed Answer Key (Quick View) */}
        <section className={`glass-card rounded-[3rem] p-10 md:p-16 space-y-12 transition-all duration-500 ${isDarkMode ? 'border-white/5' : 'bg-white border-white shadow-xl shadow-slate-100'}`}>
          <h3 className="text-xl font-black tracking-widest uppercase opacity-50">정오표 확인</h3>
          <div className="grid grid-cols-5 md:grid-cols-10 gap-4">
            {questions.map((q, i) => {
              const isCorrect = answers[i] === q.answer;
              const isUnanswered = answers[i] === undefined;
              return (
                <div 
                  key={i} 
                  className={`aspect-square rounded-xl flex items-center justify-center font-black text-sm border-2
                    ${isUnanswered ? (isDarkMode ? 'border-white/10 text-white/20' : 'border-slate-50 text-slate-200') : 
                      isCorrect ? 'border-green-500/50 bg-green-500/10 text-green-500' : 'border-red-500/50 bg-red-500/10 text-red-500'}
                  `}
                >
                  {i + 1}
                </div>
              );
            })}
          </div>
        </section>

      </main>

      <footer className="py-12 text-center opacity-20 text-[10px] font-black tracking-[0.4em] uppercase">
        © 2026 pass-cast Intelligence Report
      </footer>
    </motion.div>
  );
};

export default ExamResultPage;
