import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const HomePage = ({ 
  isDarkMode, 
  onToggleTheme, 
  onStartQuiz, 
  onGoToLanding, 
  onGoToExamSelection,
  onGoToWrongNote,
  wrongCount = 0 
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className={`flex-1 flex flex-col min-h-screen transition-all duration-500 noise-texture ${isDarkMode ? 'mesh-bg text-white' : 'bg-offwhite text-midnight'}`}>
      
      {/* 🏛️ Premium Navigation Bar */}
      <nav className={`sticky top-0 z-50 border-b transition-all duration-500 ${isDarkMode ? 'bg-midnight/60 border-white/5 backdrop-blur-2xl' : 'bg-white/80 border-slate-100 backdrop-blur-md'}`}>
        <div className="max-w-7xl mx-auto px-8 md:px-12 h-20 md:h-24 flex items-center justify-between">
          <div className="flex items-center space-x-4 group cursor-pointer" onClick={onGoToLanding}>
            <div className="w-10 h-10 bg-gold rounded-xl flex items-center justify-center shadow-lg shadow-gold/20 group-hover:scale-110 transition-transform">
              <span className="text-midnight font-black text-xl">P</span>
            </div>
            <span className="text-xl md:text-2xl font-black tracking-tighter uppercase">Pass-Cast</span>
          </div>
          
          <div className="flex items-center space-x-10">
            <div className="hidden md:flex items-center space-x-10 text-sm font-black tracking-widest uppercase opacity-40">
              <button className="hover:opacity-100 transition-opacity">기출문제</button>
              <button onClick={onGoToWrongNote} className="hover:opacity-100 transition-opacity">오답노트</button>
              <button className="hover:opacity-100 transition-opacity">내 강의실</button>
            </div>
            
            <button onClick={onToggleTheme} className="w-12 h-12 glass-button rounded-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95">
              {isDarkMode ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="5"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2m-18.78 6.36l1.42-1.42m12.72-12.72l1.42-1.42"/></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* 🚀 Dashboard Hero */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-8 md:px-12 py-12 md:py-20 space-y-12">
        <header className="space-y-4 text-center md:text-left">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center justify-center md:justify-start space-x-3">
            <div className="w-2 h-2 bg-gold rounded-full animate-pulse" />
            <span className="text-[12px] font-black text-gold uppercase tracking-[0.5em]">Private Study Space</span>
          </motion.div>
          <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-4xl md:text-7xl font-black tracking-tighter leading-[1.1]">
            사장님, 합격까지 <br/> 단 <span className="text-gold glow-gold">15%</span> 남았습니다.
          </motion.h2>
        </header>

        {/* 📊 Wide Stats Card */}
        <motion.section 
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className={`group glass-card rounded-[4rem] p-12 md:p-20 flex flex-col md:flex-row items-center justify-between gap-16 relative overflow-hidden transition-all duration-500 ${isDarkMode ? 'border-white/10' : 'bg-white border-white shadow-2xl shadow-slate-100'}`}
        >
          <div className="relative z-10 space-y-10 flex-1">
            <div className="space-y-3">
              <h3 className="text-3xl font-black tracking-tight">오늘의 학습 현황</h3>
              <p className="font-bold text-lg opacity-40">사장님만을 위한 독립된 학습 데이터를 분석 중입니다.</p>
            </div>
            <div className="space-y-8">
              <div className="flex items-end justify-between">
                <span className="text-6xl font-black text-gold tracking-tighter">85<span className="text-2xl ml-1 font-bold opacity-30">/ 100</span></span>
                <span className="text-sm font-black tracking-widest uppercase opacity-40">합격 가능성</span>
              </div>
              <div className="w-full h-5 bg-midnight/5 rounded-full overflow-hidden border border-white/5 shadow-inner">
                <motion.div initial={{ width: 0 }} animate={{ width: '85%' }} transition={{ duration: 2, ease: "easeOut" }} className="h-full bg-gold shadow-[0_0_30px_rgba(212,175,55,0.6)]" />
              </div>
            </div>
          </div>
          
          <div className="w-full md:w-96 h-64 bg-midnight/5 rounded-[3rem] border border-white/5 flex items-center justify-center relative overflow-hidden">
             <div className="absolute inset-x-0 bottom-0 h-full flex items-end space-x-3 px-8 pb-8">
                {[40, 70, 45, 90, 65, 85, 95].map((h, i) => (
                  <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ delay: 0.8 + (i * 0.1), duration: 1 }} className="flex-1 bg-gold/20 rounded-t-xl group-hover:bg-gold/50 transition-colors" />
                ))}
             </div>
          </div>
        </motion.section>

        {/* 🛠️ Refined Action Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <ActionButton 
            title="회차별 기출 풀기"
            subtitle="연도별 과목별 집중 훈련"
            icon={<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>}
            onClick={onGoToExamSelection}
            isDarkMode={isDarkMode}
            delay={0.6}
          />
          <ActionButton 
            title="나만의 오답노트"
            subtitle={`${wrongCount}개의 오답을 조용히 정복`}
            badge={wrongCount > 0 ? wrongCount : null}
            icon={<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>}
            onClick={onGoToWrongNote}
            isDarkMode={isDarkMode}
            delay={0.7}
            isPrimary={wrongCount > 0}
          />
          <ActionButton 
            title="제35회 전체 풀기"
            subtitle="가장 최신 기출 실전 모드"
            icon={<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>}
            onClick={() => onGoToExamSelection()} // 전체 풀기 기능으로 연결
            isDarkMode={isDarkMode}
            delay={0.8}
            highlight="NEW"
          />
        </section>
      </main>

      <footer className={`mt-auto border-t transition-all ${isDarkMode ? 'bg-midnight border-white/5' : 'bg-white border-slate-100'}`}>
        <div className="max-w-7xl mx-auto px-12 py-16 flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex flex-col items-center md:items-start space-y-4">
            <span className="text-2xl font-black tracking-tighter uppercase">Pass-Cast</span>
            <p className="text-sm font-bold opacity-30">오직 사장님의 합격만을 위한 비공개 학습 공간입니다.</p>
          </div>
          <div className="flex space-x-12 text-[11px] font-black uppercase tracking-[0.3em] opacity-40">
            <button className="hover:text-gold transition-colors">이용약관</button>
            <button className="hover:text-gold transition-colors">개인정보처리방침</button>
            <button className="hover:text-gold transition-colors">문의하기</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

const ActionButton = ({ title, subtitle, icon, onClick, isDarkMode, delay, badge, isPrimary, highlight }) => (
  <motion.button
    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
    onClick={onClick}
    className={`group p-12 rounded-[3rem] lift-hover text-left relative overflow-hidden transition-all duration-500
      ${isDarkMode ? 'glass-card border-white/10 hover:bg-white/5' : 'bg-white shadow-xl shadow-slate-100 border-white hover:shadow-2xl'}
      ${isPrimary ? 'ring-2 ring-gold/30' : ''}
    `}
  >
    {highlight && (
      <div className="absolute top-8 right-8 px-3 py-1 bg-gold text-midnight text-[10px] font-black rounded-full animate-bounce">
        {highlight}
      </div>
    )}
    <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-10 group-hover:scale-110 transition-transform relative
      ${isDarkMode ? 'bg-white/5 text-gold border border-white/5' : 'bg-midnight text-gold'}
    `}>
      {icon}
      {badge && <span className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white text-[11px] font-black rounded-full flex items-center justify-center shadow-lg">{badge}</span>}
    </div>
    <div className="space-y-3">
      <h4 className="text-2xl md:text-3xl font-black tracking-tight">{title}</h4>
      <p className="text-sm md:text-base font-bold opacity-30 break-keep">{subtitle}</p>
    </div>
  </motion.button>
);

export default HomePage;
