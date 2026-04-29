import React from 'react';
import { motion } from 'framer-motion';

const PremiumPage = ({ isDarkMode, onBack }) => {
  const benefits = [
    {
      title: "광고 없는 쾌적한 학습",
      desc: "학습 흐름을 방해하는 모든 광고가 즉시 제거됩니다.",
      icon: <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
    },
    {
      title: "전 회차 프리미엄 해설지",
      desc: "단순 정답을 넘어 합격생의 노하우가 담긴 해설을 제공합니다.",
      icon: <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
    },
    {
      title: "AI 오답 무제한 저장",
      desc: "용량 제한 없이 평생 나만의 오답 노트를 소장하세요.",
      icon: <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className={`min-h-screen flex flex-col noise-texture transition-all duration-500 ${isDarkMode ? 'mesh-bg text-white' : 'bg-offwhite text-midnight'}`}
    >
      <header className="max-w-7xl mx-auto w-full px-8 py-12 flex items-center justify-between">
        <button onClick={onBack} className="w-12 h-12 glass-button rounded-2xl flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <span className="text-xl font-black tracking-tighter uppercase">Pass-Cast Premium</span>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-8 md:px-12 py-12 space-y-20">
        <div className="text-center space-y-6">
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-none">
            합격으로 가는 <br/> <span className="text-gold">가장 빠른 티켓.</span>
          </h1>
          <p className="text-xl font-bold opacity-40">지금 프리미엄 패스로 전환하고 압도적인 학습 효율을 경험하세요.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {benefits.map((benefit, idx) => (
            <motion.div 
              key={idx}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 + (idx * 0.1) }}
              className={`p-12 rounded-[4rem] flex flex-col items-center text-center space-y-8 transition-all duration-500
                ${isDarkMode ? 'glass-card border-white/10' : 'bg-white border-white shadow-2xl shadow-slate-100'}
              `}
            >
              <div className="w-24 h-24 bg-gold/10 text-gold rounded-3xl flex items-center justify-center mb-4">
                {benefit.icon}
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-black tracking-tight">{benefit.title}</h3>
                <p className="font-bold opacity-40 leading-relaxed break-keep">{benefit.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="max-w-2xl mx-auto">
          <button className="w-full py-8 bg-midnight text-gold rounded-[2.5rem] font-black text-2xl shadow-2xl shadow-gold/20 hover:scale-105 active:scale-95 transition-all">
            지금 프리미엄 패스 구독하기
          </button>
          <p className="text-center mt-8 text-sm font-black opacity-20 tracking-widest uppercase">Special Offer: 49,900 / Lifetime Access</p>
        </div>
      </main>
    </motion.div>
  );
};

export default PremiumPage;
