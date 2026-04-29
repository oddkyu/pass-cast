import React from 'react';
import { motion } from 'framer-motion';

const ExamSelectionPage = ({ isDarkMode, onBack, onSelectYear }) => {
  const exams = [
    { year: 2024, round: '제35회', status: '최신 기출', applicants: '24만명 응시', passRate: '21.5%' },
    { year: 2023, round: '제34회', status: '복습 추천', applicants: '26만명 응시', passRate: '23.0%' },
    { year: 2022, round: '제33회', status: '난이도 상', applicants: '25만명 응시', passRate: '19.7%' },
    { year: 2021, round: '제32회', status: '핵심 문항', applicants: '24만명 응시', passRate: '22.8%' },
    { year: 2020, round: '제31회', status: '다회독 필수', applicants: '23만명 응시', passRate: '24.2%' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={`min-h-screen flex flex-col noise-texture transition-all duration-500 ${isDarkMode ? 'mesh-bg text-white' : 'bg-offwhite text-midnight'}`}
    >
      <header className={`sticky top-0 z-50 border-b transition-all duration-500 ${isDarkMode ? 'bg-midnight/40 border-white/5 backdrop-blur-2xl' : 'bg-white/80 border-slate-100 backdrop-blur-md'}`}>
        <div className="max-w-7xl mx-auto px-8 md:px-16 h-20 md:h-28 flex items-center space-x-8">
          <button onClick={onBack} className="w-12 h-12 glass-button rounded-2xl flex items-center justify-center">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <div className="flex flex-col">
            <span className="text-[12px] font-black text-gold uppercase tracking-[0.3em] mb-1">Select Session</span>
            <h1 className="text-2xl md:text-3xl font-black tracking-tighter">회차 선택</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-8 md:px-16 py-12 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {exams.map((exam, index) => (
            <motion.button
              key={exam.year}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onSelectYear(exam.year)}
              className={`group flex items-center p-8 rounded-[2.5rem] lift-hover text-left relative overflow-hidden
                ${isDarkMode ? 'glass-card border-white/5' : 'bg-white shadow-xl shadow-slate-100 border-white'}
              `}
            >
              {/* Year Badge */}
              <div className={`w-20 h-20 rounded-[1.5rem] flex flex-col items-center justify-center mr-8 flex-shrink-0 transition-transform group-hover:scale-110
                ${isDarkMode ? 'bg-white/5 text-gold border border-white/5' : 'bg-midnight text-gold'}
              `}>
                <span className="text-[10px] font-black opacity-50 mb-0.5">{exam.year}</span>
                <span className="text-xl font-black">{exam.round}</span>
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-center space-x-3">
                  <h3 className={`text-2xl font-black ${isDarkMode ? 'group-hover:text-gold' : 'text-midnight'}`}>공인중개사 기출문제</h3>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest ${isDarkMode ? 'bg-gold/20 text-gold' : 'bg-midnight text-white'}`}>
                    {exam.status}
                  </span>
                </div>
                <div className={`flex items-center space-x-4 text-sm font-bold ${isDarkMode ? 'text-white/30' : 'text-slate-400'}`}>
                   <span>{exam.applicants}</span>
                   <span className="w-1 h-1 bg-current rounded-full" />
                   <span>합격률 {exam.passRate}</span>
                </div>
              </div>

              <div className={`absolute right-10 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-300 ${isDarkMode ? 'text-gold' : 'text-midnight'}`}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M9 18l6-6-6-6"/></svg>
              </div>
            </motion.button>
          ))}
        </div>
      </main>

      <footer className="py-12 text-center opacity-30 text-[10px] font-black tracking-[0.4em] uppercase">
        © 2026 pass-cast Intelligence
      </footer>
    </motion.div>
  );
};

export default ExamSelectionPage;
