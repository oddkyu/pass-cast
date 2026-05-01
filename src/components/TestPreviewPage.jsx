import React, { useState } from 'react';
import { motion } from 'framer-motion';

const TestPreviewPage = ({ isDarkMode, onBack }) => {
  const [role, setRole] = useState('guest'); // 'guest', 'free', 'premium'

  const isGuest = role === 'guest';
  const isPremium = role === 'premium';
  const showAds = !isPremium;

  const [showModal, setShowModal] = useState(false);

  return (
    <div className={`min-h-screen p-6 md:p-12 transition-all duration-500 ${isDarkMode ? 'bg-midnight text-white' : 'bg-offwhite text-midnight'}`}>
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="w-12 h-12 glass-button rounded-2xl flex items-center justify-center border border-current opacity-50 hover:opacity-100">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <h1 className="text-2xl font-black uppercase tracking-widest text-gold">UI 상태 테스트 랩</h1>
          <div className="w-12"></div>
        </div>

        {/* State Controllers */}
        <div className={`p-4 rounded-3xl flex flex-wrap gap-3 justify-center border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
          <button 
            onClick={() => { setRole('guest'); setShowModal(false); }}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${role === 'guest' ? 'bg-gold text-midnight scale-105 shadow-lg' : 'bg-transparent opacity-50 hover:opacity-100'}`}
          >
            [비회원] 상태
          </button>
          <button 
            onClick={() => { setRole('free'); setShowModal(false); }}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${role === 'free' ? 'bg-gold text-midnight scale-105 shadow-lg' : 'bg-transparent opacity-50 hover:opacity-100'}`}
          >
            [일반회원 (Free)] 상태
          </button>
          <button 
            onClick={() => { setRole('premium'); setShowModal(false); }}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${role === 'premium' ? 'bg-gold text-midnight scale-105 shadow-lg' : 'bg-transparent opacity-50 hover:opacity-100'}`}
          >
            [유료회원 (Premium)] 상태
          </button>
        </div>

        {/* Preview Sections */}
        <div className="space-y-6">
          
          {/* 1. 오답노트 가두리 */}
          <section className={`p-6 md:p-8 rounded-3xl border-2 ${isDarkMode ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-white'}`}>
            <h2 className="text-sm font-black opacity-50 uppercase tracking-widest mb-6">1. 오답노트 진입 (가두리 모달)</h2>
            <div className="flex flex-col items-center gap-6">
              <button 
                onClick={() => isGuest ? setShowModal(true) : alert('오답노트 페이지로 정상 진입합니다!')}
                className="px-8 py-4 bg-midnight text-gold rounded-2xl font-black hover:scale-105 transition-transform"
              >
                오답노트 클릭해보기
              </button>

              {/* Mock Modal Display */}
              {showModal && isGuest && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`w-full max-w-md p-8 rounded-3xl border text-center space-y-6 shadow-2xl ${isDarkMode ? 'bg-midnight border-white/20' : 'bg-white border-slate-300'}`}>
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto" style={{ backgroundColor: '#FEE500' }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="#191919"><path d="M12 3C6.48 3 2 6.58 2 11c0 2.83 1.72 5.3 4.33 6.82l-.9 3.35 3.87-2.55C10.04 18.87 11 19 12 19c5.52 0 10-3.58 10-8S17.52 3 12 3z"/></svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-black tracking-tight mb-2">합격자의 90%가 활용하는 오답노트!</h3>
                    <p className="text-sm font-bold opacity-50">1초 가입하고 나만의 오답 저장하기</p>
                  </div>
                  <button className="w-full py-4 rounded-xl font-black text-sm flex items-center justify-center gap-2" style={{ backgroundColor: '#FEE500', color: '#191919' }}>
                    카카오로 시작하기 (모의 버튼)
                  </button>
                  <button onClick={() => setShowModal(false)} className="text-xs font-bold opacity-40">닫기</button>
                </motion.div>
              )}
            </div>
          </section>

          {/* 2. AI 핵심 키워드 가이드 */}
          <section className={`p-6 md:p-8 rounded-3xl border-2 ${isDarkMode ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-white'}`}>
            <h2 className="text-sm font-black opacity-50 uppercase tracking-widest mb-6">2. 문제 하단 AI 핵심 키워드 가이드</h2>
            
            {isPremium ? (
              <div className={`rounded-2xl p-6 border-2 space-y-4 ${isDarkMode ? 'bg-gold/5 border-gold/20' : 'bg-amber-50 border-amber-200'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gold rounded-lg flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0a0a23" strokeWidth="2.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  </div>
                  <span className="text-sm font-black text-gold uppercase tracking-widest">AI 핵심 키워드 가이드</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className={`rounded-xl p-4 space-y-1 ${isDarkMode ? 'bg-white/5' : 'bg-white'}`}>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gold opacity-70">관련 법령</p>
                    <p className="text-sm font-bold">공인중개사법 §2 · 민법 §99</p>
                  </div>
                  <div className={`rounded-xl p-4 space-y-1 ${isDarkMode ? 'bg-white/5' : 'bg-white'}`}>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gold opacity-70">출제 포인트</p>
                    <p className="text-sm font-bold">중개대상물의 범위</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className={`rounded-2xl p-5 border border-dashed flex items-center gap-4 ${isDarkMode ? 'border-gold/20 bg-gold/3' : 'border-amber-200 bg-amber-50/50'}`}>
                <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-gold"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-gold">AI 핵심 키워드 가이드</p>
                  <p className="text-xs font-bold opacity-40">관련 법령 번호와 출제 포인트를 바로 확인하세요. Premium 전용 기능입니다.</p>
                </div>
              </div>
            )}
          </section>

          {/* 3. 하단 광고 영역 */}
          <section className={`p-6 md:p-8 rounded-3xl border-2 ${isDarkMode ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-white'}`}>
            <h2 className="text-sm font-black opacity-50 uppercase tracking-widest mb-6">3. 배너 광고 노출 여부</h2>
            
            {showAds ? (
              <div className={`w-full max-w-lg mx-auto aspect-[3/1] rounded-2xl flex flex-col items-center justify-center gap-2 border-2 border-dashed ${isDarkMode ? 'border-white/20 bg-white/5' : 'border-slate-300 bg-slate-100'}`}>
                <span className="text-xs font-bold opacity-40 uppercase tracking-widest">Advertisement</span>
                <span className="text-lg font-black opacity-20">구글 애드센스 배너 (Mock)</span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 gap-3">
                <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center text-gold">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
                </div>
                <p className="text-sm font-black text-gold">Premium 혜택으로 모든 광고가 제거되었습니다.</p>
              </div>
            )}
          </section>

        </div>
      </div>
    </div>
  );
};

export default TestPreviewPage;
