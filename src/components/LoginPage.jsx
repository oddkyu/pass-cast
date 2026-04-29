import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';

const LoginPage = ({ isDarkMode, onBack, onLoginSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('인증 메일이 발송되었습니다. 메일함을 확인해주세요!');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onLoginSuccess(data.user);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className={`min-h-screen flex flex-col noise-texture transition-all duration-500 ${isDarkMode ? 'mesh-bg text-white' : 'bg-offwhite text-midnight'}`}
    >
      <header className="max-w-7xl mx-auto w-full px-8 py-12">
        <button onClick={onBack} className="w-12 h-12 glass-button rounded-2xl flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
      </header>

      <main className="flex-1 flex items-center justify-center px-8 pb-20">
        <motion.div 
          initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className={`w-full max-w-lg p-12 md:p-16 rounded-[4rem] shadow-2xl relative overflow-hidden ${isDarkMode ? 'glass-card border-white/10' : 'bg-white border-white'}`}
        >
          <div className="relative z-10 space-y-12">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gold rounded-[1.5rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-gold/20">
                <span className="text-midnight font-black text-2xl">P</span>
              </div>
              <h1 className="text-4xl font-black tracking-tighter uppercase">Pass-Cast</h1>
              <p className="text-lg font-bold opacity-40">{isSignUp ? '합격의 길, 가입부터 시작입니다.' : '사장님, 어서오세요!'}</p>
            </div>

            <form onSubmit={handleAuth} className="space-y-6">
              <div className="space-y-3">
                <label className="text-[12px] font-black uppercase tracking-widest opacity-40 ml-4">Email Address</label>
                <input 
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className={`w-full p-6 rounded-3xl font-bold text-lg outline-none transition-all border-2 ${isDarkMode ? 'bg-white/5 border-white/10 focus:border-gold/50' : 'bg-slate-50 border-slate-100 focus:border-gold/50'}`}
                />
              </div>
              <div className="space-y-3">
                <label className="text-[12px] font-black uppercase tracking-widest opacity-40 ml-4">Password</label>
                <input 
                  type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full p-6 rounded-3xl font-bold text-lg outline-none transition-all border-2 ${isDarkMode ? 'bg-white/5 border-white/10 focus:border-gold/50' : 'bg-slate-50 border-slate-100 focus:border-gold/50'}`}
                />
              </div>

              {error && <p className="text-red-500 text-sm font-bold text-center">{error}</p>}

              <button 
                type="submit" disabled={loading}
                className="w-full py-6 bg-midnight text-gold rounded-3xl font-black text-xl shadow-2xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
              >
                {loading ? '처리 중...' : (isSignUp ? '가입하기' : '로그인')}
              </button>
            </form>

            <div className="text-center pt-8">
              <button 
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm font-black opacity-40 hover:opacity-100 transition-opacity uppercase tracking-widest"
              >
                {isSignUp ? '이미 계정이 있으신가요? 로그인' : '아직 회원이 아니신가요? 회원가입'}
              </button>
            </div>
          </div>
          
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gold/10 rounded-full blur-[80px]" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gold/5 rounded-full blur-[80px]" />
        </motion.div>
      </main>
    </motion.div>
  );
};

export default LoginPage;
