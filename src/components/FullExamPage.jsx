import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FullExamPage = ({ year, subject, isDarkMode, onBack, onFinish, isPremium = false }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [heldQuestions, setHeldQuestions] = useState(new Set());
  const [timeLeft, setTimeLeft] = useState(50 * 60);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const showAds = !isPremium;
  const questionTopRef = useRef(null); // 질문지 상단 참조

  // Mock Questions
  const questions = useMemo(() => Array.from({ length: 40 }, (_, i) => ({
    id: i + 1,
    question_text: `[제${year}회 ${subject}] ${i + 1}번 문제입니다. 공인중개사법령상 중개대상물에 관한 설명으로 옳은 것을 모두 고른 것은?`,
    options: ["① 법령상 중개대상물에는 토지, 건물 그 밖의 토지의 정착물이 포함된다.", "② 입목에 관한 법률에 따른 입목은 중개대상물에 해당하지 않는다.", "③ 공장 및 광업재단 저당법에 따른 공장재단은 중개대상물이다.", "④ 중개보조원은 중개대상물의 확인·설명의 의무가 있다.", "⑤ 개업공인중개사는 소속공인중개사의 행위에 대해 책임을 지지 않는다."],
    answer: 2,
    explanation: "해당 문항의 정답은 ③번입니다."
  })), [year, subject]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // 문항 변경 시 질문지 상단으로 자동 스크롤
  useEffect(() => {
    if (questionTopRef.current) {
      questionTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentIndex]);

  const handleSelectAnswer = (idx) => {
    setAnswers(prev => ({ ...prev, [currentIndex]: idx }));
    if (currentIndex < questions.length - 1) {
      setTimeout(() => setCurrentIndex(prev => prev + 1), 300);
    }
  };

  const toggleHold = (idx) => {
    setHeldQuestions(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const currentQuestion = questions[currentIndex];

  return (
    <div className={`min-h-screen flex flex-col transition-all duration-500 noise-texture pb-28 md:pb-32 ${isDarkMode ? 'mesh-bg text-white' : 'bg-offwhite text-midnight'}`}>
      
      {/* 🏛️ Compact Header */}
      <header className={`sticky top-0 z-50 border-b flex items-center justify-between px-6 md:px-8 h-16 md:h-20 transition-all ${isDarkMode ? 'bg-midnight/95 border-white/5 backdrop-blur-3xl' : 'bg-white border-slate-200 shadow-sm'}`}>
        <div className="flex items-center space-x-4 md:space-x-6">
          <button onClick={() => setShowExitConfirm(true)} className="w-8 h-8 md:w-10 md:h-10 border border-gold/30 rounded-xl flex items-center justify-center text-gold">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <div className="flex flex-col">
             <span className="text-[9px] md:text-[10px] font-black text-gold uppercase tracking-widest">{year} {subject}</span>
             <h1 className="text-sm md:text-lg font-black tracking-tight">기출 실전 시험</h1>
          </div>
        </div>

        <div className="flex items-center space-x-4 md:space-x-10">
           <div className="flex items-center bg-midnight text-gold px-4 md:px-6 py-2 md:py-2.5 rounded-full font-black text-[12px] md:text-sm border border-gold/30 shadow-lg space-x-3 md:space-x-4">
              <div className="flex items-center space-x-1.5 md:space-x-2 border-r border-gold/20 pr-3 md:pr-4">
                 <span className="text-[9px] md:text-[10px] opacity-40 uppercase font-black tracking-tighter">Q</span>
                 <span className="text-sm md:text-base">{currentIndex + 1}</span>
                 <span className="text-[9px] md:text-[10px] opacity-40">/ {questions.length}</span>
              </div>
              <div className="flex items-center space-x-1.5 md:space-x-2">
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                 <span className="tabular-nums">{formatTime(timeLeft)}</span>
              </div>
           </div>
        </div>
      </header>

      {/* 🏁 Wide Question Area */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8 md:py-12 space-y-8 md:space-y-12">
        {/* 🔝 질문지 상단 스크롤 기준점 */}
        <div ref={questionTopRef} className="scroll-mt-36" />

        <section className="space-y-6 md:space-y-8">
           <div className="flex items-center justify-between">
              <span className="text-2xl md:text-3xl font-black text-gold tracking-tighter uppercase italic">Question {currentIndex + 1}</span>
              <button 
                onClick={() => toggleHold(currentIndex)}
                className={`px-4 md:px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                  ${heldQuestions.has(currentIndex) ? 'bg-gold text-midnight shadow-lg' : 'bg-midnight/5 text-gold border border-gold/20 hover:bg-gold/10'}
                `}
              >
                {heldQuestions.has(currentIndex) ? '보류 중' : '보류 표시'}
              </button>
           </div>
           <h2 className="text-xl md:text-3xl font-black leading-tight break-keep">{currentQuestion.question_text}</h2>
        </section>

        <section className="grid grid-cols-1 gap-4 md:gap-5">
          {currentQuestion.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectAnswer(idx)}
              className={`p-5 md:p-8 rounded-2xl md:rounded-[2.5rem] text-left transition-all duration-300 flex items-center space-x-4 md:space-x-6 border-2
                ${answers[currentIndex] === idx 
                  ? 'bg-gold border-gold text-midnight shadow-xl' 
                  : (isDarkMode ? 'bg-white/5 border-white/5 hover:border-gold/30' : 'bg-white border-slate-100 hover:border-gold/30 shadow-sm')}
              `}
            >
              <span className={`w-8 h-8 md:w-11 md:h-11 rounded-full flex items-center justify-center font-black text-base md:text-xl
                 ${answers[currentIndex] === idx ? 'bg-midnight/10' : 'bg-midnight/5'}
              `}>{idx + 1}</span>
              <span className="text-base md:text-xl font-bold break-keep">{opt}</span>
            </button>
          ))}
        </section>

        <div className="flex justify-end pt-4">
           <button 
             onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
             disabled={currentIndex === questions.length - 1}
             className="group flex items-center space-x-2 md:space-x-3 px-6 md:px-8 py-3 md:py-4 bg-gold/10 hover:bg-gold text-gold hover:text-midnight border border-gold/30 rounded-xl md:rounded-2xl transition-all duration-300 disabled:opacity-10"
           >
             <span className="text-sm md:text-lg font-black uppercase tracking-widest">다음 문제로</span>
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="group-hover:translate-x-1 transition-transform md:w-6 md:h-6"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
           </button>
        </div>

        {/* 👑 AI 핵심 키워드 가이드 (Premium 전용) */}
        {isPremium ? (
          <section className={`rounded-2xl md:rounded-3xl p-6 md:p-8 border-2 space-y-4 ${isDarkMode ? 'bg-gold/5 border-gold/20' : 'bg-amber-50 border-amber-200'}`}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gold rounded-lg flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0a0a23" strokeWidth="2.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              </div>
              <span className="text-sm font-black text-gold uppercase tracking-widest">AI 핵심 키워드 가이드</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className={`rounded-xl p-4 space-y-1 ${isDarkMode ? 'bg-white/5' : 'bg-white'}`}>
                <p className="text-[10px] font-black uppercase tracking-widest text-gold opacity-70">관련 법령</p>
                <p className="text-sm font-bold break-keep">공인중개사법 §2 · 민법 §99 · 입목에 관한 법률 §2</p>
              </div>
              <div className={`rounded-xl p-4 space-y-1 ${isDarkMode ? 'bg-white/5' : 'bg-white'}`}>
                <p className="text-[10px] font-black uppercase tracking-widest text-gold opacity-70">출제 포인트</p>
                <p className="text-sm font-bold break-keep">중개대상물의 범위, 입목·광업재단 해당 여부</p>
              </div>
              <div className={`rounded-xl p-4 space-y-1 md:col-span-2 ${isDarkMode ? 'bg-white/5' : 'bg-white'}`}>
                <p className="text-[10px] font-black uppercase tracking-widest text-gold opacity-70">빈출 오답 패턴</p>
                <p className="text-sm font-bold break-keep">입목은 대상물 제외라고 착각하는 경우 多 · 공장재단은 포함됨을 암기</p>
              </div>
            </div>
          </section>
        ) : (
          <section className={`rounded-2xl p-5 border border-dashed flex items-center gap-4 ${isDarkMode ? 'border-gold/20 bg-gold/3' : 'border-amber-200 bg-amber-50/50'}`}>
            <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-gold"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-gold">AI 핵심 키워드 가이드</p>
              <p className="text-xs font-bold opacity-40 break-keep">관련 법령 번호와 출제 포인트를 바로 확인하세요. Premium 전용 기능입니다.</p>
            </div>
          </section>
        )}

        {/* 📢 💡 '다음 문제로' 버튼 바로 밑에 전략적으로 배치된 수익형 광고 */}
        {showAds && (
          <div className="pt-10 flex flex-col items-center">
             <div className={`w-full max-w-[728px] h-[90px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all relative overflow-hidden
               ${isDarkMode ? 'bg-white/5 border-white/10 text-white/20' : 'bg-slate-50 border-slate-200 text-slate-400'}
             `}>
                <div className="absolute top-2 left-4 px-2 py-0.5 bg-midnight/10 rounded text-[8px] font-black tracking-widest uppercase">AD Slot</div>
                <p className="text-xs font-bold opacity-30 tracking-tight text-center px-4">Google AdSense - Commercial Space</p>
                <p className="text-[9px] font-black opacity-20 mt-1 uppercase">프리미엄 패스 가입 시 이 광고는 제거됩니다.</p>
             </div>
          </div>
        )}

        {/* 📢 Bottom Ad Slot */}
        {showAds && (
          <div className="pt-16 md:pt-24 flex justify-center">
             <div className={`w-full max-w-[728px] h-[90px] rounded-xl border border-dashed flex flex-col items-center justify-center transition-all
               ${isDarkMode ? 'bg-white/5 border-white/10 text-white/10' : 'bg-slate-50 border-slate-200 text-slate-300'}
             `}>
                <span className="text-[9px] font-black uppercase opacity-30">Ad Slot</span>
             </div>
          </div>
        )}
      </main>

      {/* 🧭 Re-designed Navigation Bar (Ultra-Compact) */}
      <footer className={`fixed bottom-0 left-0 w-full z-50 border-t transition-all ${isDarkMode ? 'bg-midnight/95 border-white/5 backdrop-blur-3xl' : 'bg-white border-slate-200 shadow-[0_-15px_50px_rgba(0,0,0,0.1)]'}`}>
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-3 md:py-4">
           <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              
              {/* 🔢 문항 칩 스트립 (더 얇고 세련되게) */}
              <div className="w-full md:w-auto flex overflow-x-auto scrollbar-hide space-x-1.5 md:space-x-2 px-2 py-1 bg-midnight/5 rounded-xl md:rounded-2xl border border-white/5">
                {questions.map((q, i) => {
                  const isSelected = currentIndex === i;
                  const isAnswered = answers[i] !== undefined;
                  const isItemHeld = heldQuestions.has(i);
                  return (
                    <button
                      key={i}
                      onClick={() => setCurrentIndex(i)}
                      className={`flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl font-black text-[10px] md:text-[12px] relative transition-all
                        ${isSelected ? 'bg-midnight text-gold scale-105 shadow-md border border-gold/30 z-10' : isAnswered ? 'bg-gold/20 text-gold' : 'opacity-30'}
                      `}
                    >
                      {i + 1}
                      {isItemHeld && <div className="absolute -top-0.5 -right-0.5 w-2 h-2 md:w-2.5 md:h-2.5 bg-orange-500 rounded-full border-2 border-white" />}
                    </button>
                  );
                })}
              </div>

              {/* 🕹️ 액션 그룹 */}
              <div className="flex items-center justify-between w-full md:w-auto gap-3 md:gap-4 border-t md:border-0 pt-3 md:pt-0">
                <div className="flex items-center space-x-2">
                  <button onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))} disabled={currentIndex === 0} className="w-10 h-10 md:w-12 md:h-12 bg-midnight/5 rounded-xl flex items-center justify-center disabled:opacity-10 hover:bg-midnight/10 transition-all text-midnight dark:text-white">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M15 18l-6-6 6-6"/></svg>
                  </button>
                  <button onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))} disabled={currentIndex === questions.length - 1} className="w-10 h-10 md:w-12 md:h-12 bg-midnight/5 rounded-xl flex items-center justify-center disabled:opacity-10 hover:bg-midnight/10 transition-all text-midnight dark:text-white">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M9 18l6-6-6-6"/></svg>
                  </button>
                </div>
                
                <button 
                  onClick={() => onFinish({ questions, answers, year, subject })}
                  className="flex-1 md:flex-none px-6 md:px-10 py-3 md:py-3.5 bg-midnight text-gold rounded-xl md:rounded-2xl font-black text-sm md:text-base shadow-xl hover:scale-105 active:scale-95 transition-all uppercase tracking-widest"
                >
                  최종 채점
                </button>
              </div>

           </div>
        </div>
      </footer>

      {/* 🔍 Exit Confirmation Modal */}
      <AnimatePresence>
        {showExitConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowExitConfirm(false)} className="absolute inset-0 bg-midnight/80 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className={`relative w-full max-w-md rounded-[2.5rem] p-10 md:p-12 text-center space-y-8 md:space-y-10 ${isDarkMode ? 'bg-midnight border border-white/10 text-white' : 'bg-white text-midnight'}`}>
              <h3 className="text-xl md:text-2xl font-black tracking-tight leading-tight">시험을 종료할까요?</h3>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setShowExitConfirm(false)} className="py-3 md:py-4 rounded-xl font-black opacity-40">취소</button>
                <button onClick={onBack} className="py-3 md:py-4 bg-red-500 text-white rounded-xl font-black shadow-lg">종료</button>
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
    </div>
  );
};

export default FullExamPage;
