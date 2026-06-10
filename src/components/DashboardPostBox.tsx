import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Image, Video, FileText, Send, X, MapPin, Loader2 } from 'lucide-react';
import { UserProfile } from '../types';
import { cn } from '../lib/utils';
import { api } from '../lib/api';

import { uploadToCloudinary } from '../services/cloudinary';

export default function DashboardPostBox({ user, onUpdate }: { user: UserProfile | null, onUpdate: () => void }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [attachment, setAttachment] = useState<{ type: 'image' | 'video' | 'file'; file: File; preview: string } | null>(null);
  const [location, setLocation] = useState<{ lat: number, lng: number, address?: string } | null>(null);
  const [isManualLocation, setIsManualLocation] = useState(false);
  const [manualAddress, setManualAddress] = useState('');
  const [showLocationSelect, setShowLocationSelect] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const captureLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lng: longitude });
        setIsManualLocation(false);
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
          const data = await response.json();
          if (data?.display_name) {
            setLocation(prev => prev ? { ...prev, address: data.display_name } : null);
          }
        } catch (e) {}
      },
      () => {
        // Fallback for easy demo
        if (!location) {
          setLocation({ lat: 28.6139, lng: 77.2090, address: "Sector-4, Eco City Map" });
        }
      }
    );
  };

  const handleSubmit = async () => {
    if (!text.trim() || !user) return;
    
    setLoading(true);
    setError('');
    try {
      let imageUrl = 'https://images.unsplash.com/photo-1518173946687-a4c8a9833d8e?auto=format&fit=crop&q=80';
      let videoUrl = null;
      let fileUrl = null;

      if (attachment) {
        const uploadedUrl = await uploadToCloudinary(
          attachment.file, 
          attachment.type === 'image' ? 'image' : (attachment.type === 'video' ? 'video' : 'raw')
        );
        
        if (attachment.type === 'image') imageUrl = uploadedUrl;
        else if (attachment.type === 'video') videoUrl = uploadedUrl;
        else fileUrl = uploadedUrl;
      }

      const reportData = {
        description: text,
        imageUrl,
        videoUrl,
        fileUrl,
        location: location || {
          lat: 28.6139,
          lng: 77.2090,
          address: "New Delhi, Sector-4 Zone"
        }
      };

      await api.createReport(reportData);
      
      setText('');
      setAttachment(null);
      setIsExpanded(false);
      onUpdate();
    } catch (err: any) {
      console.error('Error posting:', err);
      setError(err.message || 'Post failed. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Simulate upload - generate object URL
    const url = URL.createObjectURL(file);
    if (file.type.startsWith('image/')) setAttachment({ type: 'image', file, preview: url });
    else if (file.type.startsWith('video/')) setAttachment({ type: 'video', file, preview: url });
    else setAttachment({ type: 'file', file, preview: url });
  };

  return (
    <div className={cn(
      "bg-white dark:bg-surface border border-stone-100 dark:border-white/5 rounded-[2rem] transition-all duration-300",
      isExpanded ? "p-6" : "p-4 cursor-pointer hover:border-emerald-500/40"
    )}>
      {!isExpanded ? (
        <div 
          onClick={() => setIsExpanded(true)}
          className="flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/10 flex items-center justify-center border border-emerald-100 dark:border-emerald-800/20">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-800/30 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <p className="text-stone-400 font-medium flex-1">Share an update or report an environmental issue...</p>
          <div className="flex gap-2">
            <Image className="w-5 h-5 text-stone-300" />
            <Video className="w-5 h-5 text-stone-300" />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">New Impact Post</span>
            <button 
              onClick={() => setIsExpanded(false)}
              className="p-2 hover:bg-stone-100 dark:hover:bg-white/5 rounded-full text-stone-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <textarea
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What's happening in your environment?"
            className="w-full bg-transparent border-none resize-none text-stone-700 dark:text-stone-200 placeholder:text-stone-400 focus:ring-0 min-h-[120px] text-lg font-medium"
          />

          <AnimatePresence>
            {attachment && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="relative rounded-2xl overflow-hidden border border-stone-100 dark:border-white/10"
              >
                {attachment.type === 'image' && (
                  <img src={attachment.preview} alt="upload" className="w-full h-48 object-cover" />
                )}
                {attachment.type === 'video' && (
                  <video src={attachment.preview} className="w-full h-48 object-cover" />
                )}
                {attachment.type === 'file' && (
                  <div className="bg-stone-50 dark:bg-black/20 p-8 flex flex-col items-center gap-3">
                    <FileText className="w-10 h-10 text-emerald-500" />
                    <span className="text-xs font-mono text-stone-500">DOCUMENT_READY.PDF</span>
                  </div>
                )}
                <button 
                  onClick={() => setAttachment(null)}
                  className="absolute top-3 right-3 p-1.5 bg-black/60 text-white rounded-full backdrop-blur-md"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between pt-4 border-t border-stone-50 dark:border-white/5">
            <div className="flex gap-1">
              <button 
                onClick={handleFileClick}
                className="p-3 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl text-stone-500 hover:text-emerald-500 transition-all"
                title="Image"
              >
                <Image className="w-5 h-5" />
              </button>
              <button 
                onClick={handleFileClick}
                className="p-3 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl text-stone-500 hover:text-emerald-500 transition-all"
                title="Video"
              >
                <Video className="w-5 h-5" />
              </button>
              <button 
                onClick={handleFileClick}
                className="p-3 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl text-stone-500 hover:text-emerald-500 transition-all"
                title="File"
              >
                <FileText className="w-5 h-5" />
              </button>

              <button 
                onClick={() => setShowLocationSelect(!showLocationSelect)}
                className={cn(
                  "p-3 rounded-xl transition-all relative",
                  location ? "bg-emerald-500 text-white" : "text-stone-500 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
                )}
                title="Location"
              >
                <MapPin className="w-5 h-5" />
                {location && !showLocationSelect && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-white dark:bg-surface border-2 border-emerald-500 rounded-full" />
                )}
              </button>

              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange}
                className="hidden" 
                accept="image/*,video/*,.pdf,.doc,.docx"
              />
            </div>

            {error && (
              <span className="text-[10px] font-black text-rose-500 uppercase tracking-tight animate-pulse flex items-center gap-1">
                <X className="w-3 h-3" /> {error}
              </span>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading || !text.trim()}
              className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20 transition-all flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Post Impact
            </button>
          </div>

          <AnimatePresence>
            {showLocationSelect && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="pt-4 border-t border-stone-50 dark:border-white/5 space-y-4"
              >
                <div className="flex gap-2">
                  <button
                    onClick={() => { setIsManualLocation(false); captureLocation(); }}
                    className={cn(
                      "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                      !isManualLocation && location ? "bg-emerald-500 text-white border-emerald-500" : "bg-stone-50 dark:bg-white/5 text-stone-400 border-stone-100 dark:border-white/5 hover:border-emerald-500/30"
                    )}
                  >
                    GPS Auto
                  </button>
                  <button
                    onClick={() => { setIsManualLocation(true); if(!location) setLocation({ lat: 28.6139, lng: 77.2090, address: "" }); }}
                    className={cn(
                      "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                      isManualLocation ? "bg-emerald-500 text-white border-emerald-500" : "bg-stone-50 dark:bg-white/5 text-stone-400 border-stone-100 dark:border-white/5 hover:border-emerald-500/30"
                    )}
                  >
                    Manual Address
                  </button>
                </div>

                {isManualLocation && (
                  <div className="relative">
                    <input
                      type="text"
                      value={manualAddress}
                      onChange={(e) => {
                        setManualAddress(e.target.value);
                        setLocation(prev => ({ ...(prev || { lat: 28.6139, lng: 77.2090 }), address: e.target.value }));
                      }}
                      placeholder="Enter location address..."
                      className="w-full bg-stone-50 dark:bg-white/5 border border-stone-100 dark:border-white/10 rounded-xl py-3 pl-10 pr-4 text-xs font-bold focus:ring-1 focus:ring-emerald-500/20 outline-none"
                    />
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  </div>
                )}

                {location && (
                  <div className="bg-emerald-50/50 dark:bg-emerald-500/5 p-3 rounded-xl text-[10px] text-emerald-600 dark:text-emerald-400 font-bold italic line-clamp-1">
                    {location.address || "Fetching coordinates..."}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
