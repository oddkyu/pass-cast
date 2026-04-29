import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ExamSelectionPage = ({ isDarkMode, onBack, onSelectExam }) => {
  const [step, setStep] = useState('year'); // 'year' or 'subject'
  const [selectedYear, setSelectedYear] = useState(null);

  const years = [
    { year: 2024, round: '제35회' },
    { year: 2023, round: '제34회' },
    { year: 2022, round: '제33회' },
    { year: 2021, round: '제32회' },
    { year: 2020, round: '제31회' },
  ];

  const subjects = {
    first: [
      { id: 'intro', name: '부동산학개론', info: '1교시 / 40문항' },
      { id: 'civil', name: '민법 및 민사특별법', info: '1교시 / 40문항' },
    ],
    second: [
      { id: 'law', name: '중개사법령 및 실무', info: '1교시 / 40문항' },
      { id: 'public', name: '부동산공법', info: '1교시 / 40문항' },
      { id: 'tax', name: '공시법 및 세법', info: '2교시 / 40문항' },
    ]
  };

  const handleYearSelect = (year) => {
    setSelectedYear(year);
    setStep('subject');
  };

  const handleBack = () => {
    if (step === 'subject') {
      setStep('year');
    } else {
      onBack();
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={`min-h-screen flex flex-col noise-texture transition-all duration-500 ${isDarkMode ? 'mesh-bg text-white' : 'bg-offwhite text-midnight'}`}
    >
      <header className={`sticky top-0 z-50 border-b transition-all duration-500 ${isDarkMode ? 'bg-midnight/40 border-white/5 backdrop-blur-2xl' : 'bg-white/80 border-slate-100 backdrop-blur-md'}`}>
        <div className="max-w-7xl mx-auto px-8 md:px-16 h-20 md:h-28 flex items-center space-x-8">
          <button onClick={handleBack} className="w-12 h-12 glass-button rounded-2xl flex items-center justify-center">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <div className="flex flex-col">
            <span className="text-[12px] font-black text-gold uppercase tracking-[0.3em] mb-1">
              {step === 'year' ? 'Select Year' : `Year ${selectedYear} / Select Subject`}
            </span>
            <h1 className="text-2xl md:text-3xl font-black tracking-tighter">
              {step === 'year' ? '회차 선택' : '과목 선택'}
            </h1>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-8 md:px-16 py-12 md:py-24">
        <AnimatePresence mode="wait">
          {step === 'year' ? (
            <motion.div 
              key="years"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              {years.map((y, index) => (
                <YearCard 
                  key={y.year} 
                  year={y.year} 
                  round={y.round} 
                  isDarkMode={isDarkMode} 
                  onClick={() => handleYearSelect(y.year)} 
                  index={index}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div 
              key="subjects"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-16"
            >
              {/* 1차 과목 섹션 */}
              <section className="space-y-8">
                <div className="flex items-center space-x-4">
                  <div className="h-px flex-1 bg-gold/20" />
                  <h2 className="text-sm font-black text-gold tracking-[0.4em] uppercase">1차 시험 과목</h2>
                  <div className="h-px flex-1 bg-gold/20" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {subjects.first.map((sub, i) => (
                    <SubjectCard 
                      key={sub.id} 
                      subject={sub} 
                      isDarkMode={isDarkMode} 
                      onClick={() => onSelectExam(selectedYear, sub.name)}
                      index={i}
                    />
                  ))}
                </div>
              </section>

              {/* 2차 과목 섹션 */}
              <section className="space-y-8">
                <div className="flex items-center space-x-4">
                  <div className="h-px flex-1 bg-white/10" />
                  <h2 className={`text-sm font-black tracking-[0.4em] uppercase ${isDarkMode ? 'text-white/30' : 'text-slate-300'}`}>2차 시험 과목</h2>
                  <div className="h-px flex-1 bg-white/10" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {subjects.second.map((sub, i) => (
                    <SubjectCard 
                      key={sub.id} 
                      subject={sub} 
                      isDarkMode={isDarkMode} 
                      onClick={() => onSelectExam(selectedYear, sub.name)}
                      index={i}
                    />
                  ))}
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </motion.div>
  );
};

const YearCard = ({ year, round, isDarkMode, onClick, index }) => (
  <motion.button
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    onClick={onClick}
    className={`group flex items-center p-8 rounded-[2.5rem] lift-hover text-left relative overflow-hidden
      ${isDarkMode ? 'glass-card border-white/5' : 'bg-white shadow-xl shadow-slate-100 border-white'}
    `}
  >
    <div className={`w-20 h-20 rounded-[1.5rem] flex flex-col items-center justify-center mr-8 flex-shrink-0 transition-transform group-hover:scale-110
      ${isDarkMode ? 'bg-white/5 text-gold border border-white/5' : 'bg-midnight text-gold'}
    `}>
      <span className="text-[10px] font-black opacity-50 mb-0.5">{year}</span>
      <span className="text-xl font-black">{round}</span>
    </div>
    <div className="flex-1">
      <h3 className={`text-2xl font-black ${isDarkMode ? 'group-hover:text-gold' : 'text-midnight'}`}>공인중개사 기출</h3>
      <p className={`text-sm font-bold ${isDarkMode ? 'text-white/30' : 'text-slate-400'}`}>전체 과목 선택하기</p>
    </div>
    <div className={`absolute right-10 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-300 ${isDarkMode ? 'text-gold' : 'text-midnight'}`}>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M9 18l6-6-6-6"/></svg>
    </div>
  </motion.button>
);

const SubjectCard = ({ subject, isDarkMode, onClick, index }) => (
  <motion.button
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: index * 0.1 }}
    onClick={onClick}
    className={`group p-8 rounded-[2rem] text-left border-2 transition-all active:scale-95
      ${isDarkMode ? 'bg-white/5 border-white/5 hover:border-gold/30 hover:bg-white/10' : 'bg-white border-slate-50 shadow-lg shadow-slate-100/50 hover:border-gold/30'}
    `}
  >
    <div className="flex flex-col space-y-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${isDarkMode ? 'bg-white/5 text-gold' : 'bg-midnight text-gold'} group-hover:bg-gold group-hover:text-midnight`}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
      </div>
      <div>
        <h3 className={`text-[20px] font-black leading-tight mb-1 ${isDarkMode ? 'text-white' : 'text-midnight'}`}>{subject.name}</h3>
        <p className={`text-xs font-bold ${isDarkMode ? 'text-white/30' : 'text-slate-400'}`}>{subject.info}</p>
      </div>
    </div>
  </motion.button>
);

export default ExamSelectionPage;
