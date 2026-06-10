import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Report, UserProfile, ReportStatus } from '../types';
import { formatDate, cn } from '../lib/utils';
import L from 'leaflet';
import { useTheme } from '../contexts/ThemeContext';
import { motion } from 'motion/react';
import { api } from '../lib/api';

// Fix for default marker icons in Leaflet with React
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

const createCustomMarker = (status: ReportStatus) => {
  const color = status === 'pending' ? '#f59e0b' : status === 'in-progress' ? '#06b6d4' : '#10b981';
  
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px ${color}80;"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
};

export default function MapView({ user }: { user: UserProfile | null }) {
  const [reports, setReports] = useState<Report[]>([]);
  const [center, setCenter] = useState<[number, number]>([20.5937, 78.9629]); 
  const { theme } = useTheme();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await api.getReports();
        setReports(data);
        if (data.length > 0) {
          setCenter([data[0].location.lat, data[0].location.lng]);
        }
      } catch (err) {
        console.error('Error fetching map reports:', err);
      }
    };
    fetchReports();
    const interval = setInterval(fetchReports, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="h-[calc(100vh-160px)] rounded-3xl overflow-hidden brutalist-border relative"
    >
      <MapContainer center={center} zoom={5} style={{ height: '100%', width: '100%', background: theme === 'dark' ? '#050505' : '#f8fafc' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url={theme === 'dark' 
            ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          }
        />
        {reports.map((report) => (
          <Marker 
            key={report.id} 
            position={[report.location.lat, report.location.lng]}
            icon={createCustomMarker(report.status)}
          >
            <Popup className="custom-popup">
              <div className="bg-white dark:bg-surface p-1 min-w-[240px]">
                <img 
                  src={report.imageUrl} 
                  alt="Waste Trace" 
                  className="w-full h-32 object-cover rounded-xl mb-3 border border-stone-200 dark:border-white/5" 
                />
                <div className="p-2 pt-0">
                  <div className="flex items-center justify-between mb-3 text-stone-900 dark:text-white">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border",
                      report.status === 'pending' ? "bg-amber-500/10 text-amber-600 dark:text-amber-500 border-amber-500/20" :
                      report.status === 'in-progress' ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-500 border-cyan-500/20" :
                      "bg-accent/10 text-accent border-accent/20"
                    )}>
                      {report.status}
                    </span>
                    <span className="text-[8px] text-stone-400 dark:text-stone-500 font-black uppercase tracking-widest">{formatDate(report.createdAt)}</span>
                  </div>
                  <p className="text-[10px] text-stone-600 dark:text-stone-400 font-bold mb-3 line-clamp-2 italic leading-relaxed">
                    {report.location.address || "Sector coordinates secured."}
                  </p>
                  <div className="pt-3 border-t border-stone-100 dark:border-white/5">
                    <p className="text-[8px] text-stone-400 dark:text-stone-500 uppercase font-black tracking-widest font-mono">
                      NODE_ID: {report.reporterId.slice(0, 16).toUpperCase()}
                    </p>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      <div className="absolute top-6 left-6 z-[1000] space-y-2">
         <LegendItem color="#f59e0b" label="Pending Scan" />
         <LegendItem color="#06b6d4" label="Action Active" />
         <LegendItem color="#10b981" label="Sector Secured" />
      </div>

      <div className="absolute bottom-6 right-6 z-[1000] bg-white/90 dark:bg-surface/90 backdrop-blur-xl p-6 rounded-2xl border border-stone-200 dark:border-white/5 shadow-2xl max-w-xs">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <h3 className="text-xs font-black text-stone-900 dark:text-white uppercase tracking-widest">Live Activity Map</h3>
        </div>
        <p className="text-[10px] text-stone-500 dark:text-stone-500 font-bold leading-relaxed uppercase tracking-tight">
          Visualizing real-time environment status. Every post contributes to a cleaner and greener city.
        </p>
      </div>
    </motion.div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2 bg-white/80 dark:bg-surface/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-stone-200 dark:border-white/5 shadow-sm">
      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-[10px] font-black text-stone-900 dark:text-white uppercase tracking-widest">{label}</span>
    </div>
  );
}

