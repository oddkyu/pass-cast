import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MOTIVATIONAL_QUOTES = [
  "오늘의 노력이 내일의 합격이 됩니다",
  "포기하지 않으면 반드시 합격합니다",
  "꾸준함은 모든 것을 이깁니다",
  "잘하고 계십니다! 조금만 더 힘내세요",
  "합격의 그날까지, 항상 응원합니다",
  "오늘 흘린 땀방울이 곧 합격증서가 됩니다",
  "틀린 문제는 내일의 확실한 정답이 됩니다",
  "지칠 땐 크게 심호흡 한 번 하세요",
  "스스로를 믿으세요, 해낼 수 있습니다",
  "끝까지 완주하는 당신이 진짜 승자입니다",
  "실수는 성공을 위한 가장 좋은 연습입니다",
  "한 번 더 반복한 만큼 합격에 가까워집니다",
  "자신감은 완벽한 준비에서 나옵니다",
  "오늘 공부한 한 페이지가 당락을 결정할 수 있습니다",
  "당신의 노력을 가장 잘 아는 것은 당신 자신입니다",
  "흔들리지 않고 피는 꽃은 없습니다",
  "힘든 시간은 지나가고 영광은 남습니다",
  "남들과 비교하지 말고 어제의 나와 비교하세요",
  "당신의 목표는 생각보다 가까이 있습니다",
  "오늘도 책상에 앉은 당신이 이미 자랑스럽습니다"
];

const HomePage = ({ 
  user,
  isPremium,
  isDarkMode, 
  appSettings = {}, 
  activePopups = [],
  onToggleTheme, 
  onGoToLanding, 
  onGoToExamSelection,
  onGoToWrongNote,
  onGoToPremium,
  onGoToTestPage,
  onGoToQuiz,
  onLogin,
  onLogout,
  wrongCount = 0,
  routineCount = 0 
}) => {
  const isGuest = !user;
  const showAds = !isPremium;
  const displayName = user?.user_metadata?.name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || '예비';

  const [visiblePopups, setVisiblePopups] = useState([]);
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    // 0. 랜덤 격려 문구 초기 세팅 및 타이머 설정 (6초마다 경기장 배너처럼 회전)
    const initialIndex = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
    setQuoteIndex(initialIndex);

    const interval = setInterval(() => {
      setQuoteIndex(prev => (prev + 1) % MOTIVATIONAL_QUOTES.length);
    }, 10000); // 10초마다 변경

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // 1. 활성 팝업 필터링 (로컬 스토리지 확인)
    if (activePopups && activePopups.length > 0) {
      const filtered = activePopups.filter(popup => {
        const hideUntil = localStorage.getItem(`hide_popup_${popup.id}`);
        if (!hideUntil) return true;
        return new Date(hideUntil) < new Date(); // 오늘 하루가 지났는지 체크
      });
      setVisiblePopups(filtered);
    } else {
      setVisiblePopups([]);
    }
  }, [activePopups]);

  const handleClosePopup = (popupId, hideForToday) => {
    if (hideForToday) {
      const tomorrow = new Date();
      tomorrow.setHours(24, 0, 0, 0); // 다음날 자정
      localStorage.setItem(`hide_popup_${popupId}`, tomorrow.toISOString());
    }
    // 창을 닫으면 visible 목록에서만 제거
    setVisiblePopups(prev => prev.filter(p => p.id !== popupId));
  };

  return (
    <div className={`flex-1 flex flex-col min-h-screen transition-all duration-500 noise-texture ${isDarkMode ? 'mesh-bg text-white' : 'bg-offwhite text-midnight'}`}>
      
      {/* 🏛️ Professional Navigation */}
      <nav className={`sticky top-0 z-50 border-b transition-all duration-500 ${isDarkMode ? 'bg-midnight/60 border-white/5 backdrop-blur-2xl' : 'bg-white/80 border-slate-100 backdrop-blur-md'}`}>
        <div className="max-w-7xl mx-auto px-4 md:px-10 h-14 md:h-16 flex items-center justify-between gap-2">
          {/* 로고: clamp 폰트 + nowrap으로 깨짐 방지 */}
          <div className="flex items-center gap-2.5 cursor-pointer shrink-0" onClick={onGoToLanding}>
            <div className="w-8 h-8 md:w-9 md:h-9 bg-gold rounded-lg flex items-center justify-center shadow-md shadow-gold/20 shrink-0">
              <span className="text-midnight font-black text-base">P</span>
            </div>
            <div className="flex flex-col leading-none">
              <span
                className="font-black tracking-tighter uppercase whitespace-nowrap"
                style={{ fontSize: 'clamp(14px, 4vw, 20px)' }}
              >Pass-Cast</span>
              <span
                className="font-bold text-gold uppercase tracking-widest whitespace-nowrap"
                style={{ fontSize: 'clamp(8px, 2vw, 11px)' }}
              >공인중개사 전용</span>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            {isGuest ? (
              <button
                onClick={onLogin}
                className={`group flex items-center gap-2.5 px-6 md:px-8 py-2 md:py-2.5 rounded-full font-black text-[11px] md:text-sm tracking-tighter transition-all hover:scale-105 active:scale-95 whitespace-nowrap shadow-xl border-2
                  ${isDarkMode 
                    ? 'bg-gold/10 border-gold/30 text-gold hover:bg-gold/20 shadow-gold/5' 
                    : 'bg-[#F5C518] border-[#F5C518] text-midnight shadow-[#F5C518]/20 hover:border-midnight/10'
                  }
                `}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="group-hover:scale-110 transition-transform">
                  <path d="M12 3C6.48 3 2 6.58 2 11c0 2.83 1.72 5.3 4.33 6.82l-.9 3.35 3.87-2.55C10.04 18.87 11 19 12 19c5.52 0 10-3.58 10-8S17.52 3 12 3z"/>
                </svg>
                로그인 / 회원가입
              </button>
            ) : (
              <div className="flex items-center gap-3 text-right">
                <div className="hidden sm:flex flex-col leading-tight">
                  <span className="text-[11px] font-semibold opacity-40">{displayName} 사장님</span>
                  <span className={`text-[9px] font-bold uppercase tracking-wider ${isPremium ? 'text-gold' : 'opacity-20'}`}>{isPremium ? 'Premium' : 'Free'}</span>
                </div>
                <button onClick={onLogout} className="text-[10px] font-semibold opacity-30 uppercase tracking-widest hover:opacity-100 transition-opacity whitespace-nowrap">로그아웃</button>
              </div>
            )}

            {/* 다크모드 토글: 모바일에서도 텍스트 표시 */}
            <button
              onClick={onToggleTheme}
              className="flex items-center gap-1.5 glass-button rounded-xl px-2.5 md:px-3.5 h-9 transition-all hover:scale-105 active:scale-95"
            >
              {isDarkMode ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0">
                  <circle cx="12" cy="12" r="5"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2m-18.78 6.36l1.42-1.42m12.72-12.72l1.42-1.42"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              )}
              <span
                className="font-semibold whitespace-nowrap"
                style={{ fontSize: 'clamp(9px, 2vw, 11px)' }}
              >{isDarkMode ? '밝게' : '어둡게'}</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 md:px-12 py-10 md:py-24 space-y-16 md:space-y-20">
        
        {/* 🚀 Conditional Hero: Guest Intro vs User Stats */}
        <header className="space-y-8 text-center md:text-left">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center justify-center md:justify-start space-x-3">
            <div className="w-2 h-2 bg-gold rounded-full animate-pulse" />
            <span className="text-[12px] font-black text-gold uppercase tracking-[0.5em]">{isGuest ? 'Platform Introduction' : 'Personal Performance'}</span>
          </motion.div>
          
          <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-3xl md:text-8xl font-black tracking-tighter leading-[1.1] break-keep">
            {isGuest ? (
              <>공인중개사 합격을 위한 <br className="hidden md:block" /> <span className="text-gold glow-gold">최신 5개년 기출 분석</span></>
            ) : (
              <div className="h-[80px] md:h-[120px] flex flex-col justify-center">
                <AnimatePresence mode="wait">
                  <motion.h3 
                    key={quoteIndex}
                    initial={{ opacity: 0, rotateX: 90, y: 30 }}
                    animate={{ opacity: 1, rotateX: 0, y: 0 }}
                    exit={{ opacity: 0, rotateX: -90, y: -30 }}
                    transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
                    style={{ transformPerspective: 1200 }}
                    className={`font-black text-[clamp(22px,4vw,44px)] tracking-tight leading-[1.3] break-keep drop-shadow-sm ${isDarkMode ? 'text-white' : 'text-midnight'}`}
                  >
                    <span className="text-gold mr-1 md:mr-2">"</span>
                    {MOTIVATIONAL_QUOTES[quoteIndex]}
                    <span className="text-gold ml-1 md:ml-2">"</span>
                  </motion.h3>
                </AnimatePresence>
              </div>
            )}
          </motion.h2>
          
          {isGuest && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-lg md:text-2xl font-bold opacity-30 max-w-2xl break-keep">
              Pass-Cast는 매년 업데이트되는 최신 5개년 기출 데이터를 통해 수험생 여러분의 합격을 도와 드립니다.
            </motion.p>
          )}

        </header>



        {/* 🛠️ Strategic Gating Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
          <ActionButton 
            title={isGuest ? "무료 기출문제 풀기" : "회차별 기출 풀기"}
            subtitle="연도별/과목별 실전 데이터"
            icon={<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}
            onClick={onGoToExamSelection}
            isDarkMode={isDarkMode}
            delay={0.4}
            highlight="FREE"
          />
          <ActionButton 
            title={<span className={isDarkMode ? 'text-[#FEE500]' : 'text-blue-600'}>데일리 루틴 10</span>}
            subtitle={!isGuest ? (routineCount >= 4 ? "오늘의 루틴 완료! ✅" : `${routineCount}/4 세트 완료`) : "매일 10문제로 다지는 합격 습관"}
            icon={<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
            onClick={onGoToQuiz}
            isDarkMode={isDarkMode}
            delay={0.5}
            highlight={routineCount >= 4 ? "COMPLETE" : "추천"}
            customClass={routineCount >= 4 ? 'border-2 border-green-500/50' : (isDarkMode ? 'border-2 border-[#FEE500]/30 hover:border-[#FEE500]/60' : 'border-2 border-blue-500/30 hover:border-blue-500/60')}
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
            subtitle="광고제거로 쾌적한 문제풀기"
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

      {/* 📣 전역 다중 공지사항 팝업 (Popup CMS) */}
      <AnimatePresence>
        {visiblePopups.length > 0 && (
          <div className="fixed inset-0 z-[100] pointer-events-none flex flex-col items-end pt-24 px-4 md:px-8 gap-4 overflow-hidden">
            {visiblePopups.map((popup, index) => (
              <motion.div 
                key={popup.id}
                drag
                dragMomentum={false}
                initial={{ opacity: 0, scale: 0.9, x: 50 }} 
                animate={{ opacity: 1, scale: 1, x: 0 }} 
                exit={{ opacity: 0, scale: 0.9, x: 50 }}
                transition={{ delay: index * 0.1 }}
                className={`pointer-events-auto cursor-grab active:cursor-grabbing relative w-[calc(100vw-2rem)] md:w-[360px] shrink-0 p-7 md:p-8 rounded-[2rem] shadow-2xl overflow-hidden ${isDarkMode ? 'bg-midnight border border-white/20 text-white shadow-black/50' : 'bg-white border border-black/10 text-midnight shadow-black/10'}`}
              >
                  <div className="space-y-5 relative z-10">
                    <div className="w-10 h-10 rounded-2xl bg-gold/10 text-gold flex items-center justify-center mb-1">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0"/></svg>
                    </div>
                    
                    <h3 className="text-xl md:text-2xl font-black break-keep leading-tight">{popup.title}</h3>
                    {popup.content && (
                      <p className="text-sm font-bold opacity-70 whitespace-pre-line leading-relaxed break-keep">
                        {popup.content}
                      </p>
                    )}

                    {popup.image_url && (
                      <div className="mt-3 rounded-2xl overflow-hidden shadow-lg border border-black/5 dark:border-white/5">
                        <img 
                          src={popup.image_url} 
                          alt="팝업 이미지" 
                          className="w-full h-auto object-cover max-h-[250px] hover:scale-105 transition-transform duration-500" 
                        />
                      </div>
                    )}

                    <div className="pt-4 space-y-3">
                      {popup.link_url && (
                        <a 
                          href={popup.link_url} target="_blank" rel="noopener noreferrer"
                          className="block w-full py-3.5 text-center bg-gold text-midnight rounded-2xl font-black text-base transition-transform hover:scale-[1.02] active:scale-95 shadow-xl shadow-gold/20"
                        >
                          자세히 보기
                        </a>
                      )}
                      <div className="flex items-center gap-2 pt-1 relative z-20">
                        <button 
                          onPointerDown={(e) => e.stopPropagation()}
                          onClick={() => handleClosePopup(popup.id, true)}
                          className={`flex-1 py-3 text-[11px] font-black uppercase tracking-widest rounded-xl transition-colors ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-white/50' : 'bg-slate-100 hover:bg-slate-200 text-slate-500'}`}
                        >
                          오늘 하루 보지 않기
                        </button>
                        <button 
                          onPointerDown={(e) => e.stopPropagation()}
                          onClick={() => handleClosePopup(popup.id, false)}
                          className={`w-16 shrink-0 py-3 text-[11px] font-black uppercase tracking-widest rounded-xl transition-colors ${isDarkMode ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-midnight text-white hover:bg-midnight/90'}`}
                        >
                          닫기
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -top-20 -right-20 w-48 h-48 bg-gold/5 rounded-full blur-[50px] pointer-events-none" />
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ActionButton = ({ title, subtitle, icon, onClick, isDarkMode, delay, badge, highlight, isLocked, customClass }) => (
  <motion.button
    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
    onClick={onClick}
    className={`group p-8 md:p-12 rounded-[2.5rem] md:rounded-[4rem] lift-hover text-left relative overflow-hidden transition-all duration-500
      ${isDarkMode ? 'glass-card border-white/10 hover:bg-white/5' : 'bg-white shadow-xl shadow-slate-100 border-white hover:shadow-2xl'}
      ${customClass || ''}
    `}
  >
    {highlight && <div className={`absolute top-8 right-8 px-3 py-1 text-white text-[10px] font-black rounded-full z-10 ${highlight === 'PRO' ? 'bg-gold text-midnight shadow-lg shadow-gold/20' : highlight === '추천' ? 'bg-blue-500 shadow-lg shadow-blue-500/20' : 'bg-green-500'}`}>{highlight}</div>}
    {isLocked && <div className="absolute top-8 right-8 text-gold opacity-40 animate-pulse"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div>}
    
    <div className={`w-16 h-16 rounded-[2rem] flex items-center justify-center mb-10 group-hover:scale-110 transition-transform relative
      ${isDarkMode ? 'bg-white/5 text-gold border border-white/5' : 'bg-midnight text-gold'}
    `}>
      {icon}
      {badge && <span className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white text-[11px] font-black rounded-full flex items-center justify-center shadow-lg">{badge}</span>}
    </div>
    <div className="space-y-3 md:space-y-4">
      <h4 className="text-xl md:text-3xl font-black tracking-tight leading-tight">{title}</h4>
      <p className="text-sm md:text-lg font-bold opacity-30 break-keep leading-relaxed">{subtitle}</p>
    </div>
  </motion.button>
);

export default HomePage;
