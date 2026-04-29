import React from 'react';
import { motion } from 'framer-motion';

const ExamResultPage = ({ result, isDarkMode, onHome, onRetry }) => {
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
        
        {/* 🏆 Massive Result Header */}
        <section className="text-center space-y-6">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="space-y-4"
          >
            <span className="text-[14px] font-black text-gold uppercase tracking-[0.6em] mb-4 inline-block">Professional Intelligence Report</span>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none break-keep">
              {year}년 {subject} <br/> 
              <span className="text-gold">시험 결과 리포트</span>
            </h1>
          </motion.div>
        </section>

        {/* 📊 Score Dashboard */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Main Score Card */}
          <motion.div 
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className={`lg:col-span-7 rounded-[4rem] p-12 md:p-20 relative overflow-hidden flex flex-col justify-center
              ${isDarkMode ? 'glass-card border-white/10' : 'bg-white shadow-2xl shadow-slate-200 border-white'}
            `}
          >
            <div className="relative z-10">
              <p className="text-sm font-black opacity-40 uppercase tracking-widest mb-4">Total Score</p>
              <div className="flex items-baseline space-x-4">
                <motion.span 
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', damping: 10, delay: 0.6 }}
                  className={`text-[120px] md:text-[180px] font-black leading-none tracking-tighter ${isPass ? 'text-gold glow-gold' : 'text-slate-400'}`}
                >
                  {score}
                </motion.span>
                <span className="text-4xl md:text-6xl font-black text-gold">점</span>
              </div>
              <div className="mt-12 flex items-center space-x-4">
                <div className={`px-8 py-3 rounded-full font-black text-xl flex items-center space-x-3 ${isPass ? 'bg-gold text-midnight shadow-xl shadow-gold/30' : 'bg-slate-200 text-slate-500'}`}>
                  <span>{isPass ? '🎊 합격권 진입' : '💪 다음 도전에 합격'}</span>
                </div>
                <p className="text-sm font-bold opacity-40 break-keep">
                  {isPass ? '현재 실력을 유지하신다면 실제 시험에서도 충분히 합격하실 수 있습니다.' : '오답 분석을 통해 부족한 부분을 보완하면 곧 합격권에 도달할 수 있습니다.'}
                </p>
              </div>
            </div>
            {/* Background Accent */}
            <div className={`absolute -bottom-20 -right-20 w-96 h-96 rounded-full blur-[120px] opacity-30 ${isPass ? 'bg-gold' : 'bg-slate-400'}`} />
          </motion.div>

          {/* Stats Summary Column */}
          <motion.div 
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-5 grid grid-cols-1 gap-8"
          >
            <div className={`rounded-[3rem] p-10 flex flex-col justify-between transition-all ${isDarkMode ? 'bg-white/5 border border-white/5' : 'bg-white shadow-xl shadow-slate-100 border-white'}`}>
              <span className="text-[12px] font-black opacity-30 uppercase tracking-[0.3em]">Correct Answers</span>
              <div className="flex items-end justify-between mt-4">
                <span className="text-6xl font-black text-green-500">{correctCount}</span>
                <span className="text-xl font-bold opacity-20">/ {questions.length}문항</span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full mt-6 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(correctCount/questions.length)*100}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-green-500"
                />
              </div>
            </div>

            <div className={`rounded-[3rem] p-10 flex flex-col justify-between transition-all ${isDarkMode ? 'bg-white/5 border border-white/5' : 'bg-white shadow-xl shadow-slate-100 border-white'}`}>
              <span className="text-[12px] font-black opacity-30 uppercase tracking-[0.3em]">Status Breakdown</span>
              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
                  <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">Wrong</p>
                  <p className="text-2xl font-black text-red-500">{questions.length - correctCount - unansweredCount}</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-[10px] font-black opacity-30 uppercase tracking-widest mb-1">Skipped</p>
                  <p className="text-2xl font-black opacity-50">{unansweredCount}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* 📋 Quick Review Grid */}
        <section className={`rounded-[4rem] p-12 md:p-20 space-y-12 transition-all duration-500 ${isDarkMode ? 'glass-card border-white/5' : 'bg-white border-white shadow-2xl shadow-slate-200'}`}>
          <div className="flex items-center justify-between">
             <h3 className="text-2xl font-black tracking-tight">전체 문항 정오표</h3>
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
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + (i * 0.02) }}
                  className={`aspect-square rounded-[1.2rem] flex items-center justify-center font-black text-lg border-2 transition-all
                    ${isUnanswered ? (isDarkMode ? 'border-white/5 text-white/10' : 'border-slate-50 text-slate-200') : 
                      isCorrect ? 'border-green-500/30 bg-green-500/5 text-green-500 shadow-lg shadow-green-500/10' : 
                      'border-red-500/30 bg-red-500/5 text-red-500 shadow-lg shadow-red-500/10'}
                  `}
                >
                  {i + 1}
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* 🚀 Action Area */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <button 
            onClick={onRetry}
            className={`group p-10 rounded-[3rem] flex flex-col items-center justify-center space-y-4 transition-all hover:scale-[1.02] active:scale-95
              ${isDarkMode ? 'bg-white/5 text-white border border-white/5 hover:bg-white/10' : 'bg-white text-midnight border border-slate-100 shadow-xl shadow-slate-100 hover:shadow-2xl'}
            `}
          >
            <div className="w-16 h-16 rounded-2xl bg-gold/10 text-gold flex items-center justify-center group-hover:scale-110 transition-transform">
               <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
            </div>
            <div className="text-center">
              <h4 className="text-2xl font-black">다시 도전하기</h4>
              <p className="text-sm font-bold opacity-30">완벽한 마스터를 위해 한 번 더!</p>
            </div>
          </button>

          <button 
            onClick={onHome}
            className="group p-10 bg-midnight text-gold rounded-[3rem] flex flex-col items-center justify-center space-y-4 transition-all hover:scale-[1.02] active:scale-95 shadow-2xl shadow-midnight/30"
          >
            <div className="w-16 h-16 rounded-2xl bg-gold/20 text-gold flex items-center justify-center group-hover:scale-110 transition-transform">
               <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
            <div className="text-center">
              <h4 className="text-2xl font-black">대시보드로 이동</h4>
              <p className="text-gold/40 text-sm font-bold">전체 학습 통계 확인하기</p>
            </div>
          </button>
        </section>

      </main>

      <footer className="py-20 text-center space-y-4 opacity-30">
        <div className="text-[12px] font-black tracking-[0.5em] uppercase">Pass-Cast AI Analytics Division</div>
        <div className="flex justify-center space-x-8 text-[10px] font-bold">
           <span>이용약관</span>
           <span>개인정보처리방침</span>
           <span>고객센터</span>
        </div>
      </footer>
    </motion.div>
  );
};

export default ExamResultPage;
