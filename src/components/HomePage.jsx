import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const HomePage = ({ 
  user,
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
          
          <div className="flex items-center space-x-6 md:space-x-10">
            <div className="hidden lg:flex items-center space-x-8 text-sm font-black tracking-widest uppercase opacity-40">
              <button onClick={onGoToExamSelection} className="hover:opacity-100 transition-opacity">기출문제</button>
              <button onClick={onGoToWrongNote} className="hover:opacity-100 transition-opacity">오답노트</button>
            </div>

            {isGuest ? (
              <button 
                onClick={onLogin}
                className="px-6 py-2.5 bg-gold text-midnight rounded-full text-[12px] font-black tracking-widest uppercase hover:scale-105 active:scale-95 transition-all shadow-lg shadow-gold/20"
              >
                시작하기
              </button>
            ) : (
              <div className="flex items-center space-x-6">
                <span className="text-[12px] font-black opacity-40 hidden md:block">{user.email} 사장님</span>
                <button onClick={onLogout} className="text-[11px] font-black opacity-40 uppercase tracking-widest hover:opacity-100">로그아웃</button>
              </div>
            )}
            
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

      {/* 🚀 Hero Section (Conditional Content) */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-8 md:px-12 py-12 md:py-20 space-y-16">
        <header className="space-y-6 text-center md:text-left">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center justify-center md:justify-start space-x-3">
            <div className="w-2 h-2 bg-gold rounded-full animate-pulse" />
            <span className="text-[12px] font-black text-gold uppercase tracking-[0.5em]">{isGuest ? 'Professional Platform' : 'Personal Analytics'}</span>
          </motion.div>
          <motion.h2 
            key={isGuest ? 'guest-title' : 'user-title'}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} 
            className="text-4xl md:text-7xl font-black tracking-tighter leading-[1.1] break-keep"
          >
            {isGuest ? (
              <>공인중개사 합격의 <br/> <span className="text-gold glow-gold">과학적 분석,</span> Pass-Cast</>
            ) : (
              <>{user.email.split('@')[0]} 사장님, <br/> 합격까지 <span className="text-gold glow-gold">15%</span> 남았습니다.</>
            )}
          </motion.h2>
          {isGuest && <p className="text-xl md:text-2xl font-bold opacity-30 mt-6 max-w-2xl leading-relaxed break-keep">매일 업데이트되는 10개년 기출 데이터와 AI 분석으로 합격의 가장 빠른 길을 제시합니다.</p>}
        </header>

        {/* 📊 Main Feature Card (Conditional Stats) */}
        <motion.section 
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className={`group glass-card rounded-[4rem] p-12 md:p-20 flex flex-col md:flex-row items-center justify-between gap-16 relative overflow-hidden transition-all duration-500 ${isDarkMode ? 'border-white/10' : 'bg-white border-white shadow-2xl shadow-slate-100'}`}
        >
          <div className="relative z-10 space-y-10 flex-1">
            <div className="space-y-3">
              <h3 className="text-3xl font-black tracking-tight">{isGuest ? '전체 수험생 합격 추이' : '나의 지능형 학습 분석'}</h3>
              <p className="font-bold text-lg opacity-40 break-keep">
                {isGuest ? 'Pass-Cast를 이용한 수험생들의 평균 합격률이 매년 12% 상승하고 있습니다.' : '최근 학습 데이터를 기반으로 사장님의 합격 가능성을 실시간 계산합니다.'}
              </p>
            </div>
            <div className="space-y-8">
              <div className="flex items-end justify-between">
                <span className="text-6xl font-black text-gold tracking-tighter">
                  {isGuest ? '78.4' : '85'}<span className="text-2xl ml-1 font-bold opacity-30">%</span>
                </span>
                <span className="text-[11px] font-black uppercase tracking-[0.2em] opacity-30">{isGuest ? 'Average Pass Rate' : 'Estimated Success'}</span>
              </div>
              <div className="w-full h-5 bg-midnight/5 rounded-full overflow-hidden border border-white/5 shadow-inner">
                <motion.div initial={{ width: 0 }} animate={{ width: isGuest ? '78.4%' : '85%' }} transition={{ duration: 2, ease: "easeOut" }} className="h-full bg-gold shadow-[0_0_30px_rgba(212,175,55,0.6)]" />
              </div>
            </div>
          </div>
          
          <div className="w-full md:w-96 h-64 bg-midnight/5 rounded-[3rem] border border-white/5 flex items-center justify-center relative overflow-hidden">
             <div className="absolute inset-x-0 bottom-0 h-full flex items-end space-x-3 px-8 pb-8">
                {[50, 60, 55, 75, 70, 80, 95].map((h, i) => (
                  <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ delay: 0.8 + (i * 0.1), duration: 1 }} className="flex-1 bg-gold/20 rounded-t-xl" />
                ))}
             </div>
             {isGuest && <div className="absolute inset-0 bg-gold/5 backdrop-blur-[1px] flex items-center justify-center font-black text-xs text-gold uppercase tracking-[0.3em]">Cumulative Data Analysis</div>}
          </div>
        </motion.section>

        {/* 🛠️ Action Grid with Lock Icons for Guests */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <ActionButton 
            title={isGuest ? "무료 기출문제 체험하기" : "회차별 기출 풀기"}
            subtitle="연도별 실전 기출 리스트"
            icon={<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}
            onClick={onGoToExamSelection}
            isDarkMode={isDarkMode}
            delay={0.6}
            highlight={isGuest ? "FREE" : null}
          />
          <ActionButton 
            title="스마트 오답노트"
            subtitle={isGuest ? "가입 후 이용 가능" : `${wrongCount}개의 취약 문항 관리`}
            badge={!isGuest && wrongCount > 0 ? wrongCount : null}
            icon={<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>}
            onClick={onGoToWrongNote}
            isDarkMode={isDarkMode}
            delay={0.7}
            isLocked={isGuest}
          />
          <ActionButton 
            title="프리미엄 합격 패스"
            subtitle="광고 제거 및 무제한 저장"
            icon={<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>}
            onClick={onGoToPremium}
            isDarkMode={isDarkMode}
            delay={0.8}
            highlight="VIP"
          />
        </section>

        {/* 🎁 Membership Promotion Section (New) */}
        {isGuest && (
          <motion.section 
            initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            className={`p-12 md:p-20 rounded-[4rem] bg-midnight text-white flex flex-col md:flex-row items-center justify-between gap-12 border border-white/5 relative overflow-hidden`}
          >
            <div className="space-y-6 relative z-10 text-center md:text-left">
              <h3 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">틀린 문제만 모아보는 스마트 오답노트, <br/> <span className="text-gold">가입 후 0원에 시작하세요.</span></h3>
              <p className="font-bold text-lg opacity-40">지금 가입하면 나만의 분석 데이터를 평생 소장할 수 있습니다.</p>
            </div>
            <button onClick={onLogin} className="px-12 py-6 bg-gold text-midnight rounded-[2rem] font-black text-xl shadow-2xl hover:scale-105 active:scale-95 transition-all relative z-10">무료로 관리 시작하기</button>
            <div className="absolute top-0 right-0 w-80 h-80 bg-gold/10 rounded-full blur-[100px]" />
          </motion.section>
        )}
      </main>

      <footer className={`mt-auto border-t transition-all ${isDarkMode ? 'bg-midnight border-white/5' : 'bg-white border-slate-100'}`}>
        <div className="max-w-7xl mx-auto px-12 py-24 space-y-16">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12 text-center md:text-left">
            <div className="space-y-6">
              <span className="text-3xl font-black tracking-tighter uppercase">Pass-Cast</span>
              <p className="text-xl font-black opacity-30 leading-relaxed max-w-lg">
                공인중개사 시험 합격을 위한 <br/> <span className="text-gold">가장 과학적인 대비 플랫폼</span>입니다.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-12 text-sm font-black uppercase tracking-[0.3em] opacity-40">
              <div className="space-y-4 flex flex-col">
                <span className="text-gold mb-2">Platform</span>
                <button className="hover:text-gold transition-colors text-left">About Us</button>
                <button className="hover:text-gold transition-colors text-left">Technology</button>
              </div>
              <div className="space-y-4 flex flex-col">
                <span className="text-gold mb-2">Support</span>
                <button className="hover:text-gold transition-colors text-left">Terms</button>
                <button className="hover:text-gold transition-colors text-left">Privacy</button>
              </div>
            </div>
          </div>
          <div className="pt-12 border-t border-slate-50 dark:border-white/5 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.5em] opacity-20">© 2026 pass-cast scientific education systems</p>
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
    className={`group p-12 rounded-[3.5rem] lift-hover text-left relative overflow-hidden transition-all duration-500
      ${isDarkMode ? 'glass-card border-white/10 hover:bg-white/5' : 'bg-white shadow-xl shadow-slate-100 border-white hover:shadow-2xl'}
    `}
  >
    {highlight && <div className={`absolute top-8 right-8 px-3 py-1 text-white text-[10px] font-black rounded-full ${highlight === 'VIP' ? 'bg-gold text-midnight' : 'bg-green-500'}`}>{highlight}</div>}
    {isLocked && <div className="absolute top-8 right-8 text-gold opacity-40"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div>}
    
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
