import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const WrongAnswerNotePage = ({ wrongAnswers, isDarkMode, onBack, onRemove }) => {
  const [filter, setFilter] = useState('전체');
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  const subjects = ['전체', ...new Set(wrongAnswers.map(q => q.subject))];
  const filteredAnswers = filter === '전체' 
    ? wrongAnswers 
    : wrongAnswers.filter(q => q.subject === filter);

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={`min-h-screen flex flex-col noise-texture transition-all duration-500 ${isDarkMode ? 'mesh-bg text-white' : 'bg-offwhite text-midnight'}`}
    >
      {/* 🏛️ Header */}
      <header className={`sticky top-0 z-50 border-b transition-all duration-500 ${isDarkMode ? 'bg-midnight/60 border-white/5 backdrop-blur-2xl' : 'bg-white/80 border-slate-100 backdrop-blur-md'}`}>
        <div className="max-w-7xl mx-auto px-8 md:px-12 h-20 md:h-28 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button onClick={onBack} className="w-12 h-12 glass-button rounded-2xl flex items-center justify-center">
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-gold uppercase tracking-[0.4em] mb-1">My Weakness Notes</span>
              <h1 className="text-2xl md:text-3xl font-black tracking-tighter">오답노트</h1>
            </div>
          </div>
          <div className="hidden md:flex bg-white/5 rounded-2xl p-1.5 border border-white/5">
             {subjects.map(sub => (
               <button 
                 key={sub}
                 onClick={() => setFilter(sub)}
                 className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${filter === sub ? 'bg-gold text-midnight shadow-lg' : 'opacity-40 hover:opacity-100'}`}
               >
                 {sub}
               </button>
             ))}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-8 md:px-12 py-12 md:py-24 space-y-12">
        
        {/* 📊 Summary Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className={`p-8 rounded-[2.5rem] ${isDarkMode ? 'bg-white/5' : 'bg-white shadow-xl shadow-slate-100'}`}>
              <p className="text-[10px] font-black opacity-30 uppercase tracking-widest mb-2">Total Weaknesses</p>
              <p className="text-4xl font-black text-gold">{wrongAnswers.length} <span className="text-lg opacity-30">문항</span></p>
           </div>
           <div className={`p-8 rounded-[2.5rem] ${isDarkMode ? 'bg-white/5' : 'bg-white shadow-xl shadow-slate-100'}`}>
              <p className="text-[10px] font-black opacity-30 uppercase tracking-widest mb-2">Most Challenging</p>
              <p className="text-xl font-black truncate">{subjects[1] || '데이터 없음'}</p>
           </div>
           <div className={`p-8 rounded-[2.5rem] ${isDarkMode ? 'bg-white/5' : 'bg-white shadow-xl shadow-slate-100'}`}>
              <p className="text-[10px] font-black opacity-30 uppercase tracking-widest mb-2">Recent Save</p>
              <p className="text-xl font-black">방금 전</p>
           </div>
        </section>

        {/* 📋 List of Wrong Answers */}
        <section className="space-y-6">
          {filteredAnswers.length === 0 ? (
            <div className="py-32 text-center space-y-4 opacity-20">
               <svg className="mx-auto" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
               <p className="text-2xl font-black tracking-tight">아직 오답이 없습니다. 클린 패스!</p>
            </div>
          ) : (
            filteredAnswers.map((q, idx) => (
              <motion.div 
                key={q.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`group p-8 md:p-12 rounded-[3rem] lift-hover border-2 flex flex-col md:flex-row items-center justify-between gap-8 transition-all
                  ${isDarkMode ? 'bg-white/5 border-white/5 hover:border-gold/30' : 'bg-white border-slate-50 shadow-xl shadow-slate-100 hover:border-gold/30'}
                `}
              >
                <div className="flex-1 space-y-4">
                  <div className="flex items-center space-x-3">
                    <span className="px-3 py-1 bg-gold/10 text-gold text-[10px] font-black rounded-full uppercase tracking-widest border border-gold/20">{q.subject}</span>
                    <span className="text-[10px] font-black opacity-30 uppercase tracking-widest">{q.year}년 기출</span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-black leading-tight break-keep">{q.question_text}</h3>
                </div>
                
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={() => setSelectedQuestion(q)}
                    className="px-8 py-4 bg-midnight text-gold rounded-2xl font-black text-sm hover:scale-105 active:scale-95 transition-all shadow-xl shadow-midnight/20"
                  >
                    해설 보기
                  </button>
                  <button 
                    onClick={() => onRemove(q.id)}
                    className="w-14 h-14 rounded-2xl border-2 border-red-500/20 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </section>
      </main>

      {/* 🔍 Explanation Modal (Reused) */}
      <AnimatePresence>
        {selectedQuestion && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedQuestion(null)} className="absolute inset-0 bg-midnight/80 backdrop-blur-xl" />
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className={`relative w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-[3.5rem] shadow-2xl p-10 md:p-16 space-y-10 scrollbar-hide ${isDarkMode ? 'bg-midnight border border-white/10 text-white' : 'bg-white text-midnight'}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-black text-gold tracking-widest uppercase">{selectedQuestion.year} {selectedQuestion.subject}</span>
                <button onClick={() => setSelectedQuestion(null)} className="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>
              <h2 className="text-2xl md:text-3xl font-black leading-tight break-keep">{selectedQuestion.question_text}</h2>
              <div className="space-y-3">
                {selectedQuestion.options.map((opt, idx) => (
                  <div key={idx} className={`p-5 rounded-2xl border-2 flex items-center space-x-4 ${idx === selectedQuestion.answer ? 'border-green-500 bg-green-500/5 text-green-500' : 'border-transparent opacity-40'}`}>
                    <span className="font-black w-6 text-center">{idx + 1}</span>
                    <span className="font-bold flex-1">{opt}</span>
                    {idx === selectedQuestion.answer && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12"/></svg>}
                  </div>
                ))}
              </div>
              <div className={`p-8 rounded-[2rem] space-y-4 border-l-8 border-gold ${isDarkMode ? 'bg-white/5' : 'bg-gold/5'}`}>
                <div className="flex items-center space-x-3 text-gold">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9.663 17h4.674M12 3v1m0 16v1m5.657-13.657l-.707.707m-10.606 8.485l-.707.707M3 12h1m16 0h1M5.657 5.657l.707.707m8.485 10.606l.707.707M12 7a5 5 0 0 0-5 5 5 5 0 0 0 5 5 5 5 0 0 0 5-5 5 5 0 0 0-5-5z"/></svg>
                  <h4 className="text-lg font-black tracking-tighter">정답 해설</h4>
                </div>
                <p className="font-bold leading-relaxed opacity-80 break-keep">{selectedQuestion.explanation || "상세 해설이 준비 중입니다."}</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .break-keep { word-break: keep-all; }
      `}</style>
    </motion.div>
  );
};

export default WrongAnswerNotePage;
