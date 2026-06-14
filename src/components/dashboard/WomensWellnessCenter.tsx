import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  Heart, 
  Moon, 
  Brain, 
  Smile, 
  BatteryMedium, 
  Droplet,
  Calendar,
  FileText,
  BarChart2,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

export default function WomensWellnessCenter() {
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'trackers' | 'journal' | 'reports'>('dashboard');

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">
      
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl flex items-center gap-3 font-black uppercase tracking-tight text-white">
          <Heart className="text-brand-gold" /> Women's Wellness Center
        </h2>
        <p className="text-xs text-white/50 max-w-2xl leading-relaxed">
          Your complete daily health, hormonal & lifestyle tracking hub. Understand how daily choices influence your balance and vitality.
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
           onClick={() => setActiveSubTab('trackers')}
           className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded transition-colors ${activeSubTab === 'trackers' ? 'bg-brand-gold text-black' : 'bg-white/5 text-white/60 hover:text-white'}`}
        >
           Daily Trackers
        </button>
        <button 
           onClick={() => setActiveSubTab('journal')}
           className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded transition-colors ${activeSubTab === 'journal' ? 'bg-brand-gold text-black' : 'bg-white/5 text-white/60 hover:text-white'}`}
        >
           Health Journal
        </button>
        <button 
           onClick={() => setActiveSubTab('reports')}
           className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded transition-colors ${activeSubTab === 'reports' ? 'bg-brand-gold text-black' : 'bg-white/5 text-white/60 hover:text-white'}`}
        >
           Insights & Reports
        </button>
      </div>

      {activeSubTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             {/* Sleep */}
             <div className="p-4 bg-gradient-to-br from-zinc-950 to-neutral-900 border border-white/5 rounded-xl">
                <Moon size={16} className="text-[#0088cc] mb-3" />
                <p className="text-[9px] uppercase font-mono tracking-widest text-white/40 mb-1">Sleep Score</p>
                <p className="text-2xl font-black text-white">82<span className="text-sm text-white/30">%</span></p>
                <div className="w-full h-1 bg-white/5 rounded-full mt-3 overflow-hidden">
                   <div className="h-full bg-[#0088cc] w-[82%]" />
                </div>
             </div>
             {/* Stress */}
             <div className="p-4 bg-gradient-to-br from-zinc-950 to-neutral-900 border border-white/5 rounded-xl">
                <Brain size={16} className="text-brand-red mb-3" />
                <p className="text-[9px] uppercase font-mono tracking-widest text-white/40 mb-1">Stress Level</p>
                <p className="text-2xl font-black text-white">Low</p>
                <div className="w-full h-1 bg-white/5 rounded-full mt-3 overflow-hidden">
                   <div className="h-full bg-emerald-400 w-[20%]" />
                </div>
             </div>
             {/* Energy */}
             <div className="p-4 bg-gradient-to-br from-zinc-950 to-neutral-900 border border-white/5 rounded-xl">
                <BatteryMedium size={16} className="text-brand-gold mb-3" />
                <p className="text-[9px] uppercase font-mono tracking-widest text-white/40 mb-1">Energy</p>
                <p className="text-2xl font-black text-white">High</p>
                <div className="w-full h-1 bg-white/5 rounded-full mt-3 overflow-hidden">
                   <div className="h-full bg-brand-gold w-[90%]" />
                </div>
             </div>
             {/* Hydration */}
             <div className="p-4 bg-gradient-to-br from-zinc-950 to-neutral-900 border border-white/5 rounded-xl">
                <Droplet size={16} className="text-blue-400 mb-3" />
                <p className="text-[9px] uppercase font-mono tracking-widest text-white/40 mb-1">Water</p>
                <p className="text-2xl font-black text-white">3<span className="text-sm text-white/30">L</span></p>
                <div className="w-full h-1 bg-white/5 rounded-full mt-3 overflow-hidden">
                   <div className="h-full bg-blue-400 w-[100%]" />
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <div className="p-6 bg-[#111] border border-white/10 rounded-xl space-y-4">
                <h4 className="text-sm font-black uppercase text-white flex items-center gap-2 pb-3 border-b border-white/5">
                   <Activity className="text-brand-gold" size={16} /> Hormonal Balance
                </h4>
                <div className="space-y-4">
                   <div className="flex justify-between items-center text-xs">
                      <span className="text-white/60">Cycle Phase</span>
                      <span className="font-bold text-white uppercase tracking-widest text-[9px] text-emerald-400">Follicular</span>
                   </div>
                   <div className="flex justify-between items-center text-xs">
                      <span className="text-white/60">Estimated Menstruation</span>
                      <span className="font-bold text-white uppercase tracking-widest text-[9px]">In 14 Days</span>
                   </div>
                   <div className="flex justify-between items-center text-xs">
                      <span className="text-white/60">Symptom Severity</span>
                      <span className="font-bold text-white uppercase tracking-widest text-[9px] text-brand-gold">Mild</span>
                   </div>
                </div>
             </div>

             <div className="p-6 bg-[#111] border border-white/10 rounded-xl space-y-4">
                <h4 className="text-sm font-black uppercase text-white flex items-center gap-2 pb-3 border-b border-white/5">
                   <Smile className="text-brand-gold" size={16} /> Mood Trends
                </h4>
                <div className="h-32 flex items-end gap-2 pb-2">
                   {[60, 40, 80, 90, 70, 50, 85].map((val, i) => (
                      <div key={i} className="flex-1 bg-brand-gold/20 rounded-t relative group overflow-hidden" style={{ height: `${val}%` }}>
                         <div className="absolute bottom-0 w-full bg-brand-gold transition-all duration-500 h-full group-hover:bg-white" />
                      </div>
                   ))}
                </div>
                <div className="flex justify-between text-[8px] uppercase tracking-widest text-white/40">
                   <span>Mon</span><span>Wed</span><span>Fri</span><span>Sun</span>
                </div>
             </div>
          </div>
        </div>
      )}

      {activeSubTab === 'trackers' && (
         <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
               {[
                  { icon: Calendar, label: "Menstrual Health", color: "text-brand-red" },
                  { icon: Activity, label: "Hormonal Symptoms", color: "text-brand-gold" },
                  { icon: Moon, label: "Sleep Quality", color: "text-blue-300" },
                  { icon: Brain, label: "Stress Levels", color: "text-zinc-400" },
                  { icon: Smile, label: "Mood & Emotions", color: "text-emerald-400" },
                  { icon: BatteryMedium, label: "Energy Levels", color: "text-orange-400" },
                  { icon: Droplet, label: "Water Intake", color: "text-blue-500" },
                  { icon: FileText, label: "Daily Check-In", color: "text-white" }
               ].map((item, i) => (
                  <button key={i} className="p-6 bg-[#111] border border-white/5 hover:border-brand-gold/30 rounded-xl flex flex-col items-center justify-center text-center group transition-colors">
                     <item.icon size={24} className={`${item.color} mb-3 group-hover:scale-110 transition-transform`} />
                     <p className="text-[10px] font-black uppercase tracking-widest text-white">{item.label}</p>
                     <p className="text-[8px] text-brand-gold uppercase tracking-[0.2em] font-mono mt-2 opacity-0 group-hover:opacity-100 transition-opacity">Log Entry</p>
                  </button>
               ))}
            </div>
         </div>
      )}

      {activeSubTab === 'journal' && (
         <div className="space-y-6">
            <div className="flex justify-between items-end">
               <div>
                  <h3 className="text-lg font-black uppercase text-white tracking-tight">Health Journal</h3>
                  <p className="text-[10px] text-white/50 font-mono tracking-widest uppercase mt-1">Reflect on your physical & emotional states</p>
               </div>
               <button className="bg-brand-gold text-black hover:bg-white text-[9px] font-black uppercase tracking-widest px-4 py-2 transition-colors rounded">
                  New Reflection
               </button>
            </div>
            
            <div className="p-6 bg-[#111] border border-white/5 rounded-xl space-y-4">
               <textarea 
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-4 text-xs text-white placeholder-white/30 focus:outline-none focus:border-brand-gold h-32 resize-none"
                  placeholder="How is your body feeling today? Any emotional shifts or physical changes..."
               ></textarea>
               <div className="flex gap-2">
                  {['Energy', 'Stress', 'Mood', 'Body'].map(tag => (
                     <button key={tag} className="px-3 py-1 border border-white/10 rounded-full text-[9px] uppercase tracking-widest text-white/60 hover:text-white hover:border-white/30 transition-colors">
                        +{tag}
                     </button>
                  ))}
               </div>
               <div className="flex justify-end">
                  <button className="bg-white/10 text-white hover:bg-white/20 text-[9px] font-black uppercase tracking-widest px-6 py-2.5 transition-colors rounded">
                     Save Entry
                  </button>
               </div>
            </div>

            <div className="space-y-4 pt-4">
               <h4 className="text-[10px] uppercase font-mono tracking-widest text-brand-gold">Recent Entries</h4>
               <div className="p-5 border border-white/5 rounded-lg hover:border-white/10 transition-colors">
                  <p className="text-[9px] text-white/40 uppercase tracking-widest mb-2 font-mono">15 Oct 2026 • 20:45</p>
                  <p className="text-xs text-white/80 leading-relaxed font-light">Feeling consistently low energy in the afternoons. Need to monitor if this is related to my current cycle phase or perhaps hydration levels.</p>
                  <div className="flex gap-2 mt-3">
                     <span className="text-[8px] bg-brand-gold/10 text-brand-gold px-2 py-0.5 rounded tracking-widest uppercase">Energy</span>
                  </div>
               </div>
            </div>
         </div>
      )}

      {activeSubTab === 'reports' && (
         <div className="space-y-6">
            <div className="p-6 bg-gradient-to-br from-zinc-950 to-neutral-900 border border-white/10 rounded-xl text-center space-y-4">
               <div className="w-16 h-16 mx-auto bg-brand-gold/10 flex items-center justify-center rounded-full border border-brand-gold/20">
                  <TrendingUp size={24} className="text-brand-gold" />
               </div>
               <h3 className="text-xl font-black uppercase tracking-tight text-white">Monthly Wellness Report</h3>
               <p className="text-xs text-white/50 max-w-sm mx-auto">Your comprehensive health summary for the past 30 days is ready to view.</p>
               <button className="bg-brand-gold text-black mt-2 text-[10px] font-black uppercase tracking-widest px-6 py-3 transition-colors rounded shadow-[0_0_15px_rgba(212,175,55,0.4)]">
                  Generate Full Report
               </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="p-6 bg-[#111] border border-white/10 rounded-xl space-y-2">
                  <h4 className="text-xs font-black uppercase text-white flex items-center gap-2 pb-3 border-b border-white/5">
                     <BarChart2 className="text-brand-gold" size={14} /> Health Trend Analysis
                  </h4>
                  <ul className="space-y-3 pt-2">
                     <li className="flex gap-3 text-[11px] text-white/70 leading-relaxed">
                        <AlertCircle size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                        <span><strong className="text-white">Pattern detected:</strong> Your energy levels drop significantly during high-stress weeks.</span>
                     </li>
                     <li className="flex gap-3 text-[11px] text-white/70 leading-relaxed">
                        <AlertCircle size={14} className="text-brand-gold shrink-0 mt-0.5" />
                        <span><strong className="text-white">Correlation:</strong> Sleep quality strongly influences your mood stability the following day.</span>
                     </li>
                  </ul>
               </div>

               <div className="p-6 bg-[#111] border border-white/10 rounded-xl space-y-2">
                  <h4 className="text-xs font-black uppercase text-white flex items-center gap-2 pb-3 border-b border-white/5">
                     <Heart className="text-brand-gold" size={14} /> Needs Attention
                  </h4>
                  <ul className="space-y-3 pt-2">
                     <li className="flex gap-3 text-[11px] text-white/70 leading-relaxed">
                        <Droplet size={14} className="text-blue-400 shrink-0 mt-0.5" />
                        <span>Consistent hydration tracking dropped by 40% in the last week.</span>
                     </li>
                  </ul>
               </div>
            </div>
         </div>
      )}

    </div>
  );
}
