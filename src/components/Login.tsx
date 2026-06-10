import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from './Logo';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Chrome, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { api } from '../lib/api';

interface LoginProps {
  onSwitch?: () => void;
  isModal?: boolean;
}

export default function Login({ onSwitch, isModal }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.login({ email, password });
      window.location.reload(); // Quick way to refresh auth state in App.tsx
      if (!isModal) navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const containerClasses = isModal 
    ? "w-full" 
    : "max-w-md mx-auto my-12 glass p-12 rounded-[3.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] dark:shadow-none border border-white/20 transition-all duration-500";

  return (
    <motion.div 
      initial={isModal ? {} : { opacity: 0, scale: 0.95, y: 20 }}
      animate={isModal ? {} : { opacity: 1, scale: 1, y: 0 }}
      className={containerClasses}
    >
      <div>
        <div className="flex flex-col items-center mb-10">
          <motion.div 
            whileHover={{ rotate: 12, scale: 1.1 }}
            className="w-20 h-20 bg-stone-50 dark:bg-white rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-500/10 mb-6 p-2.5"
          >
            <Logo className="w-full h-full text-emerald-900" />
          </motion.div>
          <h1 className="text-3xl font-black text-stone-900 dark:text-white font-display tracking-tight uppercase italic">EcoVisit</h1>
          <p className="text-stone-500 dark:text-stone-400 text-[10px] mt-2 font-black uppercase tracking-[0.3em] opacity-80">CLEAN CITY INITIATIVE</p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 p-4 rounded-xl text-xs font-bold mb-6 border border-red-100 dark:border-red-900/50"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-stone-400 dark:text-stone-500 uppercase tracking-widest pl-1">Email Terminal</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-300 dark:text-stone-600" />
              <input
                type="email"
                required
                className="w-full pl-12 pr-4 py-4 bg-stone-100 dark:bg-white/5 border border-stone-200 dark:border-white/5 rounded-xl focus:ring-2 focus:ring-accent outline-none transition-all dark:text-white placeholder:text-stone-300 dark:placeholder:text-stone-600 font-medium text-sm"
                placeholder="citizen@ecovisit.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[10px] font-black text-stone-400 dark:text-stone-500 uppercase tracking-widest pl-1">Access Key</label>
              {!isModal && (
                <Link to="/forgot-password" size="sm" className="text-[10px] font-black text-accent-dark hover:underline uppercase tracking-widest">
                  Recover?
                </Link>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-300 dark:text-stone-600" />
              <input
                type={showPassword ? "text" : "password"}
                required
                className="w-full pl-12 pr-12 py-4 bg-stone-100 dark:bg-white/5 border border-stone-200 dark:border-white/5 rounded-xl focus:ring-2 focus:ring-accent outline-none transition-all dark:text-white placeholder:text-stone-300 dark:placeholder:text-stone-600 font-medium text-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-300 dark:text-stone-600 hover:text-stone-500 dark:hover:text-stone-400 p-1"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent hover:bg-accent-dark text-white font-black py-4 rounded-xl shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50 uppercase tracking-widest text-xs mt-2"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Initiate Login
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        {/* Alternative options removed as we migrated from Firebase */}

        <div className="mt-10 pt-6 border-t border-stone-50 dark:border-white/5 text-center">
          <p className="text-stone-400 dark:text-stone-500 text-xs font-medium">
            New here?{' '}
            <button 
              onClick={onSwitch || (() => navigate('/register'))}
              className="text-accent-dark font-black hover:underline uppercase tracking-widest ml-1"
            >
              Join Force
            </button>
          </p>
        </div>
      </div>
    </motion.div>
  );
}

