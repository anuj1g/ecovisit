import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserProfile } from '../types';
import { Camera, MapPin, Upload, CheckCircle2, AlertCircle, Loader2, Sparkles, Edit2 } from 'lucide-react';
import { cn } from '../lib/utils';
import imageCompression from 'browser-image-compression';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../lib/api';
import { uploadToCloudinary } from '../services/cloudinary';

interface Location {
  lat: number;
  lng: number;
  address?: string;
}

export default function ReportForm({ user }: { user: UserProfile }) {
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [manualAddress, setManualAddress] = useState('');
  const [isManualLocation, setIsManualLocation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'compressing' | 'uploading' | 'saving'>('idle');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
      // Auto-capture location is now optional and requested via button
    }
  };

  const captureLocation = () => {
    setStatus('idle');
    addLog('Requesting GPS location...');
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      addLog('Geolocation unsupported');
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        addLog(`GPS Success: ${latitude}, ${longitude}`);
        setLocation({ lat: latitude, lng: longitude });
        setIsManualLocation(false);
        setError('');

        // Reverse Geocoding
        try {
          addLog('Fetching address details...');
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
          const data = await response.json();
          if (data && data.display_name) {
            setLocation({
              lat: latitude,
              lng: longitude,
              address: data.display_name
            });
            addLog(`Address found: ${data.display_name.slice(0, 30)}...`);
          }
        } catch (geoErr) {
          console.warn('Reverse geocoding failed:', geoErr);
          addLog('Geocoding failed, but coordinates saved');
        }
      },
      (err) => {
        console.warn('Geolocation error:', err);
        addLog(`GPS Error Code: ${err.code}`);
        setError('Could not get GPS location. Please check your browser permissions or manually type an address.');
        // Automatic fallback for demo/development ease
        if (!location) {
          addLog('Applying default fallback location');
          setLocation({ lat: 28.6139, lng: 77.2090, address: 'Sector-4, Green Zone, Eco City' });
        }
      },
      options
    );
  };

  const handleManualAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const addr = e.target.value;
    setManualAddress(addr);
    setIsManualLocation(true);
    // When manual, we use a default center or previous GPS if available
    if (!location) {
      setLocation({ lat: 28.6139, lng: 77.2090, address: addr });
    } else {
      setLocation({ ...location, address: addr });
    }
  };

  const [debugLog, setDebugLog] = useState<string[]>([]);

  const addLog = (msg: string) => {
    console.log(msg);
    setDebugLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`].slice(-5));
  };

  const [showValidation, setShowValidation] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowValidation(true);
    
    if (!user) {
      setError('You must be logged in to submit a report.');
      return;
    }

    if (!image || !location) {
      setError('Please provide BOTH an image and a location to submit your impact report.');
      return;
    }

    setLoading(true);
    setError('');
    setDebugLog([]);

    try {
      addLog('Starting submission...');
      
      // 1. Compress Image
      setStatus('compressing');
      addLog('Compressing image...');
      const options = {
        maxSizeMB: 0.1, // 100KB is reasonable for MongoDB
        maxWidthOrHeight: 800,
        useWebWorker: false,
        initialQuality: 0.6
      };
      
      let compressedFile;
      try {
        compressedFile = await imageCompression(image, options);
        addLog(`Compressed: ${Math.round(compressedFile.size / 1024)}KB`);
      } catch (compErr) {
        addLog('Compression failed, using original');
        compressedFile = image;
      }
      
      // 3. Upload to Cloudinary
      setStatus('uploading');
      addLog('Uploading to Cloudinary...');
      
      const cloudinaryUrl = await uploadToCloudinary(compressedFile, 'image');
      addLog('Cloudinary upload success');

      // 4. Save metadata to MongoDB
      setStatus('saving');
      addLog('Saving to database...');
      await api.createReport({
        description,
        imageUrl: cloudinaryUrl,
        location,
        status: 'pending',
      });

      addLog('Success!');
      setSuccess(true);
      setTimeout(() => navigate('/'), 2000);
    } catch (err: any) {
      addLog(`Error: ${err.message}`);
      setError(`Submission failed: ${err.message}`);
    } finally {
      setLoading(false);
      setStatus('idle');
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto my-12 text-center h-[70vh] flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="glass p-12 rounded-[3.5rem] shadow-2xl shadow-stone-200/10 dark:shadow-none border border-stone-200 dark:border-white/20 flex flex-col items-center"
        >
          <div className="w-28 h-28 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mb-10 relative">
             <motion.div 
               animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.1, 0.3] }}
               transition={{ repeat: Infinity, duration: 2.5 }}
               className="absolute inset-0 bg-emerald-400 rounded-full" 
             />
            <CheckCircle2 className="w-14 h-14 text-emerald-600 dark:text-emerald-400 relative z-10 stroke-[3]" />
          </div>
          <h2 className="text-4xl font-black text-stone-900 dark:text-white mb-4 font-display tracking-tight uppercase">Success!</h2>
          <p className="text-stone-500 dark:text-stone-400 font-medium leading-relaxed">
            Helping the planet, one report at a time. <br/> Points are being processed now.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <div className="mb-10 text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-[10px] font-black uppercase tracking-widest mb-4 border border-accent/20">
          <Sparkles className="w-3 h-3" />
          <span>Priority Post</span>
        </div>
        <h1 className="text-5xl font-black text-stone-900 dark:text-white font-display tracking-tight uppercase italic leading-none">Environmental Report</h1>
        <p className="text-stone-600 dark:text-stone-500 mt-3 font-bold max-w-lg">Document environmental hazards to notify municipal authorities and share with the community feed.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Description Field */}
        <div className="space-y-2">
          <p className="text-xs font-black text-stone-400 dark:text-stone-500 uppercase tracking-widest pl-1">Describe the Situation</p>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What did you observe? e.g. Illegal waste dumping, broken recycling bin, etc."
            className="w-full bg-stone-50 dark:bg-surface border border-stone-200 dark:border-white/5 rounded-3xl p-6 text-sm font-medium focus:ring-2 focus:ring-accent/20 outline-none transition-all placeholder:text-stone-400 min-h-[120px] resize-none"
          />
        </div>

        {/* Image Upload Area */}
        <div className="space-y-2">
          <p className="text-xs font-black text-stone-400 dark:text-stone-500 uppercase tracking-widest pl-1">Capture Evidence</p>
          <div 
            onClick={() => !loading && fileInputRef.current?.click()}
            className={cn(
              "relative aspect-video rounded-3xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all duration-500 bg-stone-50 dark:bg-surface",
              preview 
                ? "border-accent shadow-[0_0_20px_rgba(16,185,129,0.2)]" 
                : "border-stone-200 dark:border-white/5 hover:border-accent shadow-sm"
            )}
          >
            <AnimatePresence mode="wait">
              {preview ? (
                <motion.div 
                  key="preview"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full h-full"
                >
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-stone-900/60 dark:bg-base/60 backdrop-blur-sm flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <div className="bg-accent text-black px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2">
                      <Camera className="w-5 h-5" /> Retake Trace
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center p-8 group"
                >
                  <div className="w-20 h-20 bg-stone-100 dark:bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6 transform group-hover:rotate-6 transition-transform border border-stone-200 dark:border-white/5">
                    <Camera className="w-10 h-10 text-stone-400 dark:text-stone-600 group-hover:text-accent transition-colors" />
                  </div>
                  <p className="text-lg font-black text-stone-900 dark:text-stone-200 uppercase tracking-tight">Initialize Scan</p>
                  <p className="text-stone-500 text-sm mt-1 font-bold">Tap to capture or choose a trace</p>
                </motion.div>
              )}
            </AnimatePresence>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageChange} 
              accept="image/*" 
              className="hidden" 
            />
          </div>
        </div>

        {/* Location Status */}
        <div className="space-y-2">
          <p className="text-xs font-black text-stone-400 dark:text-stone-50 uppercase tracking-widest pl-1">Post Location</p>
          <div className={cn(
            "p-6 rounded-[2.5rem] border transition-all duration-500 bg-stone-50 dark:bg-surface",
            location 
              ? "border-accent/20 shadow-[0_0_30px_rgba(16,185,129,0.05)]" 
              : "border-stone-200 dark:border-white/5"
          )}
          >
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsManualLocation(false);
                    captureLocation();
                  }}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all",
                    !isManualLocation && location 
                      ? "bg-accent text-white border-accent shadow-lg shadow-accent/20" 
                      : "bg-white dark:bg-white/5 text-stone-500 dark:text-stone-400 border-stone-200 dark:border-white/5 hover:border-accent/30"
                  )}
                >
                  <MapPin className="w-4 h-4" />
                  Use Current GPS
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsManualLocation(true);
                    if (!location) setLocation({ lat: 28.6139, lng: 77.2090, address: "" });
                  }}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all",
                    isManualLocation 
                      ? "bg-accent text-white border-accent shadow-lg shadow-accent/20" 
                      : "bg-white dark:bg-white/5 text-stone-500 dark:text-stone-400 border-stone-200 dark:border-white/5 hover:border-accent/30"
                  )}
                >
                  <Edit2 className="w-4 h-4" />
                  Manual Entry
                </button>
              </div>

              {isManualLocation && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-3"
                >
                  <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest px-1">Specific Address or Landmark</p>
                  <div className="relative">
                    <input
                      type="text"
                      value={manualAddress}
                      onChange={handleManualAddressChange}
                      placeholder="e.g., Near City Park Main Gate..."
                      className="w-full bg-white dark:bg-white/5 border border-stone-200 dark:border-white/10 rounded-2xl py-4 pl-12 pr-4 text-xs font-bold focus:ring-2 focus:ring-accent/20 outline-none transition-all placeholder:text-stone-400"
                    />
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-accent" />
                  </div>
                </motion.div>
              )}

              {location && (
                <div className="flex items-center gap-4 pt-4 border-t border-stone-100 dark:border-white/5">
                   <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shadow-lg",
                    isManualLocation ? "bg-stone-100 dark:bg-white/5 text-stone-500" : "bg-accent text-white"
                  )}>
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest leading-none mb-1">Sector Coordinate</p>
                    <p className="text-xs font-bold text-stone-900 dark:text-white line-clamp-1 italic">
                      {isManualLocation ? (manualAddress || "Awaiting address entry...") : (location.address || "Fetching satellite data...")}
                    </p>
                    {!isManualLocation && (
                      <span className="text-[9px] font-black text-accent mt-0.5 block">
                        {location.lat.toFixed(6)} N / {location.lng.toFixed(6)} E
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-red-500/10 text-red-500 p-5 rounded-2xl text-xs font-black flex items-center gap-3 border border-red-500/20"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </motion.div>
        )}

        {debugLog.length > 0 && (
          <div className="bg-stone-900 dark:bg-black p-5 rounded-3xl text-[10px] font-mono space-y-1.5 border border-stone-800 dark:border-white/5 mx-1">
            <p className="text-stone-500 dark:text-stone-600 mb-2 uppercase tracking-[0.2em] font-black">Transfer Protocol</p>
            <div className="space-y-1 h-20 overflow-y-auto scrollbar-hide">
              {debugLog.map((log, i) => (
                <div key={i} className="flex gap-2 text-stone-400 dark:text-stone-500">
                  <span className="text-accent/30 font-black">[{i+1}]</span>
                  <span>{log}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="group w-full bg-accent hover:bg-accent-dark text-white font-black py-6 rounded-3xl shadow-[0_20px_40px_rgba(16,185,129,0.15)] transition-all flex items-center justify-center gap-4 disabled:opacity-30 disabled:grayscale disabled:shadow-none uppercase tracking-[0.2em] text-xs"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              <span>{status.toUpperCase()}...</span>
            </>
          ) : (
            <>
              Post Impact
              <Upload className="w-5 h-5 transition-transform group-hover:-translate-y-1" />
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
}
