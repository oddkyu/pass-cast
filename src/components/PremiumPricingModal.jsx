import React from 'react';
import { motion } from 'framer-motion';

const PremiumPricingModal = ({ isDarkMode, onClose, onLogin }) => {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6 pointer-events-auto">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        onClick={onClose} 
        className="absolute inset-0 bg-midnight/90 backdrop-blur-2xl" 
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }} 
        animate={{ scale: 1, opacity: 1, y: 0 }} 
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className={`relative w-full max-w-xl rounded-[2.5rem] p-8 md:p-12 text-center space-y-8 overflow-hidden shadow-2xl ${
          isDarkMode ? 'bg-midnight border border-white/10 text-white' : 'bg-white text-midnight border border-slate-100'
        }`}
      >
        {/* Decorative Golden Glow */}
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-gold/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-gold/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Icon */}
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-lg bg-gold shadow-gold/20">
          <span className="text-midnight font-black text-2xl">P</span>
        </div>

        <div className="space-y-3">
          <span className="px-3 py-1 bg-gold/10 text-gold text-xs font-black rounded-full border border-gold/20 uppercase tracking-widest">
            Pass-Cast Premium
          </span>
          <h3 className="text-2xl md:text-3xl font-black tracking-tight leading-tight break-keep mt-2">
            단 한 번에 합격하는 가장 빠른 지름길!
          </h3>
          <p className="text-sm md:text-base font-bold opacity-65 break-keep leading-relaxed">
            나만의 무제한 오답 노트 클라우드 저장 & 광고 없는 몰입 학습
          </p>
        </div>

        {/* Pricing Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-2">
          {/* Option 1: Monthly */}
          <div className={`p-6 rounded-[2rem] border text-left relative overflow-hidden transition-all duration-300 ${
            isDarkMode 
              ? 'bg-white/[0.02] border-white/10 hover:border-gold/30 text-white' 
              : 'bg-slate-50 border-slate-200/80 hover:border-gold/30 text-midnight'
          }`}>
            <div className="text-xs font-black opacity-40 mb-1 uppercase tracking-wider">정기 구독</div>
            <div className="text-lg font-black">월간 패스</div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-2xl font-black text-gold">3,900원</span>
              <span className="text-xs font-medium opacity-50">/ 월</span>
            </div>
            <div className="text-[11px] font-bold opacity-40 mt-1">언제든지 해지 가능</div>
          </div>

          {/* Option 2: 6-Month Pass (Recommended) */}
          <div className={`p-6 rounded-[2rem] border-2 text-left relative overflow-hidden transition-all duration-300 bg-gold/[0.03] border-gold/40 shadow-lg shadow-gold/5`}>
            <div className="absolute top-4 right-4 bg-gold text-midnight font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">
              추천
            </div>
            <div className="text-xs font-black text-gold/80 mb-1 uppercase tracking-wider">단기 합격 패키지</div>
            <div className="text-lg font-black text-gold">6개월 프리패스</div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-2xl font-black text-gold">19,000원</span>
              <span className="text-xs font-medium opacity-50">/ 6개월</span>
            </div>
            <div className="text-[11px] font-bold text-gold/60 mt-1">월 3,160원 수준 (20% 특별할인)</div>
          </div>
        </div>

        {/* Social Login Options */}
        <div className="space-y-4 pt-4 border-t border-black/5 dark:border-white/5">
          <button
            onClick={() => onLogin()}
            className="w-full py-4 rounded-2xl font-black text-base flex items-center justify-center gap-3 transition-all hover:scale-[1.01] active:scale-95 shadow-md hover:shadow-lg"
            style={{ backgroundColor: '#FEE500', color: '#191919' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#191919">
              <path d="M12 3C6.48 3 2 6.58 2 11c0 2.83 1.72 5.3 4.33 6.82l-.9 3.35 3.87-2.55C10.04 18.87 11 19 12 19c5.52 0 10-3.58 10-8S17.52 3 12 3z"/>
            </svg>
            카카오로 1초 로그인 및 구독하기
          </button>
          
          <button 
            onClick={onClose} 
            className="text-xs md:text-sm font-black opacity-30 hover:opacity-100 transition-opacity uppercase tracking-widest"
          >
            나중에 구독할게요
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default PremiumPricingModal;
