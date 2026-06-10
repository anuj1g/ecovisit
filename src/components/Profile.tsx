import React, { useState, useEffect } from 'react';
import { UserProfile, Report } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { User, Shield, Award, Settings, LogOut, Mail, Calendar, MapPin, Heart, MessageCircle, FileText, Loader2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn, formatDate } from '../lib/utils';
import { api } from '../lib/api';

export default function Profile({ user, onUpdate }: { user: UserProfile, onUpdate: (user: UserProfile) => void }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'uploads' | 'likes' | 'comments'>('uploads');
  const [activity, setActivity] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState(user.fullName || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchActivity() {
      setLoading(true);
      try {
        let data: Report[] = [];
        if (activeTab === 'uploads') data = await api.getUserPosts();
        else if (activeTab === 'likes') data = await api.getUserLikes();
        else if (activeTab === 'comments') data = await api.getUserComments();
        
        setActivity(data || []);
      } catch (err) {
        console.error('Error fetching activity:', err);
        setActivity([]);
      } finally {
        setLoading(false);
      }
    }
    fetchActivity();
  }, [activeTab]);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    window.location.href = '/';
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updatedUser = await api.updateMe({ fullName: editName });
      onUpdate(updatedUser);
      setShowEditModal(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto space-y-12 pb-24"
    >
      <div>
        <div className="flex items-center gap-2 text-accent text-[10px] font-black uppercase tracking-[0.4em] mb-2">
          <Shield className="w-3 h-3" />
          Verified Account
        </div>
        <h1 className="text-5xl font-black text-stone-900 dark:text-white font-display tracking-tight uppercase italic leading-none">Profile</h1>
        <p className="text-stone-600 dark:text-stone-500 mt-3 font-bold max-w-lg italic">Management center for your personal statistics and community engagement.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="md:col-span-1 bg-white dark:bg-surface brutalist-border rounded-3xl p-8 flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-accent/10 rounded-3xl flex items-center justify-center border border-accent/20 mb-6 group relative overflow-hidden">
             <div className="absolute inset-0 bg-accent/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
             <User className="w-10 h-10 text-accent relative z-10" />
          </div>
          <h2 className="text-2xl font-black text-stone-900 dark:text-white uppercase italic tracking-tight mb-1">{user.fullName || 'User'}</h2>
          <p className="text-[10px] font-black text-stone-400 dark:text-stone-500 uppercase tracking-widest mb-6">User ID: {user.uid.slice(0, 8).toUpperCase()}</p>
          
          <div className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest mb-8",
            user.role === 'admin' ? "bg-amber-500 text-white" : "bg-emerald-500 text-white"
          )}>
            <Shield className="w-3 h-3" />
            {user.role}
          </div>

          <div className="w-full space-y-3">
             <button 
               onClick={() => setShowEditModal(true)}
               className="w-full py-4 rounded-2xl bg-stone-50 dark:bg-white/5 hover:bg-stone-100 dark:hover:bg-white/10 text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white transition-all text-[10px] font-black uppercase tracking-widest border border-stone-100 dark:border-white/5 flex items-center justify-center gap-2"
             >
                <Settings className="w-3 h-3" /> Edit Profile
             </button>
             <button 
               onClick={handleLogout}
               className="w-full py-4 rounded-2xl bg-red-500/10 hover:bg-red-500 text-red-600 dark:text-red-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest border border-red-500/20 flex items-center justify-center gap-2"
             >
                <LogOut className="w-3 h-3" /> Logout
             </button>
          </div>
        </div>

        {/* Info Blocks */}
        <div className="md:col-span-2 space-y-8">
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <InfoBlock 
                icon={<Award className="w-5 h-5" />} 
                label="Impact Points" 
                value={`${user.points} XP`} 
                color="text-accent"
              />
              <InfoBlock 
                icon={<Mail className="w-5 h-5" />} 
                label="Email" 
                value={user.email || 'N/A'} 
              />
              <InfoBlock 
                icon={<Calendar className="w-5 h-5" />} 
                label="Joined" 
                value="2024" 
              />
              <InfoBlock 
                icon={<MapPin className="w-5 h-5" />} 
                label="Location" 
                value="Community" 
              />
           </div>
        </div>
      </div>

      {/* Activity Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-stone-200 dark:border-white/5 pb-4">
          <h3 className="text-2xl font-black text-stone-900 dark:text-white uppercase italic tracking-tight">Recent Activity</h3>
          <div className="flex items-center gap-1 bg-stone-100 dark:bg-white/5 p-1 rounded-2xl">
            {(['uploads', 'likes', 'comments'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  activeTab === tab 
                    ? "bg-accent text-white shadow-lg shadow-accent/20" 
                    : "text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-8 h-8 text-accent animate-spin" />
            <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Fetching activity...</p>
          </div>
        ) : activity.length === 0 ? (
          <div className="bg-white dark:bg-surface border border-stone-100 dark:border-white/5 rounded-3xl p-16 text-center">
            <p className="text-stone-400 dark:text-stone-500 font-bold italic">No activity found in this section.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence mode="popLayout">
              {activity.map((report) => (
                <motion.div
                  key={report.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-surface border border-stone-100 dark:border-white/5 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="aspect-video relative overflow-hidden bg-stone-100 dark:bg-stone-900">
                    <img src={report.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[8px] font-black text-white uppercase tracking-widest border border-white/10 uppercase">
                      {report.status}
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-sm font-medium text-stone-600 dark:text-stone-300 line-clamp-2 mb-4 leading-relaxed italic">
                      {report.description || "No description provided."}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-stone-50 dark:border-white/5">
                      <div className="flex items-center gap-4 text-stone-400">
                        <div className="flex items-center gap-1.5 text-[10px] font-black">
                          <Heart className="w-4 h-4" /> {report.likes?.length || 0}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-black">
                          <MessageCircle className="w-4 h-4" /> {report.commentCount || 0}
                        </div>
                      </div>
                      <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">
                        {formatDate(report.createdAt)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {showEditModal && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEditModal(false)}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-surface rounded-3xl p-8 shadow-2xl overflow-hidden"
            >
              <div className="absolute right-4 top-4">
                <button 
                  onClick={() => setShowEditModal(false)}
                  className="p-2 text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-8">
                <h3 className="text-2xl font-black text-stone-900 dark:text-white uppercase italic tracking-tight mb-2">Edit Profile</h3>
                <p className="text-xs text-stone-500 font-bold italic">Update your account identity on the network.</p>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                  <input 
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                    className="w-full bg-stone-50 dark:bg-white/5 border border-stone-100 dark:border-white/5 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-accent/20 outline-none transition-all placeholder:text-stone-300 dark:text-white"
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="pt-4">
                  <button 
                    type="submit"
                    disabled={saving}
                    className="w-full bg-accent hover:bg-accent-dark text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-accent/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function InfoBlock({ icon, label, value, color = "text-stone-900 dark:text-white" }: { icon: React.ReactNode, label: string, value: string, color?: string }) {
  return (
    <div className="bg-white dark:bg-surface brutalist-border rounded-3xl p-6 flex flex-col justify-between">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-stone-50 dark:bg-white/5 rounded-2xl flex items-center justify-center text-stone-400 dark:text-stone-500 border border-stone-100 dark:border-white/5">
          {icon}
        </div>
        <p className="text-[10px] font-black text-stone-400 dark:text-stone-500 uppercase tracking-widest">{label}</p>
      </div>
      <p className={cn("text-xl font-black uppercase italic tracking-tight", color)}>{value}</p>
    </div>
  );
}

