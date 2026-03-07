// src/pages/Auth.tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authSignup, authLogin } from '../lib/api';

export default function Auth() {
  const { login } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  // Login fields
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  // Signup fields
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  const handleLogin = async () => {
    if (!identifier.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await authLogin(identifier.trim(), password);
      if (data.status === 'error') {
        setError(data.message);
      } else {
        login(data);
      }
    } catch {
      setError('Connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!username.trim() || !email.trim() || !signupPassword.trim()) {
      setError('Please fill in all fields');
      return;
    }
    if (signupPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError('Username can only contain letters, numbers, and underscores');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await authSignup(username.trim(), email.trim(), signupPassword);
      if (data.status === 'error') {
        setError(data.message);
      } else {
        login(data);
      }
    } catch {
      setError('Connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center p-4">
      {/* Background ambient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#DF812D]/5 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-3 mb-10"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-[#DF812D] via-[#ECA250] to-[#FFFFFF] rounded-xl flex items-center justify-center">
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-[20px] font-bold text-white leading-none">CreatorMentor</h1>
            <p className="text-[11px] text-[#555] mt-0.5">AI for Indian Creators</p>
          </div>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#0F0F0F] border border-[#1C1C1C] rounded-2xl p-8 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#DF812D] via-[#ECA250] to-transparent" />

          {/* Tab switcher */}
          <div className="flex bg-[#0A0A0A] border border-[#1C1C1C] rounded-xl p-1 mb-8">
            {(['login', 'signup'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => { setMode(tab); setError(''); }}
                className={`flex-1 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 ${
                  mode === tab
                    ? 'bg-[#1A1A1A] text-white shadow-sm'
                    : 'text-[#555] hover:text-[#888]'
                }`}
              >
                {tab === 'login' ? 'Log In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {mode === 'login' ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-[11px] font-medium text-[#888] uppercase tracking-wider mb-2">
                    Username or Email
                  </label>
                  <input
                    type="text"
                    value={identifier}
                    onChange={e => setIdentifier(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                    placeholder="yourname or you@email.com"
                    className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl px-4 py-3 text-[14px] text-white placeholder-[#444] outline-none focus:border-[#DF812D] focus:ring-1 focus:ring-[#DF812D]/30 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#888] uppercase tracking-wider mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleLogin()}
                      placeholder="••••••••"
                      className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl px-4 py-3 pr-12 text-[14px] text-white placeholder-[#444] outline-none focus:border-[#DF812D] focus:ring-1 focus:ring-[#DF812D]/30 transition-all"
                    />
                    <button
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#444] hover:text-[#888] transition-colors"
                    >
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3"
                  >
                    <AlertCircle size={14} className="text-red-400 shrink-0" />
                    <p className="text-[13px] text-red-400">{error}</p>
                  </motion.div>
                )}

                <button
                  onClick={handleLogin}
                  disabled={loading}
                  className="w-full py-3.5 bg-white text-[#080808] rounded-xl font-bold text-[14px] hover:bg-[#EAEAEA] disabled:opacity-50 transition-all duration-200 mt-2"
                >
                  {loading ? 'Logging in...' : 'Log In'}
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="signup"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-[11px] font-medium text-[#888] uppercase tracking-wider mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="yourname"
                    className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl px-4 py-3 text-[14px] text-white placeholder-[#444] outline-none focus:border-[#DF812D] focus:ring-1 focus:ring-[#DF812D]/30 transition-all"
                  />
                  <p className="text-[11px] text-[#444] mt-1.5">Letters, numbers, underscores only</p>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#888] uppercase tracking-wider mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl px-4 py-3 text-[14px] text-white placeholder-[#444] outline-none focus:border-[#DF812D] focus:ring-1 focus:ring-[#DF812D]/30 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#888] uppercase tracking-wider mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={signupPassword}
                      onChange={e => setSignupPassword(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSignup()}
                      placeholder="Min. 6 characters"
                      className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl px-4 py-3 pr-12 text-[14px] text-white placeholder-[#444] outline-none focus:border-[#DF812D] focus:ring-1 focus:ring-[#DF812D]/30 transition-all"
                    />
                    <button
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#444] hover:text-[#888] transition-colors"
                    >
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3"
                  >
                    <AlertCircle size={14} className="text-red-400 shrink-0" />
                    <p className="text-[13px] text-red-400">{error}</p>
                  </motion.div>
                )}

                <button
                  onClick={handleSignup}
                  disabled={loading}
                  className="w-full py-3.5 bg-white text-[#080808] rounded-xl font-bold text-[14px] hover:bg-[#EAEAEA] disabled:opacity-50 transition-all duration-200 mt-2"
                >
                  {loading ? 'Creating account...' : 'Create Account'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <p className="text-center text-[12px] text-[#444] mt-6">
          CreatorMentor · AWS AI for Bharat Hackathon 2026
        </p>
      </div>
    </div>
  );
}