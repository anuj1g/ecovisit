import React, { useState, useEffect } from 'react';
import { Search, Bell, Menu, User, LogOut } from 'lucide-react';
import { UserProfile, Notification } from '../types';
import ThemeToggle from './ThemeToggle';
import { Logo } from './Logo';
import NotificationDropdown from './NotificationDropdown';
import { AnimatePresence } from 'motion/react';
import { api } from '../lib/api';

interface HeaderProps {
  user: UserProfile | null;
  onLogout: () => void;
  onOpenAuth: () => void;
}

export default function Header({ user, onLogout, onOpenAuth }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      const fetchCount = async () => {
        try {
          const notifications: Notification[] = await api.getNotifications();
          setUnreadCount(notifications.filter(n => !n.read).length);
        } catch (err) {}
      };
      fetchCount();
      // Poll every 30 seconds
      const interval = setInterval(fetchCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  return (
    <header className="sticky top-0 z-[900] glass border-b border-stone-200 dark:border-white/5 h-20">
      <div className="max-w-(--breakpoint-2xl) mx-auto px-4 h-full flex items-center justify-between gap-4">
        <div className="flex md:hidden items-center gap-3">
           <div className="w-10 h-10 bg-stone-100 dark:bg-emerald-50 rounded-xl flex items-center justify-center p-1 shadow-lg shadow-emerald-500/10">
            <Logo className="w-full h-full text-emerald-900" />
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-xl relative group hidden sm:block">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500 group-focus-within:text-accent transition-colors" />
          <input 
            type="text" 
            placeholder="Search report ID, sector, or keyword..." 
            className="w-full bg-stone-100 dark:bg-white/5 border border-stone-200 dark:border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm font-medium outline-none focus:ring-1 focus:ring-accent/50 focus:bg-stone-200 dark:focus:bg-white/10 transition-all placeholder:text-stone-500 dark:placeholder:text-stone-600 dark:text-white text-stone-900"
          />
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden sm:flex items-center gap-1">
            <ThemeToggle />
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-3 text-stone-500 dark:text-stone-400 hover:text-accent transition-colors relative"
              >
                 <Bell className="w-5 h-5" />
                 {unreadCount > 0 && (
                   <span className="absolute top-3 right-3 w-4 h-4 bg-accent text-white text-[8px] font-black flex items-center justify-center rounded-full border-2 border-white dark:border-surface">
                     {unreadCount > 9 ? '9+' : unreadCount}
                   </span>
                 )}
              </button>
              <AnimatePresence>
                {showNotifications && (
                  <NotificationDropdown onClose={() => setShowNotifications(false)} />
                )}
              </AnimatePresence>
            </div>
          </div>
          
          <div className="h-8 w-[1px] bg-stone-200 dark:bg-white/5 hidden sm:block" />

          {user ? (
            <div className="flex items-center gap-3 bg-stone-100 dark:bg-white/5 pl-4 pr-2 py-2 rounded-2xl border border-stone-200 dark:border-white/5">
              <div className="hidden xl:block text-right">
                <p className="text-xs font-black text-stone-900 dark:text-white leading-none">{user.displayName || 'Guardian'}</p>
                <p className="text-[10px] font-bold text-accent uppercase tracking-widest mt-1 font-mono">{user.points} XP</p>
              </div>
              <button 
                onClick={onLogout}
                className="w-10 h-10 rounded-xl bg-accent text-white flex items-center justify-center hover:bg-accent-dark transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button 
              onClick={onOpenAuth}
              className="bg-accent px-6 py-3 rounded-2xl text-white font-black text-xs uppercase tracking-widest hover:bg-accent-dark transition-all shadow-lg shadow-emerald-500/20"
            >
              Login / Profile
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
