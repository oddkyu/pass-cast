import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CountUp = ({ end, duration = 2 }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTime;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [end, duration]);
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
  const [bannerIdx, setBannerIdx] = useState(0);
  const banners = ["공인중개사 합격의 공식", "실시간 기출 분석 엔진", "나만의 맞춤형 오답노트"];

  useEffect(() => {
    if (isGuest) {
      const timer = setInterval(() => {
        setBannerIdx((prev) => (prev + 1) % banners.length);
      }, 3000);
      return () => clearInterval(timer);
    }
  }, [isGuest]);

  const recentActivities = [
    "나주 거주 수험생님이 방금 35회 기출문제를 완료했습니다",
    "강남 거주 합격희망자님이 오답노트 50개를 정복했습니다",
    "부산 거주 사장님이 실전 모의고사에서 85점을 기록했습니다",
    "인천 거주 열공중인 수험생님이 32회 민법 기출을 100% 달성했습니다"
  ];

  return (
    <div className={`flex-1 flex flex-col min-h-screen transition-all duration-500 noise-texture pb-16 ${isDarkMode ? 'mesh-bg text-white' : 'bg-offwhite text-midnight'}`}>
      
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
            {isGuest ? (
              <button onClick={onLogin} className="lift-hover px-6 py-2.5 bg-gold text-midnight rounded-full text-[12px] font-black tracking-widest uppercase shadow-lg shadow-gold/20">무료 시작하기</button>
            ) : (
              <div className="flex items-center space-x-6">
                <div className="flex flex-col items-end">
                   <span className="text-[12px] font-black opacity-40">{user.email.split('@')[0]} 사장님</span>
                   <span className={`text-[9px] font-black uppercase tracking-widest ${isPremium ? 'text-gold' : 'opacity-20'}`}>{isPremium ? 'Premium Member' : 'Free Member'}</span>
                </div>
                <button onClick={onLogout} className="text-[11px] font-black opacity-40 uppercase tracking-widest hover:opacity-100">로그아웃</button>
              </div>
            )}
            
            <button onClick={onToggleTheme} className="w-12 h-12 glass-button rounded-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 lift-hover">
              {isDarkMode ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="5"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2m-18.78 6.36l1.42-1.42m12.72-12.72l1.42-1.42"/></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full px-8 md:px-12 py-12 md:py-20 space-y-16">
        {/* 🚀 Dynamic Animated Banner */}
        <header className="space-y-6 text-center md:text-left min-h-[120px] md:min-h-[160px]">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center justify-center md:justify-start space-x-3">
            <div className="w-2 h-2 bg-gold rounded-full animate-pulse" />
            <span className="text-[12px] font-black text-gold uppercase tracking-[0.5em]">{isGuest ? 'Professional Platform' : 'Personal Performance'}</span>
          </motion.div>
          
          <div className="relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.h2 
                key={isGuest ? bannerIdx : 'user-title'}
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -40, opacity: 0 }}
                transition={{ duration: 0.6, ease: "circOut" }}
                className="text-4xl md:text-7xl font-black tracking-tighter leading-[1.1] break-keep"
              >
                {isGuest ? (
                  <>{banners[bannerIdx]}<br/> <span className="text-gold glow-gold">Pass-Cast</span></>
                ) : (
                  <>{user.email.split('@')[0]} 사장님, <br/> 합격 확률 <span className="text-gold glow-gold"><CountUp end={85} />%</span> 기록 중</>
                )}
              </motion.h2>
            </AnimatePresence>
          </div>
        </header>

        {/* 📊 Animated Stats Card */}
        <motion.section 
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className={`group glass-card rounded-[4rem] p-12 md:p-20 flex flex-col md:flex-row items-center justify-between gap-16 relative overflow-hidden transition-all duration-500 lift-hover ${isDarkMode ? 'border-white/10' : 'bg-white border-white shadow-2xl shadow-slate-100'}`}
        >
          <div className="relative z-10 space-y-10 flex-1">
            <div className="space-y-3">
              <h3 className="text-3xl font-black tracking-tight">{isGuest ? '전체 누적 분석 데이터' : '나의 지능형 합격 분석'}</h3>
              <p className="font-bold text-lg opacity-40 break-keep">실시간으로 업데이트되는 기출 데이터를 기반으로 합격 가능성을 계산합니다.</p>
            </div>
            <div className="space-y-8">
              <div className="flex items-end justify-between">
                <span className="text-6xl font-black text-gold tracking-tighter">
                  <CountUp end={isGuest ? 1200432 : 85} />
                  <span className="text-2xl ml-1 font-bold opacity-30">{isGuest ? '건' : '%'}</span>
                </span>
                <span className="text-[11px] font-black uppercase tracking-[0.2em] opacity-30">Global Analysis Sync</span>
              </div>
              <div className="w-full h-5 bg-midnight/5 rounded-full overflow-hidden border border-white/5">
                <motion.div initial={{ width: 0 }} animate={{ width: isGuest ? '95%' : '85%' }} transition={{ duration: 2.5, ease: "circOut" }} className="h-full bg-gold shadow-[0_0_20px_rgba(212,175,55,0.4)]" />
              </div>
            </div>
          </div>
          <div className="w-full md:w-96 h-64 bg-midnight/5 rounded-[3rem] border border-white/5 relative overflow-hidden flex items-end px-8 pb-8 space-x-3">
             {[40, 70, 45, 90, 65, 85, 95].map((h, i) => (
                <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ delay: 1 + (i * 0.1), duration: 1.2 }} className="flex-1 bg-gold/20 rounded-t-xl" />
             ))}
             <div className="absolute inset-0 flex items-center justify-center font-black text-[10px] text-gold uppercase tracking-[0.4em] bg-gold/5 backdrop-blur-[1px]">Real-time Learning Graph</div>
          </div>
        </motion.section>

        {/* 🛠️ Strategic Action Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <ActionButton 
            title={isGuest ? "무료 기출문제 체험" : "회차별 기출 풀기"}
            subtitle="연도별/과목별 실전 리스트"
            icon={<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}
            onClick={onGoToExamSelection}
            isDarkMode={isDarkMode}
            delay={0.6}
            highlight="GUEST OK"
          />
          <ActionButton 
            title="스마트 오답노트"
            subtitle={isGuest ? "가입 후 데이터 관리" : `${wrongCount}개의 오답 정복 중`}
            badge={!isGuest && wrongCount > 0 ? wrongCount : null}
            icon={<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>}
            onClick={onGoToWrongNote}
            isDarkMode={isDarkMode}
            delay={0.7}
            isLocked={isGuest}
          />
          <ActionButton 
            title="프리미엄 결제"
            subtitle="광고 제거 및 무제한 저장"
            icon={<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>}
            onClick={onGoToPremium}
            isDarkMode={isDarkMode}
            delay={0.8}
            highlight="VIP"
          />
        </section>

        {/* 📊 Ad Slot */}
        {showAds && (
          <motion.section 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className={`w-full max-w-[728px] h-[90px] mx-auto rounded-2xl flex flex-col items-center justify-center border-2 border-dashed relative overflow-hidden transition-all lift-hover
              ${isDarkMode ? 'bg-white/5 border-white/10 text-white/20' : 'bg-slate-50 border-slate-200 text-slate-300'}
            `}
          >
            <div className="absolute top-2 left-4 px-2 py-0.5 bg-midnight/10 rounded-full text-[8px] font-black tracking-widest uppercase">AD</div>
            <p className="text-sm font-bold opacity-50 uppercase tracking-[0.2em]">728 x 90 Advertising Slot</p>
          </motion.section>
        )}
      </main>

      {/* 🔴 Real-time Activity Ticker (Bottom) */}
      <footer className="fixed bottom-0 left-0 w-full bg-midnight/90 backdrop-blur-xl border-t border-white/10 z-[60] overflow-hidden">
        <div className="flex items-center h-12 whitespace-nowrap overflow-hidden">
           <div className="flex space-x-12 animate-marquee py-2">
              {recentActivities.concat(recentActivities).map((act, i) => (
                <div key={i} className="flex items-center space-x-3 text-white/60 text-xs font-black tracking-tight">
                   <div className="w-1.5 h-1.5 bg-gold rounded-full animate-pulse" />
                   <span>{act}</span>
                </div>
              ))}
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
    {highlight && <div className={`absolute top-8 right-8 px-3 py-1 text-white text-[10px] font-black rounded-full ${highlight === 'VIP' ? 'bg-gold text-midnight' : 'bg-green-500'}`}>{highlight}</div>}
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
