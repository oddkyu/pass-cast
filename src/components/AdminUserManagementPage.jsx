import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import settings from '../configs/settings.json';

const AdminUserManagementPage = ({ isDarkMode, user, isAuthLoading, navigate }) => {
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState(new Set());

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
      setProfiles(prev => prev.map(p => p.id === profileId ? { ...p, membership_type: newType } : p));
    } catch (error) {
      console.error('멤버십 업데이트 실패:', error);
      alert('상태 변경에 실패했습니다.');
    }
  };

  const filteredProfiles = profiles.filter(p => 
    p.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const handleSendBulkEmail = () => {
    if (selectedUserIds.size === 0) {
      alert('메일을 보낼 유저를 선택해주세요.');
      return;
    }

    const selectedEmails = profiles
      .filter(p => selectedUserIds.has(p.id) && p.email)
      .map(p => p.email)
      .join(',');

    if (!selectedEmails) {
      alert('선택된 유저 중 유효한 이메일이 없습니다.');
      return;
    }

    // mailto:?bcc=a@a.com,b@b.com
    window.location.href = `mailto:?bcc=${selectedEmails}&subject=[Pass-Cast] 안내사항`;
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
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
            <h1 className="text-3xl font-black tracking-tight mb-1">전체 회원 관리</h1>
            <p className="text-sm font-bold opacity-50 uppercase tracking-widest">User Management CRM</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className={`relative w-full sm:w-64 rounded-2xl overflow-hidden ${isDarkMode ? 'bg-midnight border border-white/20' : 'bg-white border border-midnight/10'}`}>
            <input 
              type="text" 
              placeholder="이메일 검색..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent px-5 py-3.5 pr-12 font-bold outline-none"
            />
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>
          
          <button 
            onClick={handleSendBulkEmail}
            disabled={selectedUserIds.size === 0}
            className={`w-full sm:w-auto px-6 py-3.5 font-black rounded-2xl flex items-center justify-center gap-2 transition-all ${selectedUserIds.size === 0 ? 'opacity-40 cursor-not-allowed bg-slate-500 text-white' : 'hover:scale-[1.02] active:scale-95 bg-blue-500 text-white shadow-lg shadow-blue-500/30'}`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            이메일 전송 ({selectedUserIds.size})
          </button>
        </div>
      </div>
      
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
                <th className="p-5 font-black opacity-50 text-sm uppercase tracking-widest text-right">권한 변경</th>
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
                    <span className={`px-4 py-1.5 text-xs font-black rounded-full uppercase tracking-widest ${p.membership_type === 'premium' ? 'bg-gold/20 text-gold' : isDarkMode ? 'bg-white/10 text-white/70' : 'bg-midnight/10 text-midnight/70'}`}>
                      {p.membership_type || 'basic'}
                    </span>
                  </td>
                  <td className="p-5 text-right">
                    <button 
                      onClick={() => toggleMembership(p.id, p.membership_type)}
                      className={`px-4 py-2 text-xs font-black rounded-xl transition-all active:scale-95 ${p.membership_type === 'premium' ? (isDarkMode ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-midnight/5 hover:bg-midnight/10 text-midnight') : 'bg-gold text-[#191919] hover:brightness-110 shadow-lg shadow-gold/20'}`}
                    >
                      {p.membership_type === 'premium' ? 'Basic 강등' : 'Premium 승급'}
                    </button>
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
    </motion.div>
  );
};

export default AdminUserManagementPage;
