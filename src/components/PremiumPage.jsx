import React from 'react';
import { motion } from 'framer-motion';

const PremiumPage = ({ isDarkMode, onBack }) => {
  const plans = [
    {
      name: "합격 패스",
      price: "19,900",
      period: "한 달권",
      features: ["광고 없는 쾌적한 학습", "최신 10개년 기출 무제한", "개인 오답노트 무제한 저장"],
      highlight: false
    },
    {
      name: "평생 합격 패스",
      price: "49,900",
      period: "평생 소장",
      features: ["광고 영구 제거", "모든 과목 AI 요약본 제공", "오답노트 PDF 자동 생성", "전 과목 동영상 해설"],
      highlight: true
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`min-h-screen flex flex-col noise-texture transition-all duration-500 ${isDarkMode ? 'mesh-bg text-white' : 'bg-offwhite text-midnight'}`}
    >
      <header className="max-w-7xl mx-auto w-full px-8 md:px-12 py-12 flex items-center justify-between">
        <button onClick={onBack} className="w-12 h-12 glass-button rounded-2xl flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <span className="text-xl font-black tracking-tighter uppercase">Pass-Cast Premium</span>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-8 md:px-12 py-12 md:py-24 space-y-20">
        <div className="text-center space-y-6">
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-5xl md:text-8xl font-black tracking-tighter leading-none"
          >
            오직 공부에만 <br/> <span className="text-gold">집중하는 환경.</span>
          </motion.h1>
          <p className="text-xl font-bold opacity-40">사장님의 합격을 앞당길 프리미엄 멤버십을 선택하세요.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {plans.map((plan, idx) => (
            <motion.div 
              key={idx}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 + (idx * 0.1) }}
              className={`p-12 md:p-20 rounded-[4rem] relative overflow-hidden flex flex-col justify-between transition-all duration-500
                ${plan.highlight 
                  ? (isDarkMode ? 'bg-gold text-midnight' : 'bg-midnight text-gold') 
                  : (isDarkMode ? 'bg-white/5 border border-white/10' : 'bg-white border border-slate-100 shadow-2xl')}
              `}
            >
              <div className="space-y-12">
                <div className="space-y-4">
                  <span className={`text-sm font-black uppercase tracking-widest ${plan.highlight ? (isDarkMode ? 'text-midnight/40' : 'text-gold/40') : 'text-gold'}`}>Membership Plan</span>
                  <h3 className="text-4xl font-black">{plan.name}</h3>
                </div>
                
                <div className="space-y-4">
                   <div className="flex items-baseline space-x-2">
                     <span className="text-6xl font-black tracking-tighter">{plan.price}</span>
                     <span className="text-2xl font-bold opacity-40">원</span>
                   </div>
                   <p className="text-sm font-black opacity-40 tracking-widest uppercase">{plan.period}</p>
                </div>

                <ul className="space-y-4">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-center space-x-3 text-lg font-bold">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button className={`mt-16 w-full py-6 rounded-3xl font-black text-xl transition-all hover:scale-105 active:scale-95
                ${plan.highlight 
                  ? (isDarkMode ? 'bg-midnight text-gold' : 'bg-gold text-midnight shadow-2xl shadow-gold/30') 
                  : (isDarkMode ? 'bg-white text-midnight' : 'bg-midnight text-gold shadow-2xl')}
              `}>
                지금 구독하기
              </button>
            </motion.div>
          ))}
        </div>
      </main>

      <footer className="py-20 text-center opacity-20 text-[10px] font-black tracking-[0.4em] uppercase">
        © 2026 pass-cast billing system
      </footer>
    </motion.div>
  );
};

export default PremiumPage;
