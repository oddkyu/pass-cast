import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MemoSheet = ({ isDarkMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [memo, setMemo] = useState('');

  // Load memo from localStorage on mount
  useEffect(() => {
    const savedMemo = localStorage.getItem('pass-cast-memo');
    if (savedMemo) setMemo(savedMemo);
  }, []);

  // Save memo to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('pass-cast-memo', memo);
  }, [memo]);

  return (
    <>
      {/* 🔘 Floating Action Button (FAB) - PC에서 열려있을 때는 숨김 */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-28 right-6 md:bottom-32 md:right-10 w-14 h-14 md:w-16 md:h-16 bg-gold rounded-full flex items-center justify-center shadow-2xl z-[60] active:scale-90 hover:scale-105 transition-all duration-300 group ${isOpen ? 'lg:hidden' : ''}`}
        aria-label="메모장 열기"
      >
        <svg 
          width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" 
          className="text-midnight group-hover:rotate-12 transition-transform"
        >
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* 🌫️ Backdrop (모바일 전용) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className={`lg:hidden fixed inset-0 ${isDarkMode ? 'bg-black/60' : 'bg-midnight/40'} backdrop-blur-sm z-[150]`}
            />
            
            {/* 📝 PC Sidebar Layout (lg 이상: 우측 빈 공간 활용) */}
            <motion.div
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className={`hidden lg:flex fixed right-8 top-1/2 -translate-y-1/2 w-80 h-[70vh] bg-white border rounded-[2.5rem] z-[160] flex-col overflow-hidden
                ${isDarkMode ? 'border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]' : 'border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.1)]'}
              `}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-8 pt-8 pb-4 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gold/10 rounded-lg flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="3">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    </svg>
                  </div>
                  <h3 className="text-midnight text-lg font-black tracking-tight">메모장</h3>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-midnight transition-colors"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>
              {/* Textarea */}
              <div className="flex-1 px-8 pb-8">
                <textarea
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="자유롭게 메모를 남기세요..."
                  className="w-full h-full bg-transparent text-midnight text-[17px] font-medium resize-none outline-none placeholder:text-slate-300 leading-relaxed scrollbar-hide"
                  autoFocus
                />
              </div>
            </motion.div>

            {/* 📝 Mobile Bottom Sheet Layout (lg 미만: 50% 높이) */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300, mass: 0.8 }}
              drag="y"
              dragConstraints={{ top: 0 }}
              dragElastic={0.1}
              onDragEnd={(e, { offset, velocity }) => {
                if (offset.y > 100 || velocity.y > 400) {
                  setIsOpen(false);
                }
              }}
              className={`lg:hidden fixed bottom-0 left-0 right-0 h-[50vh] bg-white rounded-t-[2.5rem] z-[200] flex flex-col overflow-hidden
                ${isDarkMode ? 'shadow-[0_-10px_40px_rgba(0,0,0,0.5)] border-t border-white/5' : 'shadow-[0_-10px_40px_rgba(0,0,0,0.1)]'}
              `}
            >
              {/* Fixed Header with Close Button (상시 노출) */}
              <div className="flex items-center justify-between px-8 py-5 shrink-0 border-b border-slate-100 bg-white sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gold/10 rounded-lg flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="3">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    </svg>
                  </div>
                  <h3 className="text-midnight text-lg font-black tracking-tight">메모장</h3>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="px-5 py-2 bg-slate-100 hover:bg-slate-200 active:scale-95 rounded-xl text-midnight text-xs font-black transition-all uppercase tracking-widest"
                >
                  닫기
                </button>
              </div>

              {/* Textarea Area */}
              <div className="flex-1 px-8 py-6">
                <textarea
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="메모를 입력하세요..."
                  className="w-full h-full bg-transparent text-midnight text-[17px] font-medium resize-none outline-none placeholder:text-slate-300 leading-relaxed scrollbar-hide"
                  autoFocus
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </>
  );
};

export default MemoSheet;
