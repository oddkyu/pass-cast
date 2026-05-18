import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import MemoSheet from './MemoSheet';
import AdSense from './AdSense';

// DB에 저장된 수학 기호 마커($)를 일반 텍스트로 자연스럽게 변환
const formatMathText = (text) => {
  if (typeof text !== 'string') return text;
  // 1. DB의 수식 마커($) 제거
  let formatted = text.replace(/\$([^\$]+)\$/g, '$1');
  // 2. 이스케이프된 문자열 '\n'을 실제 줄바꿈 문자로 변환
  formatted = formatted.replace(/\\n/g, '\n');
  return formatted;
};

const renderBeautifulExplanation = (explanation, isDarkMode) => {
  if (!explanation) return null;
  
  const lines = explanation.split('\n');
  
  let currentSection = 'normal'; // 'normal', 'feedback', 'summary'
  let normalBlocks = [];
  let feedbackLines = [];
  let summaryLines = [];
  
  for (let line of lines) {
    const trimmed = line.trim();
    
    if (trimmed.includes('(오답 피드백):') || trimmed.includes('(오답 피드백)') || trimmed.includes('오답 피드백')) {
      currentSection = 'feedback';
      continue;
    } else if (trimmed.includes('💡 합격자 핵심 요약:') || trimmed.includes('💡 합격자 핵심 요약') || trimmed.includes('합격자 핵심 요약')) {
      currentSection = 'summary';
      continue;
    }
    
    if (currentSection === 'normal') {
      normalBlocks.push(line);
    } else if (currentSection === 'feedback') {
      feedbackLines.push(line);
    } else if (currentSection === 'summary') {
      summaryLines.push(line);
    }
  }
  
  return (
    <div className="space-y-8 text-[15px] md:text-[18px] leading-relaxed font-normal mt-4 text-left">
      {/* 1. 일반 설명 구역 */}
      {normalBlocks.length > 0 && (
        <div className={`space-y-4 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
          {normalBlocks.map((line, idx) => {
            const trimmed = line.trim();
            if (!trimmed) return <div key={idx} className="h-2" />;
            return (
              <p key={idx} className="break-keep leading-relaxed font-medium opacity-90">
                {line}
              </p>
            );
          })}
        </div>
      )}
      
      {/* 2. 오답 피드백 구역 */}
      {feedbackLines.length > 0 && (
        <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-white/[0.03] border-white/5 text-slate-300' : 'bg-slate-50 border-slate-200/80 text-slate-600'}`}>
          <h5 className="font-black text-base md:text-lg mb-3 flex items-center gap-2 text-red-500/80">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            오답 피드백
          </h5>
          <div className="space-y-2">
            {feedbackLines.map((line, idx) => {
              const trimmed = line.trim();
              if (!trimmed) return null;
              const isBullet = trimmed.startsWith('-') || trimmed.startsWith('*');
              return (
                <p key={idx} className={`break-keep leading-relaxed ${isBullet ? 'pl-4 -indent-4 opacity-80' : 'opacity-90'}`}>
                  {line}
                </p>
              );
            })}
          </div>
        </div>
      )}
      
      {/* 3. 합격자 핵심 요약 구역 (황금빛 골드 카드로 프리미엄하게 강조!) */}
      {summaryLines.length > 0 && (
        <div className={`p-6 md:p-8 rounded-[2rem] border-2 shadow-lg ${
          isDarkMode 
            ? 'bg-gold/5 border-gold/20 text-gold shadow-gold/5' 
            : 'bg-gold/5 border-gold/30 text-midnight shadow-gold/5'
        }`}>
          <h5 className="font-black text-[16px] md:text-[20px] mb-3 flex items-center gap-2 text-gold">
            💡 합격자 핵심 요약
          </h5>
          <div className="space-y-2 font-bold text-[15px] md:text-[19px]">
            {summaryLines.map((line, idx) => {
              const trimmed = line.trim();
              if (!trimmed) return null;
              return (
                <p key={idx} className="break-keep leading-relaxed">
                  {line}
                </p>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const FullExamPage = ({ 
  year, 
  subject, 
  isDarkMode, 
  onBack, 
  onFinish, 
  isPremium = false,
  mode = 'practice',
  userAnswers = {},
  user = null,
  isRoutine = false,
  setIndex = null,
  savedMemo = '',
  initialQuestions = null,
  onlyMistakes = false,
  enableMemo = true,
  appSettings = {},
  setShowGatingModal
}) => {
  const [questions, setQuestions] = useState(initialQuestions || []);
  const [isLoading, setIsLoading] = useState(!initialQuestions || initialQuestions.length === 0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState(mode === 'review' ? userAnswers : {});
  const [memo, setMemo] = useState(mode === 'review' ? savedMemo : '');
  const [submitting, setSubmitting] = useState(false);
  const [heldQuestions, setHeldQuestions] = useState(new Set());
  const [timeLeft, setTimeLeft] = useState(isRoutine ? 12 * 60 : 50 * 60);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [isMemoOpen, setIsMemoOpen] = useState(false);
  const isReviewMode = mode === 'review';
  const showAds = appSettings?.show_ads && !isPremium;
  const questionTopRef = useRef(null);
  const navContainerRef = useRef(null);

  const handleSetCurrentIndex = (newIndex) => {
    if (newIndex !== currentIndex) {
      // force_gating이 켜져 있고 비프리미엄인 경우 5의 배수 번째 문항 이동 시 결제창 강제 노출
      if (appSettings?.force_gating && !isPremium && newIndex > 0 && newIndex % 5 === 0) {
        setShowGatingModal(true);
      }
      setCurrentIndex(newIndex);
    }
  };

  // Fetch Questions from Supabase
  const fetchQuestions = async () => {
    setIsLoading(true);
    console.log(`Fetching questions for: Year=${year}, Subject=${subject}, Routine=${isRoutine}, Set=${setIndex}`);
    
    try {
      // 1. 해당 연도의 시험 ID(exam_id) 가져오기
      const { data: examData, error: examError } = await supabase
        .from('exams')
        .select('id')
        .eq('year', year);
      
      if (examError || !examData || examData.length === 0) {
        console.error('Exam ID fetch error:', examError, examData);
        throw new Error(`해당 연도(${year})의 시험 정보를 찾을 수 없습니다.`);
      }

      const examIds = examData.map(e => e.id);

      // 2. 과목명 별칭 대응 (공백 제거, 특수 명칭 등)
      const pureSubject = subject.replace(/\s/g, '');
      const subjectVariants = [subject, pureSubject];
      
      // 구체적인 과목명 변형 추가
      if (pureSubject.includes('부동산학개론')) subjectVariants.push('학개론');
      if (pureSubject.includes('민법')) subjectVariants.push('민법및민사특별법', '민법 및 민사특별법');
      if (pureSubject.includes('공인중개사법')) subjectVariants.push('공인중개사법 및 중개실무', '중개사법');
      if (pureSubject.includes('부동산공법')) subjectVariants.push('공법');
      if (pureSubject.includes('공시법')) subjectVariants.push('부동산공시법', '부동산공시법및세법', '공인중개사');

      console.log('Querying with subject variants:', subjectVariants);

      let query = supabase
        .from('questions')
        .select('*')
        .in('exam_id', examIds)
        .in('subject', subjectVariants)
        .order('number', { ascending: true });

      if (isRoutine && setIndex !== null) {
        const start = setIndex * 10;
        const end = start + 9;
        query = query.range(start, end);
      }

      const { data, error } = await query;

      if (error) throw error;
      if (!data || data.length === 0) {
        alert('준비된 시험 데이터가 없습니다. 메인으로 이동합니다.');
        window.location.replace('/');
        return;
      }

      if (isReviewMode && onlyMistakes) {
        // userAnswers가 fetch 시점의 answers state에 아직 반영되지 않았을 수 있으므로 직접 사용
        const targetAnswers = userAnswers || {};
        const filtered = data.filter((q, idx) => String(targetAnswers[idx]) !== String(q.answer));
        setQuestions(filtered);
      } else {
        setQuestions(data);
      }
    } catch (err) {
      console.error('Error fetching exam questions:', err);
      alert(err.message || '데이터를 불러오는 중 오류가 발생했습니다.');
      window.location.replace('/');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuestions && initialQuestions.length > 0) {
      setQuestions(initialQuestions);
      setIsLoading(false);
    } else {
      fetchQuestions();
    }
  }, [year, subject, setIndex, initialQuestions]);

  useEffect(() => {
    if (isReviewMode) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isReviewMode]);

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

  // 하단 문항 번호 네비게이션 바 자동 스크롤
  useEffect(() => {
    if (navContainerRef.current) {
      const activeBtn = navContainerRef.current.children[currentIndex];
      if (activeBtn) {
        activeBtn.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    }
  }, [currentIndex]);

  const handleSelectAnswer = (idx) => {
    if (isReviewMode) return;
    setAnswers(prev => ({ ...prev, [currentIndex]: idx }));
    if (currentIndex < questions.length - 1) {
      setTimeout(() => setCurrentIndex(prev => prev + 1), 300);
    }
  };

  const toggleHold = (idx) => {
    if (isReviewMode) return;
    setHeldQuestions(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className={`flex-1 flex flex-col items-center justify-center min-h-screen ${isDarkMode ? 'bg-midnight text-white' : 'bg-offwhite text-midnight'}`}>
        <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin mb-6"></div>
        <p className="text-xl font-black tracking-tight">시험지를 불러오는 중입니다...</p>
      </div>
    );
  }

  if (!questions || questions.length === 0) return null;
  const currentQuestion = questions[currentIndex];
  if (!currentQuestion) return null;

  const isCorrect = answers[currentIndex] === currentQuestion.answer;

  return (
    <div className={`min-h-screen flex flex-col transition-all duration-500 noise-texture pb-28 md:pb-32 ${isDarkMode ? 'mesh-bg text-white' : 'bg-offwhite text-midnight'}`}>
      
      {/* 🏛️ Compact Header */}
      <header className={`sticky top-0 z-50 border-b flex items-center justify-between px-6 md:px-8 h-16 md:h-20 transition-all ${isDarkMode ? 'bg-midnight/95 border-white/5 backdrop-blur-3xl' : 'bg-white border-slate-200 shadow-sm'}`}>
        <div className="flex items-center space-x-4 md:space-x-6">
          <button onClick={() => isReviewMode ? onBack() : setShowExitConfirm(true)} className="w-9 h-9 md:w-11 md:h-11 border border-gold/30 rounded-xl flex items-center justify-center text-gold hover:bg-gold/10 transition-all">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <div className="flex flex-col">
             <div className="flex items-center space-x-2">
               <span className="px-2 py-0.5 bg-gold/10 text-gold text-[9px] font-black rounded-md border border-gold/20 uppercase tracking-widest">{year}년</span>
               <span className="text-[10px] md:text-[11px] font-black text-gold/60 uppercase tracking-[0.2em]">{subject}</span>
             </div>
             <h1 className="text-sm md:text-xl font-black tracking-tighter mt-0.5">{isReviewMode ? '오답 분석 리뷰' : '기출 실전 시험'}</h1>
          </div>
        </div>

        {/* 🏛️ Center: Question Stats & Timer (Moved to Center) */}
        <div className="flex items-center">
           <div className={`flex items-center px-4 md:px-6 py-2 md:py-2.5 rounded-full font-black text-[12px] md:text-sm border shadow-lg space-x-3 md:space-x-4 bg-midnight border-gold/30 text-gold`}>
              <div className={`flex items-center space-x-1.5 md:space-x-2 border-r pr-3 md:pr-4 border-gold/20`}>
                 <span className="text-[9px] md:text-[10px] opacity-40 uppercase font-black tracking-tighter">Q</span>
                 <span className="text-sm md:text-base">{currentIndex + 1}</span>
                 <span className="text-[9px] md:text-[10px] opacity-40">/ {questions.length}</span>
              </div>
              <div className="flex items-center space-x-1.5 md:space-x-2">
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                 <span className="tabular-nums">{isReviewMode ? '리뷰 중' : formatTime(timeLeft)}</span>
              </div>
           </div>
        </div>

        {/* 🏛️ Right: Logo (Moved to Right) */}
        <div className="hidden md:flex items-center gap-2 cursor-pointer shrink-0" onClick={onBack}>
          <div className="w-8 h-8 bg-gold rounded-lg flex items-center justify-center shadow-lg shadow-gold/20">
            <span className="text-midnight font-black text-sm">P</span>
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-black tracking-tighter uppercase text-[12px]">Pass-Cast</span>
            <span className="text-[7px] font-bold text-gold uppercase tracking-widest">Premium</span>
          </div>
        </div>
       {/* 📊 Progress Bar (Daily Routine & Full Exam) */}
       <div className="absolute bottom-0 left-0 w-full h-1.5 bg-midnight/5 overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            className={`h-full ${isReviewMode ? 'bg-green-500' : 'bg-gold shadow-[0_0_10px_rgba(212,175,55,0.5)]'}`}
          />
       </div>
      </header>

      <main className={`flex-1 w-full px-5 py-6 md:py-12 space-y-6 md:space-y-12 transition-all duration-500
        ${isMemoOpen ? 'lg:max-w-3xl lg:ml-12 lg:mr-auto' : 'max-w-4xl mx-auto'}
      `}>
        <div ref={questionTopRef} className="scroll-mt-36" />

        {/* 📢 문제지 상단 광고 (모바일 & PC 공통) */}
        <AdSense key={currentQuestion?.id} isPremium={isPremium} isDarkMode={isDarkMode} placement="top" />

        <section className="space-y-6 md:space-y-8">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start space-x-3 md:space-x-4">
                    <span className="shrink-0 w-8 h-8 md:w-10 md:h-10 mt-0.5 md:mt-1 rounded-xl bg-gold flex items-center justify-center text-midnight font-black text-sm md:text-lg shadow-lg shadow-gold/20">Q</span>
                    <h2 className={`text-[17px] md:text-[25px] font-black tracking-tight leading-[1.4] break-keep whitespace-pre-line ${isDarkMode ? 'text-white' : 'text-midnight'}`}>
                      <span className="text-gold mr-2">{currentQuestion?.number}.</span>
                      {formatMathText(currentQuestion?.title)}
                    </h2>
                  </div>
                  {mode === 'review' && (
                    <div className={`px-4 py-1.5 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest self-start md:self-auto ${isCorrect ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                      {isCorrect ? '정답' : '오답'}
                    </div>
                  )}
           </div>
           
             {currentQuestion?.content_box?.length > 0 && (
               <div className={`mt-6 md:mt-8 p-4 md:p-10 rounded-2xl md:rounded-3xl border relative transition-all duration-500 ${isDarkMode ? 'bg-white/[0.03] border-white/10' : 'bg-slate-50/50 border-slate-200'}`}>
                 <div className="absolute -top-3 left-6 md:left-10 px-3 md:px-4 py-0.5 md:py-1 bg-midnight text-gold text-[10px] md:text-[11px] font-black rounded-full uppercase tracking-[0.2em] shadow-lg border border-gold/20">보기</div>
                 <div className="space-y-3 md:space-y-4">
                   {currentQuestion.content_box.map((line, idx) => (
                     <p 
                       key={idx} 
                       className={`text-[14px] md:text-[19px] leading-relaxed break-keep font-bold whitespace-pre-line ${isDarkMode ? 'text-white/80' : 'text-midnight/70'}`}
                     >
                       {formatMathText(line)}
                     </p>
                   ))}
                 </div>
               </div>
             )}
        </section>

        <section className="grid grid-cols-1 gap-3 md:gap-5">
          {currentQuestion.options.map((opt, idx) => {
            return (
                  <button
                    key={idx}
                    onClick={() => !isReviewMode && handleSelectAnswer(idx + 1)}
                    className={`group w-full p-4 md:p-8 rounded-[1.5rem] md:rounded-[3rem] border-2 text-left transition-all duration-500 flex items-start space-x-3 md:space-x-6 min-h-[60px] md:min-h-[80px]
                      ${isReviewMode 
                        ? (idx + 1 === currentQuestion?.answer ? 'border-green-500 bg-green-500/5' : (answers[currentIndex] === idx + 1 ? 'border-red-500 bg-red-500/5' : 'border-transparent opacity-40'))
                        : (answers[currentIndex] === idx + 1 ? 'border-gold bg-gold/5 shadow-2xl shadow-gold/10' : 'border-transparent hover:border-gold/30')
                      }
                      ${isDarkMode ? 'bg-white/5' : 'bg-white shadow-sm'}
                    `}
                  >
                    <div className={`w-8 h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center font-black text-sm md:text-xl shrink-0 transition-all duration-500 mt-0.5 md:mt-1
                      ${answers[currentIndex] === idx + 1 ? 'bg-gold text-midnight' : (isDarkMode ? 'bg-white/10 text-white/40' : 'bg-slate-100 text-slate-400')}
                      ${isReviewMode && idx + 1 === currentQuestion?.answer ? 'bg-green-500 text-white' : ''}
                      ${isReviewMode && answers[currentIndex] === idx + 1 && idx + 1 !== currentQuestion?.answer ? 'bg-red-500 text-white' : ''}
                    `}>
                      {idx + 1}
                    </div>
                    <span className={`text-[15px] md:text-[20px] font-bold leading-relaxed break-keep whitespace-pre-line pt-1 md:pt-2 ${answers[currentIndex] === idx + 1 ? 'text-gold' : ''} ${isReviewMode && idx + 1 === currentQuestion?.answer ? 'text-green-500' : ''}`}>
                      {formatMathText(opt)}
                    </span>
                  </button>
            );
          })}
        </section>

        {/* 🧭 Content Navigation Buttons (보기 하단 배치) */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t border-black/5 dark:border-white/5">
           <button 
             onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
             disabled={currentIndex === 0}
             className="group flex items-center space-x-3 px-8 py-4 bg-gold/10 hover:bg-gold text-gold hover:text-midnight border border-gold/30 rounded-2xl transition-all duration-300 disabled:opacity-0"
           >
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="group-hover:-translate-x-1 transition-transform"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
             <span className="text-base md:text-lg font-black uppercase tracking-widest">이전 문제로</span>
           </button>
           
           <button 
             onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
             disabled={currentIndex === questions.length - 1}
             className="group flex items-center space-x-3 px-8 py-4 bg-gold/10 hover:bg-gold text-gold hover:text-midnight border border-gold/30 rounded-2xl transition-all duration-300 disabled:opacity-30"
           >
             <span className="text-base md:text-lg font-black uppercase tracking-widest">다음 문제로</span>
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="group-hover:translate-x-1 transition-transform"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
           </button>
        </div>

        {isReviewMode && (
          <section className={`rounded-[2.5rem] p-10 md:p-12 border-l-8 border-gold shadow-2xl space-y-6 ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-amber-50/50 border-amber-200'}`}>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center gap-4 text-gold">
                 <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
                 <h4 className="text-2xl font-black uppercase tracking-tight">문항 해설 및 분석</h4>
              </div>
              {currentQuestion?.explanation && !currentQuestion?.explanation_verified && (
                <div className="badge-ai w-fit">💡 AI 생성 해설 (검수 전)</div>
              )}
            </div>
            
            {currentQuestion?.explanation ? (
              renderBeautifulExplanation(formatMathText(currentQuestion.explanation), isDarkMode)
            ) : (
              <p className="text-lg md:text-xl font-bold leading-relaxed opacity-40 italic">
                현재 이 문항에 등록된 해설이 없습니다.
              </p>
            )}
          </section>
        )}




      </main>

      {/* 🧭 Re-designed Navigation Bar (Ultra-Compact) */}
      <footer className={`fixed bottom-0 left-0 w-full z-50 border-t transition-all ${isDarkMode ? 'bg-midnight/95 border-white/5 backdrop-blur-3xl' : 'bg-white border-slate-200 shadow-[0_-15px_50px_rgba(0,0,0,0.1)]'}`}>
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-3 md:py-4">
           <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              
              {/* 🔢 문항 칩 스트립 (자동 스크롤 및 가로 스크롤 강화) */}
              <div 
                ref={navContainerRef}
                className="w-full md:w-auto flex overflow-x-auto scrollbar-hide space-x-1.5 md:space-x-2 px-2 py-1 bg-midnight/5 rounded-xl md:rounded-2xl border border-white/5 scroll-smooth"
              >
                {questions.map((q, i) => {
                  const isSelected = currentIndex === i;
                  const isAnswered = answers[i] !== undefined;
                  const isItemHeld = heldQuestions.has(i);
                  return (
                    <button
                      key={i}
                      onClick={() => handleSetCurrentIndex(i)}
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
                  <button onClick={() => handleSetCurrentIndex(Math.max(0, currentIndex - 1))} disabled={currentIndex === 0} className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center disabled:opacity-10 transition-all ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-midnight/5 hover:bg-midnight/10 text-midnight'}`}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M15 18l-6-6 6-6"/></svg>
                  </button>
                  <button onClick={() => handleSetCurrentIndex(Math.min(questions.length - 1, currentIndex + 1))} disabled={currentIndex === questions.length - 1} className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center disabled:opacity-10 transition-all ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-midnight/5 hover:bg-midnight/10 text-midnight'}`}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M9 18l6-6-6-6"/></svg>
                  </button>
                </div>
                
                <button 
                  onClick={() => {
                    if (isReviewMode) {
                      onBack();
                    } else if (!submitting) {
                      setSubmitting(true);
                      
                      // 점수 계산
                      let correctCount = 0;
                      questions.forEach((q, idx) => {
                        if (String(answers[idx]) === String(q.answer)) correctCount++;
                      });
                      const calculatedScore = Math.round(correctCount * (100 / questions.length));
                      
                      // 소요 시간 계산
                      const totalTime = isRoutine ? 12 * 60 : 50 * 60;
                      const spent = totalTime - timeLeft;

                      onFinish({ 
                        questions, 
                        answers, 
                        year, 
                        subject, 
                        memo,
                        score: calculatedScore,
                        isRoutine,
                        setIndex,
                        timeSpent: spent
                      });
                    }
                  }}
                  disabled={!isReviewMode && submitting}
                  className={`flex-1 md:flex-none px-6 md:px-10 py-3 md:py-3.5 bg-midnight text-gold rounded-xl md:rounded-2xl font-black text-sm md:text-base shadow-xl hover:scale-105 active:scale-95 transition-all uppercase tracking-widest ${(!isReviewMode && submitting) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isReviewMode ? '리뷰 종료' : (submitting ? '채점 중...' : '최종 채점')}
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
                <button onClick={() => { setShowExitConfirm(false); onBack(); }} className="py-3 md:py-4 bg-red-500 text-white rounded-xl font-black shadow-lg">종료</button>
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
      {enableMemo && (
        <MemoSheet 
          isDarkMode={isDarkMode} 
          memo={memo} 
          onMemoChange={setMemo} 
          isOpen={isMemoOpen}
          setIsOpen={setIsMemoOpen}
        />
      )}
    </div>
  );
};

export default FullExamPage;
