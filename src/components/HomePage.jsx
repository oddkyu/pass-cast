import React from 'react';
import { motion } from 'framer-motion';

const HomePage = ({ onStartQuiz, onTabClick }) => {
  const studyStatus = {
    todayProgress: 65,
    completedCount: 13,
    totalCount: 20,
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex-1 flex flex-col"
    >
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <h1 className="text-2xl font-black tracking-tighter text-pass-brand-blue">
          pass-cast
        </h1>
        <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.72V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.17a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
        </button>
      </header>

      <main className="flex-1 px-6 py-6 space-y-8 overflow-y-auto">
        <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h2 className="text-gray-500 text-sm font-medium mb-1">오늘의 학습 현황</h2>
              <p className="text-2xl font-bold text-gray-800">합격까지 한 걸음 더! 🚀</p>
            </div>
            <span className="text-pass-brand-blue font-bold text-lg">{studyStatus.todayProgress}%</span>
          </div>
          <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-pass-brand-blue rounded-full" style={{ width: `${studyStatus.todayProgress}%` }}></div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-4">
          <button 
            onClick={onStartQuiz}
            className="w-full bg-blue-500 text-white p-8 rounded-[2.5rem] shadow-lg shadow-blue-100 flex flex-col items-center text-center active:scale-95 transition-transform"
          >
            <span className="text-4xl mb-3">⚡</span>
            <span className="text-2xl font-bold">15분 컷 퀴즈 시작</span>
            <span className="mt-1 text-blue-100 text-sm">빠르게 핵심만 짚고 넘어가요</span>
          </button>

          <button className="w-full bg-purple-500 text-white p-8 rounded-[2.5rem] shadow-lg shadow-purple-100 flex flex-col items-center text-center active:scale-95 transition-transform">
            <span className="text-4xl mb-3">🎧</span>
            <span className="text-2xl font-bold">AI 오디오 복습 듣기</span>
            <span className="mt-1 text-purple-100 text-sm">이동하면서 귀로 공부하세요</span>
          </button>

          <button 
            onClick={onGoToLanding}
            className="w-full bg-gradient-to-r from-amber-400 to-orange-400 text-slate-900 p-8 rounded-[2.5rem] shadow-lg shadow-amber-100 flex flex-col items-center text-center active:scale-95 transition-transform"
          >
            <span className="text-4xl mb-3">👑</span>
            <span className="text-2xl font-bold">프리미엄 합격 패스</span>
            <span className="mt-1 text-amber-900/60 text-sm">모든 기능을 무제한으로 이용하세요</span>
          </button>
        </div>
      </main>

      <nav className="sticky bottom-0 bg-white/90 backdrop-blur-lg border-t border-gray-100 px-6 py-3 flex justify-between items-center">
        <TabItem icon="🏠" label="홈" active />
        <TabItem icon="📓" label="오답노트" />
        <TabItem icon="📊" label="통계" />
        <TabItem icon="👤" label="마이" />
      </nav>
    </motion.div>
  );
};

const TabItem = ({ icon, label, active = false }) => (
  <button className={`flex flex-col items-center space-y-1 ${active ? 'text-pass-brand-blue' : 'text-gray-400'}`}>
    <span className="text-xl">{icon}</span>
    <span className="text-xs font-medium">{label}</span>
  </button>
);

export default HomePage;
