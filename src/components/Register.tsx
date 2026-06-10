import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from './Logo';
import { Mail, Lock, Eye, EyeOff, User, ArrowRight, Chrome, Loader2, Phone, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../lib/api';
import { cn } from '../lib/utils';
import emailjs from '@emailjs/browser';

interface RegisterProps {
  onSwitch?: () => void;
  isModal?: boolean;
}

export default function Register({ onSwitch, isModal }: RegisterProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [timer, setTimer] = useState(90);
  const [otpLoading, setOtpLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let interval: any;
    if (isOtpSent && timer > 0 && !isOtpVerified) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsOtpSent(false);
      setGeneratedOtp('');
      setError('OTP expired. Please send again.');
    }
    return () => clearInterval(interval);
  }, [isOtpSent, timer, isOtpVerified]);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (value && !validateEmail(value)) {
      setEmailError('Invalid email format');
    } else {
      setEmailError('');
    }
  };

  const sendOtp = async () => {
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email');
      return;
    }
    setError('');
    setOtpLoading(true);

    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);

    // EmailJS keys from environment or placeholders
    const serviceId = (import.meta as any).env.VITE_EMAILJS_SERVICE_ID || 'service_default';
    const templateId = (import.meta as any).env.VITE_EMAILJS_TEMPLATE_ID || 'template_otp';
    const publicKey = (import.meta as any).env.VITE_EMAILJS_PUBLIC_KEY || 'your_public_key';

    try {
      await emailjs.send(
        serviceId,
        templateId,
        {
          passcode: newOtp,
          time: '15 minutes', // As per user request: "This code is valid until {{time}} (15 minutes)."
          to_email: email,
        },
        publicKey
      );
      setIsOtpSent(true);
      setTimer(90);
      setOtpLoading(false);
      setError('');
    } catch (err: any) {
      console.error('EmailJS Error:', err);
      setError('Failed to send OTP. Please check EmailJS configuration.');
      setOtpLoading(false);
    }
  };

  const verifyOtp = () => {
    if (otp === generatedOtp && otp !== '') {
      setIsOtpVerified(true);
      setError('');
    } else {
      setError('Invalid OTP. Please try again.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (!isOtpVerified) {
      setError('Please verify your email with OTP first');
      return;
    }

    setLoading(true);
    try {
      await api.register({ email, password, fullName: name, phoneNumber });
      window.location.reload();
      if (!isModal) navigate('/');
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
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
             whileHover={{ rotate: -12, scale: 1.1 }}
             className="w-20 h-20 bg-stone-50 dark:bg-white rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-500/10 mb-6 p-2.5"
          >
            <Logo className="w-full h-full text-emerald-900" />
          </motion.div>
          <h1 className="text-3xl font-black text-stone-900 dark:text-white font-display tracking-tight uppercase italic">Join EcoVisit</h1>
          <p className="text-stone-500 dark:text-stone-400 text-[10px] mt-2 font-black uppercase tracking-[0.3em] opacity-80">CLEAN CITY INITIATIVE</p>
        </div>

        {(error || emailError) && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 p-4 rounded-xl text-xs font-bold mb-6 border border-red-100 dark:border-red-900/50"
          >
            {error || emailError}
          </motion.div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-stone-400 dark:text-stone-500 uppercase tracking-widest pl-1">Ident Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-300 dark:text-stone-600" />
              <input
                type="text"
                required
                className="w-full pl-12 pr-4 py-4 bg-stone-100 dark:bg-white/5 border border-stone-200 dark:border-white/5 rounded-xl focus:ring-2 focus:ring-accent outline-none transition-all dark:text-white placeholder:text-stone-300 dark:placeholder:text-stone-600 font-medium text-sm"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-stone-400 dark:text-stone-500 uppercase tracking-widest pl-1">Email Terminal</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-300 dark:text-stone-600" />
              <input
                type="email"
                required
                disabled={isOtpVerified}
                className={cn(
                  "w-full pl-12 pr-4 py-4 bg-stone-100 dark:bg-white/5 border rounded-xl focus:ring-2 outline-none transition-all dark:text-white placeholder:text-stone-300 dark:placeholder:text-stone-600 font-medium text-sm",
                  emailError ? "border-red-500 focus:ring-red-500" : "border-stone-200 dark:border-white/5 focus:ring-accent"
                )}
                placeholder="citizen@ecovisit.com"
                value={email}
                onChange={handleEmailChange}
              />
            </div>
          </div>

          {!isOtpVerified && (
            <div className="space-y-4">
              {!isOtpSent ? (
                <button
                  type="button"
                  onClick={sendOtp}
                  disabled={otpLoading || !email || !!emailError}
                  className="w-full py-4 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-black rounded-xl border border-emerald-500/20 transition-all uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {otpLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Verification OTP"}
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-[10px] font-black text-stone-400 dark:text-stone-500 uppercase tracking-widest pl-1">Enter 6-Digit OTP</label>
                    <span className="text-[10px] font-black text-emerald-500 uppercase tabular-nums">{formatTime(timer)}</span>
                  </div>
                  <div className="relative">
                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
                    <input
                      type="text"
                      maxLength={6}
                      className="w-full pl-12 pr-4 py-4 bg-stone-100 dark:bg-white/5 border border-emerald-500/30 rounded-xl focus:ring-2 focus:ring-accent outline-none transition-all dark:text-white placeholder:text-stone-300 dark:placeholder:text-stone-600 font-medium text-sm tracking-[1em]"
                      placeholder="000000"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={verifyOtp}
                    className="w-full py-4 bg-emerald-600 text-white font-black rounded-xl shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all uppercase tracking-[0.2em] text-[10px]"
                  >
                    Verify OTP
                  </button>
                  <button
                    type="button"
                    onClick={sendOtp}
                    className="w-full text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300 text-[10px] font-black uppercase tracking-widest"
                  >
                    Resend OTP
                  </button>
                </div>
              )}
            </div>
          )}

          {isOtpVerified && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5"
            >
              <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/50 p-3 rounded-xl flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Email Verified Successfully</span>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-stone-400 dark:text-stone-500 uppercase tracking-widest pl-1">Access Key</label>
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

              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-stone-400 dark:text-stone-500 uppercase tracking-widest pl-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-300 dark:text-stone-600" />
                  <input
                    type="tel"
                    required
                    className="w-full pl-12 pr-4 py-4 bg-stone-100 dark:bg-white/5 border border-stone-200 dark:border-white/5 rounded-xl focus:ring-2 focus:ring-accent outline-none transition-all dark:text-white placeholder:text-stone-300 dark:placeholder:text-stone-600 font-medium text-sm"
                    placeholder="+91 00000 00000"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-xl shadow-xl shadow-emerald-600/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50 uppercase tracking-widest text-xs mt-2"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </motion.div>
          )}
        </form>

        <div className="mt-10 pt-6 border-t border-stone-50 dark:border-white/5 text-center">
          <p className="text-stone-400 dark:text-stone-500 text-xs font-medium">
            Already a member?{' '}
            <button 
              onClick={onSwitch || (() => navigate('/login'))}
              className="text-emerald-600 font-black hover:underline uppercase tracking-widest ml-1"
            >
              Auth Login
            </button>
          </p>
        </div>
      </div>
    </motion.div>
  );
}


