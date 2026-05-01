import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const HomePage = ({ 
  user,
  isPremium,
  isDarkMode, 
  onToggleTheme, 
  onGoToLanding, 
  onGoToExamSelection,
  onGoToWrongNote,
  onGoToPremium,
  onLogin,
  onLogout,
  wrongCount = 0 
}) => {
  const isGuest = !user;
  const showAds = !isPremium;

  return (
    <div className={`flex-1 flex flex-col min-h-screen transition-all duration-500 noise-texture ${isDarkMode ? 'mesh-bg text-white' : 'bg-offwhite text-midnight'}`}>
      
      {/* 🏛️ Professional Navigation */}
      <nav className={`sticky top-0 z-50 border-b transition-all duration-500 ${isDarkMode ? 'bg-midnight/60 border-white/5 backdrop-blur-2xl' : 'bg-white/80 border-slate-100 backdrop-blur-md'}`}>
        <div className="max-w-7xl mx-auto px-8 md:px-12 h-20 md:h-24 flex items-center justify-between">
          <div className="flex items-center space-x-4 group cursor-pointer" onClick={onGoToLanding}>
            <div className="w-10 h-10 bg-gold rounded-xl flex items-center justify-center shadow-lg shadow-gold/20">
              <span className="text-midnight font-black text-xl">P</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl md:text-2xl font-black tracking-tighter uppercase leading-tight">Pass-Cast</span>
              <span className="text-[10px] md:text-[11px] font-black text-gold tracking-[0.2em] uppercase">공인중개사 전용</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            {isGuest ? (
              <button onClick={onLogin} className="px-6 py-2.5 bg-midnight text-gold rounded-full text-[12px] font-black tracking-widest uppercase hover:scale-105 active:scale-95 transition-all">로그인 / 회원가입</button>
            ) : (
              <div className="flex items-center space-x-6 text-right">
                <div className="hidden sm:flex flex-col">
                   <span className="text-[12px] font-black opacity-40">{user.email.split('@')[0]} 사장님</span>
                   <span className={`text-[9px] font-black uppercase tracking-widest ${isPremium ? 'text-gold' : 'opacity-20'}`}>{isPremium ? 'Premium' : 'Free'} Member</span>
                </div>
                <button onClick={onLogout} className="text-[11px] font-black opacity-40 uppercase tracking-widest hover:opacity-100">로그아웃</button>
              </div>
            )}
            
            <button onClick={onToggleTheme} className="flex items-center space-x-2 glass-button rounded-2xl px-4 h-12 transition-all hover:scale-105 active:scale-95 ml-4">
              {isDarkMode ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="5"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2m-18.78 6.36l1.42-1.42m12.72-12.72l1.42-1.42"/></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              )}
              <span className="text-[11px] font-black tracking-tight hidden sm:inline">{isDarkMode ? '밝게 보기' : '눈이 편한 모드'}</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full px-8 md:px-12 py-12 md:py-24 space-y-20">
        
        {/* 🚀 Conditional Hero: Guest Intro vs User Stats */}
        <header className="space-y-8 text-center md:text-left">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center justify-center md:justify-start space-x-3">
            <div className="w-2 h-2 bg-gold rounded-full animate-pulse" />
            <span className="text-[12px] font-black text-gold uppercase tracking-[0.5em]">{isGuest ? 'Platform Introduction' : 'Personal Performance'}</span>
          </motion.div>
          
          <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-4xl md:text-8xl font-black tracking-tighter leading-[1.05] break-keep">
            {isGuest ? (
              <>공인중개사 합격의 <br/> <span className="text-gold glow-gold">가장 과학적인 분석</span></>
            ) : (
              <>{user.email.split('@')[0]} 사장님, <br/> 합격 확률 <span className="text-gold glow-gold">85.4%</span></>
            )}
          </motion.h2>
          
          {isGuest && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-lg md:text-2xl font-bold opacity-30 max-w-2xl break-keep">
              Pass-Cast는 매일 업데이트되는 10개년 기출 데이터를 통해 사장님의 합격을 가장 정교하게 예측하고 관리해 드립니다.
            </motion.p>
          )}
        </header>

        {/* 🛠️ Strategic Gating Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <ActionButton 
            title={isGuest ? "무료 기출문제 체험" : "회차별 기출 풀기"}
            subtitle="연도별/과목별 실전 데이터"
            icon={<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}
            onClick={onGoToExamSelection}
            isDarkMode={isDarkMode}
            delay={0.5}
            highlight="FREE"
          />
          <ActionButton 
            title="스마트 오답노트"
            subtitle={isGuest ? "가입 후 관리 가능" : `${wrongCount}개의 취약 문항 관리`}
            badge={!isGuest && wrongCount > 0 ? wrongCount : null}
            icon={<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>}
            onClick={onGoToWrongNote}
            isDarkMode={isDarkMode}
            delay={0.6}
            isLocked={isGuest}
          />
          <ActionButton 
            title="프리미엄 결제"
            subtitle="광고 제거 및 해설지 증정"
            icon={<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>}
            onClick={onGoToPremium}
            isDarkMode={isDarkMode}
            delay={0.7}
            highlight="PRO"
          />
        </section>

        {/* 📊 High-Performance Ad Slot (Gated for Premium) */}
        {showAds && (
          <motion.section 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className={`w-full max-w-[728px] h-[120px] mx-auto rounded-[3rem] flex flex-col items-center justify-center border-2 border-dashed relative overflow-hidden transition-all
              ${isDarkMode ? 'bg-white/5 border-white/10 text-white/20' : 'bg-slate-50 border-slate-200 text-slate-300'}
            `}
          >
            <div className="absolute top-4 left-6 px-3 py-1 bg-midnight/10 rounded-full text-[10px] font-black tracking-widest uppercase">AD</div>
            <p className="text-lg font-bold opacity-50 uppercase tracking-[0.3em]">Scientific Education Ads Area</p>
            <p className="text-xs font-black opacity-30 mt-2 uppercase">프리미엄 구독 시 모든 광고 영역이 즉시 제거됩니다.</p>
          </motion.section>
        )}
      </main>

      <footer className={`mt-auto border-t transition-all ${isDarkMode ? 'bg-midnight border-white/5' : 'bg-white border-slate-100'}`}>
        <div className="max-w-7xl mx-auto px-12 py-24 flex flex-col md:flex-row justify-between items-center gap-16 text-center md:text-left">
          <div className="space-y-6">
            <span className="text-3xl font-black tracking-tighter uppercase">Pass-Cast</span>
            <p className="text-xl font-bold opacity-30 leading-relaxed max-w-lg break-keep">공인중개사 시험 합격을 위한 가장 과학적인 대비 플랫폼입니다. 관리받는 사람이 합격합니다.</p>
          </div>
          <div className="flex space-x-12 text-[11px] font-black uppercase tracking-[0.3em] opacity-40">
            <button className="hover:text-gold transition-colors">Term of Service</button>
            <button className="hover:text-gold transition-colors">Privacy Policy</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

const ActionButton = ({ title, subtitle, icon, onClick, isDarkMode, delay, badge, highlight, isLocked }) => (
  <motion.button
    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
    onClick={onClick}
    className={`group p-12 rounded-[4rem] lift-hover text-left relative overflow-hidden transition-all duration-500
      ${isDarkMode ? 'glass-card border-white/10 hover:bg-white/5' : 'bg-white shadow-xl shadow-slate-100 border-white hover:shadow-2xl'}
    `}
  >
    {highlight && <div className={`absolute top-8 right-8 px-3 py-1 text-white text-[10px] font-black rounded-full ${highlight === 'PRO' ? 'bg-gold text-midnight shadow-lg shadow-gold/20' : 'bg-green-500'}`}>{highlight}</div>}
    {isLocked && <div className="absolute top-8 right-8 text-gold opacity-40 animate-pulse"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div>}
    
    <div className={`w-16 h-16 rounded-[2rem] flex items-center justify-center mb-10 group-hover:scale-110 transition-transform relative
      ${isDarkMode ? 'bg-white/5 text-gold border border-white/5' : 'bg-midnight text-gold'}
    `}>
      {icon}
      {badge && <span className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white text-[11px] font-black rounded-full flex items-center justify-center shadow-lg">{badge}</span>}
    </div>
    <div className="space-y-4">
      <h4 className="text-2xl md:text-3xl font-black tracking-tight">{title}</h4>
      <p className="text-base md:text-lg font-bold opacity-30 break-keep">{subtitle}</p>
    </div>
  </motion.button>
);

export default HomePage;
