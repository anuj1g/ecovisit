import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, MapPin, Award, User, PlusCircle, AlertCircle } from 'lucide-react';
import { Logo } from './Logo';
import { cn } from '../lib/utils';

export default function Sidebar() {
  const navItems = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/report", icon: PlusCircle, label: "Report" },
    { to: "/map", icon: MapPin, label: "Map" },
    { to: "/rewards", icon: Award, label: "Rewards" },
    { to: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-20 xl:w-64 bg-white dark:bg-surface border-r border-stone-200 dark:border-white/5 z-[1000] hidden md:flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-stone-100 dark:bg-emerald-50 rounded-xl flex items-center justify-center p-1 shadow-lg shadow-emerald-500/10">
            <Logo className="w-full h-full text-emerald-900" />
          </div>
          <span className="text-xl font-black font-display tracking-tight uppercase italic hidden xl:block text-stone-900 dark:text-emerald-50">EcoVisit</span>
        </div>

        <nav className="flex-1 mt-6 px-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => cn(
                "flex items-center gap-4 p-4 rounded-2xl transition-all group relative",
                isActive 
                  ? "bg-accent text-white font-black" 
                  : "text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-white/5"
              )}
            >
              <item.icon className={cn(
                "w-6 h-6", 
                item.to === "/report" && "text-accent group-hover:text-white transition-colors"
              )} />
              <span className="font-bold hidden xl:block">{item.label}</span>
              {item.to === "/report" && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden xl:block">
                   <div className="w-2 h-2 bg-accent rounded-full animate-ping" />
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 mt-auto">
          <div className="bg-stone-50 dark:bg-emerald-900/10 rounded-2xl p-4 hidden xl:block border border-stone-100 dark:border-emerald-800/20">
            <div className="flex items-center gap-2 text-stone-400 dark:text-emerald-500/60 text-[10px] font-black uppercase tracking-widest mb-2">
              <AlertCircle className="w-3 h-3" />
              Service Status
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-accent rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <span className="text-xs font-bold text-stone-600 dark:text-emerald-100/70">Feed Online</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Nav */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white/80 dark:bg-surface/80 backdrop-blur-xl border-t border-stone-200 dark:border-white/5 z-[1000] flex md:hidden items-center justify-around px-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => cn(
              "p-3 rounded-xl transition-all",
              isActive ? "text-accent" : "text-stone-400 dark:text-stone-500"
            )}
          >
            <item.icon className="w-6 h-6" />
          </NavLink>
        ))}
      </nav>
    </>
  );
}
