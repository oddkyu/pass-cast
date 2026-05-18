import React, { useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AdSense = ({ isPremium, placement = 'default', isDarkMode }) => {
  useEffect(() => {
    if (isPremium) return;
    
    const recordImpression = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        await supabase
          .from('ad_impressions')
          .insert([{
            user_id: user?.id || null,
            placement: placement
          }]);
      } catch (err) {
        // 테이블이 존재하지 않거나 네트워크 오류 발생 시 조용히 스킵 (오류 복원력)
      }
    };
    
    recordImpression();
  }, [isPremium, placement]);

  if (isPremium) return null;
  
  return (
    <div className="flex flex-col items-center w-full my-4 pointer-events-auto">
      <div className={`w-full max-w-[728px] min-h-[70px] md:min-h-[90px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all relative overflow-hidden
        ${isDarkMode ? 'bg-white/5 border-white/10 text-white/20' : 'bg-slate-50 border-slate-200 text-slate-400'}
      `}>
        <div className="absolute top-2 left-4 px-2 py-0.5 bg-midnight/10 rounded text-[8px] font-black tracking-widest uppercase">AD Slot</div>
        <p className="text-[10px] md:text-xs font-bold opacity-40 tracking-tight text-center px-4 mt-3">
          Google AdSense - {placement === 'result' ? 'Result Page Placement' : 'Top Placement'}
        </p>
        <p className="text-[8px] md:text-[9px] font-black opacity-30 mt-1 uppercase">프리미엄 구독 시 광고가 제거됩니다.</p>
      </div>
    </div>
  );
};

export default AdSense;
