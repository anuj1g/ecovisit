import React, { useEffect, useState } from 'react';
import { Database, AlertTriangle, CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../lib/api';

export function DatabaseStatus() {
  const [status, setStatus] = useState<{
    mongo: string;
    mongoState: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(true);

  const checkStatus = async () => {
    try {
      const data = await api.getHealth();
      setStatus(data);
    } catch (err) {
      console.error('Health check failed:', err);
      setStatus({ mongo: 'disconnected', mongoState: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Small delay before first check to ensure server is bound to port
    const timer = setTimeout(checkStatus, 1500);
    const interval = setInterval(checkStatus, 30000); 
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  if (!status || !isVisible) return null;

  const isConnected = status.mongoState === 1;
  const isConnecting = status.mongoState === 2;

  if (isConnected) return null; // Don't show anything if everything is fine

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        className="fixed bottom-6 right-6 z-50 max-w-sm"
      >
        <div className={`p-4 rounded-2xl shadow-2xl flex flex-col gap-3 border ${
          isConnecting 
            ? "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/50" 
            : "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900/50"
        }`}>
          <div className="flex items-start gap-4">
            <div className={`p-2 rounded-xl ${
              isConnecting ? "bg-amber-100 text-amber-600" : "bg-red-100 text-red-600"
            }`}>
              {isConnecting ? <Loader2 className="w-5 h-5 animate-spin" /> : <AlertTriangle className="w-5 h-5" />}
            </div>
            <div className="flex-1">
              <h3 className={`text-xs font-black uppercase tracking-widest ${
                isConnecting ? "text-amber-800 dark:text-amber-400" : "text-red-800 dark:text-red-400"
              }`}>
                {isConnecting ? "Stabilizing Connection" : "Database Offline"}
              </h3>
              <p className="text-[10px] font-medium text-stone-500 mt-1 leading-relaxed">
                {isConnecting 
                  ? "We're currently bridging to MongoDB Atlas. This should only take a moment."
                  : "We're having trouble reaching the database. Applications defaults (Mocks) are active. Please check your Atlas IP whitelist."}
              </p>
            </div>
            <button 
              onClick={() => setIsVisible(false)}
              className="text-stone-400 hover:text-stone-600 p-1"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
          
           {!isConnecting && (
            <div className="flex gap-2">
              <button 
                onClick={checkStatus}
                className="flex-1 py-1.5 bg-white dark:bg-white/5 border border-red-200 dark:border-red-900/30 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-red-100 transition-colors"
              >
                Retry Link
              </button>
              <a 
                href="https://www.mongodb.com/docs/atlas/security-whitelist/"
                target="_blank"
                rel="no-referrer"
                className="flex-1 py-1.5 bg-red-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest text-center hover:bg-red-700 transition-colors"
              >
                Whitelist IP
              </a>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
