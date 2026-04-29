import React from 'react';
import { motion } from 'framer-motion';

const LandingPage = ({ isDarkMode, onClose, isPopup }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12">
      {/* 🌑 Overlay Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={() => onClose()}
        className="absolute inset-0 bg-midnight/80 backdrop-blur-md"
      />

      {/* 📦 Compact Popup Card */}
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className={`relative w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden ${isDarkMode ? 'bg-midnight border border-white/10' : 'bg-white'}`}
      >
        {/* 🎨 Top Promotion Image Area (Scientific Theme) */}
        <div className="h-64 bg-gold relative flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-20 noise-texture" />
          <div className="relative z-10 text-center space-y-2">
            <span className="text-[10px] font-black text-midnight uppercase tracking-[0.5em]">Special Promotion</span>
            <h2 className="text-4xl font-black text-midnight tracking-tighter">합격 패스 0원</h2>
            <p className="text-sm font-bold text-midnight/60">지금 가입하고 AI 분석을 시작하세요</p>
          </div>
          {/* Decorative Elements */}
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-3xl" />
        </div>

        {/* 📝 Popup Content */}
        <div className="p-10 md:p-12 space-y-8">
          <div className="space-y-4">
            <h3 className={`text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-midnight'}`}>공인중개사 시험 대비, <br/> <span className="text-gold">더 과학적으로 시작하세요.</span></h3>
            <ul className={`space-y-3 text-sm font-bold opacity-60 ${isDarkMode ? 'text-white' : 'text-midnight'}`}>
              <li className="flex items-center space-x-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-gold"><polyline points="20 6 9 17 4 12"/></svg>
                <span>실시간 AI 합격 확률 분석</span>
              </li>
              <li className="flex items-center space-x-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-gold"><polyline points="20 6 9 17 4 12"/></svg>
                <span>무제한 오답노트 PDF 생성</span>
              </li>
              <li className="flex items-center space-x-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-gold"><polyline points="20 6 9 17 4 12"/></svg>
                <span>최신 10개년 기출 완벽 복원</span>
              </li>
            </ul>
          </div>

          <button 
            onClick={() => onClose()}
            className="w-full py-5 bg-midnight text-gold rounded-2xl font-black text-lg shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
          >
            지금 바로 합격하러 가기
          </button>

          {/* 🔘 Footer Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-white/5">
            <button 
              onClick={() => onClose(true)} 
              className="text-[11px] font-black opacity-30 hover:opacity-100 uppercase tracking-widest transition-opacity"
            >
              오늘 하루 보지 않기
            </button>
            <button 
              onClick={() => onClose()} 
              className="text-[11px] font-black opacity-30 hover:opacity-100 uppercase tracking-widest transition-opacity"
            >
              닫기
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LandingPage;
