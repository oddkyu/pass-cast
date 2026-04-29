import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const HomePage = ({ onStartQuiz, onGoToLanding, isDarkMode, onToggleTheme }) => {
  const studyStatus = {
    todayProgress: 85,
    completedCount: 17,
    totalCount: 20,
  };

  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`min-h-screen flex flex-col noise-texture transition-all duration-500 ${isDarkMode ? 'mesh-bg' : ''}`}
    >
      {/* 🌐 Luxury Global Header */}
      <header className={`sticky top-0 z-50 border-b transition-all duration-500 ${isDarkMode ? 'bg-midnight/40 border-white/5 backdrop-blur-2xl' : 'bg-white/80 border-slate-100 backdrop-blur-md'}`}>
        <div className="max-w-7xl mx-auto px-8 md:px-16 h-20 md:h-28 flex justify-between items-center">
          <div className="flex items-center space-x-16">
            <div className="flex flex-col cursor-pointer group" onClick={onGoToLanding}>
              <span className="text-[10px] md:text-[12px] font-black tracking-[0.4em] text-gold uppercase mb-1 opacity-70 group-hover:opacity-100 transition-opacity">AI Intelligence</span>
              <h1 className={`text-3xl md:text-4xl font-black tracking-tighter leading-none transition-colors ${isDarkMode ? 'text-white' : 'text-midnight'}`}>pass-cast</h1>
            </div>
            
            {/* PC Navigation Menu */}
            <nav className="hidden lg:flex items-center space-x-12">
              <NavMenu label="기출문제" active isDarkMode={isDarkMode} />
              <NavMenu label="오답노트" isDarkMode={isDarkMode} />
              <NavMenu label="학습통계" isDarkMode={isDarkMode} />
              <NavMenu label="커뮤니티" isDarkMode={isDarkMode} />
            </nav>
          </div>

          <div className="flex items-center space-x-6">
            {/* Theme Toggle Button with Tooltip */}
            <div className="relative">
              <button 
                onClick={onToggleTheme}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all glass-button ${isDarkMode ? 'text-gold hover:bg-gold hover:text-midnight' : 'text-midnight hover:bg-midnight hover:text-white'}`}
              >
                {isDarkMode ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                )}
              </button>
              
              <AnimatePresence>
                {showTooltip && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className={`absolute top-full left-1/2 -translate-x-1/2 mt-4 px-4 py-2 rounded-xl text-[12px] font-black tracking-widest whitespace-nowrap shadow-2xl z-[60] border pointer-events-none
                      ${isDarkMode ? 'bg-white text-midnight border-white' : 'bg-midnight text-white border-midnight'}
                    `}
                  >
                    {isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
                    <div className={`absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 ${isDarkMode ? 'bg-white' : 'bg-midnight'}`} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button className={`p-3 rounded-2xl glass-button hidden md:flex ${isDarkMode ? 'text-white' : 'text-midnight'}`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-8 md:px-16 py-12 md:py-24 space-y-16">
        
        {/* 📊 Analysis Banner */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className={`lg:col-span-2 glass-card rounded-[3.5rem] p-12 md:p-20 flex flex-col justify-center transition-all duration-500 ${isDarkMode ? 'border-white/10' : 'border-white'}`}>
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
              <div>
                <h2 className="text-[12px] md:text-[14px] font-black text-gold uppercase tracking-[0.5em] mb-6 opacity-80">AI Learning Analysis</h2>
                <p className={`text-4xl md:text-5xl font-black break-keep leading-[1.1] tracking-tight transition-colors ${isDarkMode ? 'text-white' : 'text-midnight'}`}>
                  사장님, 합격까지<br/>단 <span className="text-gradient-gold">15%</span> 남았습니다
                </p>
              </div>
              <div className="text-right mt-8 md:mt-0">
                <span className={`text-7xl md:text-9xl font-black tracking-tighter leading-none transition-all duration-500 ${isDarkMode ? 'text-white glow-white' : 'text-midnight'}`}>85</span>
                <span className="text-4xl font-black text-gold ml-2">%</span>
              </div>
            </div>
            <div className={`w-full h-5 rounded-full overflow-hidden relative transition-colors ${isDarkMode ? 'bg-white/5' : 'bg-slate-100'}`}>
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `85%` }}
                transition={{ duration: 2, ease: "circOut" }}
                className={`h-full bg-gradient-to-r from-gold to-gold-light rounded-full ${isDarkMode ? 'glow-gold' : ''}`}
              />
            </div>
            <div className={`mt-6 flex justify-between text-[14px] font-black tracking-widest ${isDarkMode ? 'text-white/30' : 'text-slate-300'}`}>
              <span>PROGRESS STATUS</span>
              <span>17 / 20 COMPLETED</span>
            </div>
          </div>

          {/* PC Flow Graph */}
          <div className={`hidden lg:flex flex-col glass-card rounded-[3.5rem] p-12 border-white/5 overflow-hidden transition-all duration-500 ${isDarkMode ? 'border-white/5' : 'border-white'}`}>
            <h3 className={`text-xs font-black uppercase tracking-[0.3em] mb-12 ${isDarkMode ? 'text-white/30' : 'text-slate-300'}`}>Weekly Intensity</h3>
            <div className="flex-1 flex items-end justify-between px-2 gap-4">
              {[40, 70, 45, 90, 65, 80, 75].map((h, i) => (
                <div key={i} className={`flex-1 rounded-full relative group h-full transition-colors ${isDarkMode ? 'bg-white/5' : 'bg-slate-50'}`}>
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    className={`absolute bottom-0 w-full rounded-full transition-all duration-500
                      ${i === 6 ? 'bg-gold' : isDarkMode ? 'bg-white/10 group-hover:bg-gold/30' : 'bg-midnight/5 group-hover:bg-midnight/10'}
                      ${isDarkMode && i === 6 ? 'glow-gold' : ''}
                    `}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ⚡ Action Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          <ActionButton 
            onClick={onStartQuiz}
            icon={<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>}
            badge="AI PICKS"
            title="지금 바로 5문제 풀기"
            description="가장 과학적인 지문 엄선"
            primary
            isDarkMode={isDarkMode}
          />
          <ActionButton 
            icon={<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>}
            badge="VOICE RECAP"
            title="AI 오디오 복습 듣기"
            description="이동 중에 귀로 공부하는 지문"
            isDarkMode={isDarkMode}
          />
          <ActionButton 
            onClick={onGoToLanding}
            icon={<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>}
            badge="MEMBERSHIP"
            title="프리미엄 합격 패스"
            description="모든 지능형 기능 무제한"
            goldStyle
            isDarkMode={isDarkMode}
          />
        </section>

      </main>

      {/* 🏢 Luxury Footer */}
      <footer className={`py-24 mt-20 border-t transition-colors duration-500 ${isDarkMode ? 'bg-black/20 border-white/5' : 'bg-white border-slate-100'}`}>
        <div className="max-w-7xl mx-auto px-8 md:px-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-20">
          <div className="space-y-8">
            <h4 className={`text-2xl font-black tracking-tighter ${isDarkMode ? 'text-white' : 'text-midnight'}`}>pass-cast</h4>
            <p className={`text-[15px] font-bold leading-loose ${isDarkMode ? 'text-white/40' : 'text-slate-400'}`}>
              AI가 설계한 공인중개사<br/>합격의 최단 경로, 패스캐스트.
            </p>
          </div>
          <div>
            <h5 className="text-[12px] font-black text-gold uppercase tracking-[0.3em] mb-8">Platform</h5>
            <ul className={`space-y-5 font-bold text-sm ${isDarkMode ? 'text-white/30' : 'text-slate-400'}`}>
              <li className="hover:text-gold cursor-pointer transition-colors">서비스 이용약관</li>
              <li className="hover:text-gold cursor-pointer transition-colors">개인정보 처리방침</li>
              <li className="hover:text-gold cursor-pointer transition-colors">기술 지원</li>
            </ul>
          </div>
          <div className="flex flex-col items-start lg:items-end col-span-2">
            <p className={`text-[11px] font-black uppercase tracking-[0.4em] ${isDarkMode ? 'text-white/10' : 'text-slate-200'}`}>© 2026 pass-cast Intelligence</p>
          </div>
        </div>
      </footer>

      {/* Mobile Nav */}
      <nav className={`lg:hidden fixed bottom-0 left-0 right-0 border-t px-10 py-8 flex justify-between items-center z-50 transition-all duration-500 ${isDarkMode ? 'bg-midnight/60 backdrop-blur-3xl border-white/5' : 'bg-white/90 backdrop-blur-md border-slate-100'}`}>
        <TabItem icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>} label="홈" active isDarkMode={isDarkMode} />
        <TabItem icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>} label="오답" isDarkMode={isDarkMode} />
        <TabItem icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>} label="분석" isDarkMode={isDarkMode} />
        <TabItem icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>} label="프로필" isDarkMode={isDarkMode} />
      </nav>

      <style>{`
        .break-keep { word-break: keep-all; }
      `}</style>
    </motion.div>
  );
};

const NavMenu = ({ label, active = false, isDarkMode }) => (
  <button className={`text-[15px] font-black tracking-widest transition-all duration-300 relative group
    ${active ? (isDarkMode ? 'text-white' : 'text-midnight') : (isDarkMode ? 'text-white/30 hover:text-white' : 'text-slate-300 hover:text-midnight')}
  `}>
    {label}
    <span className={`absolute -bottom-2 left-0 h-1 bg-gold transition-all duration-300 ${active ? 'w-full' : 'w-0 group-hover:w-full'}`} />
  </button>
);

const ActionButton = ({ onClick, icon, badge, title, description, primary = false, goldStyle = false, isDarkMode }) => (
  <button 
    onClick={onClick}
    className={`w-full group relative flex flex-col p-12 rounded-[3.5rem] lift-hover text-left min-h-[320px] overflow-hidden
      ${goldStyle ? 'bg-gradient-to-br from-gold to-gold-light text-midnight' : 'glass-card'}
      ${!goldStyle && !isDarkMode && 'bg-white shadow-xl shadow-slate-100'}
    `}
  >
    <div className="flex justify-between items-start mb-auto">
      <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-2xl transition-transform group-hover:scale-110
        ${primary ? 'bg-midnight text-gold' : goldStyle ? 'bg-midnight text-gold shadow-midnight/30' : (isDarkMode ? 'bg-white/5 text-gold border border-white/5' : 'bg-slate-50 text-midnight')}
      `}>
        {icon}
      </div>
      <div className={`px-5 py-2 rounded-full text-[12px] font-black tracking-[0.2em]
        ${primary ? 'bg-gold text-midnight' : goldStyle ? 'bg-midnight text-white' : (isDarkMode ? 'bg-white/5 text-white/50 border border-white/5' : 'bg-midnight text-white')}
      `}>
        {badge}
      </div>
    </div>
    <div className="mt-12 space-y-3">
      <h3 className={`text-[28px] font-black leading-tight transition-colors ${!goldStyle && (isDarkMode ? 'group-hover:text-gold' : 'text-midnight')}`}>{title}</h3>
      <p className={`text-[17px] font-bold ${goldStyle ? 'text-midnight/60' : (isDarkMode ? 'text-white/30' : 'text-slate-400')}`}>{description}</p>
    </div>
    {!goldStyle && (
      <div className={`absolute bottom-0 right-0 p-10 transition-colors pointer-events-none ${isDarkMode ? 'text-gold/5 group-hover:text-gold/10' : 'text-midnight/5 group-hover:text-midnight/10'}`}>
         {icon}
      </div>
    )}
  </button>
);

const TabItem = ({ icon, label, active = false, isDarkMode }) => (
  <button className={`flex flex-col items-center space-y-2 transition-all ${active ? (isDarkMode ? 'text-white scale-110' : 'text-midnight scale-110') : (isDarkMode ? 'text-white/20 hover:text-white' : 'text-slate-300 hover:text-midnight')}`}>
    <div className={`${active ? 'text-gold' : ''}`}>
      {icon}
    </div>
    <span className={`text-[11px] font-black tracking-[0.2em] ${active ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>{label}</span>
  </button>
);

export default HomePage;
