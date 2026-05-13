import React from 'react';
import { motion } from 'framer-motion';

const TestPreviewPage = ({ isDarkMode, selectedExam, onBack, onStart }) => {
  const { year, subject } = selectedExam || { year: 2025, subject: '부동산학개론' };

  const examInfo = [
    { label: '시험 시간', value: '50분 (권장)', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg> },
    { label: '문항 수', value: '40문항', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
    { label: '합격 기준', value: '60점 이상', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className={`min-h-screen flex flex-col noise-texture transition-all duration-500 ${isDarkMode ? 'mesh-bg text-white' : 'bg-offwhite text-midnight'}`}
    >
      <header className={`sticky top-0 z-50 border-b transition-all duration-500 ${isDarkMode ? 'bg-midnight/40 border-white/5 backdrop-blur-2xl' : 'bg-white/80 border-slate-100 backdrop-blur-md'}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-16 h-20 md:h-28 flex items-center space-x-6">
          <button onClick={onBack} className="w-10 h-10 md:w-12 md:h-12 glass-button rounded-xl md:rounded-2xl flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <div className="flex flex-col">
            <span className="text-[10px] md:text-[12px] font-black text-gold uppercase tracking-[0.3em] mb-1">Exam Preview</span>
            <h1 className="text-xl md:text-3xl font-black tracking-tighter leading-none">시험 안내</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-8 py-12 md:py-24 space-y-12">
        <div className="text-center space-y-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-block px-4 py-1.5 bg-gold/10 rounded-full border border-gold/20">
            <span className="text-xs font-black text-gold uppercase tracking-widest">{year}년도 제36회 기출</span>
          </motion.div>
          <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-3xl md:text-5xl font-black tracking-tighter leading-tight break-keep">
            {subject}
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {examInfo.map((info, i) => (
            <motion.div 
              key={info.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className={`flex items-center p-6 rounded-[2rem] border transition-all ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-6 ${isDarkMode ? 'bg-gold/10 text-gold' : 'bg-midnight text-gold'}`}>
                {info.icon}
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-black opacity-30 uppercase tracking-widest mb-0.5">{info.label}</span>
                <span className="text-lg font-black">{info.value}</span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className={`p-8 rounded-[2.5rem] border-2 border-dashed space-y-4 ${isDarkMode ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-white'}`}>
          <div className="flex items-center space-x-3 text-gold">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <span className="text-sm font-black uppercase tracking-widest">수험생 유의사항</span>
          </div>
          <p className="text-sm font-bold opacity-40 leading-relaxed break-keep">
            본 시험은 실전과 동일한 환경을 제공합니다. 시작 버튼을 누르면 타이머가 작동하며, 중단 시 진행 상황은 저장되지 않을 수 있습니다.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileActive={{ scale: 0.98 }}
          onClick={onStart}
          className="w-full py-6 md:py-8 rounded-[2.5rem] bg-gold text-midnight font-black text-xl md:text-2xl shadow-2xl shadow-gold/20 hover:shadow-gold/40 transition-all"
        >
          시험 시작하기
        </motion.button>
      </main>
    </motion.div>
  );
};

export default TestPreviewPage;
