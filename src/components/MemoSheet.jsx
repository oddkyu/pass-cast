import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MemoSheet = ({ isDarkMode, memo, onMemoChange, isOpen, setIsOpen }) => {
  return (
    <>
      {/* 🔘 Floating Action Button (FAB) - 모바일에서 위치 정교화 */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-24 right-5 md:bottom-32 md:right-10 w-12 h-12 md:w-16 md:h-16 bg-gold rounded-full flex items-center justify-center shadow-[0_8px_30px_rgb(212,175,55,0.4)] z-[60] active:scale-90 hover:scale-105 transition-all duration-300 group ${isOpen ? 'lg:hidden' : ''}`}
        aria-label="메모장 열기"
      >
        <svg 
          width="20" height="20" md:width="24" md:height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" 
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
              className={`lg:hidden fixed inset-0 ${isDarkMode ? 'bg-black/70' : 'bg-midnight/50'} backdrop-blur-md z-[150]`}
            />
            
            {/* 📝 PC Sidebar Layout (lg 이상) - 더 슬림하고 세련되게 */}
            <motion.div
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className={`hidden lg:flex fixed right-6 top-1/2 -translate-y-1/2 w-72 h-[75vh] bg-white border rounded-[2.5rem] z-[160] flex-col overflow-hidden
                ${isDarkMode ? 'border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.6)] bg-midnight/95 backdrop-blur-3xl' : 'border-slate-200 shadow-[0_20px_60px_rgba(0,0,0,0.15)]'}
              `}
            >
              <div className="flex items-center justify-between px-6 pt-8 pb-4 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gold/10 rounded-lg flex items-center justify-center">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="3">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    </svg>
                  </div>
                  <h3 className={`text-sm md:text-base font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-midnight'}`}>학습 메모</h3>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className={`w-7 h-7 flex items-center justify-center rounded-full transition-colors ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-white/40 hover:text-white' : 'bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-midnight'}`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>
              <div className="flex-1 px-6 pb-8">
                <textarea
                  value={memo}
                  onChange={(e) => onMemoChange(e.target.value)}
                  placeholder="중요한 내용을 기록하세요..."
                  className={`w-full h-full bg-transparent text-[16px] font-medium resize-none outline-none leading-relaxed scrollbar-hide ${isDarkMode ? 'text-white/90 placeholder:text-white/20' : 'text-midnight placeholder:text-slate-300'}`}
                  autoFocus
                />
              </div>
            </motion.div>

            {/* 📝 Mobile Bottom Sheet Layout (lg 미만) */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 32, stiffness: 350, mass: 0.7 }}
              drag="y"
              dragConstraints={{ top: 0 }}
              dragElastic={0.1}
              onDragEnd={(e, { offset, velocity }) => {
                if (offset.y > 100 || velocity.y > 400) {
                  setIsOpen(false);
                }
              }}
              className={`lg:hidden fixed bottom-0 left-0 right-0 h-[60vh] rounded-t-[2.5rem] z-[200] flex flex-col overflow-hidden
                ${isDarkMode ? 'bg-midnight/95 backdrop-blur-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] border-t border-white/10' : 'bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.1)]'}
              `}
            >
              <div className="w-12 h-1.5 bg-slate-300/30 rounded-full mx-auto mt-4 shrink-0" />
              <div className={`flex items-center justify-between px-8 py-5 shrink-0 border-b ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gold/10 rounded-lg flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="3">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    </svg>
                  </div>
                  <h3 className={`text-lg font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-midnight'}`}>학습 메모</h3>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className={`px-5 py-2 rounded-xl text-xs font-black transition-all uppercase tracking-widest ${isDarkMode ? 'bg-white/5 text-white/60' : 'bg-slate-100 text-midnight'}`}
                >
                  닫기
                </button>
              </div>

              <div className="flex-1 px-8 py-6">
                <textarea
                  value={memo}
                  onChange={(e) => onMemoChange(e.target.value)}
                  placeholder="메모를 입력하세요..."
                  className={`w-full h-full bg-transparent text-[17px] font-medium resize-none outline-none leading-relaxed scrollbar-hide ${isDarkMode ? 'text-white/90 placeholder:text-white/20' : 'text-midnight placeholder:text-slate-300'}`}
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
