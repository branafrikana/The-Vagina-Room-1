import React from 'react';
import { Home, GraduationCap, MessageSquare, Calendar, User, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardMobileStickyFooterProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function DashboardMobileStickyFooter({ activeTab, setActiveTab }: DashboardMobileStickyFooterProps) {
  const tabs = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'programs', icon: GraduationCap, label: 'Learn' },
    { id: 'ai_assistant', icon: Sparkles, label: 'Ask AI', isCenter: true },
    { id: 'events', icon: Calendar, label: 'Events' },
    { id: 'profile', icon: User, label: 'Profile' }
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#111111]/90 backdrop-blur-md border-t border-white/10 pb-safe">
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          if (tab.isCenter) {
             return (
                <button
                   key={tab.id}
                   onClick={() => setActiveTab(tab.id)}
                   className="relative -top-5 flex flex-col items-center justify-center gap-1 group"
                >
                   <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform ${
                      isActive ? 'bg-brand-gold text-black scale-110 shadow-[0_0_20px_rgba(212,175,55,0.4)]' : 'bg-[#1A1A1A] text-brand-gold border border-brand-gold/30 group-hover:scale-105'
                   }`}>
                      <Icon size={24} className={isActive ? '' : 'group-hover:animate-pulse'} />
                   </div>
                   <span className={`text-[9px] uppercase tracking-widest font-black transition-colors ${
                      isActive ? 'text-brand-gold' : 'text-white/50 group-hover:text-white/80'
                   }`}>
                      {tab.label}
                   </span>
                </button>
             );
          }

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex flex-col items-center justify-center gap-1 w-16 h-full group"
            >
              <Icon 
                 size={20} 
                 className={`transition-colors ${isActive ? 'text-brand-gold' : 'text-white/40 group-hover:text-white/70'}`} 
              />
              <span className={`text-[9px] uppercase tracking-widest font-bold transition-colors ${
                 isActive ? 'text-brand-gold' : 'text-white/40 group-hover:text-white/70'
              }`}>
                {tab.label}
              </span>
              
              {isActive && (
                 <motion.div 
                    layoutId="mobileNavIndicator"
                    className="absolute bottom-0 w-8 h-0.5 bg-brand-gold rounded-t-full"
                 />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
