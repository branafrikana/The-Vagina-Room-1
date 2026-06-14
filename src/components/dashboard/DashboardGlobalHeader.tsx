import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Bell, 
  Bot, 
  ChevronDown, 
  Menu, 
  X, 
  LogOut, 
  CalendarCheck, 
  GraduationCap, 
  Award, 
  Activity,
  User,
  Settings,
  HelpCircle,
  Sparkles,
  Trophy,
  Flame
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../lib/firebase';

interface DashboardGlobalHeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  setActiveTab: (tab: string) => void;
  userData: any;
  user: any;
}

export default function DashboardGlobalHeader({ sidebarOpen, setSidebarOpen, setActiveTab, userData, user }: DashboardGlobalHeaderProps) {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);

  const getMembershipDisplayLabel = () => {
    if (userData?.role === 'admin' || userData?.isAdmin === true) return 'System Admin';
    if (userData?.isFreeMemberForLife) return 'Lifetime Elite';
    const tier = userData?.membershipType || 'Gold';
    const t = tier.toLowerCase();
    if (t === 'gold' || t === 'quarterly') return 'Gold Plan';
    if (t === 'diamond' || t === 'yearly') return 'Diamond Plan';
    return `${tier.charAt(0).toUpperCase() + tier.slice(1)}`;
  };

  const getMembershipColor = () => {
    const tier = (userData?.membershipType || 'gold').toLowerCase();
    if (tier === 'diamond' || tier === 'yearly' || userData?.isFreeMemberForLife) return 'bg-brand-gold text-black';
    return 'bg-white/10 text-white';
  };

  return (
    <div className="flex flex-col gap-6 mb-8 font-sans">
      
      {/* 📱 MOBILE TOP ROW */}
      <div className="lg:hidden flex items-center justify-between border-b border-white/5 pb-4">
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 bg-white/5 hover:bg-white/10 text-brand-gold rounded-xl transition-colors border border-white/5"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <span className="text-sm font-black uppercase tracking-[0.2em] text-brand-gold">The Vagina Room</span>
        <button className="relative p-2 text-white/70 hover:text-white transition-colors">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-brand-red rounded-full border border-black"></span>
        </button>
      </div>

      {/* 💻 DESKTOP ROW 1: Logo | Search | AI | Notifications | Badge | Profile */}
      <div className="hidden lg:flex items-center justify-between gap-6 pb-4 border-b border-white/5">
        
        {/* Left Side: Sidebar Toggle & Search */}
        <div className="flex items-center gap-6 flex-1">
           <button 
             onClick={() => setSidebarOpen(!sidebarOpen)}
             className="p-2.5 bg-white/5 hover:bg-white/10 text-brand-gold rounded-xl transition-colors border border-white/5"
           >
             {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
           </button>
           
           <div className="relative flex-1 max-w-md">
             <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" />
             <input 
               type="text" 
               placeholder="Search resources, programs, events..." 
               className="w-full bg-[#1A1A1A] border border-white/10 rounded-full py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/40 focus:outline-none focus:border-brand-gold/50 transition-colors"
             />
           </div>
        </div>

        {/* Right Side: Actions & Profile */}
        <div className="flex items-center gap-4">
           {/* Ask Dr. FID AI Quick Action */}
           <button 
              onClick={() => setActiveTab('ai_assistant')}
              className="flex items-center gap-2 bg-brand-gold/10 hover:bg-brand-gold hover:text-black border border-brand-gold/30 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-brand-gold transition-all group"
           >
              <Sparkles size={14} className="group-hover:animate-pulse" />
              Ask AI
           </button>

           {/* Quick Actions Dropdown */}
           <div className="relative">
              <button 
                 onClick={() => setQuickActionsOpen(!quickActionsOpen)}
                 className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-white/70 hover:text-white transition-colors capitalize bg-white/5 border border-white/10 rounded-xl"
              >
                 <span className="hidden xl:inline">Actions</span> <ChevronDown size={14} />
              </button>
              
              <AnimatePresence>
                 {quickActionsOpen && (
                    <motion.div 
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       exit={{ opacity: 0, scale: 0.95 }}
                       className="absolute right-0 mt-2 w-48 bg-[#181818] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden py-2"
                    >
                       <button onClick={() => { setActiveTab('consultation'); setQuickActionsOpen(false); }} className="w-full text-left px-4 py-2.5 text-xs text-white/80 hover:text-white hover:bg-white/5 flex items-center gap-3">
                          <CalendarCheck size={14} className="text-brand-gold" /> Book Consultation
                       </button>
                       <button onClick={() => { setActiveTab('reflection'); setQuickActionsOpen(false); }} className="w-full text-left px-4 py-2.5 text-xs text-white/80 hover:text-white hover:bg-white/5 flex items-center gap-3">
                          <Activity size={14} className="text-emerald-400" /> Start Check-In
                       </button>
                       <button onClick={() => { setActiveTab('live_class'); setQuickActionsOpen(false); }} className="w-full text-left px-4 py-2.5 text-xs text-white/80 hover:text-white hover:bg-white/5 flex items-center gap-3">
                          <GraduationCap size={14} className="text-[#3B82F6]" /> Join Live Class
                       </button>
                    </motion.div>
                 )}
              </AnimatePresence>
           </div>

           {/* Notifications */}
           <button className="relative p-2.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-xl transition-colors border border-white/5">
             <Bell size={16} />
             <span className="absolute top-2 right-2 w-2 h-2 bg-brand-red rounded-full border border-[#111111]"></span>
           </button>

           {/* Membership Badge */}
           <div className={`hidden md:flex px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${getMembershipColor()} shadow-[0_0_10px_rgba(212,175,55,0.1)]`}>
              {getMembershipDisplayLabel()}
           </div>

           {/* Profile Menu */}
           <div className="relative">
              <button 
                 onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                 className="flex items-center gap-2 pr-1"
              >
                 <div className="w-10 h-10 rounded-full bg-brand-gold/20 flex items-center justify-center border border-brand-gold/30 hover:border-brand-gold transition-colors overflow-hidden">
                    {userData?.avatarUrl ? (
                       <img src={userData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                       <User size={18} className="text-brand-gold" />
                    )}
                 </div>
              </button>

              <AnimatePresence>
                 {profileDropdownOpen && (
                    <motion.div 
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       exit={{ opacity: 0, scale: 0.95 }}
                       className="absolute right-0 mt-3 w-56 bg-[#181818] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
                    >
                       <div className="px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                          <p className="text-sm font-bold text-white truncate text-left">{userData?.firstName || 'Sister'} {userData?.lastName || ''}</p>
                          <p className="text-[10px] text-white/40 truncate text-left">{user?.email}</p>
                       </div>
                       <div className="py-2">
                          <button onClick={() => { setActiveTab('profile'); setProfileDropdownOpen(false); }} className="w-full text-left px-4 py-2.5 text-xs text-white/70 hover:text-brand-gold hover:bg-white/5 flex items-center gap-3">
                             <User size={14} /> My Profile
                          </button>
                          <button onClick={() => { setActiveTab('id_card'); setProfileDropdownOpen(false); }} className="w-full text-left px-4 py-2.5 text-xs text-white/70 hover:text-brand-gold hover:bg-white/5 flex items-center gap-3">
                             <Award size={14} /> Identity Card
                          </button>
                          <button onClick={() => { setActiveTab('settings'); setProfileDropdownOpen(false); }} className="w-full text-left px-4 py-2.5 text-xs text-white/70 hover:text-brand-gold hover:bg-white/5 flex items-center gap-3">
                             <Settings size={14} /> Settings
                          </button>
                          <button onClick={() => { setActiveTab('support'); setProfileDropdownOpen(false); }} className="w-full text-left px-4 py-2.5 text-xs text-white/70 hover:text-brand-gold hover:bg-white/5 flex items-center gap-3">
                             <HelpCircle size={14} /> Support
                          </button>
                       </div>
                       <div className="p-2 border-t border-white/5">
                          <button 
                             onClick={() => auth.signOut()} 
                             className="w-full text-left px-4 py-2 rounded-xl text-xs text-brand-red hover:bg-brand-red/10 flex items-center gap-3 transition-colors"
                          >
                             <LogOut size={14} /> Terminate Session
                          </button>
                       </div>
                    </motion.div>
                 )}
              </AnimatePresence>
           </div>
        </div>
      </div>

      {/* 📱 MOBILE SEARCH ROW */}
      <div className="lg:hidden relative w-full mb-2">
         <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" />
         <input 
            type="text" 
            placeholder="Search resources, courses..." 
            className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-white/40 focus:outline-none focus:border-brand-gold/50"
         />
      </div>

      {/* 🌟 ROW 2: Welcome Message & Smart Greeting */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
         <div className="text-left space-y-1.5">
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-white flex items-center gap-3">
               Welcome back{(() => {
                  const name = userData?.firstName || (userData?.fullName ? userData.fullName.split(' ')[0] : null) || (user?.displayName ? user.displayName.split(' ')[0] : null);
                  return name && name !== 'Demo' ? `, ${name}` : '';
               })()} 👋
            </h2>
            <div className="flex items-center gap-2">
               <Sparkles size={14} className="text-brand-gold" />
               <p className="text-sm font-sans text-brand-gold/80 font-medium">Day 21 of your Wellness Journey</p>
            </div>
         </div>
         
         <div className="hidden lg:flex items-center gap-3 bg-[#181818] border border-white/10 px-4 py-3 rounded-xl max-w-sm">
            <div className="w-8 h-8 rounded-full bg-brand-gold/20 flex items-center justify-center shrink-0">
               <Bot size={16} className="text-brand-gold" />
            </div>
            <p className="text-xs text-white/70 font-sans leading-relaxed text-left">
               <span className="font-bold text-white block">Today's Focus</span>
               Your fertility tracking update is ready. Consider adding a short journal reflection today.
            </p>
         </div>
         {/* Mobile Smart Greeting */}
         <p className="lg:hidden text-xs text-white/60 font-sans bg-white/5 border border-white/10 p-3 rounded-xl border-l-4 border-l-brand-gold text-left">
            <strong className="text-white block mb-0.5">Today's Focus</strong>
            Your fertility tracking update is ready. Consider adding a short journal reflection today.
         </p>
      </div>

      {/* 📊 ROW 3: Premium Header Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-2">
         {/* Card 1: Wellness Score */}
         <div 
             onClick={() => setActiveTab('analytics')}
             className="bg-gradient-to-br from-[#1A1A1A] to-[#111] border border-white/10 rounded-2xl p-4 text-left cursor-pointer hover:border-brand-gold/40 transition-colors group relative overflow-hidden"
         >
            <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex justify-between items-start mb-3">
               <div className="p-2 border border-white/10 bg-white/5 rounded-lg text-emerald-400">
                  <Activity size={16} />
               </div>
               <div className="flex items-center gap-1 text-[10px] text-brand-gold font-bold bg-brand-gold/10 px-2 py-0.5 rounded-full">
                  <Flame size={10} /> 15d
               </div>
            </div>
            <p className="text-[10px] uppercase font-black tracking-widest text-white/50 mb-1">Wellness Score</p>
            <p className="text-2xl font-black text-white group-hover:text-emerald-400 transition-colors">82<span className="text-sm font-medium text-white/40">%</span></p>
         </div>

         {/* Card 2: Learning Progress */}
         <div 
             onClick={() => setActiveTab('programs')}
             className="bg-gradient-to-br from-[#1A1A1A] to-[#111] border border-white/10 rounded-2xl p-4 text-left cursor-pointer hover:border-brand-gold/40 transition-colors group relative overflow-hidden"
         >
            <div className="absolute top-0 right-0 w-16 h-16 bg-[#3B82F6]/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex justify-between items-start mb-3">
               <div className="p-2 border border-white/10 bg-white/5 rounded-lg text-[#3B82F6]">
                  <GraduationCap size={16} />
               </div>
            </div>
            <p className="text-[10px] uppercase font-black tracking-widest text-white/50 mb-1">Academy Progress</p>
            <p className="text-2xl font-black text-white group-hover:text-[#3B82F6] transition-colors">65<span className="text-sm font-medium text-white/40">%</span></p>
            {/* Progress bar */}
            <div className="w-full h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
               <div className="h-full bg-[#3B82F6] w-[65%]" />
            </div>
         </div>

         {/* Card 3: Next Event */}
         <div 
             onClick={() => setActiveTab('events')}
             className="bg-gradient-to-br from-[#1A1A1A] to-[#111] border border-white/10 rounded-2xl p-4 text-left cursor-pointer hover:border-[#D4AF37]/40 transition-colors group relative overflow-hidden"
         >
            <div className="absolute top-0 right-0 w-16 h-16 bg-[#D4AF37]/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex justify-between items-start mb-2">
               <div className="p-2 border border-white/10 bg-white/5 rounded-lg text-[#D4AF37]">
                  <CalendarCheck size={16} />
               </div>
            </div>
            <p className="text-[10px] uppercase font-black tracking-widest text-white/50 mb-1">Next Live Event</p>
            <p className="text-xs sm:text-sm font-bold text-white group-hover:text-brand-gold transition-colors truncate">Women's Wellness</p>
            <p className="text-[10px] text-white/50 mt-1 font-mono">Tomorrow • 6 PM ET</p>
         </div>

         {/* Card 4: Reward Points */}
         <div 
             onClick={() => setActiveTab('rewards')}
             className="bg-gradient-to-br from-[#1A1A1A] to-[#111] border border-white/10 rounded-2xl p-4 text-left cursor-pointer hover:border-[#A855F7]/40 transition-colors group relative overflow-hidden"
         >
            <div className="absolute top-0 right-0 w-16 h-16 bg-[#A855F7]/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex justify-between items-start mb-3">
               <div className="p-2 border border-white/10 bg-white/5 rounded-lg text-[#A855F7]">
                  <Trophy size={16} />
               </div>
            </div>
            <p className="text-[10px] uppercase font-black tracking-widest text-white/50 mb-1">Reward Points</p>
            <p className="text-xl sm:text-2xl font-black text-white group-hover:text-[#A855F7] transition-colors">1,250</p>
            <p className="text-[9px] uppercase tracking-widest text-white/50 mt-1 font-bold">Lvl 4 Ambassador</p>
         </div>
      </div>
      
    </div>
  );
}
