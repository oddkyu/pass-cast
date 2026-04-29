import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

const QuizPage = ({ onBack }) => {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const [wrongQuestions, setWrongQuestions] = useState([]);

  const fetchRandomQuestions = async () => {
    if (!supabase) {
      console.error('Supabase client is not initialized. Please check your .env file.');
      setQuestions([
        {
          id: 0,
          subject: "설정 오류",
          question_text: "Supabase 설정이 누락되었습니다. .env 파일에 VITE_SUPABASE_URL과 VITE_SUPABASE_ANON_KEY가 있는지 확인해주세요.",
          options: ["확인"],
          answer: 0
        }
      ]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .limit(50);

      if (error) throw error;

      const shuffled = [...data].sort(() => 0.5 - Math.random());
      setQuestions(shuffled.slice(0, 5));
    } catch (err) {
      console.error('Error fetching questions:', err);
      setQuestions([
        {
          id: 0,
          subject: "에러 발생",
          question_text: "데이터를 불러오는 중 오류가 발생했습니다. .env 설정을 확인해주세요.",
          options: ["확인"],
          answer: 0
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRandomQuestions();
  }, []);

  const handleSelect = (index) => {
    if (selectedOption !== null) return;
    
    const currentQ = questions[currentIndex];
    const correct = index === currentQ.answer;
    
    setSelectedOption(index);
    setIsCorrect(correct);
    
    if (correct) {
      setScore(prev => prev + 1);
    } else {
      setWrongQuestions(prev => [...prev, currentQ]);
    }

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setSelectedOption(null);
        setIsCorrect(null);
      } else {
        setIsFinished(true);
      }
    }, 1500);
  };

  const handleRetryWrong = () => {
    setQuestions(wrongQuestions);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsCorrect(null);
    setScore(0);
    setWrongQuestions([]);
    setIsFinished(false);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-offwhite min-h-screen">
        <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin mb-6"></div>
        <p className="text-xl font-black text-midnight tracking-tight">문제를 엄선하고 있습니다...</p>
      </div>
    );
  }

  if (isFinished) {
    const isPerfect = score === questions.length;
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex-1 flex flex-col p-10 bg-offwhite min-h-screen items-center justify-center text-center"
      >
        <div className="w-32 h-32 glass-card rounded-full flex items-center justify-center text-6xl mb-10 shadow-2xl">
          {isPerfect ? '🏆' : '✨'}
        </div>
        <h2 className="text-3xl font-black text-midnight mb-3 tracking-tighter leading-tight">
          {isPerfect ? "완벽합니다, 사장님!" : "훌륭한 학습이었습니다!"}
        </h2>
        <p className="text-[20px] font-bold text-slate-400 mb-14">
          오늘 5문제를 모두 소화하셨습니다.
        </p>

        <div className="w-full space-y-4 max-w-sm">
          {wrongQuestions.length > 0 && (
            <button 
              onClick={handleRetryWrong}
              className="w-full py-6 bg-midnight text-gold rounded-[2rem] font-black text-xl shadow-2xl shadow-midnight/20 active:scale-95 transition-all"
            >
              오답 다시 풀기 ({wrongQuestions.length})
            </button>
          )}
          <button 
            onClick={onBack}
            className="w-full py-6 glass-card text-midnight rounded-[2rem] font-black text-xl active:scale-95 transition-all"
          >
            내 성적 확인하기
          </button>
        </div>
      </motion.div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="flex-1 flex flex-col bg-offwhite min-h-screen font-['Pretendard']">
      {/* Header */}
      <header className="px-8 py-8 flex items-center justify-between bg-offwhite/80 backdrop-blur-md sticky top-0 z-10">
        <button onClick={onBack} className="w-12 h-12 glass-button rounded-2xl flex items-center justify-center text-midnight">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <div className="flex flex-col items-center">
          <span className="text-[12px] font-black text-gold uppercase tracking-[0.2em] mb-2">{currentQuestion?.subject || '기출문제'}</span>
          <div className="flex space-x-2">
            {questions.map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 rounded-full transition-all duration-500 ${i === currentIndex ? 'w-10 bg-midnight' : i < currentIndex ? 'w-3 bg-midnight/20' : 'w-3 bg-slate-200'}`} 
              />
            ))}
          </div>
        </div>
        <div className="w-12" />
      </header>

      <main className="flex-1 flex flex-col px-8 py-10 max-w-2xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="glass-card rounded-[3rem] p-10 md:p-14 min-h-[500px] flex flex-col relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8">
               <span className="text-slate-200 font-black text-8xl opacity-20">0{currentIndex + 1}</span>
            </div>

            <h2 className="text-[24px] md:text-[28px] font-black leading-snug text-midnight mb-12 relative z-10 break-keep">
              {currentQuestion?.question_text}
            </h2>

            <div className="space-y-4 mt-auto relative z-10">
              {currentQuestion?.options.map((option, index) => {
                const isSelected = selectedOption === index;
                const isCorrectAns = index === currentQuestion.answer;
                
                let stateClass = "bg-white/50 border-slate-100 text-midnight hover:border-gold/30 hover:bg-white";
                if (selectedOption !== null) {
                  if (isSelected) {
                    stateClass = isCorrectAns ? "bg-midnight text-gold border-midnight shadow-2xl" : "bg-red-50 text-red-600 border-red-100";
                  } else if (isCorrectAns) {
                    stateClass = "border-gold bg-gold/5 text-gold font-black";
                  } else {
                    stateClass = "opacity-30 border-slate-50 text-slate-300";
                  }
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleSelect(index)}
                    disabled={selectedOption !== null}
                    className={`group w-full text-left p-6 md:p-8 rounded-[2rem] border-2 transition-all duration-300 flex items-center active:scale-[0.98] ${stateClass}`}
                  >
                    <span className={`w-10 h-10 rounded-full flex items-center justify-center mr-6 font-black text-lg transition-all ${isSelected ? 'bg-gold text-midnight' : 'bg-slate-50 text-slate-300 group-hover:bg-gold/10 group-hover:text-gold'}`}>
                      {index + 1}
                    </span>
                    <span className="flex-1 font-bold text-[20px] md:text-[22px] leading-tight">
                      {option}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="h-32 flex items-center justify-center">
          <AnimatePresence>
            {selectedOption !== null && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`font-black text-2xl tracking-tighter ${isCorrect ? 'text-gold' : 'text-red-500'}`}
              >
                {isCorrect ? '✨ 역시 대단하십니다!' : '✍️ 복습이 필요한 지문입니다'}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <style>{`
        .break-keep { word-break: keep-all; }
      `}</style>
    </div>
  );
};

export default QuizPage;
