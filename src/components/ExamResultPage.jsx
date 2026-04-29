import React from 'react';

const ExamResultPage = ({ result, isDarkMode, onHome, onRetry }) => {
  if (!result || !result.questions) {
    return <div className="p-20 text-center font-bold">데이터를 찾을 수 없습니다.</div>;
  }

  const { questions, answers, year, subject } = result;
  
  let correctCount = 0;
  questions.forEach((q, idx) => {
    if (answers[idx] === q.answer) {
      correctCount++;
    }
  });

  const score = correctCount * (100 / questions.length);
  const isPass = score >= 60;

  return (
    <div className={`min-h-screen p-8 md:p-20 flex flex-col items-center justify-center transition-all ${isDarkMode ? 'bg-midnight text-white' : 'bg-slate-50 text-midnight'}`}>
      <div className={`max-w-2xl w-full p-12 rounded-[3rem] text-center space-y-10 shadow-2xl ${isDarkMode ? 'bg-white/5 border border-white/10' : 'bg-white border border-slate-100'}`}>
        
        <div className="space-y-2">
          <span className="text-gold font-black tracking-widest uppercase text-sm">{year} 기출 결과</span>
          <h1 className="text-3xl md:text-4xl font-black">{subject}</h1>
        </div>

        <div className="py-10">
          <div className={`text-[100px] md:text-[140px] font-black leading-none ${isPass ? 'text-gold' : 'text-slate-400'}`}>
            {score}
            <span className="text-3xl ml-2">점</span>
          </div>
          <p className="text-xl font-bold mt-4 opacity-60">
            {isPass ? "🎉 축하합니다! 합격권입니다." : "💪 조금만 더 힘내세요! 다음엔 합격입니다."}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={onRetry}
            className="p-6 bg-slate-200 text-midnight rounded-2xl font-black hover:bg-slate-300 transition-all"
          >
            다시 풀기
          </button>
          <button 
            onClick={onHome}
            className="p-6 bg-midnight text-gold rounded-2xl font-black hover:scale-105 transition-all"
          >
            홈으로 이동
          </button>
        </div>
      </div>
      
      <div className="mt-12 text-[10px] font-black opacity-20 tracking-widest">
        PASS-CAST RESULT REPORT
      </div>
    </div>
  );
};

export default ExamResultPage;
