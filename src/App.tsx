import React, { useEffect, useState } from 'react';
import { useLocation, BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { Logo } from './components/Logo';
import { UserProfile } from './types';
import { LogOut, MapPin, PlusCircle, LayoutDashboard, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ErrorBoundary from './components/ErrorBoundary';
import { api } from './lib/api';

// Components
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import ReportForm from './components/ReportForm';
import Dashboard from './components/Dashboard';
import Rewards from './components/Rewards';
import Profile from './components/Profile';
import MapView from './components/MapView';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import RightSidebar from './components/RightSidebar';
import AuthModal from './components/AuthModal';
import { DatabaseStatus } from './components/DatabaseStatus';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      // Small delay for initial sync
      await new Promise(resolve => setTimeout(resolve, 800));
      try {
        const userData = await api.me();
        setUser(userData);
      } catch (err) {
        console.error('Auth sync deferred:', err);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-base">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-accent/20 p-2">
            <Logo className="w-full h-full" />
          </div>
          <p className="text-stone-400 dark:text-accent font-black uppercase tracking-[0.3em] text-[10px]">Loading EcoVisit</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Router>
        <AppContent 
          user={user} 
          setUser={setUser}
          isAuthModalOpen={isAuthModalOpen}
          setIsAuthModalOpen={setIsAuthModalOpen}
        />
      </Router>
    </ErrorBoundary>
  );
}

function AppContent({ 
  user, 
  setUser,
  isAuthModalOpen, 
  setIsAuthModalOpen 
}: { 
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
}) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    localStorage.removeItem('auth_token');
    setUser(null);
    navigate('/');
  };

  const requireAuth = (callback: () => void) => {
    if (user) {
      callback();
    } else {
      setIsAuthModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-base dark:bg-grid text-stone-900 dark:text-white font-sans transition-colors duration-500">
      <Sidebar />
      <DatabaseStatus />
      
      <div className="md:pl-20 xl:pl-64 min-h-screen flex flex-col">
        <Header 
          user={user} 
          onLogout={handleLogout} 
          onOpenAuth={() => setIsAuthModalOpen(true)} 
        />
        
        <main className="flex-1 max-w-(--breakpoint-2xl) mx-auto w-full px-4 py-8 flex gap-8">
          {/* Feed Column */}
          <div className="flex-1 min-w-0">
             <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <Routes location={location}>
                  <Route path="/" element={<Dashboard user={user} onOpenAuth={() => setIsAuthModalOpen(true)} />} />
                  <Route path="/report" element={<PrivateRoute user={user} openAuth={() => setIsAuthModalOpen(true)}><ReportForm user={user!} /></PrivateRoute>} />
                  <Route path="/map" element={<MapView user={user} />} />
                  <Route path="/rewards" element={<PrivateRoute user={user} openAuth={() => setIsAuthModalOpen(true)}><Rewards user={user!} /></PrivateRoute>} />
                  <Route path="/profile" element={<PrivateRoute user={user} openAuth={() => setIsAuthModalOpen(true)}><Profile user={user!} onUpdate={setUser} /></PrivateRoute>} />
                  <Route path="/login" element={<Navigate to="/" />} />
                  <Route path="/register" element={<Navigate to="/" />} />
                </Routes>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Sidebar Widgets */}
          <RightSidebar />
        </main>
      </div>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </div>
  );
}

function PrivateRoute({ children, user, openAuth }: { children: React.ReactNode; user: UserProfile | null; openAuth: () => void }) {
  useEffect(() => {
    if (!user) {
      openAuth();
    }
  }, [user, openAuth]);

  return user ? <>{children}</> : <div className="flex flex-col items-center justify-center h-96 gap-4">
    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center animate-pulse">
       <Logo className="w-10 h-10 opacity-50" />
    </div>
    <p className="text-stone-500 font-black uppercase tracking-widest text-[10px]">Please sign in to view this page</p>
  </div>;
}
