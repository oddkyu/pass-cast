import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import settings from '../configs/settings.json';

const ToggleSwitch = ({ checked, onChange, isDarkMode }) => (
  <button 
    onClick={onChange}
    className={`w-14 h-8 rounded-full relative transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 ${isDarkMode ? 'focus:ring-offset-midnight' : 'focus:ring-offset-white'} ${checked ? 'bg-gold' : isDarkMode ? 'bg-white/20' : 'bg-midnight/20'}`}
  >
    <div className={`w-6 h-6 rounded-full bg-white absolute top-1 transition-all duration-300 shadow-md ${checked ? 'left-7' : 'left-1'}`} />
  </button>
);

const AdminPage = ({ isDarkMode, user, isAuthLoading, navigate, appSettings: globalSettings }) => {
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [localSettings, setLocalSettings] = useState({
    show_ads: false,
    enable_memo: true,
    routine_question_count: 10,
    force_gating: false,
    ...globalSettings
  });
  
  // 전역 설정이 백그라운드에서 바뀌면 로컬 설정도 동기화
  useEffect(() => {
    setLocalSettings({
      show_ads: false,
      enable_memo: true,
      routine_question_count: 10,
      force_gating: false,
      ...globalSettings
    });
  }, [globalSettings]);

  const [profiles, setProfiles] = useState([]);
  const [adminPopups, setAdminPopups] = useState([]);
  const [isCreatingPopup, setIsCreatingPopup] = useState(false);
  const [newPopup, setNewPopup] = useState({ title: '', content: '', image_url: '', link_url: '', is_active: false });
  const [stats, setStats] = useState({
    totalUsers: 0,
    premiumUsers: 0,
    todayExams: 0,
    monthlySales: 0,
    todayImpressions: 0
  });

  useEffect(() => {
    if (isAuthLoading) return; // 인증 로딩 중엔 대기

    // 권한 체크 로직
    if (!user || !settings.admin_emails?.includes(user.email)) {
      alert('관리자 권한이 없습니다.');
      navigate('home', {}, { replace: true });
      return;
    }

    fetchAdminData();
  }, [user, isAuthLoading, navigate]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // 1. 유저 프로필 데이터 로드
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // 2. 오늘 생성된 시험 데이터 로드
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString();

      const { count: todayExamsCount, error: examsError } = await supabase
        .from('user_exam_history')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', todayISO);

      if (examsError) throw examsError;

      // 2.1 오늘 실시간 광고 노출 카운트 로드
      const { count: adCount, error: adError } = await supabase
        .from('ad_impressions')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', todayISO);

      // 2.2 이번 달 누적 구독 매출 로드 (구독 레코드 집계)
      const firstDayOfMonth = new Date();
      firstDayOfMonth.setDate(1);
      firstDayOfMonth.setHours(0, 0, 0, 0);
      const firstDayOfMonthISO = firstDayOfMonth.toISOString();

      const { data: subsThisMonth, error: subStatsError } = await supabase
        .from('subscriptions')
        .select('*')
        .gte('created_at', firstDayOfMonthISO);

      let calculatedRevenue = 0;
      if (!subStatsError && subsThisMonth) {
        subsThisMonth.forEach(s => {
          if (s.expires_at && s.created_at) {
            const diffTime = Math.abs(new Date(s.expires_at) - new Date(s.created_at));
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            // 150일 이상이면 6개월 패스로 간주(19,000원), 미만이면 1개월 패스(3,900원)
            if (diffDays >= 150) {
              calculatedRevenue += 19000;
            } else {
              calculatedRevenue += 3900;
            }
          } else {
            calculatedRevenue += 3900;
          }
        });
      }

      // 4. 팝업 히스토리 로드
      const { data: popupsData, error: popupsError } = await supabase
        .from('popups')
        .select('*')
        .order('created_at', { ascending: false });

      if (popupsError) throw popupsError;

      setProfiles(profilesData || []);
      setAdminPopups(popupsData || []);
      setStats({
        totalUsers: profilesData?.length || 0,
        premiumUsers: profilesData?.filter(p => p.membership_type === 'premium').length || 0,
        todayExams: todayExamsCount || 0,
        monthlySales: calculatedRevenue || 0,
        todayImpressions: adCount || 0
      });

    } catch (error) {
      console.error('관리자 데이터 로드 실패:', error);
      alert('데이터를 불러오는데 실패했습니다. 콘솔을 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      // 💡 [Context Sync 가이드 - 실시간 반영 구조]
      // 여기서 DB에 저장된 설정이 사용자 앱 화면에 실시간으로 반영되려면:
      // 1. App.jsx 최상단에서 Supabase Realtime을 사용하여 'app_settings' 테이블의 변경을 구독합니다.
      //    const channel = supabase.channel('settings-channel')
      //      .on('postgres_changes', { event: '*', schema: 'public', table: 'app_settings' }, (payload) => {
      //        // Context API나 전역 상태 관리(Zustand 등)의 값을 payload.new 로 업데이트
      //        updateGlobalSettings(payload.new);
      //      }).subscribe();
      // 2. 앱 전역에서 import settings from 'settings.json' 대신 Context에서 제공하는 설정값을 구독하여 사용합니다.
      
      const { error } = await supabase
        .from('app_settings')
        .upsert([{ 
          id: 1, // 단일 설정 레코드로 관리
          show_ads: localSettings.show_ads,
          enable_memo: localSettings.enable_memo,
          routine_question_count: localSettings.routine_question_count,
          force_gating: localSettings.force_gating || false,
          updated_at: new Date().toISOString()
        }]);

      if (error) throw error;
      
      // 토스트 메시지 대신 직관적인 alert 사용
      alert('✅ 설정이 즉시 반영되었습니다'); 
    } catch (error) {
      console.error('설정 저장 실패:', error);
      alert('설정 저장에 실패했습니다.');
    } finally {
      setSavingSettings(false);
    }
  };

  const toggleMembership = async (profileId, currentType) => {
    const newType = currentType === 'premium' ? 'basic' : 'premium';
    const isConfirm = window.confirm(`해당 유저를 ${newType.toUpperCase()} 멤버십으로 변경하시겠습니까?`);
    if (!isConfirm) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ membership_type: newType })
        .eq('id', profileId);

      if (error) throw error;

      // UI 즉시 업데이트
      setProfiles(prev => prev.map(p => p.id === profileId ? { ...p, membership_type: newType } : p));
      setStats(prev => ({
        ...prev,
        premiumUsers: prev.premiumUsers + (newType === 'premium' ? 1 : -1)
      }));
    } catch (error) {
      console.error('멤버십 업데이트 실패:', error);
      alert('상태 변경에 실패했습니다.');
    }
  };

  const handleCreatePopup = async () => {
    if (!newPopup.title) {
      alert('팝업 제목은 필수입니다.');
      return;
    }
    setSavingSettings(true);
    try {
      const { data, error } = await supabase
        .from('popups')
        .insert([{
          title: newPopup.title,
          content: newPopup.content,
          image_url: newPopup.image_url,
          link_url: newPopup.link_url,
          is_active: newPopup.is_active
        }])
        .select();

      if (error) throw error;
      setAdminPopups(prev => [data[0], ...prev]);
      setIsCreatingPopup(false);
      setNewPopup({ title: '', content: '', image_url: '', link_url: '', is_active: false });
      alert('팝업이 성공적으로 생성되었습니다.');
    } catch (err) {
      console.error(err);
      alert('팝업 생성에 실패했습니다.');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleTogglePopup = async (popupId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('popups')
        .update({ is_active: !currentStatus })
        .eq('id', popupId);
      if (error) throw error;
      setAdminPopups(prev => prev.map(p => p.id === popupId ? { ...p, is_active: !currentStatus } : p));
    } catch (err) {
      console.error(err);
      alert('상태 변경 실패');
    }
  };

  const handleDeletePopup = async (popupId) => {
    if (!confirm('이 팝업 기록을 완전히 삭제하시겠습니까? (복구 불가)')) return;
    try {
      const { error } = await supabase
        .from('popups')
        .delete()
        .eq('id', popupId);
      if (error) throw error;
      setAdminPopups(prev => prev.filter(p => p.id !== popupId));
    } catch (err) {
      console.error(err);
      alert('팝업 삭제 실패');
    }
  };

  // 권한이 없으면 빈 화면을 렌더링 (깜빡임 방지 및 보호)
  if (isAuthLoading || !user || !settings.admin_emails?.includes(user.email)) return null;

  if (loading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center pt-20 ${isDarkMode ? 'text-white' : 'text-midnight'}`}>
        <div className="w-12 h-12 border-4 border-t-gold border-r-gold border-b-transparent border-l-transparent rounded-full animate-spin mb-6"></div>
        <p className="text-lg font-bold animate-pulse tracking-wide">관리자 데이터를 로드 중입니다...</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
    >
      <div className="flex items-center gap-4 mb-10">
        <button 
          onClick={() => navigate('home')} 
          className={`p-3 rounded-full transition-all active:scale-95 ${isDarkMode ? 'hover:bg-white/10 bg-white/5' : 'hover:bg-midnight/10 bg-midnight/5'}`}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-1">관리자 대시보드</h1>
          <p className="text-sm font-bold opacity-50 uppercase tracking-widest">Admin Control Center</p>
        </div>
      </div>
      
      {/* 실시간 통계 대시보드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
        <div className={`p-6 rounded-3xl border flex flex-col justify-center transition-transform hover:-translate-y-1 ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-midnight/10 shadow-xl'}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <p className="text-xs opacity-60 font-black uppercase tracking-widest">총 가입자</p>
          </div>
          <p className="text-3xl font-black tracking-tighter">{stats.totalUsers.toLocaleString()}<span className="text-lg ml-1 opacity-50">명</span></p>
        </div>
        
        <div className={`p-6 rounded-3xl border flex flex-col justify-center transition-transform hover:-translate-y-1 ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-midnight/10 shadow-xl'}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            </div>
            <p className="text-xs opacity-60 font-black uppercase tracking-widest">프리미엄 유저</p>
          </div>
          <p className="text-3xl font-black tracking-tighter text-gold">{stats.premiumUsers.toLocaleString()}<span className="text-lg ml-1 opacity-50">명</span></p>
        </div>
        
        <div className={`p-6 rounded-3xl border flex flex-col justify-center transition-transform hover:-translate-y-1 ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-midnight/10 shadow-xl'}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
            </div>
            <p className="text-xs opacity-60 font-black uppercase tracking-widest">오늘 학습량</p>
          </div>
          <p className="text-3xl font-black tracking-tighter text-green-500">{stats.todayExams.toLocaleString()}<span className="text-lg ml-1 opacity-50">회</span></p>
        </div>

        {/* ₩ 이번 달 누적 구독 매출 */}
        <div className={`p-6 rounded-3xl border border-gold/30 flex flex-col justify-center transition-transform hover:-translate-y-1 ${isDarkMode ? 'bg-gold/5' : 'bg-gold/5 shadow-xl'}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold shadow-sm shadow-gold/20">
              <span className="text-sm font-black">₩</span>
            </div>
            <p className="text-xs opacity-60 font-black uppercase tracking-widest text-gold">당월 구독 매출</p>
          </div>
          <p className="text-3xl font-black tracking-tighter text-gold">₩ {stats.monthlySales.toLocaleString()}</p>
        </div>

        {/* 📊 오늘 실시간 광고 노출 */}
        <div className={`p-6 rounded-3xl border border-purple-500/30 flex flex-col justify-center transition-transform hover:-translate-y-1 ${isDarkMode ? 'bg-purple-500/5' : 'bg-purple-50/80 shadow-xl'}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-500">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
            </div>
            <p className="text-xs opacity-60 font-black uppercase tracking-widest text-purple-500">오늘 광고 노출</p>
          </div>
          <p className="text-3xl font-black tracking-tighter text-purple-500">{stats.todayImpressions.toLocaleString()}<span className="text-lg ml-1 opacity-50">회</span></p>
        </div>
      </div>

      {/* CRM 유저 관리 테이블 (최근 5명 요약) */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
          최근 가입 유저 <span className="text-sm px-3 py-1 rounded-full bg-gold/20 text-gold">최근 5명 (총 {stats.totalUsers}명)</span>
        </h2>
        <button 
          onClick={() => navigate('admin_users')}
          className="px-5 py-2.5 bg-blue-500 text-white text-sm font-black rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-blue-500/30 flex items-center gap-2"
        >
          전체 회원 관리 및 단체 메일 발송
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>
      </div>
      
      <div className={`border rounded-[2rem] overflow-hidden ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-midnight/10 shadow-2xl'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className={`border-b ${isDarkMode ? 'border-white/10 bg-white/5' : 'border-midnight/10 bg-midnight/5'}`}>
                <th className="p-5 font-black opacity-50 text-sm uppercase tracking-widest">가입일</th>
                <th className="p-5 font-black opacity-50 text-sm uppercase tracking-widest">이메일</th>
                <th className="p-5 font-black opacity-50 text-sm uppercase tracking-widest">멤버십 상태</th>
                <th className="p-5 font-black opacity-50 text-sm uppercase tracking-widest text-right">액션</th>
              </tr>
            </thead>
            <tbody>
              {profiles.slice(0, 5).map((p, index) => (
                <motion.tr 
                  key={p.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  className={`border-b last:border-0 transition-colors ${isDarkMode ? 'border-white/10 hover:bg-white/[0.02]' : 'border-midnight/10 hover:bg-midnight/[0.02]'}`}
                >
                  <td className="p-5 font-bold opacity-80 text-[15px]">
                    {new Date(p.created_at).toLocaleDateString()} {new Date(p.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="p-5">
                    {p.email ? (
                      <a href={`mailto:${p.email}`} className="text-blue-500 hover:text-blue-400 font-bold transition-colors underline-offset-4 hover:underline">
                        {p.email}
                      </a>
                    ) : (
                      <span className="opacity-40 italic font-bold text-sm">이메일 없음</span>
                    )}
                  </td>
                  <td className="p-5">
                    <span className={`px-4 py-1.5 text-xs font-black rounded-full uppercase tracking-widest ${p.membership_type === 'premium' ? 'bg-gold/20 text-gold shadow-md shadow-gold/10' : isDarkMode ? 'bg-white/10 text-white/70' : 'bg-midnight/10 text-midnight/70'}`}>
                      {(p.membership_type || 'basic').toUpperCase()}
                    </span>
                  </td>
                  <td className="p-5 text-right">
                    <button 
                      onClick={() => toggleMembership(p.id, p.membership_type)}
                      className={`px-5 py-2 text-sm font-black rounded-2xl transition-all active:scale-95 ${p.membership_type === 'premium' ? (isDarkMode ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-midnight/5 hover:bg-midnight/10 text-midnight') : 'bg-gold text-[#191919] hover:brightness-110 shadow-lg shadow-gold/20'}`}
                    >
                      {p.membership_type === 'premium' ? 'Basic 강등' : 'Premium 승급'}
                    </button>
                  </td>
                </motion.tr>
              ))}
              {profiles.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-12 text-center opacity-50 font-bold">
                    표시할 유저 데이터가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 서비스 설정 제어 (Remote Config) */}
      <div className="mt-16 mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
          운영 제어판 <span className="text-sm font-bold opacity-50 uppercase tracking-widest px-2 py-1 rounded bg-midnight/5 dark:bg-white/5">Remote Config</span>
        </h2>
        <button 
          onClick={handleSaveSettings}
          disabled={savingSettings}
          className={`px-6 py-3 text-[15px] font-black rounded-2xl transition-all active:scale-95 flex items-center gap-3 ${savingSettings ? 'opacity-50 cursor-not-allowed' : ''} ${isDarkMode ? 'bg-gold text-midnight hover:brightness-110 shadow-lg shadow-gold/20' : 'bg-gold text-[#191919] hover:brightness-110 shadow-xl'}`}
        >
          {savingSettings ? (
            <div className="w-5 h-5 border-2 border-midnight border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
          )}
          설정 저장하기
        </button>
      </div>

      <div className={`border rounded-[2rem] p-8 ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-midnight/10 shadow-2xl'}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          
          {/* 토글 설정들 */}
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="pr-6">
                <p className="font-black text-lg">광고 노출 여부 (show_ads)</p>
                <p className="text-sm opacity-60 mt-1 font-medium">비프리미엄 유저에게 하단 배너 광고를 표시합니다.</p>
              </div>
              <ToggleSwitch 
                isDarkMode={isDarkMode}
                checked={localSettings.show_ads} 
                onChange={() => setLocalSettings(prev => ({ ...prev, show_ads: !prev.show_ads }))} 
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="pr-6">
                <p className="font-black text-lg">메모장 활성화 (enable_memo)</p>
                <p className="text-sm opacity-60 mt-1 font-medium">시험 화면에서 플로팅 메모장 기능을 켜거나 끕니다.</p>
              </div>
              <ToggleSwitch 
                isDarkMode={isDarkMode}
                checked={localSettings.enable_memo} 
                onChange={() => setLocalSettings(prev => ({ ...prev, enable_memo: !prev.enable_memo }))} 
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="pr-6">
                <p className="font-black text-lg text-gold">구독 유도 모달 공격적 노출 (force_gating)</p>
                <p className="text-sm opacity-60 mt-1 font-medium text-gold/80">ON 설정 시, 일반/비회원 유저들이 홈 메인 진입 및 기출문제 풀이 중 매 5문항 이동 시 결제 모달을 강제 팝업합니다.</p>
              </div>
              <ToggleSwitch 
                isDarkMode={isDarkMode}
                checked={localSettings.force_gating} 
                onChange={() => setLocalSettings(prev => ({ ...prev, force_gating: !prev.force_gating }))} 
              />
            </div>
          </div>

          {/* 수치 설정들 */}
          <div className="space-y-8 md:pl-12 md:border-l border-midnight/10 dark:border-white/10">
            <div>
              <p className="font-black text-lg mb-1">오늘의 루틴 문항 수</p>
              <p className="text-sm opacity-60 mb-5 font-medium">Daily Routine 10에서 제공할 기본 문항 개수입니다.</p>
              <div className="flex items-center gap-4">
                <input 
                  type="number" 
                  min="5" 
                  max="40"
                  value={localSettings.routine_question_count}
                  onChange={(e) => setLocalSettings(prev => ({ ...prev, routine_question_count: parseInt(e.target.value) || 10 }))}
                  className={`w-28 text-center text-2xl font-black rounded-2xl p-3 outline-none transition-all shadow-inner ${isDarkMode ? 'bg-midnight border border-white/20 focus:border-gold focus:ring-1 focus:ring-gold' : 'bg-offwhite border border-midnight/10 focus:border-gold focus:ring-1 focus:ring-gold'}`}
                />
                <span className="font-bold opacity-50 uppercase tracking-widest text-sm">Questions</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 전문 팝업 관리 시스템 (Popup CMS) */}
      <div className="mt-16 mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
          팝업 관리 센터 <span className="text-sm font-bold opacity-50 uppercase tracking-widest px-2 py-1 rounded bg-midnight/5 dark:bg-white/5">Popup CMS</span>
        </h2>
        <button 
          onClick={() => setIsCreatingPopup(!isCreatingPopup)}
          className={`px-6 py-3 text-[15px] font-black rounded-2xl transition-all active:scale-95 ${isCreatingPopup ? 'bg-red-500 text-white' : 'bg-midnight text-white dark:bg-white dark:text-midnight'} shadow-lg`}
        >
          {isCreatingPopup ? '취소' : '+ 새 팝업 등록'}
        </button>
      </div>

      <AnimatePresence>
        {isCreatingPopup && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }} 
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-12"
          >
            <div className={`border rounded-[2rem] p-8 ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-midnight/10 shadow-xl'}`}>
              <h3 className="text-xl font-black mb-6">새로운 팝업 만들기</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-black opacity-60 uppercase tracking-widest mb-2">팝업 제목 <span className="text-red-500">*</span></label>
                  <input type="text" value={newPopup.title} onChange={e => setNewPopup({...newPopup, title: e.target.value})} placeholder="예: 봄맞이 프리미엄 할인 이벤트" className={`w-full p-4 rounded-xl font-bold outline-none transition-all ${isDarkMode ? 'bg-midnight border border-white/20' : 'bg-white border border-midnight/10'}`} />
                </div>
                <div>
                  <label className="block text-sm font-black opacity-60 uppercase tracking-widest mb-2">팝업 내용 (엔터 줄바꿈 가능)</label>
                  <textarea rows="4" value={newPopup.content} onChange={e => setNewPopup({...newPopup, content: e.target.value})} placeholder="팝업 본문을 입력하세요..." className={`w-full p-4 rounded-xl font-bold outline-none transition-all resize-none ${isDarkMode ? 'bg-midnight border border-white/20' : 'bg-white border border-midnight/10'}`} />
                </div>
                <div>
                  <label className="block text-sm font-black opacity-60 uppercase tracking-widest mb-2">첨부 이미지 주소 URL</label>
                  <input type="text" value={newPopup.image_url} onChange={e => setNewPopup({...newPopup, image_url: e.target.value})} placeholder="https://..." className={`w-full p-4 rounded-xl font-bold outline-none transition-all ${isDarkMode ? 'bg-midnight border border-white/20' : 'bg-white border border-midnight/10'}`} />
                </div>
                <div>
                  <label className="block text-sm font-black opacity-60 uppercase tracking-widest mb-2">버튼 클릭 시 이동할 링크 URL</label>
                  <input type="text" value={newPopup.link_url} onChange={e => setNewPopup({...newPopup, link_url: e.target.value})} placeholder="https://..." className={`w-full p-4 rounded-xl font-bold outline-none transition-all ${isDarkMode ? 'bg-midnight border border-white/20' : 'bg-white border border-midnight/10'}`} />
                </div>
                <div className="flex items-center justify-between py-4 border-t border-black/5 dark:border-white/5 mt-4">
                  <div>
                    <p className="font-black">생성 즉시 활성화 할까요?</p>
                    <p className="text-sm opacity-50 font-bold mt-1">체크하면 저장 즉시 유저들에게 노출됩니다.</p>
                  </div>
                  <ToggleSwitch isDarkMode={isDarkMode} checked={newPopup.is_active} onChange={() => setNewPopup({...newPopup, is_active: !newPopup.is_active})} />
                </div>
                <div className="flex justify-end pt-4">
                  <button onClick={handleCreatePopup} disabled={savingSettings} className={`px-8 py-4 font-black rounded-2xl transition-all ${savingSettings ? 'opacity-50' : 'hover:scale-105 active:scale-95'} bg-gold text-[#191919] shadow-xl`}>
                    팝업 생성 및 저장하기
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`mb-12 border rounded-[2rem] overflow-hidden ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-midnight/10 shadow-2xl'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className={`border-b ${isDarkMode ? 'border-white/10 bg-white/5' : 'border-midnight/10 bg-midnight/5'}`}>
                <th className="p-5 font-black opacity-50 text-sm uppercase tracking-widest">상태</th>
                <th className="p-5 font-black opacity-50 text-sm uppercase tracking-widest">팝업 제목</th>
                <th className="p-5 font-black opacity-50 text-sm uppercase tracking-widest">등록일</th>
                <th className="p-5 font-black opacity-50 text-sm uppercase tracking-widest text-right">관리</th>
              </tr>
            </thead>
            <tbody>
              {adminPopups.map((popup) => (
                <tr key={popup.id} className={`border-b last:border-0 transition-colors ${isDarkMode ? 'border-white/10' : 'border-midnight/10'}`}>
                  <td className="p-5">
                    <button 
                      onClick={() => handleTogglePopup(popup.id, popup.is_active)}
                      className={`px-3 py-1.5 text-xs font-black rounded-full uppercase tracking-widest transition-all ${popup.is_active ? 'bg-green-500/20 text-green-500 border border-green-500/30' : 'bg-slate-500/20 text-slate-500 border border-slate-500/30 hover:bg-slate-500/40'}`}
                    >
                      {popup.is_active ? '✅ 노출중' : '숨김'}
                    </button>
                  </td>
                  <td className="p-5">
                    <p className="font-bold text-[15px]">{popup.title}</p>
                    <p className="text-xs font-bold opacity-40 mt-1 max-w-[200px] truncate">{popup.content}</p>
                  </td>
                  <td className="p-5 font-bold opacity-60 text-sm">
                    {new Date(popup.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-5 text-right space-x-3">
                    <button 
                      onClick={() => handleDeletePopup(popup.id)}
                      className="px-4 py-2 text-sm font-black rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
              {adminPopups.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-12 text-center opacity-50 font-bold">
                    등록된 팝업이 없습니다. 새 팝업을 등록해 보세요!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminPage;
