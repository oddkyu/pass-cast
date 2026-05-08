import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
          <div className="flex items-center space-x-6">
            <button onClick={handleBack} className="w-10 h-10 glass-button rounded-xl flex items-center justify-center">
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <div className="flex flex-col">
               <span className="text-[10px] font-black text-gold uppercase tracking-[0.2em] mb-0.5">Smart Note</span>
               <h1 className="text-xl md:text-2xl font-black tracking-tighter">
                 {step === 'subject' ? '스마트 오답노트' : selectedSubject}
               </h1>
            </div>
          </div>
          <div className="flex items-center space-x-4">
             {isPremium && <span className="px-3 py-1 bg-gold text-midnight text-[9px] font-black rounded-full uppercase tracking-widest hidden sm:block">클라우드 동기화</span>}
             <div className="w-10 h-10 bg-gold rounded-xl flex items-center justify-center text-midnight font-black shadow-lg shadow-gold/20">
               {step === 'subject' ? wrongAnswers.length : filteredHistory.length}
             </div>
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
                    className={`group p-10 rounded-[3.5rem] border text-left transition-all duration-500 hover:scale-[1.03] active:scale-95
                      ${isDarkMode ? 'glass-card border-white/10 hover:bg-white/5' : 'bg-white border-white shadow-xl shadow-slate-100 hover:shadow-2xl'}
                    `}
                  >
                    <div className="flex flex-col h-full justify-between space-y-8">
                       <div className="space-y-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${isDarkMode ? 'bg-white/5 text-gold' : 'bg-midnight text-gold'} group-hover:bg-gold group-hover:text-midnight`}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                          </div>
                          <div>
                            <h3 className="text-2xl font-black leading-tight break-keep">{sub.name}</h3>
                            <p className="text-xs font-bold opacity-30 mt-1 uppercase tracking-widest">{sub.info}</p>
                          </div>
                       </div>
                       
                       <div className="flex items-end justify-between border-t border-black/5 dark:border-white/5 pt-6">
                          <div className="flex flex-col">
                             <span className="text-[10px] font-black opacity-20 uppercase tracking-tighter">Mistakes</span>
                             <span className="text-2xl font-black text-gold">{stats.mistakes}</span>
                          </div>
                          <div className="text-right">
                             <span className="text-[10px] font-black opacity-20 uppercase tracking-tighter">Last Attempt</span>
                             <p className="text-xs font-bold opacity-40">{stats.lastDate ? formatDate(stats.lastDate) : '기록 없음'}</p>
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
                <div className="space-y-6">
                  {filteredHistory.map((h, idx) => (
                    <motion.div
                      key={h.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`flex flex-col lg:flex-row items-center p-8 md:p-10 rounded-[3rem] border gap-8 md:gap-12
                        ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-100 shadow-sm'}
                      `}
                    >
                      {/* Left: Score & Date */}
                      <div className="flex items-center gap-6 shrink-0 w-full lg:w-auto">
                        <div className={`w-20 h-20 rounded-[2rem] flex flex-col items-center justify-center shadow-2xl ${h.score >= 60 ? 'bg-green-500 text-white shadow-green-500/20' : 'bg-red-500 text-white shadow-red-500/20'}`}>
                          <span className="text-[10px] font-black uppercase opacity-60 leading-none mb-1">Score</span>
                          <span className="text-2xl font-black leading-none">{h.score}</span>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-gold uppercase tracking-[0.2em] mb-1">{h.year}년 기출</p>
                          <h4 className="text-lg font-black leading-tight">{h.is_routine ? `루틴 SET ${h.set_index + 1}` : '정기 시험'}</h4>
                          <p className="text-xs font-bold opacity-30 mt-1">{formatDate(h.created_at)}</p>
                        </div>
                      </div>

                      {/* Middle: Mistake Icons */}
                      <div className="flex-1 w-full overflow-hidden">
                        <div className="flex flex-col space-y-3">
                           <span className="text-[10px] font-black opacity-30 uppercase tracking-widest">Mistakes ({h.wrong_question_numbers?.length || 0})</span>
                           <div className="flex flex-wrap gap-2">
                             {h.wrong_question_numbers && h.wrong_question_numbers.length > 0 ? (
                               h.wrong_question_numbers.map(num => (
                                 <button
                                   key={num}
                                   onClick={() => openQuestionModal(num, h.year, h.subject)}
                                   className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-xs transition-all hover:scale-110 active:scale-90 shadow-sm
                                     ${isDarkMode ? 'bg-white/10 text-white hover:bg-gold hover:text-midnight' : 'bg-slate-100 text-midnight hover:bg-gold hover:text-midnight'}
                                   `}
                                 >
                                   {num}
                                 </button>
                               ))
                             ) : (
                               <span className="text-sm font-bold text-green-500/60 italic">No mistakes! Perfect.</span>
                             )}
                           </div>
                        </div>
                      </div>

                      {/* Right: Review Button */}
                      <div className="shrink-0 w-full lg:w-auto">
                        <button 
                          onClick={() => onReviewAttempt(h)}
                          className="w-full lg:w-auto px-10 py-4 bg-midnight text-gold rounded-2xl font-black text-sm hover:scale-105 active:scale-95 transition-all shadow-xl shadow-gold/10 uppercase tracking-widest"
                        >
                          회차 리뷰
                        </button>
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
