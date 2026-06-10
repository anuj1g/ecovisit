import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, Report, ReportStatus, Comment as CommentType } from '../types';
import { formatDate, cn } from '../lib/utils';
import { Clock, CheckCircle2, Loader2, Filter, ChevronRight, MapPin, User as UserIcon, Shield, TrendingUp, Heart, MessageCircle, Share2, MoreHorizontal, Edit2, Trash2, AlertTriangle, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import DashboardPostBox from './DashboardPostBox';
import { ShareModal, ReportModal, CommentSection } from './SocialModals';
import { api } from '../lib/api';

export default function Dashboard({ 
  user,
  onOpenAuth 
}: { 
  user: UserProfile | null;
  onOpenAuth: () => void;
}) {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ReportStatus | 'all'>('all');

  const fetchReports = async () => {
    try {
      const data = await api.getReports();
      if (Array.isArray(data)) {
        setReports(data);
      } else {
        console.error('Expected array from getReports, got:', data);
        setReports([]);
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    // Poll every 30 seconds for new data
    const interval = setInterval(fetchReports, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = async (id: string, newStatus: ReportStatus, reporterId: string) => {
    if (user?.role !== 'admin') return;

    try {
      await api.updateReport(id, { status: newStatus });
      fetchReports();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const filteredReports = Array.isArray(reports) ? reports.filter(r => filter === 'all' || r.status === filter) : [];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-6">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(16,185,129,0.3)]" />
        <p className="text-stone-500 font-black animate-pulse uppercase tracking-[0.3em] text-[10px]">Loading Feed...</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12 pb-20 px-1"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-stone-900 dark:text-emerald-50 font-display tracking-tight uppercase italic leading-none">
            ECO VISIT
          </h1>
          <p className="text-stone-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Community Green Feed</p>
        </div>

        <div className="flex items-center gap-1.5 bg-stone-100 dark:bg-white/5 p-1.5 rounded-2xl border border-stone-200 dark:border-white/5">
          {(['all', 'pending', 'in-progress', 'resolved'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={cn(
                "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                filter === s 
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                  : "text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <DashboardPostBox user={user} onUpdate={fetchReports} />

      <div className="flex flex-col gap-10">
        <AnimatePresence mode="popLayout">
          {filteredReports.map((report) => (
            <motion.div
              key={report.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <ReportCard 
                report={report} 
                user={user}
                onStatusChange={handleStatusChange}
                onUpdate={fetchReports}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredReports.length === 0 && (
        <div className="bg-white dark:bg-surface border border-stone-100 dark:border-white/5 rounded-3xl p-20 text-center">
          <div className="w-20 h-20 bg-stone-50 dark:bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6 transform rotate-3 border border-stone-100 dark:border-white/5">
            <Shield className="w-10 h-10 text-stone-300" />
          </div>
          <h3 className="text-xl font-black text-stone-900 dark:text-white uppercase italic tracking-tight">No Active Posts</h3>
          <p className="text-xs text-stone-500 font-bold max-w-xs mx-auto mt-2">The community feed is empty. Start by sharing an update!</p>
        </div>
      )}
    </motion.div>
  );
}

function ReportCard({ 
  report, 
  user,
  onStatusChange,
  onUpdate
}: { 
  report: Report; 
  user: UserProfile | null;
  onStatusChange: (id: string, status: ReportStatus, reporterId: string) => void;
  onUpdate: () => void;
}) {
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(report.description || '');
  const menuRef = useRef<HTMLDivElement>(null);

  const isLiked = user && report.likes?.includes(user.uid);
  const isOwner = user && report.reporterId === user.uid;
  const likesCount = report.likes?.length || 0;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuRef]);

  const handleLike = async () => {
    if (!user) return;
    try {
      await api.likeReport(report.id);
      onUpdate();
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  const handleDelete = async () => {
    if (!isOwner) return;
    if (confirm('Are you sure you want to delete this post?')) {
      await api.deleteReport(report.id);
      onUpdate();
    }
  };

  const handleEdit = async () => {
    if (!isOwner) return;
    try {
      await api.updateReport(report.id, {
        description: editValue
      });
      setIsEditing(false);
      onUpdate();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-white dark:bg-surface border border-stone-100 dark:border-white/5 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500">
      <div className="p-6 md:p-8">
        {/* Post Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-4 items-center">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center border border-emerald-100 dark:border-emerald-800/30">
                <UserIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              {isOwner && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white dark:border-surface flex items-center justify-center">
                  <Shield className="w-2.5 h-2.5 text-white" />
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-black text-stone-900 dark:text-emerald-50 italic">
                {report.reporterName || `Member-${report.reporterId.slice(0, 4).toUpperCase()}`}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-stone-400 font-bold uppercase tracking-tight">
                  {formatDate(report.createdAt)}
                </span>
                <div className="w-1 h-1 bg-stone-200 dark:bg-stone-800 rounded-full" />
                <span className={cn(
                  "text-[9px] font-black uppercase tracking-[0.1em]",
                  report.status === 'pending' ? "text-amber-500" :
                  report.status === 'in-progress' ? "text-blue-500" :
                  "text-emerald-500"
                )}>
                  {report.status}
                </span>
              </div>
            </div>
          </div>
          <div className="relative" ref={menuRef}>
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-2 rounded-full hover:bg-stone-50 dark:hover:bg-white/5 transition-all"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>

            <AnimatePresence>
              {showMenu && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-surface border border-stone-100 dark:border-white/10 rounded-2xl shadow-2xl py-2 z-50 overflow-hidden"
                >
                  {isOwner ? (
                    <>
                      <button 
                        onClick={() => { setIsEditing(true); setShowMenu(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-stone-600 dark:text-stone-300 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-all border-b border-stone-50 dark:border-white/5"
                      >
                        <Edit2 className="w-4 h-4" /> Edit Post
                      </button>
                      <button 
                        onClick={() => { handleDelete(); setShowMenu(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                      >
                        <Trash2 className="w-4 h-4" /> Delete Post
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => { setShowReportModal(true); setShowMenu(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-stone-600 dark:text-stone-300 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                    >
                      <AlertTriangle className="w-4 h-4" /> Report Content
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Post Description */}
        <div className="mb-6 px-1">
          {isEditing ? (
            <div className="space-y-3">
              <textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-full bg-stone-50 dark:bg-white/5 border border-emerald-500/20 rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-emerald-500/10"
                rows={3}
              />
              <div className="flex justify-end gap-2 text-[10px] font-black uppercase tracking-widest">
                <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-stone-400">Cancel</button>
                <button onClick={handleEdit} className="px-4 py-2 bg-emerald-500 text-white rounded-lg">Save</button>
              </div>
            </div>
          ) : (
            <p className="text-base text-stone-600 dark:text-stone-300 leading-relaxed font-medium">
              {report.description || report.location.address || "Environmental update from this sector."}
            </p>
          )}
        </div>

        {/* Post Media */}
        <div className="relative rounded-[2rem] overflow-hidden bg-stone-100 dark:bg-stone-900/40 mb-6 border border-stone-100 dark:border-white/5 shadow-inner min-h-[200px] flex items-center justify-center">
          {report.videoUrl ? (
            <video 
              src={report.videoUrl} 
              controls 
              className="w-full h-full object-cover"
            />
          ) : report.fileUrl ? (
            <div className="w-full h-48 bg-stone-50 dark:bg-black/20 flex flex-col items-center justify-center gap-4 p-8">
               <div className="p-4 bg-emerald-500 text-white rounded-2xl shadow-xl shadow-emerald-500/20">
                 <FileText className="w-10 h-10" />
               </div>
               <div className="text-center">
                 <p className="text-sm font-black text-stone-900 dark:text-white uppercase tracking-widest">Document Attachment</p>
                 <a 
                   href={report.fileUrl} 
                   target="_blank" 
                   rel="noreferrer"
                   className="text-[10px] font-black text-emerald-500 hover:underline uppercase tracking-[0.2em] mt-1 block"
                 >
                   View Resource
                 </a>
               </div>
            </div>
          ) : (
            <img 
              src={report.imageUrl} 
              alt="Eco Report" 
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            />
          )}
          
          <div className="absolute top-4 right-4 group/loc z-10">
            <a 
              href={`https://www.google.com/maps/search/?api=1&query=${report.location.lat},${report.location.lng}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 bg-black/50 backdrop-blur-md rounded-full text-[10px] font-black text-white border border-white/10 uppercase tracking-widest hover:bg-emerald-500 transition-all cursor-pointer shadow-xl active:scale-95"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>LOCATE</span>
              <div className="absolute top-full right-0 mt-2 p-3 bg-white dark:bg-surface border border-stone-200 dark:border-white/10 rounded-2xl shadow-2xl opacity-0 group-hover/loc:opacity-100 pointer-events-none transition-opacity w-48 text-[10px] normal-case text-stone-500 dark:text-stone-400 font-bold leading-relaxed z-20">
                {report.location.address || `Coordinates: ${report.location.lat.toFixed(4)}, ${report.location.lng.toFixed(4)}`}
              </div>
            </a>
          </div>
        </div>

        {/* Social Interactions */}
        <div className="flex items-center justify-between pt-6 border-t border-stone-50 dark:border-white/5">
          <div className="flex items-center gap-8">
            <button 
              onClick={handleLike}
              className={cn(
                "flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all",
                isLiked ? "text-rose-500" : "text-stone-400 hover:text-rose-500"
              )}
            >
              <Heart className={cn("w-6 h-6 transition-transform active:scale-150", isLiked && "fill-current")} />
              <span className="font-mono text-sm">{likesCount}</span>
            </button>
            <button 
              onClick={() => setShowComments(!showComments)}
              className={cn(
                "flex items-center gap-2 text-stone-400 hover:text-emerald-500 text-xs font-black uppercase tracking-widest transition-all",
                showComments && "text-emerald-500"
              )}
            >
              <MessageCircle className="w-6 h-6" />
              <span className="font-mono text-sm">{report.commentCount || 0}</span>
            </button>
            <button 
              onClick={() => setShowShare(true)}
              className="flex items-center gap-2 text-stone-400 hover:text-emerald-500 text-xs font-black transition-all"
            >
              <Share2 className="w-6 h-6" />
            </button>
          </div>

          {user?.role === 'admin' && report.status !== 'resolved' && (
            <div className="flex gap-2">
               <button 
                onClick={() => onStatusChange(report.id, report.status === 'pending' ? 'in-progress' : 'resolved', report.reporterId)}
                className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all border border-emerald-100 dark:border-emerald-500/20"
              >
                {report.status === 'pending' ? 'Verify' : 'Resolve'}
              </button>
            </div>
          )}
        </div>

        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <CommentSection reportId={report.id} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showShare && (
          <ShareModal 
            url={`${window.location.origin}/#/report/${report.id}`} 
            onClose={() => setShowShare(false)} 
          />
        )}
        {showReportModal && (
          <ReportModal 
            postId={report.id} 
            onClose={() => setShowReportModal(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
