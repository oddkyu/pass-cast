import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

const RoutineSelectionPage = ({ isDarkMode, onBack, onStartRoutine, user }) => {
  const [selectedYear, setSelectedYear] = useState(2024);
  const [selectedSubject, setSelectedSubject] = useState('부동산학개론');
  const [completedSets, setCompletedSets] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);

  const years = [2024, 2023, 2022, 2021, 2020];
  const subjects = ['부동산학개론', '민법', '중개사법', '공법', '공시세법'];
  const sets = [
    { id: 0, range: '1 - 10번', label: 'Set 01' },
    { id: 1, range: '11 - 20번', label: 'Set 02' },
    { id: 2, range: '21 - 30번', label: 'Set 03' },
    { id: 3, range: '31 - 40번', label: 'Set 04' },
  ];

  useEffect(() => {
    fetchCompletionStatus();
  }, [selectedYear, selectedSubject, user]);

  const fetchCompletionStatus = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_routine_history')
        .select('set_index')
        .eq('user_id', user.id)
        .eq('year', selectedYear)
        .eq('subject', selectedSubject);
      
      if (error) throw error;
      setCompletedSets(new Set(data.map(item => item.set_index)));
    } catch (err) {
      console.error('Error fetching completion:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className={`min-h-screen flex flex-col noise-texture transition-all duration-500 ${isDarkMode ? 'mesh-bg text-white' : 'bg-offwhite text-midnight'}`}
    >
      {/* 🏛️ Premium Header */}
      <header className={`sticky top-0 z-50 border-b flex items-center justify-between px-6 md:px-10 h-16 md:h-20 transition-all ${isDarkMode ? 'bg-midnight/95 border-white/5 backdrop-blur-3xl' : 'bg-white border-slate-100 shadow-sm'}`}>
        <button onClick={onBack} className="w-10 h-10 md:w-12 md:h-12 border border-gold/30 rounded-xl flex items-center justify-center text-gold hover:bg-gold/10 transition-all">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-black text-gold uppercase tracking-widest">Daily Routine 10</span>
          <h1 className="text-sm md:text-lg font-black tracking-tight">데일리 루틴 세트 선택</h1>
        </div>
        <div className="w-10 md:w-12" />
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-8 py-12 md:py-20 space-y-16">
        
        {/* 📅 Selection Filters */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          <div className="space-y-6">
            <h3 className="text-xl font-black opacity-40 uppercase tracking-widest">Year</h3>
            <div className="flex flex-wrap gap-3">
              {years.map(y => (
                <button 
                  key={y} onClick={() => setSelectedYear(y)}
                  className={`px-6 py-3 rounded-2xl font-black transition-all ${selectedYear === y ? 'bg-gold text-midnight shadow-lg shadow-gold/20' : 'bg-midnight/5 opacity-40 hover:opacity-100'}`}
                >
                  {y}년
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <h3 className="text-xl font-black opacity-40 uppercase tracking-widest">Subject</h3>
            <div className="flex flex-wrap gap-3">
              {subjects.map(s => (
                <button 
                  key={s} onClick={() => setSelectedSubject(s)}
                  className={`px-6 py-3 rounded-2xl font-black transition-all ${selectedSubject === s ? 'bg-gold text-midnight shadow-lg shadow-gold/20' : 'bg-midnight/5 opacity-40 hover:opacity-100'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* 🎯 Sets Grid */}
        <section className="space-y-10">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black tracking-tight">세트 리스트</h3>
            <span className="text-sm font-bold opacity-40">10문제씩 나누어 학습하세요</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {sets.map((set) => {
              const isCompleted = completedSets.has(set.id);
              return (
                <motion.button
                  key={set.id}
                  whileHover={{ y: -5, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onStartRoutine(selectedYear, selectedSubject, set.id)}
                  className={`relative p-10 rounded-[3.5rem] border flex flex-col items-start text-left group transition-all duration-500 overflow-hidden
                    ${isCompleted 
                      ? (isDarkMode ? 'bg-green-500/5 border-green-500/20' : 'bg-green-50/50 border-green-200/50')
                      : (isDarkMode ? 'bg-white/[0.03] border-white/5 shadow-2xl shadow-black/20' : 'bg-white border-slate-100 shadow-2xl shadow-slate-200/50')
                    }
                  `}
                >
                  {/* Decorative Background Element */}
                  <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-10 transition-all group-hover:scale-150 ${isCompleted ? 'bg-green-500' : 'bg-gold'}`} />

                  <div className="w-full flex justify-between items-start mb-8">
                    <div className={`px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest shadow-sm
                      ${isCompleted ? 'bg-green-500 text-white' : 'bg-gold text-midnight'}
                    `}>
                      {set.label}
                    </div>
                    {isCompleted && (
                      <div className="flex items-center gap-1.5 text-green-500 font-black text-[11px] uppercase tracking-tighter">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12"/></svg>
                        COMPLETED
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <h4 className={`text-4xl font-black tracking-tighter ${isDarkMode ? 'text-white' : 'text-midnight'}`}>
                      {set.range}
                    </h4>
                    <p className="text-sm font-bold opacity-30 uppercase tracking-widest">
                      Daily Routine Stage {set.id + 1}
                    </p>
                  </div>

                  <div className="mt-10 w-full flex items-center justify-between">
                     <span className={`text-[12px] font-black uppercase tracking-widest transition-all group-hover:translate-x-1 ${isCompleted ? 'text-green-500/50' : 'text-gold'}`}>
                       {isCompleted ? '다시 학습하기' : '지금 시작하기 →'}
                     </span>
                     <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500
                        ${isCompleted ? 'bg-green-500/10 text-green-500' : 'bg-midnight text-gold shadow-lg shadow-midnight/20 group-hover:bg-gold group-hover:text-midnight'}
                     `}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          {isCompleted ? <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /> : <path d="M5 12h14M12 5l7 7-7 7" />}
                        </svg>
                     </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </section>

      </main>

      {/* 💡 Info Section */}
      <footer className="max-w-4xl mx-auto w-full px-8 pb-20">
         <div className={`p-10 rounded-[3rem] border-l-8 border-gold space-y-4 ${isDarkMode ? 'bg-white/5' : 'bg-gold/5'}`}>
            <h4 className="text-xl font-black text-gold">데일리 루틴이란?</h4>
            <p className="text-base font-bold opacity-60 leading-relaxed break-keep">
              바쁜 수험생 여러분을 위해 40문항의 기출문제를 10문제씩 4개 세트로 나누었습니다. <br/>
              매일 한 세트씩 꾸준히 학습하는 습관이 합격의 가장 빠른 지름길입니다.
            </p>
         </div>
      </footer>

      <style>{`
        .break-keep { word-break: keep-all; }
      `}</style>
    </motion.div>
  );
};

export default RoutineSelectionPage;
