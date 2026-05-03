import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const WrongAnswerNotePage = ({ wrongAnswers, isDarkMode, isPremium, onBack, onRemove }) => {
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [filterSubject, setFilterSubject] = useState('전체');

  const subjects = ['전체', ...new Set((Array.isArray(wrongAnswers) ? wrongAnswers : []).map(q => q.subject))];
  
  const filteredAnswers = (Array.isArray(wrongAnswers) ? wrongAnswers : [])
    .filter(q => filterSubject === '전체' || q.subject === filterSubject)
    .sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className={`min-h-screen flex flex-col noise-texture transition-all duration-500 ${isDarkMode ? 'mesh-bg text-white' : 'bg-offwhite text-midnight'}`}
    >
      <header className={`sticky top-0 z-50 border-b transition-all duration-500 ${isDarkMode ? 'bg-midnight/60 border-white/5 backdrop-blur-2xl' : 'bg-white/90 border-slate-100 backdrop-blur-md'}`}>
        <div className="max-w-7xl mx-auto px-8 md:px-12 h-20 md:h-24 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button onClick={onBack} className="w-10 h-10 glass-button rounded-xl flex items-center justify-center">
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <h1 className="text-xl md:text-2xl font-black tracking-tighter">나만의 오답노트</h1>
          </div>
          <div className="flex items-center space-x-4">
             {isPremium && <span className="px-3 py-1 bg-gold text-midnight text-[9px] font-black rounded-full uppercase tracking-widest hidden sm:block">클라우드 동기화</span>}
             <div className="w-10 h-10 bg-gold rounded-xl flex items-center justify-center text-midnight font-black">{filteredAnswers.length}</div>
          </div>
        </div>

        {/* 🏷️ Subject Filters */}
        <div className="max-w-7xl mx-auto px-8 md:px-12 py-4 overflow-x-auto scrollbar-hide flex items-center space-x-3">
          {subjects.map(s => (
            <button
              key={s}
              onClick={() => setFilterSubject(s)}
              className={`flex-shrink-0 px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all border
                ${filterSubject === s ? 'bg-midnight text-gold border-gold/50 shadow-lg shadow-gold/10' : (isDarkMode ? 'bg-white/5 border-white/5 opacity-40 hover:opacity-100' : 'bg-white border-slate-100 opacity-60 hover:opacity-100')}
              `}
            >
              {s}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-8 md:px-12 py-12 md:py-20">
        {filteredAnswers.length === 0 ? (
          <div className="h-96 flex flex-col items-center justify-center space-y-6 opacity-20">
             <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
             <p className="text-xl font-black">아직 저장된 오답이 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredAnswers.map((q, idx) => (
              <motion.div
                key={q.id || idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`group p-10 rounded-[3rem] border transition-all duration-500 hover:scale-[1.02] cursor-pointer flex flex-col justify-between
                  ${isDarkMode ? 'glass-card border-white/10 hover:bg-white/5' : 'bg-white border-white shadow-xl shadow-slate-100 hover:shadow-2xl'}
                `}
                onClick={() => setSelectedQuestion(q)}
              >
                <div className="space-y-6">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-black text-gold uppercase tracking-[0.3em]">{q.year}년 기출 문제</span>
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        if(confirm('이 문제를 오답노트에서 삭제할까요?')) {
                          onRemove(q.id); 
                        }
                      }}
                      className="p-2 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
                    </button>
                  </div>
                  <h3 className="text-xl md:text-2xl font-black leading-tight break-keep line-clamp-3">
                    <span className="text-gold mr-2">{q.number}.</span>
                    {q.title}
                  </h3>
                </div>
                <div className="mt-10 pt-6 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                   <span className="text-xs font-black opacity-30">{q.subject}</span>
                   <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center text-gold">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                   </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* 🔍 Details Modal */}
      <AnimatePresence>
        {selectedQuestion && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedQuestion(null)} className="absolute inset-0 bg-midnight/90 backdrop-blur-2xl" />
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className={`relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[4rem] shadow-2xl p-12 md:p-20 space-y-12 scrollbar-hide ${isDarkMode ? 'bg-midnight border border-white/10 text-white' : 'bg-white text-midnight'}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-black text-gold tracking-widest uppercase">{selectedQuestion.year}년 {selectedQuestion.subject} 문항 복습</span>
                <button onClick={() => setSelectedQuestion(null)} className="w-12 h-12 rounded-full hover:bg-white/5 flex items-center justify-center text-gold">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>

              <div className="space-y-10">
                <div className="space-y-8">
                  <h2 className="text-2xl md:text-3xl font-black leading-tight break-keep">
                    <span className="text-gold mr-3">{selectedQuestion.number}.</span>
                    {selectedQuestion.title}
                  </h2>
                  
                  {selectedQuestion.content_box && selectedQuestion.content_box.length > 0 && (
                    <div className={`p-8 rounded-3xl border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                      <div className="space-y-3">
                        {selectedQuestion.content_box.map((line, idx) => (
                          <p key={idx} className="text-lg font-medium opacity-60 leading-relaxed">{line}</p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  {selectedQuestion.options.map((opt, idx) => {
                    const isCorrect = (idx + 1) === selectedQuestion.answer;
                    return (
                      <div key={idx} className={`p-8 rounded-[2rem] border-2 flex items-center space-x-6 transition-all ${isCorrect ? 'border-green-500 bg-green-500/5 text-green-500 shadow-lg' : 'border-slate-50 opacity-30'}`}>
                        <span className="font-black text-2xl w-8 text-center">{idx + 1}</span>
                        <span className="font-bold text-xl md:text-2xl flex-1">{opt}</span>
                        {isCorrect && (
                          <div className="text-green-500">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12"/></svg>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className={`p-12 rounded-[2.5rem] space-y-6 border-l-8 border-gold ${isDarkMode ? 'bg-white/5' : 'bg-gold/5'}`}>
                <div className="flex items-center space-x-4 text-gold">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M9.663 17h4.674M12 3v1m0 16v1m5.657-13.657l-.707.707m-10.606 8.485l-.707.707M3 12h1m16 0h1M5.657 5.657l.707.707m8.485 10.606l.707.707M12 7a5 5 0 0 0-5 5 5 5 0 0 0 5 5 5 5 0 0 0 5-5 5 5 0 0 0-5-5z"/></svg>
                  <h4 className="text-2xl font-black">심층 정답 해설</h4>
                </div>
                <p className="font-bold text-xl md:text-2xl leading-relaxed opacity-80 break-keep">{selectedQuestion.explanation || "상세 해설 데이터를 불러오는 중입니다."}</p>
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
