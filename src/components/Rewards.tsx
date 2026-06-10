import React, { useEffect, useState } from 'react';
import { UserProfile, Reward } from '../types';
import { formatDate, cn } from '../lib/utils';
import { Award, TrendingUp, History, Gift, ArrowUpRight, Star, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { api } from '../lib/api';

export default function Rewards({ user }: { user: UserProfile }) {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRewards() {
      try {
        const data = await api.getRewards();
        setRewards(data || []);
      } catch (err) {
        console.error('Error fetching rewards:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchRewards();
  }, []);

  const handleExport = () => {
    const headers = ['ID', 'Type', 'Points', 'Date'];
    const rows = rewards.map(r => [r.id, r.type, r.points, new Date(r.timestamp).toLocaleDateString()]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ecovisit_rewards_${user.uid.slice(0, 8)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-5xl mx-auto space-y-12"
    >
      <div>
        <div className="flex items-center gap-2 text-accent text-[10px] font-black uppercase tracking-[0.4em] mb-2">
          <TrendingUp className="w-3 h-3" />
          My Impact
        </div>
        <h1 className="text-5xl font-black text-stone-900 dark:text-white font-display tracking-tight uppercase italic leading-none">Rewards</h1>
        <p className="text-stone-600 dark:text-stone-500 mt-3 font-bold max-w-lg italic">View your points and track your contributions to the environment.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main XP Card */}
        <div className="md:col-span-1 bg-white dark:bg-surface brutalist-border rounded-3xl p-10 relative overflow-hidden group">
          <Star className="absolute -right-8 -top-8 w-40 h-40 text-accent/5 group-hover:rotate-45 transition-transform duration-1000" />
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div>
              <p className="text-stone-400 dark:text-stone-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Total Points</p>
              <div className="flex items-baseline gap-2">
                <span className="text-7xl font-black text-stone-900 dark:text-white tracking-tighter italic">{user.points}</span>
                <span className="text-accent font-black text-xs uppercase tracking-widest pl-1">XP</span>
              </div>
            </div>
            <div className="mt-8">
              <div className="h-1.5 w-full bg-stone-100 dark:bg-white/5 rounded-full overflow-hidden mb-2">
                <div className="h-full bg-accent w-3/4 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              </div>
              <p className="text-[10px] font-black text-stone-400 dark:text-stone-500 uppercase tracking-widest flex justify-between">
                <span>Green Guardian</span>
                <span>75%</span>
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-surface brutalist-border rounded-3xl p-8 flex flex-col justify-between border-emerald-500/10">
            <div className="flex items-center justify-between mb-8">
              <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-600 dark:text-emerald-500 border border-emerald-500/20">
                <Award className="w-7 h-7" />
              </div>
              <p className="text-4xl font-black text-stone-900 dark:text-white italic">{rewards.length}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-stone-400 dark:text-stone-500 uppercase tracking-[0.2em] mb-1">Total Reports</p>
              <h3 className="text-xl font-black text-stone-900 dark:text-white leading-none uppercase">Contributions</h3>
            </div>
          </div>

          <div className="bg-white dark:bg-surface brutalist-border rounded-3xl p-8 flex flex-col justify-between border-amber-500/10">
            <div className="flex items-center justify-between mb-8 text-amber-600 dark:text-amber-500">
              <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20">
                <Gift className="w-7 h-7" />
              </div>
              <div className="px-3 py-1 bg-amber-500/10 rounded-full text-[8px] font-black uppercase tracking-widest border border-amber-500/20">
                SOON
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black text-stone-400 dark:text-stone-500 uppercase tracking-[0.2em] mb-1">Coming Soon</p>
              <h3 className="text-xl font-black text-stone-900 dark:text-white leading-none uppercase">Voucher Access</h3>
            </div>
          </div>
        </div>
      </div>

      {/* History Ledger */}
      <div className="bg-white dark:bg-surface brutalist-border rounded-3xl overflow-hidden">
        <div className="p-10 border-b border-stone-200 dark:border-white/5 flex items-center justify-between bg-stone-50 dark:bg-white/[0.02]">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-stone-100 dark:bg-white/5 rounded-2xl flex items-center justify-center text-stone-400 dark:text-stone-600 border border-stone-200 dark:border-white/5">
              <History className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-stone-900 dark:text-white uppercase italic tracking-tight leading-none">Activity</h2>
              <p className="text-[10px] text-stone-400 dark:text-stone-500 uppercase tracking-[0.2em] mt-2 font-black">Points History</p>
            </div>
          </div>
          <button 
            onClick={handleExport}
            className="hidden sm:flex items-center gap-2 text-[10px] font-black text-accent uppercase tracking-widest hover:bg-accent/10 px-4 py-2 rounded-xl transition-all border border-accent/20"
          >
             Export <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
        
        {loading ? (
          <div className="p-24 text-center">
            <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[10px] text-stone-500 uppercase tracking-widest font-black">Loading activity...</p>
          </div>
        ) : rewards.length === 0 ? (
          <div className="p-24 text-center">
            <p className="text-xl font-black text-stone-900 dark:text-white uppercase italic tracking-tight mb-2">No Points Yet</p>
            <p className="text-xs text-stone-500 font-bold max-w-xs mx-auto">Start posting reports to earn impact points and rewards.</p>
          </div>
        ) : (
          <div className="divide-y divide-stone-200 dark:divide-white/5">
            {rewards.map((reward, index) => (
              <motion.div 
                key={reward.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className="p-8 flex items-center justify-between hover:bg-stone-50 dark:hover:bg-white/[0.03] transition-all group"
              >
                <div className="flex items-center gap-8">
                  <div className="w-16 h-16 bg-stone-100 dark:bg-white/5 group-hover:bg-accent/10 rounded-2xl flex items-center justify-center text-stone-400 dark:text-stone-600 group-hover:text-accent transition-all border border-stone-200 dark:border-white/5 group-hover:border-accent/20">
                    <Award className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="font-black text-stone-900 dark:text-white uppercase tracking-tight text-xl italic leading-none mb-2">Reward Earned</p>
                    <div className="flex items-center gap-3">
                      <p className="text-[10px] text-stone-400 dark:text-stone-500 font-black uppercase tracking-widest">{formatDate(reward.timestamp)}</p>
                      <div className="w-1 h-1 bg-stone-200 dark:bg-stone-800 rounded-full" />
                      <p className="text-[9px] text-stone-500 dark:text-stone-600 uppercase whitespace-nowrap tracking-widest">ID: {reward.id.slice(0, 10).toUpperCase()}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-accent font-black text-2xl group-hover:drop-shadow-[0_0_10px_rgba(16,185,129,0.4)] transition-all">
                  <span className="text-sm opacity-50">+</span>
                  <span className="italic">{reward.points}</span>
                  <ArrowUpRight className="w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
