import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const QuizPage = ({ onBack }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);

  const sampleQuestion = {
    id: 1,
    category: "공인중개사법",
    question: "공인중개사법령상 중개대상물에 해당하지 않는 것을 모두 고른 것은?",
    options: [
      "토지",
      "건축물 및 그 밖의 토지의 정착물",
      "입목에 관한 법률에 따른 입목",
      "공장 및 광업재단 저당법에 따른 공장재단",
      "20톤 이상의 선박"
    ],
    answer: 4, // index 4 (20톤 이상의 선박)
  };

  const handleSelect = (index) => {
    if (selectedOption !== null) return;
    setSelectedOption(index);
    setIsCorrect(index === sampleQuestion.answer);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="flex-1 flex flex-col bg-white"
    >
      {/* Quiz Header */}
      <header className="flex items-center px-6 py-4 border-b border-gray-50">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-gray-100">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div className="ml-2">
          <span className="text-xs font-bold text-pass-brand-blue uppercase tracking-wider">{sampleQuestion.category}</span>
          <h1 className="text-sm font-bold text-gray-400">15분 컷 퀴즈 (1/10)</h1>
        </div>
      </header>

      {/* Question */}
      <main className="flex-1 px-8 py-10 flex flex-col">
        <h2 className="text-2xl font-bold leading-tight text-gray-800 mb-12">
          {sampleQuestion.question}
        </h2>

        {/* Options */}
        <div className="space-y-3">
          {sampleQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleSelect(index)}
              disabled={selectedOption !== null}
              className={`w-full text-left p-5 rounded-2xl border-2 transition-all flex items-center group
                ${selectedOption === index 
                  ? (isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50') 
                  : (selectedOption !== null && index === sampleQuestion.answer ? 'border-green-500 bg-green-50' : 'border-gray-100 bg-gray-50 hover:border-gray-200 hover:bg-gray-100')
                }
              `}
            >
              <span className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 font-bold text-sm
                ${selectedOption === index 
                  ? (isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white') 
                  : (selectedOption !== null && index === sampleQuestion.answer ? 'bg-green-500 text-white' : 'bg-white text-gray-400 border border-gray-200')
                }
              `}>
                {index + 1}
              </span>
              <span className={`font-semibold ${selectedOption === index || (selectedOption !== null && index === sampleQuestion.answer) ? 'text-gray-900' : 'text-gray-600'}`}>
                {option}
              </span>
            </button>
          ))}
        </div>

        {/* Feedback Animation */}
        <AnimatePresence>
          {selectedOption !== null && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="mt-auto pt-8 text-center"
            >
              <div className={`inline-block px-8 py-4 rounded-full font-black text-xl shadow-xl
                ${isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}
              `}>
                {isCorrect ? '정답입니다! 🎉' : '아쉬워요, 정답은 5번! ✍️'}
              </div>
              <button 
                onClick={onBack}
                className="block w-full mt-6 py-4 bg-gray-900 text-white rounded-2xl font-bold text-lg hover:bg-black transition-colors"
              >
                다음 문제로 (준비 중)
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </motion.div>
  );
};

export default QuizPage;
