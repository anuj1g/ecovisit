import React from 'react';
import { TrendingUp, Users, Shield, Zap } from 'lucide-react';
import { motion } from 'motion/react';

export default function RightSidebar() {
  return (
    <aside className="w-80 h-[calc(100vh-120px)] sticky top-28 hidden lg:block overflow-y-auto pr-4 scrollbar-hide">
      <div className="space-y-6 pb-20">
        {/* Cleanliness Stats */}
        <div className="bg-white dark:bg-surface brutalist-border rounded-3xl p-6">
          <div className="flex items-center gap-2 text-[10px] font-black text-stone-400 dark:text-stone-500 uppercase tracking-[0.2em] mb-4">
            <TrendingUp className="w-3 h-3 text-accent" />
            City Statistics
          </div>
          <div className="space-y-4">
            <StatItem label="Resolved Reports" value="1,284" change="+12%" />
            <StatItem label="Active Volunteers" value="452" change="+5%" />
            <StatItem label="Cleanliness Score" value="84/100" change="+2%" />
          </div>
        </div>

        {/* Global Objectives */}
        <div className="bg-white dark:bg-surface brutalist-border rounded-3xl p-6">
          <div className="flex items-center gap-2 text-[10px] font-black text-stone-400 dark:text-stone-500 uppercase tracking-[0.2em] mb-6">
            <Zap className="w-3 h-3 text-accent" />
            Live Objectives
          </div>
          <div className="space-y-6">
            <ObjectiveItem 
              title="Green Sector 4 Cleanout" 
              progress={75} 
              reward="500 EXP"
            />
            <ObjectiveItem 
              title="Industrial Waste Scan" 
              progress={40} 
              reward="1200 EXP"
            />
          </div>
        </div>

        {/* Top Guardians */}
        <div className="bg-white dark:bg-surface brutalist-border rounded-3xl p-6">
          <div className="flex items-center gap-2 text-[10px] font-black text-stone-400 dark:text-stone-500 uppercase tracking-[0.2em] mb-4">
            <Shield className="w-3 h-3 text-accent" />
            Top Guardians
          </div>
          <div className="space-y-4">
            <GuardianItem name="User_Cyan" rank={1} points={14200} />
            <GuardianItem name="Ecovigilante" rank={2} points={12800} />
            <GuardianItem name="TrashHunter" rank={3} points={11500} />
          </div>
        </div>

        {/* Categories */}
        <div className="bg-white dark:bg-surface brutalist-border rounded-3xl p-6">
          <div className="flex items-center gap-2 text-[10px] font-black text-stone-400 dark:text-stone-500 uppercase tracking-[0.2em] mb-4">
             <TrendingUp className="w-3 h-3 text-accent" />
             Active Categories
          </div>
          <div className="flex flex-wrap gap-2">
             <CategoryTag label="Plastic" count={84} />
             <CategoryTag label="Metal" count={32} />
             <CategoryTag label="Organic" count={128} />
             <CategoryTag label="Hazardous" count={12} />
             <CategoryTag label="Electronic" count={45} />
          </div>
        </div>
      </div>
    </aside>
  );
}

function CategoryTag({ label, count }: { label: string; count: number }) {
  return (
    <div className="px-3 py-1.5 rounded-xl bg-stone-50 dark:bg-white/5 border border-stone-100 dark:border-white/5 hover:border-accent/30 transition-all cursor-default group">
      <span className="text-[10px] font-black text-stone-500 dark:text-stone-400 group-hover:text-stone-900 dark:group-hover:text-white uppercase tracking-tight">{label}</span>
      <span className="ml-2 text-[10px] font-black text-stone-400 dark:text-stone-600 font-mono tracking-tighter">{count}</span>
    </div>
  );
}

function StatItem({ label, value, change }: { label: string; value: string; change: string }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-bold text-stone-400 dark:text-stone-400">{label}</p>
        <p className="text-xl font-black font-mono text-stone-900 dark:text-white">{value}</p>
      </div>
      <span className="text-[10px] font-black text-accent bg-accent/10 px-2 py-1 rounded-lg">
        {change}
      </span>
    </div>
  );
}

function ObjectiveItem({ title, progress, reward }: { title: string; progress: number; reward: string }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <div>
          <p className="text-xs font-bold text-stone-900 dark:text-white">{title}</p>
          <p className="text-[10px] font-black text-accent uppercase">{reward}</p>
        </div>
        <span className="text-[10px] font-black font-mono text-stone-400 dark:text-stone-500">{progress}%</span>
      </div>
      <div className="h-1 bg-stone-100 dark:bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="h-full bg-accent shadow-[0_0_10px_rgba(16,185,129,0.5)]"
        />
      </div>
    </div>
  );
}

function GuardianItem({ name, rank, points }: { name: string; rank: number; points: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-xl bg-stone-100 dark:bg-white/5 flex items-center justify-center text-xs font-black text-stone-400 dark:text-stone-400 font-mono">
        {rank}
      </div>
      <div className="flex-1">
        <p className="text-xs font-bold text-stone-900 dark:text-white line-clamp-1">{name}</p>
        <p className="text-[10px] font-black text-stone-400 dark:text-stone-500 uppercase font-mono">{points} PTS</p>
      </div>
    </div>
  );
}
