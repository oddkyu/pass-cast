import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CountUp = ({ end, duration = 1.5 }) => {
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
  const [bannerIdx, setBannerIdx] = useState(0);
  const banners = ["공인중개사 합격의 공식", "실시간 지능형 기출 분석", "나만의 맞춤형 오답 관리"];

  useEffect(() => {
    if (isGuest) {
      const timer = setInterval(() => {
        setBannerIdx((prev) => (prev + 1) % banners.length);
      }, 4000);
      return () => clearInterval(timer);
    }
  }, [isGuest]);

  const recentActivities = [
    "서울 수험생님이 35회 부동산학개론 완료",
    "부산 수험생님이 민법 오답노트 20개 정복",
    "대구 합격희망자님이 실전 모의고사 90점 달성",
    "광주 수험생님이 34회 공법 기출 100% 달성",
    "대전 사장님이 프리미엄 패스 구독 시작"
  ];

  return (
    <div className={`flex-1 flex flex-col min-h-screen transition-all duration-500 noise-texture pb-12 ${isDarkMode ? 'mesh-bg text-white' : 'bg-offwhite text-midnight'}`}>
      
      {/* 🏛️ Solid Navigation */}
      <nav className={`sticky top-0 z-50 border-b transition-all duration-500 ${isDarkMode ? 'bg-midnight/90 border-white/5 backdrop-blur-2xl' : 'bg-white/95 border-slate-200 shadow-sm'}`}>
        <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-4 cursor-pointer" onClick={onGoToLanding}>
            <div className="w-10 h-10 bg-midnight text-gold rounded-xl flex items-center justify-center font-black text-xl shadow-lg">P</div>
            <span className="text-xl md:text-2xl font-black tracking-tighter uppercase">Pass-Cast</span>
          </div>
          
          <div className="flex items-center space-x-6 md:space-x-10">
            {isGuest ? (
              <button onClick={onLogin} className="px-6 py-2.5 bg-gold text-midnight rounded-full text-[12px] font-black tracking-widest uppercase hover:brightness-110 transition-all shadow-md">무료 시작</button>
            ) : (
              <div className="flex items-center space-x-6 text-right">
                <div className="hidden sm:flex flex-col">
                   <span className="text-[12px] font-black opacity-40">{user.email.split('@')[0]} 사장님</span>
                   <span className="text-[9px] font-black uppercase tracking-widest text-gold">{isPremium ? 'Premium' : 'Free Member'}</span>
                </div>
                <button onClick={onLogout} className="text-[11px] font-black opacity-40 uppercase tracking-widest hover:opacity-100">로그아웃</button>
              </div>
            )}
            
            <button onClick={onToggleTheme} className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:bg-gold/10 text-gold border border-gold/20">
              {isDarkMode ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="5"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2m-18.78 6.36l1.42-1.42m12.72-12.72l1.42-1.42"/></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full px-8 py-16 md:py-24 space-y-20">
        {/* 🚀 Stable Hero Section */}
        <header className="space-y-8 text-center md:text-left min-h-[140px]">
          <div className="flex items-center justify-center md:justify-start space-x-3">
            <span className="px-3 py-1 bg-gold text-midnight text-[10px] font-black rounded-md uppercase tracking-widest">{isGuest ? 'Introduction' : 'Personal Dashboard'}</span>
          </div>
          
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.h2 
                key={isGuest ? bannerIdx : 'user-title'}
                initial={{ opacity: 0, filter: 'blur(10px)' }}
                animate={{ opacity: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, filter: 'blur(10px)' }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="text-4xl md:text-7xl font-black tracking-tighter leading-[1.1] break-keep"
              >
                {isGuest ? (
                  <>{banners[bannerIdx]}<br/> <span className="text-gold">Pass-Cast</span></>
                ) : (
                  <>{user.email.split('@')[0]} 사장님, <br/> 합격 확률 <span className="text-gold"><CountUp end={85} />%</span> 달성 중</>
                )}
              </motion.h2>
            </AnimatePresence>
          </div>
        </header>

        {/* 📊 Grounded Stats Card */}
        <section className={`glass-card rounded-[3rem] p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12 transition-all duration-500 lift-hover`}>
          <div className="space-y-10 flex-1">
            <div className="space-y-4">
              <h3 className="text-2xl md:text-3xl font-black tracking-tight">{isGuest ? '실시간 기출 데이터 분석 현황' : '지능형 합격 데이터 분석'}</h3>
              <p className="font-bold text-lg opacity-40 break-keep">매일 업데이트되는 1,200,432건의 기출 데이터를 분석하여 합격 가능성을 도출합니다.</p>
            </div>
            <div className="space-y-6">
              <div className="flex items-end justify-between">
                <span className="text-5xl font-black text-gold tracking-tighter">
                  <CountUp end={isGuest ? 1200432 : 85} />
                  <span className="text-xl ml-1 font-bold opacity-30">{isGuest ? '건' : '%'}</span>
                </span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30">Analytical Engine Active</span>
              </div>
              <div className="w-full h-4 bg-midnight/5 rounded-full overflow-hidden border border-slate-200/10">
                <motion.div initial={{ width: 0 }} animate={{ width: isGuest ? '95%' : '85%' }} transition={{ duration: 2, ease: "circOut" }} className="h-full bg-gold" />
              </div>
            </div>
          </div>
          <div className="w-full md:w-80 h-48 bg-midnight/5 rounded-2xl border border-slate-200/10 relative overflow-hidden flex items-end px-6 pb-6 space-x-2">
             {[30, 60, 40, 80, 55, 75, 90].map((h, i) => (
                <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ delay: 0.5 + (i * 0.1) }} className="flex-1 bg-gold/30 rounded-t-lg" />
             ))}
          </div>
        </section>

        {/* 🛠️ Action Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <ActionButton 
            title="회차별 기출 풀기"
            subtitle="연도별 실전 데이터 체험"
            icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}
            onClick={onGoToExamSelection}
            isDarkMode={isDarkMode}
            delay={0.3}
          />
          <ActionButton 
            title="스마트 오답노트"
            subtitle={isGuest ? "가입 후 이용 가능" : "나만의 취약 문항 관리"}
            badge={!isGuest && wrongCount > 0 ? wrongCount : null}
            icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>}
            onClick={onGoToWrongNote}
            isDarkMode={isDarkMode}
            delay={0.4}
            isLocked={isGuest}
          />
          <ActionButton 
            title="프리미엄 패스"
            subtitle="광고 제거 및 무제한 저장"
            icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>}
            onClick={onGoToPremium}
            isDarkMode={isDarkMode}
            delay={0.5}
            highlight="VIP"
          />
        </section>

        {/* 📊 Ad Slot */}
        {showAds && (
          <section className="flex justify-center pt-8">
             <div className={`w-full max-w-[728px] h-[90px] rounded-xl flex flex-col items-center justify-center border border-dashed border-slate-300 text-slate-400 bg-slate-50/50`}>
               <span className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-40">Advertising Section</span>
               <p className="text-xs font-bold opacity-30">프리미엄 구독 시 광고가 제거됩니다.</p>
             </div>
          </section>
        )}
      </main>

      {/* 🔴 Fixed Live Information Bar */}
      <footer className="fixed bottom-0 left-0 w-full bg-midnight text-white z-[60] h-10 border-t border-white/5 flex items-center">
        <div className="bg-gold px-4 h-full flex items-center justify-center z-10">
           <span className="text-[10px] font-black text-midnight uppercase tracking-widest flex items-center">
             <div className="w-1.5 h-1.5 bg-midnight rounded-full mr-2 animate-pulse" />
             LIVE
           </span>
        </div>
        <div className="flex-1 overflow-hidden relative h-full flex items-center">
           <div className="animate-marquee whitespace-nowrap">
              {recentActivities.concat(recentActivities).map((act, i) => (
                <span key={i} className="inline-block px-12 text-[11px] font-bold text-white/50 tracking-tight">
                   {act}
                </span>
              ))}
           </div>
        </div>
      </footer>
    </div>
  );
};

const ActionButton = ({ title, subtitle, icon, onClick, isDarkMode, delay, badge, highlight, isLocked }) => (
  <motion.button
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay }}
    onClick={onClick}
    className={`group p-10 rounded-[2.5rem] lift-hover text-left relative overflow-hidden transition-all duration-500
      ${isDarkMode ? 'glass-card' : 'bg-white shadow-md border border-slate-100'}
    `}
  >
    {highlight && <div className="absolute top-6 right-8 px-2 py-0.5 bg-gold text-midnight text-[9px] font-black rounded uppercase">{highlight}</div>}
    {isLocked && <div className="absolute top-6 right-8 text-gold/30"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div>}
    
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110
      ${isDarkMode ? 'bg-white/5 text-gold' : 'bg-midnight text-gold'}
    `}>
      {icon}
      {badge && <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-lg">{badge}</span>}
    </div>
    <div className="space-y-2">
      <h4 className="text-xl md:text-2xl font-black tracking-tight">{title}</h4>
      <p className="text-sm font-bold opacity-30 break-keep">{subtitle}</p>
    </div>
  </motion.button>
);

export default HomePage;
