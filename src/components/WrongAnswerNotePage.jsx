import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// DB에 저장된 수학 기호 마커($)를 일반 텍스트로 자연스럽게 변환
const formatMathText = (text) => {
  if (typeof text !== 'string') return text;
  let formatted = text.replace(/\$([^\$]+)\$/g, '$1');
  formatted = formatted.replace(/\\n/g, '\n');
  return formatted;
};

const WrongAnswerNotePage = ({ wrongAnswers, examHistory, isDarkMode, isPremium, onBack, onRemove, onReviewAttempt }) => {
  const [step, setStep] = useState('subject'); // 'subject' or 'details'
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  const subjectList = [
    { name: '부동산학개론', info: '1차 1교시' },
    { name: '민법 및 민사특별법', info: '1차 1교시' },
    { name: '공인중개사법', info: '2차 1교시' },
    { name: '부동산공법', info: '2차 1교시' },
    { name: '부동산공시법 및 세법', info: '2차 2교시' },
  ];

  const getSubjectStats = (subjectName) => {
    const mistakes = (wrongAnswers || []).filter(q => q.subject === subjectName).length;
    const history = (examHistory || []).filter(h => h.subject === subjectName);
    const lastDate = history.length > 0 ? new Date(history[0].created_at) : null;
    return { mistakes, lastDate, attemptCount: history.length };
  };

  const filteredHistory = (examHistory || []).filter(h => h.subject === selectedSubject);

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  };

  const handleSubjectClick = (subjectName) => {
    setSelectedSubject(subjectName);
    setStep('details');
  };

  const handleBack = () => {
    if (step === 'details') setStep('subject');
    else onBack();
  };

  // 특정 번호의 문제를 wrongAnswers에서 찾아 모달 오픈
  const openQuestionModal = (number, year, subject) => {
    const found = wrongAnswers.find(q => q.number === number && q.year === year && q.subject === subject);
    if (found) setSelectedQuestion(found);
    else alert('이 문제는 오답노트에 저장되어 있지 않아 상세 내용을 볼 수 없습니다.');
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className={`min-h-screen flex flex-col noise-texture transition-all duration-500 ${isDarkMode ? 'mesh-bg text-white' : 'bg-offwhite text-midnight'}`}
    >
      {/* 🏛️ Header */}
      <header className={`sticky top-0 z-50 border-b transition-all duration-500 ${isDarkMode ? 'bg-midnight/60 border-white/5 backdrop-blur-2xl' : 'bg-white/90 border-slate-100 backdrop-blur-md'}`}>
        <div className="max-w-7xl mx-auto px-8 md:px-12 h-20 md:h-24 flex items-center justify-between">
          <div className="flex items-center space-x-3 md:space-x-6">
            <button onClick={handleBack} className="w-9 h-9 md:w-10 md:h-10 glass-button rounded-xl flex items-center justify-center">
               <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <div className="flex flex-col">
               <span className="text-[8px] md:text-[10px] font-black text-gold uppercase tracking-[0.2em] mb-0.5">스마트 오답노트</span>
               <h1 className="text-lg md:text-2xl font-black tracking-tighter leading-none">
                 {step === 'subject' ? '스마트 오답노트' : selectedSubject}
               </h1>
            </div>
          </div>
          <div className="flex items-center space-x-4">
             {isPremium && <span className="px-3 py-1 bg-gold text-midnight text-[9px] font-black rounded-full uppercase tracking-widest hidden sm:block">클라우드 동기화</span>}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-8 md:px-12 py-12 md:py-20">
        <AnimatePresence mode="wait">
          {step === 'subject' ? (
            <motion.div 
              key="subject-step"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {subjectList.map((sub, idx) => {
                const stats = getSubjectStats(sub.name);
                return (
                  <motion.button
                    key={sub.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => handleSubjectClick(sub.name)}
                    className={`group p-6 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] border text-left transition-all duration-500 hover:scale-[1.03] active:scale-95
                      ${isDarkMode ? 'glass-card border-white/10 hover:bg-white/5' : 'bg-white border-white shadow-xl shadow-slate-100 hover:shadow-2xl'}
                    `}
                  >
                    <div className="flex flex-col h-full justify-between space-y-6 md:space-y-8">
                       <div className="space-y-3 md:space-y-4">
                          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center transition-colors ${isDarkMode ? 'bg-white/5 text-gold' : 'bg-midnight text-gold'} group-hover:bg-gold group-hover:text-midnight`}>
                            <svg width="20" height="20" md:width="24" md:height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                          </div>
                          <div>
                            <h3 className="text-xl md:text-2xl font-black leading-tight break-keep">{sub.name}</h3>
                            <p className="text-[10px] md:text-xs font-bold opacity-30 mt-1 uppercase tracking-widest">{sub.info}</p>
                          </div>
                       </div>
                       
                       <div className="flex items-end justify-between border-t border-black/5 dark:border-white/5 pt-5 md:pt-6">
                          <div className="flex flex-col">
                             <span className="text-[9px] md:text-[10px] font-black opacity-20 uppercase tracking-tighter">누적 오답</span>
                             <span className="text-xl md:text-2xl font-black text-gold">{stats.mistakes}</span>
                          </div>
                          <div className="text-right">
                             <span className="text-[9px] md:text-[10px] font-black opacity-20 uppercase tracking-tighter">최근 풀이</span>
                             <p className="text-[10px] md:text-xs font-bold opacity-40">{stats.lastDate ? formatDate(stats.lastDate) : '기록 없음'}</p>
                          </div>
                       </div>
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
          ) : (
            <motion.div 
              key="details-step"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              {filteredHistory.length === 0 ? (
                <div className="h-96 flex flex-col items-center justify-center space-y-6 opacity-20 text-center">
                   <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
                   <div className="space-y-2">
                     <p className="text-xl font-black">이 과목의 시험 기록이 없습니다.</p>
                     <p className="text-sm font-bold">시험을 풀고 기록을 남겨보세요!</p>
                   </div>
                   <button onClick={() => setStep('subject')} className="px-8 py-3 bg-gold text-midnight rounded-xl font-black text-sm">과목 목록으로 돌아가기</button>
                </div>
              ) : (
                <div className="space-y-12">
                  {filteredHistory.map((h, idx) => (
                    <motion.div
                      key={h.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`flex flex-col p-8 md:p-12 rounded-[3rem] md:rounded-[4rem] border relative overflow-hidden transition-all duration-500
                        ${isDarkMode ? 'bg-white/5 border-white/10 hover:bg-white/[0.08]' : 'bg-white border-slate-100 shadow-2xl shadow-slate-100/50 hover:shadow-gold/5'}
                      `}
                    >
                      {/* 🏛️ Subtle Background Accent */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />

                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 md:gap-12 relative z-10">
                        {/* 📊 Score Section */}
                        <div className="flex items-center gap-6 md:gap-8 shrink-0">
                           <div className="relative">
                              <svg className="w-20 h-20 md:w-24 md:h-24 transform -rotate-90">
                                <circle cx="50%" cy="50%" r="45%" stroke={isDarkMode ? "rgba(255,255,255,0.05)" : "#f1f5f9"} strokeWidth="8" fill="transparent" />
                                <circle 
                                  cx="50%" cy="50%" r="45%" 
                                  stroke={h.score >= 60 ? "#22c55e" : "#ef4444"} 
                                  strokeWidth="8" 
                                  fill="transparent" 
                                  strokeDasharray="283" 
                                  strokeDashoffset={283 - (283 * h.score) / 100}
                                  strokeLinecap="round"
                                  className="transition-all duration-1000"
                                />
                              </svg>
                              <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-[8px] md:text-[9px] font-black uppercase opacity-40 tracking-widest leading-none mb-1">점수</span>
                                <span className="text-2xl md:text-3xl font-black">{h.score}</span>
                              </div>
                           </div>

                             <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
                               {/* Year Badge & Title Group */}
                               <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                                 <span className="px-3 py-1 bg-gold text-midnight text-sm md:text-base font-black rounded-lg uppercase tracking-wider w-fit shadow-lg shadow-gold/10">
                                   {h.year}년 기출
                                 </span>
                                 <h4 className="text-sm md:text-base font-black tracking-tight leading-tight">
                                   {h.is_routine ? `데일리 루틴 SET ${h.set_index + 1}` : '정기 시험'}
                                 </h4>
                               </div>

                               {/* Vertical Divider (Desktop Only) */}
                               <div className="hidden md:block w-px h-4 bg-slate-200 dark:bg-white/10" />
                               
                               {/* Date Group */}
                               <div className="flex items-center gap-2 text-sm md:text-base font-bold opacity-60">
                                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                 <span>{formatDate(h.created_at)}</span>
                               </div>
                             </div>
                        </div>

                        {/* 🧭 Review Button */}
                        <div className="w-full md:w-auto">
                          <button 
                            onClick={() => onReviewAttempt(h)}
                            className="w-full md:w-auto px-10 py-4 bg-midnight text-gold border border-gold/20 rounded-2xl font-black text-sm hover:bg-gold hover:text-midnight transition-all duration-300 shadow-xl shadow-gold/5 flex items-center justify-center space-x-3 group"
                          >
                            <span className="uppercase tracking-[0.2em]">회차 리뷰하기</span>
                            <svg className="transform group-hover:translate-x-1 transition-transform" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                          </button>
                        </div>
                      </div>

                      {/* 🎯 Mistakes Row */}
                      <div className={`mt-10 p-6 md:p-8 rounded-3xl relative overflow-hidden ${isDarkMode ? 'bg-white/[0.02]' : 'bg-slate-50/50'}`}>
                         <div className="flex flex-col space-y-4 relative z-10">
                            <div className="flex items-center justify-between">
                               <div className="flex items-center gap-2.5">
                                 <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                 <span className="text-[10px] md:text-[11px] font-black text-red-500 uppercase tracking-[0.1em]">틀린 문항 다시보기</span>
                               </div>
                               <span className="text-[10px] md:text-[11px] font-black opacity-30">{h.wrong_question_numbers?.length || 0} Questions</span>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 md:gap-3">
                              {h.wrong_question_numbers && h.wrong_question_numbers.length > 0 ? (
                                h.wrong_question_numbers.map(num => (
                                  <button
                                    key={num}
                                    onClick={() => openQuestionModal(num, h.year, h.subject)}
                                    className={`w-9 h-9 md:w-11 md:h-11 rounded-xl md:rounded-2xl flex items-center justify-center font-black text-xs md:text-sm transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg
                                      ${isDarkMode ? 'bg-white/5 text-white/40 hover:bg-red-500 hover:text-white' : 'bg-white text-slate-400 hover:bg-red-500 hover:text-white border border-slate-100'}
                                    `}
                                  >
                                    {num}
                                  </button>
                                ))
                              ) : (
                                <div className="flex items-center gap-2 py-2 px-4 bg-green-500/10 rounded-xl">
                                   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="4"><polyline points="20 6 9 17 4 12"/></svg>
                                   <span className="text-xs md:text-sm font-black text-green-500">완벽합니다! 틀린 문제가 없습니다.</span>
                                </div>
                              )}
                            </div>
                         </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* 🔍 Question Details Modal */}
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
                  <h2 className="text-2xl md:text-3xl font-black leading-tight break-keep whitespace-pre-line">
                    <span className="text-gold mr-3">{selectedQuestion.number}.</span>
                    {formatMathText(selectedQuestion.title)}
                  </h2>
                  
                  {selectedQuestion.content_box && selectedQuestion.content_box.length > 0 && (
                    <div className={`p-8 rounded-3xl border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                      <div className="space-y-3">
                        {selectedQuestion.content_box.map((line, idx) => (
                          <p key={idx} className="text-lg font-medium opacity-60 leading-relaxed whitespace-pre-line">{formatMathText(line)}</p>
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
                        <span className="font-bold text-xl md:text-2xl flex-1 break-keep whitespace-pre-line">{formatMathText(opt)}</span>
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
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
                  <h4 className="text-2xl font-black">심층 정답 해설</h4>
                </div>
                <p className="font-bold text-xl md:text-2xl leading-relaxed opacity-80 break-keep">{selectedQuestion.explanation || "상세 해설 데이터를 불러오는 중입니다."}</p>
              </div>

              {/* Action Buttons in Modal */}
              <div className="flex justify-center pt-8">
                 <button 
                   onClick={() => {
                     if(confirm('이 문제를 오답노트에서 삭제할까요?')) {
                        onRemove(selectedQuestion.id);
                        setSelectedQuestion(null);
                     }
                   }}
                   className="px-10 py-4 bg-red-500/10 text-red-500 rounded-2xl font-black text-sm hover:bg-red-500 hover:text-white transition-all"
                 >
                   오답노트에서 삭제
                 </button>
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
