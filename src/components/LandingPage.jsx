import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LandingPage = ({ onBack }) => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const plans = [
    {
      id: 'free',
      name: '무료 체험',
      price: '0',
      description: '기출 학습의 시작',
      features: ['최근 1개년 기출 제공', '기본 회독 대시보드', '모바일 동기화'],
      buttonText: '체험 시작하기',
      highlight: false,
    },
    {
      id: 'monthly',
      name: '월간 다회독',
      price: '9,900',
      description: '가장 많은 합격생이 선택',
      features: ['전 과목 기출 무제한', 'AI 취약 구간 자동 반복', '실시간 오답 포인트 분석', '맞춤형 회독 스케줄러'],
      buttonText: '지금 결제하기',
      highlight: true,
      badge: 'POPULAR',
    },
    {
      id: 'lifetime',
      name: '합격 패스',
      price: '149,000',
      description: '합격의 끝까지 함께',
      features: ['평생 업데이트 보장', '프리미엄 요약집 증정', '1:1 학습 멘토링권', '오프라인 학습 모드'],
      buttonText: '평생 패스 신청',
      highlight: false,
    },
  ];

  const handlePaymentClick = (plan) => {
    console.log(`[PAYMENT] Plan: ${plan.name}, Price: ${plan.price}`);
    alert('결제 준비 중입니다. 잠시만 기다려주세요! (Mockup)');
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white font-['Pretendard_Variable',Pretendard,sans-serif] selection:bg-blue-500/30 overflow-x-hidden antialiased">
      {/* 고도화된 배경 효과 (Blue Glow) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-blue-600/10 blur-[180px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/10 blur-[150px] rounded-full" />
        <div className="absolute top-[30%] left-[50%] -translate-x-1/2 w-[40%] h-[40%] bg-cyan-500/5 blur-[120px] rounded-full" />
      </div>

      {/* 상단 헤더 */}
      <header className="px-6 md:px-12 py-8 flex justify-between items-center border-b border-white/5 sticky top-0 bg-[#020617]/80 backdrop-blur-2xl z-50">
        <div className="flex items-center space-x-3 group cursor-pointer" onClick={onBack}>
          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 via-blue-600 to-blue-800 rounded-2xl flex items-center justify-center font-black text-white italic shadow-[0_0_30px_rgba(37,99,235,0.3)] text-2xl group-hover:scale-110 transition-transform">P</div>
          <h1 className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">pass-cast</h1>
        </div>
        <button 
          onClick={onBack} 
          className="group px-7 py-3 rounded-full border border-white/10 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all text-sm font-black flex items-center space-x-2"
        >
          <span className="text-gray-400 group-hover:text-white">메인으로</span>
          <svg className="group-hover:translate-x-1 transition-transform" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"></path></svg>
        </button>
      </header>

      <main className="relative z-10 px-6 md:px-12 py-24 md:py-40 max-w-7xl mx-auto space-y-32 md:space-y-48">
        {/* 메인 히어로 */}
        <section className="text-center space-y-12 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center space-x-3 px-6 py-2.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-black tracking-widest uppercase"
          >
            <span className="w-2.5 h-2.5 bg-blue-500 rounded-full shadow-[0_0_10px_#3b82f6] animate-pulse" />
            <span>Problem Bank Science</span>
          </motion.div>
          
          <div className="space-y-8">
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.8 }}
              className="text-6xl md:text-8xl lg:text-[110px] font-black leading-[0.9] tracking-[ -0.05em]"
            >
              결국 합격은 <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400 drop-shadow-sm">기출 다회독</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-gray-400 text-xl md:text-3xl font-bold max-w-3xl mx-auto leading-relaxed"
            >
              무의미한 이론 공부는 이제 그만. <br className="hidden md:block" />
              시험에 나오는 것만 무한 반복하는 과학적 시스템.
            </motion.p>
          </div>
        </section>

        {/* 세 개의 가격 카드 */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 relative items-center">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1, duration: 0.7 }}
              whileHover={{ y: -20, transition: { duration: 0.2 } }}
              className={`relative p-10 md:p-14 rounded-[3.5rem] border transition-all duration-500 ${
                plan.highlight 
                ? 'bg-gradient-to-b from-[#0F172A] to-[#020617] border-blue-500 shadow-[0_30px_100px_rgba(37,99,235,0.25)] md:scale-110 z-20' 
                : 'bg-white/[0.02] border-white/10 hover:border-white/20 backdrop-blur-xl'
              }`}
            >
              {/* 강조 라인 (가운데 카드 전용) */}
              {plan.highlight && (
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent blur-[1px]" />
              )}
              
              {plan.badge && (
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-8 py-2.5 bg-blue-600 text-white text-sm font-black rounded-full shadow-[0_15px_35px_rgba(37,99,235,0.6)] tracking-widest">
                  {plan.badge}
                </div>
              )}

              <div className="space-y-12">
                <div className="space-y-3">
                  <h3 className={`text-3xl font-black ${plan.highlight ? 'text-blue-400' : 'text-white'}`}>{plan.name}</h3>
                  <p className="text-gray-400 text-lg font-bold">{plan.description}</p>
                </div>
                
                <div className="flex items-baseline space-x-2">
                  <span className="text-sm font-black text-blue-500/50 tracking-tighter uppercase">KRW</span>
                  <span className="text-6xl font-black tracking-tighter">₩{plan.price}</span>
                  {plan.id === 'monthly' && <span className="text-xl font-bold text-gray-600">/월</span>}
                </div>

                <ul className="space-y-6 pt-10 border-t border-white/5">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start space-x-4 text-[18px] font-bold leading-tight group/item">
                      <span className="flex-shrink-0 mt-0.5 text-blue-500 text-xl group-hover/item:scale-125 transition-transform">✅</span>
                      <span className={plan.highlight ? 'text-blue-50' : 'text-gray-300'}>{feature}</span>
                    </li>
                  ))}
                </ul>

                <motion.button
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: plan.highlight ? "0 0 60px rgba(251, 191, 36, 0.6)" : "none"
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handlePaymentClick(plan)}
                  className={`w-full py-6 rounded-[2.5rem] font-black text-2xl transition-all shadow-2xl relative overflow-hidden group ${
                    plan.highlight
                    ? 'bg-amber-400 text-slate-900 shadow-[0_20px_50px_rgba(251,191,36,0.4)]'
                    : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {/* Glow/Shimmer Effect */}
                  {plan.highlight && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-shimmer" />
                  )}
                  {plan.buttonText}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </section>

        {/* '왜 다회독인가' 섹션 */}
        <section className="max-w-4xl mx-auto text-center space-y-16 py-20 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
          <div className="space-y-8">
            <h3 className="text-4xl md:text-6xl font-black tracking-tight">이론에 속지 마세요</h3>
            <p className="text-xl md:text-3xl text-gray-400 leading-relaxed font-bold">
              시험장에 들고 갈 수 있는 것은 <br className="hidden md:block" />
              머릿속에 새겨진 <span className="text-blue-500 underline decoration-blue-500/20 underline-offset-8">기출 지문의 잔상</span>뿐입니다. <br />
              다회독만이 유일한 정답인 이유입니다.
            </p>
          </div>
        </section>

        {/* 하단 신뢰 아이콘 섹션 */}
        <section className="pt-24 border-t border-white/5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="space-y-6 group">
              <div className="w-24 h-24 mx-auto rounded-3xl bg-white/[0.03] flex items-center justify-center text-4xl group-hover:bg-blue-600/10 group-hover:scale-110 transition-all border border-white/5">🛡️</div>
              <div className="space-y-2">
                <h4 className="text-xl font-black text-gray-200">개인정보 보호</h4>
                <p className="text-gray-500 font-bold">AES-256 암호화 적용</p>
              </div>
            </div>
            <div className="space-y-6 group">
              <div className="w-24 h-24 mx-auto rounded-3xl bg-white/[0.03] flex items-center justify-center text-4xl group-hover:bg-blue-600/10 group-hover:scale-110 transition-all border border-white/5">💳</div>
              <div className="space-y-2">
                <h4 className="text-xl font-black text-gray-200">간편 결제</h4>
                <p className="text-gray-500 font-bold">카드 및 각종 페이 지원</p>
              </div>
            </div>
            <div className="space-y-6 group">
              <div className="w-24 h-24 mx-auto rounded-3xl bg-white/[0.03] flex items-center justify-center text-4xl group-hover:bg-blue-600/10 group-hover:scale-110 transition-all border border-white/5">✅</div>
              <div className="space-y-2">
                <h4 className="text-xl font-black text-gray-200">7일 환불 보장</h4>
                <p className="text-gray-500 font-bold">사용 전 100% 환불 가능</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 푸터 */}
      <footer className="py-24 text-center border-t border-white/5 bg-black/20">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="flex flex-col items-center space-y-6">
             <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center font-black text-gray-500 italic text-2xl">P</div>
             <p className="text-gray-500 font-black tracking-widest text-sm uppercase">© 2026 pass-cast Corp. All Rights Reserved.</p>
          </div>
          <div className="text-gray-700 text-xs font-bold max-w-3xl mx-auto space-y-2">
            <p>본 사이트의 콘텐츠는 저작권법의 보호를 받습니다. 무단 전재 및 재배포를 금지합니다.</p>
            <p>서울특별시 강남구 테헤란로 1234 패스캐스트 타워 | 대표자: 합격이 | 사업자등록번호: 123-45-67890</p>
            <p>통신판매업신고: 제2026-서울강남-0000호 | 고객센터: 1588-0000 | privacy@pass-cast.com</p>
          </div>
        </div>
      </footer>

      {/* Tailwind 전용 애니메이션 스타일 주입 */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 1.2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
