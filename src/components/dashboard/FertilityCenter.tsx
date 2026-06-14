import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  Activity, 
  Heart, 
  ArrowRight,
  Target,
  Thermometer,
  Droplet,
  BookOpen,
  PieChart,
  Brain,
  Video,
  List,
  ChevronRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function FertilityCenter() {
  const { userData } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'tracker' | 'journal'>('dashboard');

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="text-left space-y-2">
        <h2 className="text-2xl flex items-center gap-3 font-black uppercase tracking-tight text-white">
          <Activity className="text-brand-gold" /> Fertility Center
        </h2>
        <p className="text-xs text-white/50 max-w-2xl leading-relaxed">
          Your personal fertility awareness, education & wellness hub. Understand your reproductive health, fertility patterns, and conception readiness.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button 
           onClick={() => setActiveSubTab('dashboard')}
           className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded transition-colors ${activeSubTab === 'dashboard' ? 'bg-brand-gold text-black' : 'bg-white/5 text-white/60 hover:text-white'}`}
        >
           Dashboard
        </button>
        <button 
           onClick={() => setActiveSubTab('tracker')}
           className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded transition-colors ${activeSubTab === 'tracker' ? 'bg-brand-gold text-black' : 'bg-white/5 text-white/60 hover:text-white'}`}
        >
           Cycle Tracker
        </button>
        <button 
           onClick={() => setActiveSubTab('journal')}
           className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded transition-colors ${activeSubTab === 'journal' ? 'bg-brand-gold text-black' : 'bg-white/5 text-white/60 hover:text-white'}`}
        >
           Fertility Journal
        </button>
      </div>

      {activeSubTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Cycle Status */}
            <div className="p-6 bg-gradient-to-br from-zinc-950 to-neutral-900 border border-brand-gold/20 rounded-xl relative overflow-hidden group text-left flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 rounded-full filter blur-[40px] pointer-events-none transition-opacity opacity-50 group-hover:opacity-100" />
              <div>
                <p className="text-[10px] uppercase font-mono tracking-widest text-brand-gold flex items-center gap-2">
                  <Calendar size={12} /> Cycle Day
                </p>
                <h3 className="text-4xl font-black text-white mt-2">Day 14</h3>
              </div>
              <div className="mt-4 pt-4 border-t border-white/5">
                <p className="text-[9px] uppercase font-bold text-emerald-400 tracking-widest">Ovulation Approaching</p>
              </div>
            </div>

            {/* Fertility Readiness */}
            <div className="p-6 bg-[#111] border border-white/10 rounded-xl text-left flex flex-col justify-between relative overflow-hidden">
               <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 pointer-events-none" />
               <div className="relative z-10 w-full">
                  <div className="flex justify-between items-start w-full">
                    <p className="text-[10px] uppercase font-mono tracking-widest text-white/50 flex items-center gap-2">
                      <Target size={12} /> Readiness Score
                    </p>
                    <span className="text-brand-gold font-mono text-[10px] uppercase tracking-widest border border-brand-gold/30 px-2 py-0.5 bg-brand-gold/10 rounded">High</span>
                  </div>
                  <h3 className="text-4xl font-black text-white mt-2">85<span className="text-lg text-white/40">%</span></h3>
               </div>
               <div className="relative z-10 mt-4 pt-4 border-t border-white/5 w-full">
                  <div className="w-full bg-black h-1 rounded-full overflow-hidden">
                     <div className="bg-brand-gold h-full" style={{ width: '85%' }} />
                  </div>
               </div>
            </div>

             {/* Wellness Reminder */}
             <div className="p-6 bg-brand-gold/10 border border-brand-gold/30 rounded-xl text-left flex flex-col justify-between">
               <div>
                  <p className="text-[10px] uppercase font-mono tracking-widest text-brand-gold flex items-center gap-2">
                    <AlertCircle size={12} /> Daily Reminder
                  </p>
                  <p className="text-sm font-black uppercase text-white tracking-tight mt-2 leading-snug">Log your BBT & Symptoms today for better predictions.</p>
               </div>
               <button className="mt-4 text-[10px] font-black uppercase tracking-widest text-brand-black bg-brand-gold hover:bg-white px-4 py-2 rounded transition-colors self-start">
                  Log Now
               </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Ferile Window Calculator / Predictor */}
            <div className="p-6 bg-gradient-to-br from-zinc-950 to-neutral-900 border border-white/10 rounded-xl space-y-4 text-left">
               <h4 className="text-sm font-black uppercase tracking-tight text-white flex items-center gap-2 pb-3 border-b border-white/5">
                  <PieChart className="text-brand-gold" size={16} /> Fertile Window Estimation
               </h4>
               <div className="grid grid-cols-7 gap-1">
                 {/* Dummy calendar row */}
                 {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                   <div key={day} className="text-center text-[8px] uppercase tracking-widest text-white/40 mb-2">{day}</div>
                 ))}
                 {[...Array(7)].map((_, i) => (
                    <div key={i} className="aspect-square flex items-center justify-center border border-white/5 bg-black/40 rounded text-xs text-white/50">
                       {i + 10}
                    </div>
                 ))}
                 {[...Array(3)].map((_, i) => (
                    <div key={`fw-${i}`} className="aspect-square flex items-center justify-center border border-brand-gold/30 bg-brand-gold/10 rounded text-xs text-brand-gold font-bold relative group">
                       {i + 17}
                       <div className="absolute inset-0 border border-brand-gold/50 rounded animate-pulse opacity-50" />
                    </div>
                 ))}
                 {[...Array(4)].map((_, i) => (
                    <div key={`post-${i}`} className="aspect-square flex items-center justify-center border border-white/5 bg-black/40 rounded text-xs text-white/50">
                       {i + 20}
                    </div>
                 ))}
               </div>
               <div className="flex items-center gap-4 text-[9px] font-mono uppercase tracking-widest pt-2">
                 <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-brand-gold/20 border border-brand-gold" /> Fertile Peak</div>
                 <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-white/10 border border-white/20" /> Low/Observer</div>
               </div>
            </div>

             {/* Recommended Education */}
             <div className="p-6 bg-[#111] border border-white/10 rounded-xl space-y-4 text-left">
               <h4 className="text-sm font-black uppercase tracking-tight text-white flex items-center gap-2 pb-3 border-b border-white/5">
                  <BookOpen className="text-brand-gold" size={16} /> Fertility Learning Path
               </h4>
               <div className="space-y-3">
                  <div className="bg-black/50 p-3 rounded border border-white/5 hover:border-brand-gold/30 cursor-pointer transition-colors group flex items-start gap-4">
                     <div className="w-10 h-10 rounded bg-brand-gold/10 flex items-center justify-center shrink-0">
                        <Video size={16} className="text-brand-gold" />
                     </div>
                     <div>
                        <span className="text-brand-gold font-mono text-[8px] uppercase tracking-[0.2em] block mb-1">Fertility 101</span>
                        <h5 className="text-[10px] uppercase font-black text-white group-hover:text-brand-gold transition-colors">Understanding Ovulation Indicators</h5>
                     </div>
                  </div>
                  <div className="bg-black/50 p-3 rounded border border-white/5 hover:border-brand-gold/30 cursor-pointer transition-colors group flex items-start gap-4">
                     <div className="w-10 h-10 rounded bg-[#0088cc]/10 flex items-center justify-center shrink-0">
                        <List size={16} className="text-[#0088cc]" />
                     </div>
                     <div>
                        <span className="text-[#0088cc] font-mono text-[8px] uppercase tracking-[0.2em] block mb-1">Checklist</span>
                        <h5 className="text-[10px] uppercase font-black text-white group-hover:text-[#0088cc] transition-colors">Preconception Dietary Adjustments</h5>
                     </div>
                  </div>
               </div>
            </div>

          </div>
        </div>
      )}

      {activeSubTab === 'tracker' && (
         <div className="space-y-6">
            <div className="p-8 bg-gradient-to-br from-zinc-950 to-neutral-900 border border-white/10 rounded-xl text-center space-y-4">
               <div className="w-16 h-16 mx-auto bg-brand-gold/10 flex items-center justify-center rounded-full border border-brand-gold/20">
                  <TrendingUp size={24} className="text-brand-gold" />
               </div>
               <h3 className="text-xl font-black uppercase tracking-tight text-white">Daily Tracking</h3>
               <p className="text-xs text-white/50 max-w-sm mx-auto">Log your symptoms, BBT, and cervical mucus to improve pattern recognition.</p>
               
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 max-w-2xl mx-auto">
                  <div className="p-4 bg-black/40 border border-white/5 rounded text-left hover:border-brand-gold/30 transition-colors cursor-pointer group">
                     <Thermometer className="text-brand-gold mb-2" size={16} />
                     <p className="text-[9px] uppercase font-black tracking-widest text-white group-hover:text-brand-gold">BBT Log</p>
                  </div>
                  <div className="p-4 bg-black/40 border border-white/5 rounded text-left hover:border-brand-gold/30 transition-colors cursor-pointer group">
                     <Droplet className="text-emerald-400 mb-2" size={16} />
                     <p className="text-[9px] uppercase font-black tracking-widest text-white group-hover:text-emerald-400">Cervical Mucus</p>
                  </div>
                  <div className="p-4 bg-black/40 border border-white/5 rounded text-left hover:border-brand-gold/30 transition-colors cursor-pointer group">
                     <Brain className="text-[#0088cc] mb-2" size={16} />
                     <p className="text-[9px] uppercase font-black tracking-widest text-white group-hover:text-[#0088cc]">Symptoms & Mood</p>
                  </div>
               </div>
            </div>
         </div>
      )}

      {activeSubTab === 'journal' && (
         <div className="space-y-6 text-left">
            <div className="flex justify-between items-end">
               <div>
                  <h3 className="text-lg font-black uppercase text-white tracking-tight">Fertility Journal</h3>
                  <p className="text-[10px] text-white/50 font-mono tracking-widest uppercase mt-1">A safe space for reflection</p>
               </div>
               <button className="bg-brand-gold text-black hover:bg-white text-[9px] font-black uppercase tracking-widest px-4 py-2 transition-colors rounded">
                  New Entry
               </button>
            </div>
            
            <div className="space-y-4">
               {/* Dummy Entries */}
               {[1, 2].map((i) => (
                  <div key={i} className="p-6 bg-[#111] border border-white/5 rounded-xl cursor-pointer hover:border-brand-gold/30 transition-colors">
                     <div className="flex items-center gap-3 mb-3">
                        <span className="text-[9px] uppercase font-mono tracking-widest text-brand-gold">Cycle Day 1{i}</span>
                        <div className="w-1 h-1 rounded-full bg-white/20" />
                        <span className="text-[9px] uppercase font-mono tracking-widest text-white/40">12 Oct 2026</span>
                     </div>
                     <p className="text-xs text-white/70 leading-relaxed font-light">
                        Today I felt a slight twinge on the right side. Energy levels were much better than yesterday. Feeling optimistic about this cycle and focusing on maintaining my wellness routines.
                     </p>
                  </div>
               ))}
            </div>
         </div>
      )}

    </div>
  );
}
