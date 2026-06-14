import React, { useState } from 'react';
import { 
  Trophy, 
  Award, 
  Star, 
  Target, 
  CheckCircle2, 
  Calendar, 
  Gift,
  Lock,
  Zap,
  Flame,
  ArrowRight,
  TrendingUp,
  Activity,
  Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function MemberRewards() {
  const [activeTab, setActiveTab] = useState<'overview' | 'badges' | 'streaks' | 'redeem' | 'leaderboard'>('overview');
  const [toastMessage, setToastMessage] = useState('');
  
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const badges = [
    { id: 'b1', name: 'Fertility Champion', icon: Activity, desc: 'Logged 30 cycle days', earned: true, date: 'June 01, 2026' },
    { id: 'b2', name: 'Emotional Pillar', icon: Heart, desc: 'Used mood tracker for 14 days', earned: true, date: 'May 15, 2026' },
    { id: 'b3', name: 'Learning Master', icon: Star, desc: 'Completed 3 courses', earned: false, progress: 66 },
    { id: 'b4', name: 'Community Spark', icon: Zap, desc: 'Received 50 likes on a post', earned: true, date: 'April 20, 2026' },
    { id: 'b5', name: 'Healing Consistency', icon: Calendar, desc: 'Attended 5 live masterclasses', earned: false, progress: 40 },
    { id: 'b6', name: 'VIP Status', icon: Trophy, desc: 'Accumulated 5,000 points', earned: false, progress: 24 }
  ];

  const rewards = [
    { title: '10% Shop Discount', cost: 500, type: 'Discount' },
    { title: 'Free Expert Priority Q&A', cost: 1200, type: 'Consultation' },
    { title: 'VIP Community Access', cost: 2500, type: 'Access' },
    { title: 'Divine Seed Supplement Kit', cost: 4000, type: 'Product' }
  ];

  return (
    <div className="space-y-8 font-sans text-white text-left relative pb-20">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-6 right-6 bg-[#D4AF37] text-black px-6 py-4 rounded-none shadow-2xl z-[9999] border border-white/20 flex gap-3 items-center"
          >
            <Trophy size={18} />
            <div>
              <h4 className="font-bold text-[11px] uppercase tracking-widest font-mono">Achievement Unlocked</h4>
              <p className="text-sm font-medium">{toastMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Header */}
      <div className="bg-[#110f0f] border border-white/5 p-6 sm:p-8 relative overflow-hidden flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#D4AF37]/[0.02] blur-3xl rounded-full select-none pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <span className="text-[9px] font-mono text-[#D4AF37] uppercase tracking-[0.3em] font-extrabold block">
            Your Wellness Progress Recognized
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-black uppercase text-white tracking-tight">
            🏆 Rewards & Milestones
          </h2>
          <p className="text-xs text-white/50 max-w-2xl font-light font-sans leading-relaxed">
            Everyday wellness actions transformed into meaningful achievements. See your progress, redeem points, and celebrate your healing journey.
          </p>
        </div>
        
        <div className="flex gap-4 shrink-0 w-full lg:w-auto">
           <div className="bg-white/5 border border-white/10 p-5 flex-1 lg:flex-none flex items-center justify-between lg:justify-center gap-4 min-w-[150px]">
              <div>
                 <div className="text-[9px] font-mono uppercase tracking-widest text-[#D4AF37] mb-1">Total Points</div>
                 <div className="text-2xl font-bold font-serif text-white">1,240</div>
              </div>
              <Star size={24} className="text-[#D4AF37] opacity-20" />
           </div>
           <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 p-5 flex-1 lg:flex-none flex items-center justify-between lg:justify-center gap-4 min-w-[150px]">
              <div>
                 <div className="text-[9px] font-mono uppercase tracking-widest text-[#D4AF37] mb-1">Active Streak</div>
                 <div className="text-2xl font-bold font-serif text-[#D4AF37]">7 <span className="text-sm">Days</span></div>
              </div>
              <Flame size={24} className="text-[#D4AF37] opacity-80" />
           </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex border-b border-white/10 overflow-x-auto no-scrollbar font-mono text-[10px] uppercase tracking-widest bg-white/[0.02] p-1">
        {[
          { id: 'overview', label: 'Progress Overview' },
          { id: 'badges', label: 'Achieved Badges' },
          { id: 'streaks', label: 'Streaks & Consistency' },
          { id: 'redeem', label: 'Redeem Rewards' }
        ].map(tab => (
          <button
             key={tab.id}
             onClick={() => setActiveTab(tab.id as any)}
             className={`px-4 py-2.5 whitespace-nowrap transition-all border-b-2 ${
               activeTab === tab.id 
                 ? 'border-[#D4AF37] text-[#D4AF37] font-bold bg-[#D4AF37]/5' 
                 : 'border-transparent text-white/40 hover:text-white hover:bg-white/5'
             }`}
          >
             {tab.label}
          </button>
        ))}
      </div>

      <div className="min-h-[400px]">
         
         {/* OVERVIEW */}
         {activeTab === 'overview' && (
            <div className="space-y-6">
               <div className="grid md:grid-cols-3 gap-6">
                 
                 {/* Next Goal */}
                 <div className="md:col-span-2 bg-[#110f0f] border border-white/5 p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 blur-2xl group-hover:bg-[#D4AF37]/10 transition-colors" />
                    <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2 mb-4"><Target size={16} className="text-[#D4AF37]" /> Current Focus</h3>
                    <h4 className="text-xl font-serif font-black text-white mt-1">Consistency Champion Level 1</h4>
                    <p className="text-sm text-white/60 mb-5 max-w-sm">Use the Breathing Space daily to manage your nervous system for 10 straight days.</p>
                    
                    <div className="space-y-2">
                       <div className="flex justify-between text-[10px] font-mono text-white/50">
                          <span>7/10 Days Completed</span>
                          <span>70%</span>
                       </div>
                       <div className="w-full bg-black border border-white/10 h-2">
                          <div className="bg-[#D4AF37] h-full" style={{ width: '70%' }} />
                       </div>
                    </div>
                    
                    <button onClick={() => triggerToast("Navigating to Breathing Space...")} className="mt-6 px-4 py-2 bg-white/5 hover:bg-[#D4AF37] border border-white/10 hover:border-[#D4AF37] text-white hover:text-black font-mono text-[9px] uppercase tracking-widest transition-colors font-bold flex items-center gap-2">
                       Complete Today's Task <ArrowRight size={12} />
                    </button>
                 </div>
                 
                 {/* Activity Breakdown */}
                 <div className="bg-[#110f0f] border border-white/5 p-6">
                   <h3 className="text-sm font-bold text-white uppercase mb-5">Point Sources</h3>
                   <div className="space-y-4">
                      <div className="flex justify-between items-center text-sm">
                         <span className="text-white/60">Program Completion</span>
                         <span className="font-mono text-[#D4AF37]">45%</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                         <span className="text-white/60">Community Engagement</span>
                         <span className="font-mono text-[#D4AF37]">30%</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                         <span className="text-white/60">Daily Check-ins</span>
                         <span className="font-mono text-[#D4AF37]">15%</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                         <span className="text-white/60">Events Attended</span>
                         <span className="font-mono text-[#D4AF37]">10%</span>
                      </div>
                   </div>
                 </div>

               </div>
               
               {/* Recent Unlocks Preview */}
               <h3 className="text-xl font-serif font-black tracking-tight text-white uppercase mt-8 mb-4">Recent Milestones</h3>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 {badges.filter(b => b.earned).slice(0, 4).map(badge => {
                   const Icon = badge.icon;
                   return (
                     <div key={badge.id} className="bg-zinc-950 border border-[#D4AF37]/30 p-5 flex flex-col items-center text-center group">
                        <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mb-3">
                           <Icon size={20} className="text-[#D4AF37]" />
                        </div>
                        <h4 className="text-[11px] font-bold text-white uppercase">{badge.name}</h4>
                        <span className="text-[9px] font-mono text-white/40 mt-1">{badge.date}</span>
                     </div>
                   );
                 })}
               </div>
            </div>
         )}

         {/* BADGES */}
         {activeTab === 'badges' && (
            <div className="space-y-6">
               <h3 className="text-xl font-serif font-black tracking-tight text-white uppercase">Identity & Achievements</h3>
               <p className="text-xs text-white/50 mb-6">Visual identity markers that reflect your dedication to transformation.</p>
               
               <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                  {badges.map(badge => {
                     const Icon = badge.icon;
                     return (
                        <div key={badge.id} className={`p-6 border border-white/5 flex flex-col items-center text-center transition-all ${badge.earned ? 'bg-[#110f0f] border-[#D4AF37]/20 hover:border-[#D4AF37]/50' : 'bg-black/50 opacity-60 grayscale'}`}>
                           <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${badge.earned ? 'bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 shadow-[0_0_15px_rgba(212,175,55,0.15)]' : 'bg-white/5 border border-white/10'}`}>
                              <Icon size={24} className={badge.earned ? 'text-[#D4AF37]' : 'text-white/30'} />
                           </div>
                           <h4 className={`text-sm font-bold uppercase ${badge.earned ? 'text-white' : 'text-white/70'}`}>{badge.name}</h4>
                           <p className="text-[10px] font-mono text-white/40 mt-2 min-h-[30px] leading-relaxed">{badge.desc}</p>
                           
                           {!badge.earned && badge.progress && (
                              <div className="w-full mt-4 space-y-1">
                                 <div className="flex justify-between text-[8px] font-mono text-white/40 uppercase">
                                    <span>Progress</span>
                                    <span>{badge.progress}%</span>
                                 </div>
                                 <div className="w-full bg-white/5 h-1">
                                    <div className="bg-[#D4AF37]/50 h-full" style={{ width: `${badge.progress}%` }} />
                                 </div>
                              </div>
                           )}
                           
                           {badge.earned && (
                              <div className="mt-4 text-[9px] font-mono text-[#D4AF37] uppercase tracking-widest bg-[#D4AF37]/5 px-3 py-1 flex items-center gap-1 border border-[#D4AF37]/20">
                                 <CheckCircle2 size={10} /> Earned {badge.date}
                              </div>
                           )}
                        </div>
                     );
                  })}
               </div>
            </div>
         )}
         
         {/* STREAKS */}
         {activeTab === 'streaks' && (
            <div className="space-y-6">
               <h3 className="text-xl font-serif font-black tracking-tight text-white uppercase text-center">🔥 Consistency Engine</h3>
               <p className="text-xs text-white/50 mb-8 max-w-xl mx-auto text-center">Streak systems reward taking consecutive daily actions, building powerful habits over time.</p>
               
               <div className="max-w-3xl mx-auto grid gap-6">
                  {/* Active Streak */}
                  <div className="bg-[#110f0f] border border-[#D4AF37]/30 p-8 flex flex-col items-center justify-center relative overflow-hidden">
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#D4AF37]/10 blur-3xl" />
                     <Flame size={48} className="text-[#D4AF37] mb-4" />
                     <h4 className="text-5xl font-black text-white font-serif tracking-tighter">7 <span className="text-2xl text-white/50 font-sans tracking-normal">Days</span></h4>
                     <p className="text-[10px] font-mono uppercase tracking-widest text-[#D4AF37] font-bold mt-2">Active Learning & Check-in Streak</p>
                     
                     <div className="flex gap-2 justify-center w-full mt-8">
                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                           <div key={i} className="flex flex-col items-center gap-2">
                              <span className="text-[8px] font-mono text-white/40">{day}</span>
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${i < 5 ? 'bg-[#D4AF37] border-[#D4AF37] text-black' : 'bg-transparent border-white/10 text-white/20'}`}>
                                 {i < 5 ? <CheckCircle2 size={14} /> : ''}
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
                  
                  {/* Streak Milestones */}
                  <div className="bg-zinc-950 border border-white/5 p-6">
                     <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4">Upcoming Streak Milestones</h4>
                     <div className="space-y-4">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 bg-white/5 flex items-center justify-center text-white/40 font-serif font-black text-lg opacity-50">14</div>
                           <div>
                              <p className="text-sm font-bold text-white/80">14-Day Consistency Glow</p>
                              <p className="text-[10px] font-mono text-white/40 mt-1">+500 Points & Profile Badge</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 bg-white/5 flex items-center justify-center text-white/40 font-serif font-black text-lg opacity-50">30</div>
                           <div>
                              <p className="text-sm font-bold text-white/80">30-Day Master Habit</p>
                              <p className="text-[10px] font-mono text-white/40 mt-1">+1,500 Points & Silver Frame</p>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         )}

         {/* REDEEM */}
         {activeTab === 'redeem' && (
            <div className="space-y-6">
               <div className="flex justify-between items-end border-b border-white/10 pb-4">
                 <div>
                    <h3 className="text-xl font-serif font-black tracking-tight text-white uppercase">🎁 Reward Redemption</h3>
                    <p className="text-xs text-white/50">Convert points into meaningful benefits across the platform.</p>
                 </div>
                 <div className="text-right">
                    <span className="text-[9px] font-mono uppercase text-white/40 block">Available Points</span>
                    <span className="text-xl font-serif font-bold text-[#D4AF37]">1,240</span>
                 </div>
               </div>

               <div className="grid md:grid-cols-2 gap-6">
                  {rewards.map((reward, i) => (
                     <div key={i} className="bg-[#110f0f] border border-white/5 p-6 flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-4">
                           <div>
                              <span className="text-[9px] font-mono bg-white/5 text-white/60 px-2 py-0.5 tracking-widest uppercase border border-white/10">{reward.type}</span>
                              <h4 className="text-sm font-bold text-white uppercase mt-3 pr-4 leading-relaxed">{reward.title}</h4>
                           </div>
                           <Gift size={20} className="text-[#D4AF37]/50" />
                        </div>
                        
                        <div className="flex justify-between items-center mt-6 pt-4 border-t border-white/5">
                           <div className="flex items-center gap-1.5 font-serif font-bold text-lg text-white">
                              <Star size={16} className="text-[#D4AF37]" /> {reward.cost}
                           </div>
                           {1240 >= reward.cost ? (
                              <button onClick={() => triggerToast(`Successfully redeemed: ${reward.title}`)} className="px-4 py-2 bg-[#D4AF37] text-black font-mono text-[9px] font-black uppercase tracking-widest hover:bg-white transition-colors">
                                 Redeem
                              </button>
                           ) : (
                              <div className="flex items-center gap-2 text-[9px] font-mono uppercase text-white/30 border border-white/10 px-4 py-2 bg-black/50">
                                 <Lock size={10} /> Locked
                              </div>
                           )}
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         )}
      </div>
    </div>
  );
}
