import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MemoSheet = () => {
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
      {/* 🔘 Floating Action Button (FAB) */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-28 right-6 md:bottom-32 md:right-10 w-14 h-14 md:w-16 md:h-16 bg-gold rounded-full flex items-center justify-center shadow-[0_8px_30px_rgba(212,175,55,0.4)] z-[60] active:scale-90 hover:scale-105 transition-all duration-300 group"
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
            {/* 🌫️ Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-midnight/60 backdrop-blur-sm z-[150]"
            />
            
            {/* 📝 Bottom Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300, mass: 0.8 }}
              drag="y"
              dragConstraints={{ top: 0 }}
              dragElastic={0.2}
              onDragEnd={(e, { offset, velocity }) => {
                // 일정 거리 이상 내리거나 속도가 빠르면 닫기
                if (offset.y > 100 || velocity.y > 400) {
                  setIsOpen(false);
                }
              }}
              className="fixed bottom-0 left-0 right-0 h-[60vh] bg-[#1a1a1a]/95 backdrop-blur-2xl rounded-t-[2.5rem] border-t border-white/10 z-[200] flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.5)] overflow-hidden"
            >
              {/* 🤚 Drag Handle & Header */}
              <div className="flex flex-col items-center pt-4 pb-2 shrink-0 cursor-grab active:cursor-grabbing">
                <div className="w-12 h-1.5 bg-white/20 rounded-full mb-4" />
                
                <div className="w-full flex items-center justify-between px-8">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gold/20 rounded-lg flex items-center justify-center">
                       <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="3">
                         <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                       </svg>
                    </div>
                    <h3 className="text-white text-lg font-black tracking-tight">메모장</h3>
                  </div>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="px-5 py-2 bg-white/5 hover:bg-white/10 active:scale-95 rounded-xl text-white/60 hover:text-white text-xs font-black transition-all uppercase tracking-widest border border-white/5"
                  >
                    닫기
                  </button>
                </div>
              </div>

              {/* ✍️ Textarea Area */}
              <div className="flex-1 px-8 pb-10 mt-2">
                <textarea
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="자유롭게 메모를 남기세요. 내용은 자동으로 저장됩니다."
                  className="w-full h-full bg-transparent text-white/90 text-[17px] md:text-lg font-medium resize-none outline-none placeholder:text-white/10 leading-relaxed scrollbar-hide"
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
