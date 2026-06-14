import React, { useState } from 'react';
import { 
  BarChart, 
  Activity, 
  Moon, 
  Brain, 
  Flower, 
  TrendingUp, 
  AlertCircle, 
  Lightbulb, 
  Sparkles,
  Calendar,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function PersonalInsightsEngine() {
  const [activeTab, setActiveTab] = useState<'overview' | 'cycle' | 'mood' | 'sleep' | 'stress'>('overview');

  const navItems = [
    { id: 'overview', label: 'Dashboard', icon: BarChart },
    { id: 'cycle', label: 'Cycle Patterns', icon: Flower },
    { id: 'mood', label: 'Mood Trends', icon: Brain },
    { id: 'sleep', label: 'Sleep Quality', icon: Moon },
    { id: 'stress', label: 'Stress Index', icon: Activity },
  ] as const;

  return (
    <div className="space-y-6 font-sans text-white text-left pb-10">
      
      {/* Header */}
      <div className="bg-[#110f0f] border border-white/5 p-6 sm:p-8 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/[0.02] blur-3xl rounded-full select-none pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-3">
             <span className="text-[9px] font-mono text-[#D4AF37] uppercase tracking-[0.3em] font-extrabold block">
                Data Intelligence
             </span>
             <span className="bg-white/5 text-white/70 border border-white/10 px-2 py-0.5 text-[8px] font-mono uppercase tracking-widest font-bold flex items-center gap-1">
                Last Sync: 2 hrs ago
             </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-black uppercase text-white tracking-tight flex items-center gap-3">
            Personal Insights <TrendingUp size={24} className="text-[#D4AF37]" />
          </h2>
          <p className="text-xs text-white/50 max-w-2xl font-light font-sans leading-relaxed">
            Your body and behavior patterns analyzed. Discover the connections between your cycle, mood, sleep, and overall wellness to make informed, proactive decisions.
          </p>
        </div>

        <div className="flex flex-col gap-2 relative z-10 shrink-0 w-full md:w-auto">
           <div className="bg-white/5 border border-white/10 p-4 md:text-right">
              <div className="text-[9px] font-mono uppercase tracking-widest text-[#D4AF37] mb-1">Wellness Score</div>
              <div className="text-3xl font-black font-sans text-white">
                 84<span className="text-lg text-white/30 font-medium">/100</span>
              </div>
           </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex overflow-x-auto no-scrollbar gap-2 mb-6">
        {navItems.map((tab) => {
           const Icon = tab.icon;
           return (
              <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id as any)}
                 className={`flex items-center gap-2 px-4 py-2.5 whitespace-nowrap transition-all border text-[10px] uppercase font-mono tracking-widest ${
                 activeTab === tab.id 
                    ? 'border-[#D4AF37] text-black font-bold bg-[#D4AF37]' 
                    : 'border-white/10 text-white/60 hover:text-white hover:bg-white/5'
                 }`}
              >
                 <Icon size={14} />
                 {tab.label}
              </button>
           );
        })}
      </div>

      <div className="min-h-[400px]">
         
         <AnimatePresence mode="wait">
            <motion.div
               key={activeTab}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.98 }}
               transition={{ duration: 0.3 }}
            >
               {activeTab === 'overview' && <OverviewTab />}
               {activeTab === 'cycle' && <CycleTab />}
               {activeTab === 'mood' && <MoodTab />}
               {activeTab === 'sleep' && <SleepTab />}
               {activeTab === 'stress' && <StressTab />}
            </motion.div>
         </AnimatePresence>
      </div>

    </div>
  );
}

function OverviewTab() {
   return (
      <div className="space-y-6">
         {/* Top Insights */}
         <div className="bg-[#D4AF37]/5 border border-[#D4AF37]/20 p-6 flex flex-col md:flex-row gap-6 items-start relative overflow-hidden">
            <Sparkles size={40} className="text-[#D4AF37] shrink-0 opacity-20 absolute -top-2 -left-2" />
            <div className="w-12 h-12 bg-[#D4AF37]/10 flex items-center justify-center shrink-0 border border-[#D4AF37]/30 z-10">
               <Lightbulb size={24} className="text-[#D4AF37]" />
            </div>
            <div className="z-10">
               <h3 className="text-sm font-bold text-[#D4AF37] uppercase tracking-widest mb-2 font-mono">AI Recommendation</h3>
               <p className="text-sm text-white/90 leading-relaxed font-light mb-4">
                  "Your stress levels are consistently higher during the second half of your cycle (luteal phase). Consider incorporating the Somatic Womb Breathing tool daily starting next week to support cortisol regulation ahead of your period."
               </p>
               <button className="text-[10px] font-mono text-black bg-[#D4AF37] hover:bg-white px-4 py-2 uppercase tracking-widest font-bold transition-colors">
                  Open Somatic Tool
               </button>
            </div>
         </div>

         {/* Chart Previews */}
         <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-[#110f0f] border border-white/5 p-5">
               <div className="flex items-center justify-between mb-4">
                  <div className="text-[10px] font-mono uppercase text-white/50 flex items-center gap-2"><Flower size={14} /> Cycle Health</div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5">Stable</span>
               </div>
               <div className="flex items-end gap-2 text-2xl font-black">28 <span className="text-xs text-white/40 font-normal mb-1">Days Avg</span></div>
               {/* Mock Graph */}
               <div className="mt-4 h-12 w-full flex items-end gap-1">
                  {[28,29,27,28,30,28,28].map((h,i) => (
                     <div key={i} className="flex-1 bg-white/10 hover:bg-[#D4AF37] transition-colors" style={{ height: `${(h/35)*100}%` }} />
                  ))}
               </div>
            </div>

            <div className="bg-[#110f0f] border border-white/5 p-5">
               <div className="flex items-center justify-between mb-4">
                  <div className="text-[10px] font-mono uppercase text-white/50 flex items-center gap-2"><Brain size={14} /> Mood Stability</div>
                  <span className="text-[10px] font-mono text-[#D4AF37] bg-[#D4AF37]/10 px-1.5 py-0.5">Improving</span>
               </div>
               <div className="flex items-end gap-2 text-2xl font-black">7.2 <span className="text-xs text-white/40 font-normal mb-1">/ 10</span></div>
               {/* Mock Graph */}
               <div className="mt-4 h-12 w-full flex items-end gap-1">
                  {[5,6,6,8,7,8,7].map((h,i) => (
                     <div key={i} className="flex-1 bg-white/10 hover:bg-[#D4AF37] transition-colors" style={{ height: `${(h/10)*100}%` }} />
                  ))}
               </div>
            </div>

            <div className="bg-[#110f0f] border border-white/5 p-5">
               <div className="flex items-center justify-between mb-4">
                  <div className="text-[10px] font-mono uppercase text-white/50 flex items-center gap-2"><Moon size={14} /> Sleep Quality</div>
                  <span className="text-[10px] font-mono text-red-400 bg-red-400/10 px-1.5 py-0.5">Low</span>
               </div>
               <div className="flex items-end gap-2 text-2xl font-black">6.5 <span className="text-xs text-white/40 font-normal mb-1">Hrs Avg</span></div>
               {/* Mock Graph */}
               <div className="mt-4 h-12 w-full flex items-end gap-1">
                  {[7,8,6,5,6,7,5].map((h,i) => (
                     <div key={i} className="flex-1 bg-white/10 hover:bg-[#D4AF37] transition-colors" style={{ height: `${(h/10)*100}%` }} />
                  ))}
               </div>
            </div>

            <div className="bg-[#110f0f] border border-white/5 p-5">
               <div className="flex items-center justify-between mb-4">
                  <div className="text-[10px] font-mono uppercase text-white/50 flex items-center gap-2"><Activity size={14} /> Stress Index</div>
                   <span className="text-[10px] font-mono text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5">Stable</span>
               </div>
               <div className="flex items-end gap-2 text-2xl font-black">Medium</div>
               {/* Mock Graph */}
               <div className="mt-4 h-12 w-full flex items-end gap-1">
                  {[8,7,5,4,4,5,3].map((h,i) => (
                     <div key={i} className="flex-1 bg-white/10 hover:bg-[#D4AF37] transition-colors" style={{ height: `${(h/10)*100}%` }} />
                  ))}
               </div>
            </div>

         </div>
         
         <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-[#110f0f] border border-white/5 p-6">
               <h4 className="text-[10px] font-mono text-white/50 uppercase tracking-widest mb-4 flex items-center gap-2"><AlertCircle size={14}/> Pattern Highlights</h4>
               <ul className="space-y-4">
                  <li className="flex items-start gap-4">
                     <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10 text-emerald-400"><TrendingUp size={14} /></div>
                     <div>
                        <p className="text-sm font-bold text-white mb-1">Sleep improves when journaling</p>
                        <p className="text-[10px] text-white/50 font-mono">You get 1.5 hr more sleep on days you log reflections.</p>
                     </div>
                  </li>
                  <li className="flex items-start gap-4">
                     <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10 text-red-400"><TrendingUp size={14} className="rotate-180" /></div>
                     <div>
                        <p className="text-sm font-bold text-white mb-1">Energy dips around day 24</p>
                        <p className="text-[10px] text-white/50 font-mono">A recurring drop in physical energy before menses.</p>
                     </div>
                  </li>
               </ul>
            </div>

            <div className="bg-[#110f0f] border border-white/5 p-6 flex flex-col justify-between">
               <div>
                  <h4 className="text-[10px] font-mono text-[#D4AF37] uppercase tracking-widest mb-2 flex items-center gap-2">Learning Progress</h4>
                  <div className="text-3xl font-black mb-1">68%</div>
                  <p className="text-[10px] text-white/50 font-mono mb-4">Fertility Awareness Mastery</p>
                  
                  <div className="w-full bg-black h-2 rounded-full overflow-hidden border border-white/10">
                     <div className="h-full bg-[#D4AF37]" style={{ width: '68%' }} />
                  </div>
               </div>
               
               <button className="mt-6 flex items-center justify-between text-[10px] font-mono text-white hover:text-[#D4AF37] uppercase tracking-widest border border-white/10 p-3 hover:bg-white/5 transition-colors">
                  Continue Course <ChevronRight size={14} />
               </button>
            </div>
         </div>
      </div>
   );
}


function CycleTab() {
   return (
      <div className="space-y-6">
         <div className="bg-[#110f0f] border border-[#D4AF37]/30 p-8 text-center max-w-2xl mx-auto">
            <Flower size={40} className="text-[#D4AF37] mx-auto mb-4" />
            <h3 className="text-xl font-serif font-black uppercase text-white mb-2">Cycle Analytics</h3>
            <p className="text-sm text-white/50 font-light mb-6">Your recorded cycle history indicates high predictability but highlights opportunities for preconception planning insights.</p>
            
            <div className="grid grid-cols-2 gap-4 text-left">
               <div className="bg-black/50 p-4 border border-white/5">
                  <div className="text-[10px] font-mono text-white/40 uppercase mb-1">Avg Length</div>
                  <div className="text-2xl font-black text-[#D4AF37]">28.3 <span className="text-sm font-normal text-white/30">days</span></div>
               </div>
               <div className="bg-black/50 p-4 border border-white/5">
                  <div className="text-[10px] font-mono text-white/40 uppercase mb-1">Ovulation Predictability</div>
                  <div className="text-2xl font-black text-emerald-400">High</div>
               </div>
               <div className="bg-black/50 p-4 border border-white/5">
                  <div className="text-[10px] font-mono text-white/40 uppercase mb-1">Follicular Phase</div>
                  <div className="text-lg font-black text-white">13 - 15 <span className="text-xs font-normal text-white/30">days</span></div>
               </div>
               <div className="bg-black/50 p-4 border border-white/5">
                  <div className="text-[10px] font-mono text-white/40 uppercase mb-1">Luteal Phase</div>
                  <div className="text-lg font-black text-white">13 - 14 <span className="text-xs font-normal text-white/30">days</span></div>
               </div>
            </div>
         </div>

         {/* Visual Map */}
         <div className="bg-[#110f0f] border border-white/5 p-6 overflow-hidden relative">
            <h4 className="text-[10px] font-mono text-white/50 uppercase tracking-widest mb-6">6-Month Blueprint</h4>
            
            <div className="space-y-4">
               {['June', 'May', 'April', 'March', 'Feb', 'Jan'].map((m) => (
                  <div key={m} className="flex relative items-center gap-4 group">
                     <span className="w-12 text-[10px] font-mono text-white/40 text-right group-hover:text-[#D4AF37] transition-colors">{m}</span>
                     <div className="flex-1 bg-white/5 h-8 relative">
                        {/* Period Phase */}
                        <div className="absolute top-0 bottom-0 left-0 bg-red-900/40 border-r border-red-500/50" style={{ width: '15%' }}></div>
                        {/* Follicular */}
                        <div className="absolute top-0 bottom-0 bg-transparent" style={{ left: '15%', width: '35%' }}></div>
                        {/* Ovulation Window */}
                        <div className="absolute top-0 bottom-0 bg-[#D4AF37]/30 border-x border-[#D4AF37] z-10" style={{ left: '44%', width: '15%' }}></div>
                        {/* Luteal */}
                        <div className="absolute top-0 bottom-0 bg-transparent" style={{ left: '59%', width: '41%' }}></div>
                     </div>
                  </div>
               ))}
            </div>
            
            <div className="flex gap-4 mt-6 text-[9px] font-mono text-white/40 uppercase tracking-widest">
               <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-900/40 border border-red-500/50"></div> Menstruation</div>
               <div className="flex items-center gap-1"><div className="w-3 h-3 bg-[#D4AF37]/30 border border-[#D4AF37]"></div> Fertile Window</div>
            </div>
         </div>
      </div>
   );
}


function MoodTab() {
   const [logs, setLogs] = useState<{date: string, mood: number, note: string}[]>([]);
   const [moodScore, setMoodScore] = useState(5);
   const [note, setNote] = useState('');

   React.useEffect(() => {
      const saved = localStorage.getItem('tvr_mood_logs');
      if (saved) setLogs(JSON.parse(saved));
   }, []);

   const handleSave = () => {
      const newLogs = [{date: new Date().toLocaleDateString(), mood: moodScore, note}, ...logs];
      setLogs(newLogs);
      localStorage.setItem('tvr_mood_logs', JSON.stringify(newLogs));
      setNote('');
   };

   return (
      <div className="bg-[#110f0f] border border-white/5 p-6 lg:p-8 min-h-[400px]">
         <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 space-y-6">
               <div className="flex items-center gap-3">
                 <Brain size={24} className="text-[#D4AF37]" />
                 <h3 className="text-xl font-serif font-black uppercase text-white">Mood & Emotional Trends</h3>
               </div>
               <p className="text-sm text-white/50 mb-6 font-light">Log daily emotional states and entries to unlock pattern recognition.</p>
               
               <div className="space-y-4 bg-black/40 p-5 border border-white/5">
                 <div className="space-y-2">
                    <label className="text-[10px] uppercase font-mono tracking-widest text-[#D4AF37]">Mood Score (1-10): <span className="text-white text-lg ml-2">{moodScore}</span></label>
                    <input type="range" min="1" max="10" value={moodScore} onChange={e => setMoodScore(Number(e.target.value))} className="w-full accent-[#D4AF37]" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] uppercase font-mono tracking-widest text-white/50">Journal Entry</label>
                    <textarea value={note} onChange={e => setNote(e.target.value)} rows={3} placeholder="How are you feeling today?" className="w-full bg-black border border-white/10 p-3 text-white focus:border-[#D4AF37] outline-none text-sm font-sans" />
                 </div>
                 <button onClick={handleSave} className="w-full py-3 bg-[#D4AF37] text-black text-[10px] font-mono font-bold uppercase tracking-widest hover:bg-white transition-colors">
                    Save Daily Log
                 </button>
               </div>
            </div>

            <div className="flex-1 space-y-4">
               <h4 className="text-[10px] uppercase font-mono tracking-widest text-[#D4AF37] border-b border-white/10 pb-2">Recent Logs</h4>
               <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                  {logs.length === 0 ? (
                     <div className="text-center p-8 border border-dashed border-white/10 text-white/40 text-xs font-mono uppercase">No logs yet.</div>
                  ) : logs.map((log, i) => (
                     <div key={i} className="p-4 bg-white/[0.02] border border-white/5">
                        <div className="flex justify-between items-center mb-2">
                           <span className="text-[10px] font-mono text-white/40">{log.date}</span>
                           <span className="text-[10px] font-mono bg-[#D4AF37]/10 text-[#D4AF37] px-2 py-0.5">Score: {log.mood}/10</span>
                        </div>
                        {log.note && <p className="text-sm text-white/70 italic leading-relaxed">{log.note}</p>}
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </div>
   );
}

function SleepTab() {
   const [logs, setLogs] = useState<{date: string, hours: number, quality: string}[]>([]);
   const [hours, setHours] = useState(7);
   const [quality, setQuality] = useState('Good');

   React.useEffect(() => {
      const saved = localStorage.getItem('tvr_sleep_logs');
      if (saved) setLogs(JSON.parse(saved));
   }, []);

   const handleSave = () => {
      const newLogs = [{date: new Date().toLocaleDateString(), hours, quality}, ...logs];
      setLogs(newLogs);
      localStorage.setItem('tvr_sleep_logs', JSON.stringify(newLogs));
   };

   return (
      <div className="bg-[#110f0f] border border-white/5 p-6 lg:p-8 min-h-[400px]">
         <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 space-y-6">
               <div className="flex items-center gap-3">
                 <Moon size={24} className="text-[#D4AF37]" />
                 <h3 className="text-xl font-serif font-black uppercase text-white">Sleep Architecture</h3>
               </div>
               <p className="text-sm text-white/50 mb-6 font-light">Input sleep data to visualize recovery patterns and hormonal impact on rest.</p>
               
               <div className="space-y-4 bg-black/40 p-5 border border-white/5">
                 <div className="space-y-2">
                    <label className="text-[10px] uppercase font-mono tracking-widest text-[#D4AF37]">Hours Slept: <span className="text-white text-lg ml-2">{hours} hr</span></label>
                    <input type="range" min="1" max="14" step="0.5" value={hours} onChange={e => setHours(Number(e.target.value))} className="w-full accent-[#D4AF37]" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] uppercase font-mono tracking-widest text-white/50">Rest Quality</label>
                    <select value={quality} onChange={e => setQuality(e.target.value)} className="w-full bg-black border border-white/10 p-3 text-white focus:border-[#D4AF37] outline-none text-sm font-sans">
                       <option>Excellent</option>
                       <option>Good</option>
                       <option>Fair</option>
                       <option>Poor</option>
                    </select>
                 </div>
                 <button onClick={handleSave} className="w-full py-3 bg-[#D4AF37] text-black text-[10px] font-mono font-bold uppercase tracking-widest hover:bg-white transition-colors">
                    Log Sleep Session
                 </button>
               </div>
            </div>

            <div className="flex-1 space-y-4">
               <h4 className="text-[10px] uppercase font-mono tracking-widest text-[#D4AF37] border-b border-white/10 pb-2">Recent Sleep Logs</h4>
               <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                  {logs.length === 0 ? (
                     <div className="text-center p-8 border border-dashed border-white/10 text-white/40 text-xs font-mono uppercase">No data yet.</div>
                  ) : logs.map((log, i) => (
                     <div key={i} className="p-4 bg-white/[0.02] border border-white/5 flex justify-between items-center">
                        <span className="text-[10px] font-mono text-white/40">{log.date}</span>
                        <div className="text-right">
                           <div className="text-lg font-bold text-white">{log.hours} <span className="text-xs font-normal text-white/50">hrs</span></div>
                           <div className={`text-[9px] font-mono uppercase px-1.5 py-0.5 inline-block ${
                              log.quality === 'Excellent' ? 'bg-emerald-500/10 text-emerald-400' :
                              log.quality === 'Poor' ? 'bg-red-500/10 text-red-400' : 'bg-[#D4AF37]/10 text-[#D4AF37]'
                           }`}>{log.quality}</div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </div>
   );
}

function StressTab() {
   const [logs, setLogs] = useState<{date: string, level: string, triggers: string}[]>([]);
   const [level, setLevel] = useState('Medium');
   const [triggers, setTriggers] = useState('');

   React.useEffect(() => {
      const saved = localStorage.getItem('tvr_stress_logs');
      if (saved) setLogs(JSON.parse(saved));
   }, []);

   const handleSave = () => {
      const newLogs = [{date: new Date().toLocaleDateString(), level, triggers}, ...logs];
      setLogs(newLogs);
      localStorage.setItem('tvr_stress_logs', JSON.stringify(newLogs));
      setTriggers('');
   };

   return (
      <div className="bg-[#110f0f] border border-white/5 p-6 lg:p-8 min-h-[400px]">
         <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 space-y-6">
               <div className="flex items-center gap-3">
                 <Activity size={24} className="text-[#D4AF37]" />
                 <h3 className="text-xl font-serif font-black uppercase text-white">Stress Correlation Index</h3>
               </div>
               <p className="text-sm text-white/50 mb-6 font-light">Document your stress loads and triggers to discover interactions with your cycle boundaries.</p>
               
               <div className="space-y-4 bg-black/40 p-5 border border-white/5">
                 <div className="space-y-2">
                    <label className="text-[10px] uppercase font-mono tracking-widest text-white/50">Current Stress Level</label>
                    <select value={level} onChange={e => setLevel(e.target.value)} className="w-full bg-black border border-white/10 p-3 text-white focus:border-[#D4AF37] outline-none text-sm font-sans">
                       <option>Low (Restful)</option>
                       <option>Medium (Active)</option>
                       <option>High (Overwhelmed)</option>
                       <option>Severe (Burnout)</option>
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] uppercase font-mono tracking-widest text-[#D4AF37]">Noted Triggers (Optional)</label>
                    <input type="text" value={triggers} onChange={e => setTriggers(e.target.value)} placeholder="e.g., Work deadline, family..." className="w-full bg-black border border-white/10 p-3 text-white focus:border-[#D4AF37] outline-none text-sm font-sans" />
                 </div>
                 <button onClick={handleSave} className="w-full py-3 bg-[#D4AF37] text-black text-[10px] font-mono font-bold uppercase tracking-widest hover:bg-white transition-colors">
                    Log Stress Assessment
                 </button>
               </div>
            </div>

            <div className="flex-1 space-y-4">
               <h4 className="text-[10px] uppercase font-mono tracking-widest text-[#D4AF37] border-b border-white/10 pb-2">Recent Assessments</h4>
               <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                  {logs.length === 0 ? (
                     <div className="text-center p-8 border border-dashed border-white/10 text-white/40 text-xs font-mono uppercase">No records found.</div>
                  ) : logs.map((log, i) => (
                     <div key={i} className="p-4 bg-white/[0.02] border border-white/5">
                        <div className="flex justify-between items-center mb-2">
                           <span className="text-[10px] font-mono text-white/40">{log.date}</span>
                           <span className={`text-[9px] font-mono uppercase px-2 py-0.5 border ${
                              log.level.includes('Low') ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                              log.level.includes('Severe') ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                              log.level.includes('High') ? 'bg-orange-500/10 border-orange-500/30 text-orange-400' :
                              'bg-[#D4AF37]/10 border-[#D4AF37]/30 text-[#D4AF37]'
                           }`}>{log.level}</span>
                        </div>
                        {log.triggers && <p className="text-sm text-white/70">Triggers: <span className="italic text-white/50">{log.triggers}</span></p>}
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </div>
   );
}
