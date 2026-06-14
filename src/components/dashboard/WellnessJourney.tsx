import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Compass, 
  Target, 
  Map as MapIcon, 
  TrendingUp, 
  CheckCircle2, 
  ChevronRight, 
  PlayCircle,
  BookOpen,
  Calendar,
  Lock,
  Heart,
  Activity,
  Smile,
  Zap,
  Star,
  Award
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface WellnessJourneyProps {
  setActiveTab: (tab: any) => void;
}

// Dummy journey data
const JOURNEY_STAGES = [
  { id: 'foundations', title: 'Hormonal Wellness Foundations', status: 'completed' },
  { id: 'lifestyle', title: 'Lifestyle Optimization', status: 'active' },
  { id: 'tracking', title: 'Wellness Tracking integration', status: 'locked' },
  { id: 'consultation', title: 'Professional Evaluation', status: 'locked' }
];

export default function WellnessJourney({ setActiveTab }: WellnessJourneyProps) {
  const { userData } = useAuth();
  const [showAssessment, setShowAssessment] = useState(false);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="text-left space-y-2">
        <h2 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-3">
          <Compass className="text-brand-gold" /> My Wellness Journey
        </h2>
        <p className="text-xs text-white/50 max-w-2xl leading-relaxed">
          Your personalized roadmap based on your unique wellness goals, life stage, and health priorities. Follow your guided pathway towards restoration and balance.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Current Stage Panel */}
          <div className="p-8 bg-gradient-to-br from-zinc-950 to-neutral-900 border border-brand-gold/20 rounded-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/5 rounded-full filter blur-[80px] pointer-events-none group-hover:bg-brand-gold/10 transition-colors duration-700" />
            
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="text-left space-y-3">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-brand-gold bg-brand-gold/10 px-2 py-1 rounded inline-flex items-center gap-1.5">
                  <Target size={12} /> Current Stage
                </span>
                <h3 className="text-3xl font-black uppercase tracking-tight text-white">Hormonal Balance</h3>
                <p className="text-xs text-white/60">Primary Focus: <span className="text-white">Irregular Cycles & Fatigue</span></p>
              </div>

              <div className="w-full md:w-auto">
                 <button
                    onClick={() => setShowAssessment(true)}
                    className="w-full md:w-auto px-6 py-3 bg-white/5 hover:bg-white/10 text-white text-[10px] uppercase font-black tracking-widest transition-colors rounded border border-white/10"
                 >
                    Retake Assessment
                 </button>
              </div>
            </div>
          </div>

          {/* Journey Map */}
          <div className="p-8 bg-[#111] border border-white/10 rounded-xl text-left space-y-6">
            <h4 className="text-sm font-black uppercase text-white tracking-widest flex items-center gap-2 pb-4 border-b border-white/5">
              <MapIcon size={16} className="text-brand-gold" /> Personalized Roadmap
            </h4>

            <div className="relative pl-6 space-y-8 before:absolute before:inset-0 before:ml-8 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-brand-gold before:via-brand-gold/30 before:to-white/10">
              
              {JOURNEY_STAGES.map((stage, index) => {
                const isActive = stage.status === 'active';
                const isCompleted = stage.status === 'completed';
                const isLocked = stage.status === 'locked';

                return (
                  <div key={stage.id} className="relative flex items-center justify-between gap-6 group">
                    <div className="flex items-center gap-6 flex-1">
                      {/* Node Indicator */}
                      <div className={`absolute left-0 w-5 h-5 -ml-2.5 rounded-full flex items-center justify-center transition-transform duration-500 z-10 shadow-[0_0_10px_rgba(0,0,0,0.5)] border-2 ${
                        isCompleted ? 'bg-brand-gold border-brand-gold text-black scale-100' :
                        isActive ? 'bg-[#111] border-brand-gold text-brand-gold scale-125' :
                        'bg-[#111] border-white/20 text-white/20 scale-75'
                      }`}>
                        {isCompleted && <CheckCircle2 size={12} />}
                        {isActive && <div className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-pulse" />}
                        {isLocked && <Lock size={8} />}
                      </div>

                      {/* Content Card */}
                      <div className={`flex-1 p-5 rounded-lg border transition-all duration-300 ml-4 ${
                        isActive ? 'bg-brand-gold/5 border-brand-gold/30 shadow-[0_0_20px_rgba(212,175,55,0.05)]' :
                        isCompleted ? 'bg-white/[0.02] border-white/10 hover:bg-white/[0.04]' :
                        'bg-transparent border-white/5 opacity-50'
                      }`}>
                        <div className="flex justify-between items-center">
                          <h5 className={`text-xs font-black uppercase tracking-wider ${isActive ? 'text-brand-gold' : 'text-white'}`}>
                            Step {index + 1}: {stage.title}
                          </h5>
                          {isActive && <span className="bg-brand-gold text-black text-[8px] font-black uppercase px-2 py-0.5 rounded tracking-widest">In Progress</span>}
                        </div>
                        
                        {isActive && (
                          <div className="mt-4 pt-4 border-t border-brand-gold/10 grid grid-cols-1 sm:grid-cols-2 gap-3">
                             <button onClick={() => setActiveTab('programs')} className="text-[10px] font-bold uppercase tracking-widest text-white hover:text-brand-gold flex items-center gap-2 bg-black/40 p-3 rounded transition-colors text-left border border-white/5">
                                <PlayCircle size={14} className="text-brand-gold" /> Watch Foundations Module
                             </button>
                             <button onClick={() => setActiveTab('reflection')} className="text-[10px] font-bold uppercase tracking-widest text-white hover:text-brand-gold flex items-center gap-2 bg-black/40 p-3 rounded transition-colors text-left border border-white/5">
                                <Heart size={14} className="text-brand-gold" /> Log Daily Symptoms
                             </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          
          {/* Progress Tracker */}
          <div className="p-6 bg-gradient-to-br from-zinc-950 to-neutral-900 border border-white/10 rounded-xl text-left space-y-5">
             <h4 className="text-xs font-black uppercase text-white tracking-widest flex items-center gap-2 pb-3 border-b border-white/5">
               <TrendingUp size={14} className="text-brand-gold" /> Journey Progress
             </h4>

             <div className="space-y-4">
                <div className="flex items-end justify-between">
                   <div className="space-y-1">
                      <p className="text-[24px] font-black tracking-tight text-white leading-none">25<span className="text-[12px] text-white/40">%</span></p>
                      <p className="text-[8px] uppercase tracking-widest text-brand-gold font-mono">Overall Completion</p>
                   </div>
                   <div className="w-10 h-10 rounded-full border-2 border-brand-gold/30 flex items-center justify-center">
                     <Award size={16} className="text-brand-gold" />
                   </div>
                </div>

                <div className="h-1 w-full bg-white/10 overflow-hidden rounded-full">
                   <div className="h-full bg-brand-gold rounded-full" style={{ width: '25%' }} />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                   <div className="bg-black/40 p-3 rounded border border-white/5">
                      <p className="text-[10px] font-black text-white">4</p>
                      <p className="text-[7px] uppercase tracking-widest text-white/50 mt-1">Reflections</p>
                   </div>
                   <div className="bg-black/40 p-3 rounded border border-white/5">
                      <p className="text-[10px] font-black text-white">1</p>
                      <p className="text-[7px] uppercase tracking-widest text-white/50 mt-1">Program</p>
                   </div>
                </div>
             </div>
          </div>

          {/* Up Next Recommendations */}
          <div className="p-6 bg-[#111] border border-white/10 rounded-xl text-left space-y-4">
             <h4 className="text-xs font-black uppercase text-white tracking-widest flex items-center gap-2 pb-3 border-b border-white/5">
               <Star size={14} className="text-brand-gold" /> Recommended
             </h4>
             
             <div className="space-y-3">
                <div 
                  onClick={() => setActiveTab('resources')}
                  className="flex gap-3 items-center p-3 border border-white/5 hover:border-brand-gold/30 rounded bg-white/[0.01] transition-colors cursor-pointer group"
                >
                   <div className="w-8 h-8 rounded bg-brand-gold/10 flex items-center justify-center shrink-0">
                      <BookOpen size={12} className="text-brand-gold" />
                   </div>
                   <div>
                      <p className="text-[8px] text-brand-gold uppercase tracking-[0.2em] font-mono mb-0.5">Read Guide</p>
                      <p className="text-[10px] text-white uppercase font-black tracking-wider group-hover:text-brand-gold transition-colors">Cycle Syncing 101</p>
                   </div>
                </div>
                
                <div 
                  onClick={() => setActiveTab('community')}
                  className="flex gap-3 items-center p-3 border border-white/5 hover:border-brand-gold/30 rounded bg-white/[0.01] transition-colors cursor-pointer group"
                >
                   <div className="w-8 h-8 rounded bg-emerald-400/10 flex items-center justify-center shrink-0">
                      <Heart size={12} className="text-emerald-400" />
                   </div>
                   <div>
                      <p className="text-[8px] text-emerald-400 uppercase tracking-[0.2em] font-mono mb-0.5">Community Group</p>
                      <p className="text-[10px] text-white uppercase font-black tracking-wider group-hover:text-emerald-400 transition-colors">Hormone Healing Circle</p>
                   </div>
                </div>
             </div>
          </div>

        </div>
      </div>

       {/* Assessment Modal */}
       <AnimatePresence>
        {showAssessment && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-950 border border-brand-gold/20 w-full max-w-2xl rounded-2xl shadow-2xl p-8 sticky max-h-[90vh] overflow-y-auto hidden-scrollbar"
            >
              <div className="text-center space-y-4 mb-8">
                 <div className="w-16 h-16 mx-auto rounded-full bg-brand-gold/10 flex items-center justify-center border border-brand-gold/20">
                    <Compass size={24} className="text-brand-gold" />
                 </div>
                 <h2 className="text-2xl font-black uppercase text-white tracking-tight">Wellness Assessment</h2>
                 <p className="text-xs text-white/50 max-w-sm mx-auto">Select the areas you'd like to focus on for your healing journey.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {[
                   { icon: '🌸', title: 'Fertility & Conception' },
                   { icon: '🤰', title: 'Pregnancy Preparation' },
                   { icon: '👶', title: 'Postpartum Recovery' },
                   { icon: '⚖️', title: 'Hormonal Balance' },
                   { icon: '🔥', title: 'Menopause & Midlife' },
                   { icon: '💪', title: 'Metabolic Wellness' },
                   { icon: '🧠', title: 'Emotional Healing' },
                   { icon: '💕', title: 'Sexual Wellness' },
                 ].map(cat => (
                   <button key={cat.title} className="p-4 border border-white/10 hover:border-brand-gold focus:border-brand-gold focus:bg-brand-gold/5 bg-[#111] rounded text-left transition-all group">
                      <span className="text-2xl block mb-2 opacity-50 group-hover:opacity-100 group-focus:opacity-100 transition-opacity">{cat.icon}</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-white block">{cat.title}</span>
                   </button>
                 ))}
              </div>

              <div className="mt-8 flex justify-end gap-4">
                 <button onClick={() => setShowAssessment(false)} className="px-6 py-2.5 text-[10px] uppercase font-black tracking-widest text-white/50 hover:text-white transition-colors">
                    Cancel
                 </button>
                 <button onClick={() => setShowAssessment(false)} className="px-6 py-2.5 bg-brand-gold text-black text-[10px] uppercase font-black tracking-widest rounded hover:bg-white transition-colors">
                    Save Priorities
                 </button>
              </div>
            </motion.div>
          </div>
        )}
       </AnimatePresence>
    </div>
  );
}
