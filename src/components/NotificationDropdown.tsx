import React, { useEffect, useState } from 'react';
import { Bell, Check, Clock, Heart, MessageCircle, Info, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Notification } from '../types';
import { api } from '../lib/api';
import { cn, formatDate } from '../lib/utils';

interface NotificationDropdownProps {
  onClose: () => void;
}

export default function NotificationDropdown({ onClose }: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    
    // Auto mark all as read when opening? Or maybe add a button.
    // For now, let's just fetch.
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data || []);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleNotificationClick = async (n: Notification) => {
    if (!n.read) {
      try {
        await api.markNotificationRead(n.id);
        setNotifications(prev => prev.map(notif => notif.id === n.id ? { ...notif, read: true } : notif));
      } catch (err) {}
    }
    // Handle link navigation if needed
    if (n.link) {
      // In a real app we'd navigate. Here we just close the dropdown.
      onClose();
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'like': return <Heart className="w-4 h-4 text-rose-500" />;
      case 'comment': return <MessageCircle className="w-4 h-4 text-emerald-500" />;
      case 'status_change': return <Check className="w-4 h-4 text-blue-500" />;
      default: return <Info className="w-4 h-4 text-stone-400" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-surface border border-stone-200 dark:border-white/5 rounded-3xl shadow-2xl overflow-hidden z-[1000]"
    >
      <div className="p-6 border-b border-stone-100 dark:border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-black text-stone-900 dark:text-white uppercase tracking-widest">Inbox</h3>
        </div>
        <button 
          onClick={markAllAsRead}
          className="text-[10px] font-black text-accent uppercase tracking-widest hover:bg-accent/10 px-3 py-1 rounded-lg transition-all"
        >
          Mark all read
        </button>
      </div>

      <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Updating feed...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm font-bold text-stone-400 italic">No notifications yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-stone-50 dark:divide-white/5">
            {notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className={cn(
                  "w-full text-left p-5 flex gap-4 transition-colors hover:bg-stone-50 dark:hover:bg-white/5 text-xs",
                  !n.read && "bg-accent/5 dark:bg-accent/10"
                )}
              >
                <div className={cn(
                  "shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
                  n.read ? "bg-stone-100 dark:bg-white/5" : "bg-white dark:bg-surface shadow-md"
                )}>
                  {getIcon(n.type)}
                </div>
                <div className="flex-1 space-y-1">
                  <p className={cn(
                    "font-bold leading-relaxed",
                    n.read ? "text-stone-500 dark:text-stone-400" : "text-stone-900 dark:text-white"
                  )}>
                    {n.message}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-stone-400 font-bold">
                    <Clock className="w-3 h-3" />
                    {formatDate(n.createdAt)}
                  </div>
                </div>
                {!n.read && (
                  <div className="w-2 h-2 bg-accent rounded-full mt-2" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 bg-stone-50 dark:bg-white/5 text-center">
        <button 
          onClick={onClose}
          className="text-[10px] font-black text-stone-400 uppercase tracking-widest hover:text-stone-600 dark:hover:text-stone-200 transition-all"
        >
          Dismiss
        </button>
      </div>
    </motion.div>
  );
}
