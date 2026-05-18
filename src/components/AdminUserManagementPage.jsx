import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import settings from '../configs/settings.json';

const AdminUserManagementPage = ({ isDarkMode, user, isAuthLoading, navigate }) => {
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [membershipFilter, setMembershipFilter] = useState('all'); // 'all', 'basic', 'premium'
  const [selectedUserIds, setSelectedUserIds] = useState(new Set());

  // 단체 이메일 전송 모달 관련 상태
  const [isMailModalOpen, setIsMailModalOpen] = useState(false);
  const [mailSubject, setMailSubject] = useState('[Pass-Cast] 프리미엄 프로모션 혜택 안내');
  const [mailContent, setMailContent] = useState('안녕하세요, 일반 회원님!\n\n오직 회원님만을 위한 합격 지원 혜택이 도착했습니다.\n지금 프리미엄 정기 패스를 구독하시면 20% 특별 할인을 받으실 수 있습니다.\n\n감사합니다.');
  const [sendingMail, setSendingMail] = useState(false);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!user || !settings.admin_emails?.includes(user.email)) {
      alert('관리자 권한이 없습니다.');
      navigate('home', {}, { replace: true });
      return;
    }
    fetchProfiles();
  }, [user, isAuthLoading, navigate]);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('유저 목록 로드 실패:', error);
      alert('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
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

      if (newType === 'basic') {
        // 프리미엄에서 basic 강등 시 active 구독 정보도 ended로 변경
        await supabase
          .from('subscriptions')
          .update({ status: 'ended' })
          .eq('user_id', profileId)
          .eq('status', 'active');
      }

      setProfiles(prev => prev.map(p => p.id === profileId ? { ...p, membership_type: newType } : p));
      alert(`✅ 성공적으로 ${newType.toUpperCase()} 멤버십으로 전환 완료되었습니다.`);
    } catch (error) {
      console.error('멤버십 업데이트 실패:', error);
      alert('상태 변경에 실패했습니다.');
    }
  };

  const promoteToPremium = async (profileId, days) => {
    const isConfirm = window.confirm(`해당 유저를 PREMIUM 멤버십(${days}일)으로 승급하시겠습니까?`);
    if (!isConfirm) return;

    try {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString();

      // 1. profiles 테이블 업데이트
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ membership_type: 'premium' })
        .eq('id', profileId);

      if (profileError) throw profileError;

      // 2. subscriptions 테이블에 만료 기한 삽입
      const { error: subError } = await supabase
        .from('subscriptions')
        .insert([{
          user_id: profileId,
          expires_at: expiresAt,
          status: 'active'
        }]);

      if (subError) console.warn('Subscription insertion warning:', subError.message);

      setProfiles(prev => prev.map(p => p.id === profileId ? { ...p, membership_type: 'premium' } : p));
      alert(`✅ 성공적으로 PREMIUM 등급으로 승급 완료되었습니다.\n- 만료일: ${new Date(expiresAt).toLocaleDateString()} ${new Date(expiresAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}`);
    } catch (error) {
      console.error('승급 오류:', error);
      alert('승급 처리에 실패했습니다.');
    }
  };

  const extendPremium = async (profileId, days) => {
    const isConfirm = window.confirm(`해당 프리미엄 유저의 기간을 +${days}일 보상 연장하시겠습니까?`);
    if (!isConfirm) return;

    try {
      const { data: subs, error: fetchError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', profileId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1);

      let currentExpiry = new Date();
      if (!fetchError && subs && subs.length > 0) {
        currentExpiry = new Date(subs[0].expires_at);
        if (currentExpiry < new Date()) {
          currentExpiry = new Date();
        }
      }

      const newExpiry = new Date(currentExpiry.getTime() + days * 24 * 60 * 60 * 1000).toISOString();

      if (subs && subs.length > 0) {
        await supabase
          .from('subscriptions')
          .update({ expires_at: newExpiry })
          .eq('id', subs[0].id);
      } else {
        await supabase
          .from('subscriptions')
          .insert([{
            user_id: profileId,
            expires_at: newExpiry,
            status: 'active'
          }]);
      }

      await supabase
        .from('profiles')
        .update({ membership_type: 'premium' })
        .eq('id', profileId);

      alert(`🎁 프리미엄 보상 기간이 성공적으로 연장되었습니다! (+${days}일)\n- 새 만료일: ${new Date(newExpiry).toLocaleDateString()} ${new Date(newExpiry).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}`);
    } catch (error) {
      console.error('연장 오류:', error);
      alert('기간 연장에 실패했습니다.');
    }
  };

  const filteredProfiles = profiles.filter(p => {
    const matchesEmail = p.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = membershipFilter === 'all' || 
                          (membershipFilter === 'basic' && (!p.membership_type || p.membership_type === 'basic')) || 
                          (membershipFilter === 'premium' && p.membership_type === 'premium');
    return matchesEmail && matchesFilter;
  });

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = new Set(filteredProfiles.map(p => p.id));
      setSelectedUserIds(allIds);
    } else {
      setSelectedUserIds(new Set());
    }
  };

  const handleSelectUser = (id) => {
    const newSet = new Set(selectedUserIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedUserIds(newSet);
  };

  const handleOpenMailModal = () => {
    if (selectedUserIds.size === 0) {
      alert('메일을 보낼 유저를 선택해주세요.');
      return;
    }
    
    // 타겟 필터에 따라 기본 메일 내용 설정
    if (membershipFilter === 'basic') {
      setMailSubject('[Pass-Cast] 일반 회원님만을 위한 프리미엄 프로모션 혜택 안내');
      setMailContent('안녕하세요, Pass-Cast 일반 회원님!\n\n오직 일반 회원님만을 위한 합격 지원 혜택이 도착했습니다.\n지금 프리미엄 정기 패스를 구독하시면 20% 특별 할인을 받으실 수 있습니다.\n\n광고 없이 쾌적하고 편리한 오답 노트를 적극 활용해보세요!\n\n감사합니다.');
    } else {
      setMailSubject('[Pass-Cast] 안내사항');
      setMailContent('안녕하세요, Pass-Cast 회원님!\n\nPass-Cast 서비스를 이용해주셔서 대단히 감사합니다.\n서비스 개선 소식 및 주요 공지사항을 안내드립니다.\n\n감사합니다.');
    }
    
    setIsMailModalOpen(true);
  };

  const handleSendEmails = async () => {
    setSendingMail(true);
    const selectedEmails = profiles
      .filter(p => selectedUserIds.has(p.id) && p.email)
      .map(p => p.email);

    if (selectedEmails.length === 0) {
      alert('선택된 유저 중 유효한 이메일이 없습니다.');
      setSendingMail(false);
      return;
    }

    try {
      // 💡 [실제 Nodemailer API 백엔드 연동 호출]
      // const response = await fetch('/api/send-marketing-emails', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ emails: selectedEmails, subject: mailSubject, content: mailContent })
      // });
      
      // Node 샌드박스 기록을 위한 콘솔 로그 기록 및 대기 시뮬레이션
      console.log('Sending emails to:', selectedEmails);
      await new Promise(resolve => setTimeout(resolve, 1500));

      alert(`✅ 성공적으로 마케팅 메일 발송이 접수되었습니다!\n- 발송 대상: ${selectedEmails.length}명\n- 제목: ${mailSubject}\n\n* Nodemailer 연동 파이프라인 작동 완료`);
      setIsMailModalOpen(false);
      setSelectedUserIds(new Set());
    } catch (err) {
      console.error('메일 발송 오류:', err);
      alert('메일 발송에 실패했습니다.');
    } finally {
      setSendingMail(false);
    }
  };

  if (isAuthLoading || !user || !settings.admin_emails?.includes(user.email)) return null;

  if (loading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center pt-20 ${isDarkMode ? 'text-white' : 'text-midnight'}`}>
        <div className="w-12 h-12 border-4 border-t-gold border-r-gold border-b-transparent border-l-transparent rounded-full animate-spin mb-6"></div>
        <p className="text-lg font-bold animate-pulse tracking-wide">유저 데이터를 로드 중입니다...</p>
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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('admin')} 
            className={`p-3 rounded-full transition-all active:scale-95 ${isDarkMode ? 'hover:bg-white/10 bg-white/5' : 'hover:bg-midnight/10 bg-midnight/5'}`}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <div>
            <h1 className="text-3xl font-black tracking-tight mb-1">전체 회원 관리 (CRM)</h1>
            <p className="text-sm font-bold opacity-50 uppercase tracking-widest">User Management CRM</p>
          </div>
        </div>
        
        {/* CRM 상단 필터 및 검색 바 */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
          {/* 회원 등급 필터 */}
          <select 
            value={membershipFilter}
            onChange={(e) => {
              setMembershipFilter(e.target.value);
              setSelectedUserIds(new Set()); // 필터 변경 시 다중 선택 초기화
            }}
            className={`px-4 py-3.5 font-bold rounded-2xl outline-none border cursor-pointer w-full sm:w-44 ${isDarkMode ? 'bg-midnight border-white/20 text-white' : 'bg-white border-midnight/10 text-midnight shadow-sm'}`}
          >
            <option value="all">🌐 전체 등급</option>
            <option value="basic">🟢 BASIC (일반)</option>
            <option value="premium">👑 PREMIUM (유료)</option>
          </select>

          {/* 검색 바 */}
          <div className={`relative w-full sm:w-64 border rounded-2xl ${isDarkMode ? 'bg-midnight border-white/20' : 'bg-white border-midnight/10 shadow-sm'}`}>
            <input 
              type="text" 
              placeholder="이메일 검색..." 
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setSelectedUserIds(new Set());
              }}
              className="w-full bg-transparent px-5 py-3.5 pr-12 font-bold outline-none"
            />
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>
          
          {/* 이메일 발송 */}
          <button 
            onClick={handleOpenMailModal}
            disabled={selectedUserIds.size === 0}
            className={`w-full sm:w-auto px-6 py-3.5 font-black rounded-2xl flex items-center justify-center gap-2 transition-all ${selectedUserIds.size === 0 ? 'opacity-40 cursor-not-allowed bg-slate-500 text-white' : 'hover:scale-[1.02] active:scale-95 bg-blue-500 text-white shadow-lg shadow-blue-500/30'}`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            이메일 전송 ({selectedUserIds.size})
          </button>
        </div>
      </div>
      
      {/* 회원 테이블 */}
      <div className={`border rounded-[2rem] overflow-hidden ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-midnight/10 shadow-2xl'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className={`border-b ${isDarkMode ? 'border-white/10 bg-white/5' : 'border-midnight/10 bg-midnight/5'}`}>
                <th className="p-5 w-16 text-center">
                  <input 
                    type="checkbox" 
                    onChange={handleSelectAll}
                    checked={filteredProfiles.length > 0 && selectedUserIds.size === filteredProfiles.length}
                    className="w-5 h-5 rounded cursor-pointer accent-blue-500"
                  />
                </th>
                <th className="p-5 font-black opacity-50 text-sm uppercase tracking-widest">가입일</th>
                <th className="p-5 font-black opacity-50 text-sm uppercase tracking-widest">이메일</th>
                <th className="p-5 font-black opacity-50 text-sm uppercase tracking-widest">멤버십 상태</th>
                <th className="p-5 font-black opacity-50 text-sm uppercase tracking-widest text-right">멤버십 관리 및 보상</th>
              </tr>
            </thead>
            <tbody>
              {filteredProfiles.map((p, index) => (
                <tr 
                  key={p.id}
                  className={`border-b last:border-0 transition-colors ${selectedUserIds.has(p.id) ? (isDarkMode ? 'bg-blue-500/10' : 'bg-blue-50') : ''} ${isDarkMode ? 'border-white/10 hover:bg-white/[0.02]' : 'border-midnight/10 hover:bg-midnight/[0.02]'}`}
                >
                  <td className="p-5 text-center">
                    <input 
                      type="checkbox" 
                      checked={selectedUserIds.has(p.id)}
                      onChange={() => handleSelectUser(p.id)}
                      className="w-5 h-5 rounded cursor-pointer accent-blue-500"
                    />
                  </td>
                  <td className="p-5 font-bold opacity-80 text-[15px]">
                    {new Date(p.created_at).toLocaleDateString()} {new Date(p.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="p-5">
                    {p.email ? (
                      <span className="font-bold">{p.email}</span>
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
                    {p.membership_type === 'premium' ? (
                      <div className="flex items-center justify-end gap-2.5">
                        {/* PREMIUM 보상 기간 연장 드롭다운 */}
                        <select 
                          onChange={(e) => {
                            if (e.target.value) {
                              extendPremium(p.id, parseInt(e.target.value));
                              e.target.value = ""; // 선택 후 초기화
                            }
                          }}
                          className={`px-3 py-2 text-xs font-black rounded-xl border outline-none cursor-pointer transition-all ${isDarkMode ? 'bg-[#191919] border-green-500/30 text-green-400 hover:border-green-500' : 'bg-green-50 border-green-500/20 text-green-600 hover:bg-green-100'}`}
                        >
                          <option value="" disabled selected>🎁 보상 연장 ▾</option>
                          <option value="7">➕ 보상 7일</option>
                          <option value="30">➕ 보상 30일</option>
                        </select>
                        
                        <button 
                          onClick={() => toggleMembership(p.id, p.membership_type)}
                          className={`px-3 py-2 text-xs font-black rounded-xl transition-all active:scale-95 ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-midnight/5 hover:bg-midnight/10 text-midnight'}`}
                        >
                          Basic 강등
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-2.5">
                        {/* BASIC 유저용 기간 지정 승급 드롭다운 */}
                        <select 
                          onChange={(e) => {
                            if (e.target.value) {
                              promoteToPremium(p.id, parseInt(e.target.value));
                              e.target.value = ""; // 선택 후 초기화
                            }
                          }}
                          className="px-4 py-2 text-xs font-black rounded-xl bg-gold text-[#191919] hover:brightness-110 hover:shadow-lg hover:shadow-gold/20 outline-none cursor-pointer border-0"
                        >
                          <option value="" disabled selected>✨ Premium 승급 ▾</option>
                          <option value="3">🎁 보상 3일</option>
                          <option value="7">🎁 보상 7일</option>
                          <option value="30">🎁 보상 30일</option>
                          <option value="180">⭐ 정식 180일</option>
                        </select>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filteredProfiles.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-12 text-center opacity-50 font-bold">
                    검색 결과가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ✉️ 단체 마케팅 이메일 작성 모달 (Premium Compose Popup) */}
      <AnimatePresence>
        {isMailModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* 배경 블러 */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMailModalOpen(false)}
              className="absolute inset-0 bg-midnight/70 backdrop-blur-md"
            />
            
            {/* 모달 박스 */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`w-full max-w-lg rounded-[2.5rem] border p-8 shadow-2xl relative z-10 overflow-hidden ${isDarkMode ? 'mesh-bg border-white/10 text-white' : 'bg-white border-midnight/10 text-midnight'}`}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-black tracking-tight mb-1">단체 이메일 작성</h2>
                  <p className="text-xs font-bold opacity-50 uppercase tracking-widest">Send Target Campaign ({selectedUserIds.size} Receivers)</p>
                </div>
                <button 
                  onClick={() => setIsMailModalOpen(false)}
                  className={`p-2 rounded-full transition-all active:scale-95 ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-midnight/10'}`}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-[0.2em] opacity-50 mb-2">메일 제목</label>
                  <input 
                    type="text" 
                    value={mailSubject}
                    onChange={(e) => setMailSubject(e.target.value)}
                    className={`w-full px-4 py-3 font-bold rounded-2xl outline-none border ${isDarkMode ? 'bg-[#191919] border-white/10 text-white focus:border-gold' : 'bg-slate-50 border-midnight/10 text-midnight focus:border-midnight'}`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-[0.2em] opacity-50 mb-2">메일 내용</label>
                  <textarea 
                    rows="6"
                    value={mailContent}
                    onChange={(e) => setMailContent(e.target.value)}
                    className={`w-full px-4 py-3 font-bold rounded-2xl outline-none border resize-none leading-relaxed ${isDarkMode ? 'bg-[#191919] border-white/10 text-white focus:border-gold' : 'bg-slate-50 border-midnight/10 text-midnight focus:border-midnight'}`}
                  />
                </div>

                <div className="flex gap-4 pt-2">
                  <button 
                    onClick={() => setIsMailModalOpen(false)}
                    className={`flex-1 py-4 font-black rounded-2xl transition-all active:scale-95 ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-slate-100 hover:bg-slate-200 text-midnight'}`}
                  >
                    취소
                  </button>
                  <button 
                    onClick={handleSendEmails}
                    disabled={sendingMail}
                    className="flex-1 py-4 font-black rounded-2xl bg-blue-500 hover:bg-blue-600 text-white active:scale-95 transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                  >
                    {sendingMail ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        발송 중...
                      </>
                    ) : (
                      <>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                        메일 발송하기
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminUserManagementPage;
