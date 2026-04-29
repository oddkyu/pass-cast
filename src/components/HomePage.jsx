import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CountUp = ({ end, duration = 1.2 }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTime;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const easeOutQuad = progress * (2 - progress);
      setCount(Math.floor(easeOutQuad * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [end]);
  return <span>{count.toLocaleString()}</span>;
};

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

  const recentActivities = [
    "김OO님, 35회 공인중개사 기출 완료",
    "이OO님, 부동산학개론 오답 20개 정복",
    "박OO님, 민법 90점 합격권 도달",
    "최OO님, 프리미엄 멤버십 전환 완료",
    "정OO님, 34회 전과목 모의고사 응시 중"
  ];

  return (
    <div className={`flex-1 flex flex-col min-h-screen transition-all duration-500 noise-texture pb-10 ${isDarkMode ? 'mesh-bg text-white' : 'bg-offwhite text-midnight'}`}>
      
      {/* 🏛️ System Navigation */}
      <nav className={`sticky top-0 z-50 border-b transition-all duration-500 ${isDarkMode ? 'bg-midnight/95 border-white/5 backdrop-blur-3xl' : 'bg-white/95 border-slate-200 shadow-sm'}`}>
        <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={onGoToLanding}>
            <div className="w-10 h-10 bg-midnight text-gold rounded-lg flex items-center justify-center font-black text-xl border border-gold/30">P</div>
            <span className="text-xl md:text-2xl font-black tracking-tighter uppercase">Pass-Cast</span>
          </div>
          
          <div className="flex items-center space-x-6 md:space-x-10">
            {isGuest ? (
              <button onClick={onLogin} className="px-6 py-2 bg-gold text-midnight rounded-md text-[11px] font-black tracking-widest uppercase hover:bg-white transition-all shadow-lg">무료 가동 시작</button>
            ) : (
              <div className="flex items-center space-x-6">
                <div className="text-right hidden sm:block">
                   <p className="text-[11px] font-black opacity-40">{user.email}</p>
                   <p className="text-[9px] font-black uppercase text-gold">Status: {isPremium ? 'Premium Operating' : 'Standard Member'}</p>
                </div>
                <button onClick={onLogout} className="text-[11px] font-black opacity-30 hover:opacity-100 uppercase tracking-widest">Logout</button>
              </div>
            )}
            <button onClick={onToggleTheme} className="w-10 h-10 border border-gold/20 rounded-lg flex items-center justify-center text-gold hover:bg-gold/5">
              {isDarkMode ? <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2m-18.78 6.36l1.42-1.42m12.72-12.72l1.42-1.42"/></svg> : <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>}
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full px-8 py-16 md:py-24 space-y-20">
        
        {/* 🚀 Dynamic Header: Industrial Style */}
        <header className="space-y-6">
          <div className="flex items-center space-x-3">
            <span className="w-2 h-2 bg-gold rounded-full animate-ping" />
            <span className="text-[10px] font-black text-gold uppercase tracking-[0.5em]">{isGuest ? 'System Offline' : 'Operating Mode'}</span>
          </div>
          <h2 className="text-4xl md:text-7xl font-black tracking-tighter leading-[1.05] break-keep">
            {isGuest ? (
              <>공인중개사 합격의 <br/> <span className="text-gold">과학적 분석, Pass-Cast</span></>
            ) : (
              <>{user.email.split('@')[0]} 사장님, <br/> 합격 확률 <span className="text-gold"><CountUp end={85} />%</span> 가동 중</>
            )}
          </h2>
        </header>

        {/* 📊 Analyzing Data Infrastructure */}
        <section className={`rounded-[3rem] p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12 transition-all duration-500 border border-gold/10 ${isDarkMode ? 'bg-white/5' : 'bg-white shadow-xl shadow-slate-200/50'}`}>
          <div className="space-y-12 flex-1">
            <div className="space-y-4">
              <h3 className="text-2xl font-black uppercase tracking-tight opacity-50">{isGuest ? 'Global Data Pool' : 'Personal Study Metrics'}</h3>
              <div className="flex items-end space-x-4">
                <span className="text-6xl md:text-8xl font-black text-gold tracking-tighter leading-none">
                  <CountUp end={isGuest ? 1200432 : 85} />
                </span>
                <span className="text-2xl font-black opacity-30 pb-2">{isGuest ? 'Analysis Cases' : 'Success Probability'}</span>
              </div>
            </div>
            <div className="w-full h-4 bg-midnight/10 rounded-full overflow-hidden border border-white/5">
              <motion.div initial={{ width: 0 }} animate={{ width: isGuest ? '95%' : '85%' }} transition={{ duration: 2, ease: "circOut" }} className="h-full bg-gold shadow-[0_0_20px_rgba(212,175,55,0.4)]" />
            </div>
          </div>
          
          <div className="w-full md:w-80 h-48 bg-midnight/10 rounded-2xl border border-white/5 relative overflow-hidden flex items-end px-6 pb-6 space-x-2">
             {[30, 60, 45, 85, 55, 75, 95].map((h, i) => (
                <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ delay: 0.5 + (i * 0.1) }} className="flex-1 bg-gold/20 rounded-t-lg" />
             ))}
             <div className="absolute inset-0 flex items-center justify-center font-black text-[9px] text-gold uppercase tracking-[0.4em] bg-gold/5 backdrop-blur-[2px]">Real-time Processing</div>
          </div>
        </section>

        {/* 🛠️ Specialized Function Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <ActionButton 
            title="실전 기출 엔진"
            subtitle="연도별/과목별 기출 모듈"
            icon={<svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}
            onClick={onGoToExamSelection}
            isDarkMode={isDarkMode}
          />
          <div className="relative group overflow-hidden rounded-[2.5rem]">
            <ActionButton 
              title="지능형 오답노트"
              subtitle={isGuest ? "가입 후 모듈 활성화" : `${wrongCount}개의 오답 관리 중`}
              badge={!isGuest && wrongCount > 0 ? wrongCount : null}
              icon={<svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>}
              onClick={onGoToWrongNote}
              isDarkMode={isDarkMode}
            />
            {isGuest && (
              <div className="absolute inset-0 bg-midnight/60 backdrop-blur-sm flex flex-col items-center justify-center space-y-4 opacity-100 transition-all group-hover:bg-midnight/70">
                <svg width="40" height="40" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <p className="text-white text-xs font-black uppercase tracking-widest">Login to Unlock</p>
                <button onClick={onLogin} className="px-4 py-2 bg-gold text-midnight text-[10px] font-black rounded uppercase hover:scale-105 transition-transform">가입 후 관리받기</button>
              </div>
            )}
          </div>
          <ActionButton 
            title="프리미엄 구독"
            subtitle="광고 제거 및 상시 해설"
            icon={<svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>}
            onClick={onGoToPremium}
            isDarkMode={isDarkMode}
            highlight="VIP"
          />
        </section>

        {/* 📊 Ad Slot Section (728x90) */}
        {showAds && (
          <section className="flex justify-center pt-10">
             <div className={`w-full max-w-[728px] h-[90px] rounded-xl flex flex-col items-center justify-center border-2 border-dashed relative overflow-hidden
               ${isDarkMode ? 'bg-white/5 border-white/10 text-white/20' : 'bg-slate-100 border-slate-300 text-slate-400'}
             `}>
               <span className="absolute top-2 left-4 text-[8px] font-black opacity-30 uppercase tracking-widest">Ad Slot (728x90)</span>
               <p className="text-sm font-bold opacity-30">Commercial Space - Available for Members</p>
               <p className="text-[10px] font-black opacity-20 mt-1 uppercase">프리미엄 패스 가입 시 이 광고 영역은 비활성화됩니다.</p>
             </div>
          </section>
        )}
      </main>

      {/* 🔴 Fixed Real-time Activity Bar (Industrial Black) */}
      <footer className="fixed bottom-0 left-0 w-full bg-midnight text-white z-[60] h-10 border-t border-gold/10 flex items-center overflow-hidden">
        <div className="bg-gold px-6 h-full flex items-center justify-center z-10 shadow-[5px_0_15px_rgba(0,0,0,0.5)]">
           <span className="text-[10px] font-black text-midnight uppercase tracking-widest flex items-center">
             <div className="w-1.5 h-1.5 bg-midnight rounded-full mr-2 animate-ping" />
             Live Processing
           </span>
        </div>
        <div className="flex-1 whitespace-nowrap overflow-hidden relative h-full flex items-center">
           <div className="animate-marquee inline-block">
              {recentActivities.concat(recentActivities).map((act, i) => (
                <span key={i} className="inline-block px-12 text-[11px] font-bold text-white/40 tracking-tight italic">
                   [시스템 알림] {act}
                </span>
              ))}
           </div>
        </div>
      </footer>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: inline-block;
          animation: marquee 60s linear infinite;
        }
      `}</style>
    </div>
  );
};

const ActionButton = ({ title, subtitle, icon, onClick, isDarkMode, badge, highlight }) => (
  <button
    onClick={onClick}
    className={`group p-10 rounded-[2.5rem] text-left relative overflow-hidden transition-all duration-300 hover:border-gold/50 border
      ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-white shadow-lg border-slate-100'}
    `}
  >
    {highlight && <div className="absolute top-6 right-8 px-2 py-0.5 bg-gold text-midnight text-[9px] font-black rounded uppercase">{highlight}</div>}
    
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-all group-hover:bg-gold group-hover:text-midnight
      ${isDarkMode ? 'bg-white/5 text-gold' : 'bg-midnight text-gold'}
    `}>
      {icon}
      {badge && <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-600 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-lg">{badge}</span>}
    </div>
    <div className="space-y-1">
      <h4 className="text-xl md:text-2xl font-black tracking-tight uppercase">{title}</h4>
      <p className="text-sm font-bold opacity-30 break-keep">{subtitle}</p>
    </div>
  </button>
);

export default HomePage;
