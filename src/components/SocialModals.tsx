import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Share2, Link2, MessageSquare, Twitter, X as XIcon, AlertTriangle, Send, Loader2, Heart, Trash2, Edit2 } from 'lucide-react';
import { cn, formatDate } from '../lib/utils';
import { Comment } from '../types';
import { api } from '../lib/api';

// SHARE MODAL
export function ShareModal({ url, onClose }: { url: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = () => window.open(`https://wa.me/?text=${encodeURIComponent(url)}`, '_blank');
  const shareTwitter = () => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`, '_blank');

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="absolute inset-0 bg-base/80 backdrop-blur-sm" 
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-sm bg-white dark:bg-surface border border-stone-100 dark:border-white/5 rounded-3xl p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-black uppercase tracking-widest text-stone-700 dark:text-emerald-50">Share Impact</h3>
          <button onClick={onClose} className="p-2 hover:bg-stone-100 dark:hover:bg-white/5 rounded-full"><XIcon className="w-4 h-4" /></button>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mb-6">
          <button onClick={copyLink} className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-stone-50 dark:bg-white/5 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-all group">
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600">
               {copied ? <div className="text-[8px] font-black">OK!</div> : <Link2 className="w-5 h-5" />}
            </div>
            <span className="text-[10px] font-black uppercase text-stone-400 group-hover:text-emerald-500">Link</span>
          </button>
          <button onClick={shareWhatsApp} className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-stone-50 dark:bg-white/5 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-all group">
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600"><MessageSquare className="w-5 h-5" /></div>
            <span className="text-[10px] font-black uppercase text-stone-400 group-hover:text-emerald-500">WhatsApp</span>
          </button>
          <button onClick={shareTwitter} className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-stone-50 dark:bg-white/5 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-all group">
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600"><Twitter className="w-5 h-5" /></div>
            <span className="text-[10px] font-black uppercase text-stone-400 group-hover:text-emerald-500">Twitter</span>
          </button>
        </div>

        <div className="bg-stone-50 dark:bg-black/20 p-3 rounded-xl border border-stone-100 dark:border-white/5 text-[10px] font-mono text-stone-400 break-all">
          {url}
        </div>
      </motion.div>
    </div>
  );
}

// REPORT MODAL
export function ReportModal({ postId, onClose }: { postId: string; onClose: () => void }) {
  const [reason, setReason] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const reasons = [
    "Spam or misleading",
    "Inappropriate content",
    "Hate speech",
    "Violence",
    "False environmental claim"
  ];

  const handleReport = async () => {
    // Abuse reporting logic will be migrated in a future update
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="absolute inset-0 bg-base/80 backdrop-blur-sm" 
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-md bg-white dark:bg-surface border border-stone-100 dark:border-white/5 rounded-3xl p-8 shadow-2xl"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-stone-900 dark:text-emerald-50">Report Post</h3>
            <p className="text-[10px] text-stone-400 font-bold uppercase tracking-tight">Help us keep the community safe</p>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          {reasons.map((r) => (
            <button
              key={r}
              onClick={() => setReason(r)}
              className={cn(
                "w-full p-4 rounded-2xl text-left text-xs font-bold transition-all border",
                reason === r 
                  ? "bg-red-500/10 border-red-500/30 text-red-600" 
                  : "bg-stone-50 dark:bg-white/5 border-stone-100 dark:border-white/5 text-stone-500 hover:border-red-500/20"
              )}
            >
              {r}
            </button>
          ))}
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Additional context (optional)..."
          className="w-full bg-stone-50 dark:bg-white/5 border border-stone-100 dark:border-white/5 rounded-2xl p-4 text-xs font-bold mb-6 focus:ring-1 focus:ring-red-500/20 mb-6"
          rows={3}
        />

        <div className="flex gap-4">
          <button onClick={onClose} className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-stone-400">Cancel</button>
          <button 
            onClick={handleReport}
            disabled={!reason || submitting}
            className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-black py-4 rounded-xl text-xs uppercase tracking-widest transition-all"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Submit Report"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// COMMENT SECTION
export function CommentSection({ reportId }: { reportId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<{ id: string, name: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  const loadComments = async () => {
    try {
      const data = await api.getComments(reportId);
      setComments(data);
    } catch (err) {
      console.error('Error loading comments:', err);
    }
  };

  useEffect(() => {
    async function init() {
      const u = await api.me();
      setUser(u);
      loadComments();
    }
    init();
  }, [reportId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;
    
    setLoading(true);
    try {
      await api.addComment(reportId, {
        userName: user.fullName || 'User',
        text: newComment,
        parentId: replyTo?.id || null,
      });

      setNewComment('');
      setReplyTo(null);
      loadComments();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLikeComment = async (commentId: string, isLiked: boolean) => {
    // Comment likes logic to be implemented in API
  };

  const renderComments = (parentId: string | null = null, depth = 0) => {
    return comments
      .filter(c => (c.parentId === parentId || (!c.parentId && !parentId)))
      .map(comment => {
        const isLiked = user && comment.likes?.includes(user.uid);
        return (
          <div key={comment.id} className={cn("mt-4", depth > 0 && "ml-8 border-l-2 border-emerald-500/10 pl-4")}>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-stone-100 dark:bg-white/5 flex items-center justify-center text-[10px] font-black text-stone-500 uppercase border border-stone-200 dark:border-white/10">
                {comment.userName.slice(0, 1)}
              </div>
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-[11px] font-black text-stone-900 dark:text-emerald-50 italic">{comment.userName}</span>
                  <span className="text-[9px] text-stone-400 font-bold">{formatDate(comment.createdAt)}</span>
                </div>
                <p className="text-xs text-stone-600 dark:text-stone-300 mt-1">{comment.text}</p>
                <div className="flex items-center gap-4 mt-2">
                  <button 
                    onClick={() => handleLikeComment(comment.id, !!isLiked)}
                    className={cn("flex items-center gap-1 text-[10px] font-bold transition-all", isLiked ? "text-red-500" : "text-stone-400 hover:text-red-500")}
                  >
                    <Heart className={cn("w-3 h-3", isLiked && "fill-current")} />
                    {comment.likes.length}
                  </button>
                  <button 
                    onClick={() => setReplyTo({ id: comment.id, name: comment.userName })}
                    className="text-[10px] font-bold text-stone-400 hover:text-emerald-500"
                  >
                    Reply
                  </button>
                </div>
              </div>
            </div>
            {renderComments(comment.id, depth + 1)}
          </div>
        );
      });
  };

  return (
    <div className="mt-6 pt-6 border-t border-stone-50 dark:border-white/5">
      <div className="space-y-4 max-h-[300px] overflow-y-auto scrollbar-hide mb-6">
        {comments.length === 0 ? (
          <p className="text-center py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest italic">No responses recorded yet</p>
        ) : (
          renderComments(null)
        )}
      </div>

      <form onSubmit={handleSubmit} className="relative">
        <AnimatePresence>
          {replyTo && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="px-4 py-2 bg-emerald-500/5 text-[10px] font-bold text-emerald-500 flex justify-between items-center rounded-t-xl mb-1 border-x border-t border-emerald-500/10"
            >
              <span>Replying to {replyTo.name}</span>
              <button type="button" onClick={() => setReplyTo(null)} className="text-stone-400 hover:text-stone-600"><XIcon className="w-3 h-3" /></button>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="relative">
          <input 
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={replyTo ? "Write a reply..." : "Add a comment to this post..."}
            className="w-full bg-stone-50 dark:bg-white/5 border border-stone-100 dark:border-white/5 rounded-2xl py-3 pl-4 pr-12 text-xs font-bold focus:ring-1 focus:ring-accent/20"
          />
          <button 
            type="submit"
            disabled={!newComment.trim() || loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-emerald-500 disabled:opacity-30"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </form>
    </div>
  );
}
