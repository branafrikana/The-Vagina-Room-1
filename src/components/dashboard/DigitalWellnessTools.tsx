import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Wind, 
  Headphones, 
  Music, 
  Smile, 
  FileText, 
  PenTool, 
  BrainCircuit, 
  BarChart,
  Activity,
  Play,
  Pause,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import WellnessAssessment from './WellnessAssessment';

export default function DigitalWellnessTools() {
  const [activeTab, setActiveTab] = useState<'home' | 'breathing' | 'audio' | 'mood' | 'journal' | 'tests' | 'insights'>('home');
  const [toastMessage, setToastMessage] = useState('');
  const [isAssessing, setIsAssessing] = useState(false);
  const [recommendedTags, setRecommendedTags] = useState<string[] | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const toolsList = [
    { id: 'breathing', title: 'Guided Breathing', desc: 'Regulate stress & anxiety', icon: Wind },
    { id: 'audio', title: 'Meditation & Audio', desc: 'Audio healing experiences', icon: Headphones },
    { id: 'mood', title: 'Mood Tracker', desc: 'Daily emotional awareness', icon: Smile },
    { id: 'journal', title: 'Journals', desc: 'Gratitude & Reflection', icon: PenTool },
    { id: 'tests', title: 'Assessments', desc: 'Self-awareness evaluations', icon: BrainCircuit },
    { id: 'insights', title: 'Wellness Insights', desc: 'Personalized data', icon: BarChart }
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
            className="fixed bottom-6 right-6 bg-brand-gold text-black px-6 py-4 rounded-none shadow-2xl z-[9999] border border-white/20 flex gap-3 items-center"
          >
            <Sparkles size={18} />
            <div>
              <h4 className="font-bold text-[11px] uppercase tracking-widest font-mono">Wellness Engine</h4>
              <p className="text-sm font-medium">{toastMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Header */}
      <div className="bg-[#110f0f] border border-white/5 p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-brand-gold/[0.02] blur-3xl rounded-full select-none pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-[9px] font-mono text-brand-gold uppercase tracking-[0.3em] font-extrabold block">
              Everyday Healing & Mind-Body Reset
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-black uppercase text-white mt-1 tracking-tight">
              🧘 Digital Wellness Tools
            </h2>
            <p className="text-xs text-white/50 max-w-2xl font-light font-sans mt-3 leading-relaxed">
              Your practical, always-accessible wellness companion to regulate emotions, reduce stress, and maintain mental and physical balance through simple, guided routines.
            </p>
          </div>
          <button 
            onClick={() => setActiveTab('mood')}
            className="shrink-0 px-4 py-2 bg-white/5 hover:bg-brand-gold border border-white/10 hover:border-brand-gold text-white hover:text-black font-mono text-[9px] uppercase tracking-widest font-black transition-colors flex items-center gap-2"
          >
            Log Daily Mood <ArrowRight size={12} />
          </button>
        </div>
      </div>

      {/* Tools Navigation */}
      <div className="flex border-b border-white/10 overflow-x-auto no-scrollbar font-mono text-[10px] uppercase tracking-widest bg-white/[0.02] p-1">
        <button
          onClick={() => setActiveTab('home')}
          className={`px-4 py-2.5 whitespace-nowrap transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'home'
              ? 'border-brand-gold text-brand-gold font-bold bg-brand-gold/5' 
              : 'border-transparent text-white/40 hover:text-white hover:bg-white/5'
          }`}
        >
          Overview
        </button>
        {toolsList.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 whitespace-nowrap transition-all border-b-2 flex items-center gap-2 ${
              activeTab === tab.id 
                ? 'border-brand-gold text-brand-gold font-bold bg-brand-gold/5' 
                : 'border-transparent text-white/40 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab.title}
          </button>
        ))}
      </div>

      <div className="min-h-[500px]">
        {/* HOMEPAGE / TOOLKIT OVERVIEW */}
        {activeTab === 'home' && !isAssessing && !recommendedTags && (
          <div className="space-y-6">
            
            {/* Daily Prompt */}
            <div className="bg-brand-gold/10 border border-brand-gold/30 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-brand-gold border border-brand-gold text-black mt-1">
                  <Wind size={20} />
                </div>
                <div>
                  <h4 className="text-[12px] font-mono text-brand-gold font-black tracking-widest uppercase">Daily Wellness Prompt</h4>
                  <p className="text-sm font-sans font-medium text-white/90 mt-1">"Take 3 minutes to breathe deeply and center your energy today."</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveTab('breathing')}
                className="px-4 py-2 bg-brand-gold text-black font-mono text-[10px] uppercase tracking-widest font-black whitespace-nowrap hover:bg-white transition-colors"
              >
                Start Breathing
              </button>
            </div>

            {/* Grid of Tools */}
            <h3 className="text-xl font-serif font-black tracking-tight text-white uppercase mt-8 mb-4">Explore Your Toolkit</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {toolsList.map(tool => {
                const Icon = tool.icon;
                return (
                  <button
                    key={tool.id}
                    onClick={() => setActiveTab(tool.id as any)}
                    className="p-6 bg-[#110f0f] border border-white/5 hover:border-brand-gold/50 flex flex-col items-start gap-4 transition-all group hover:bg-white/[0.02]"
                  >
                    <div className="p-3 bg-white/5 border border-white/10 group-hover:bg-brand-gold group-hover:text-black transition-colors text-brand-gold">
                      <Icon size={24} strokeWidth={1.5} />
                    </div>
                    <div className="text-left">
                      <h4 className="text-md font-bold text-white tracking-wide">{tool.title}</h4>
                      <p className="text-[11px] text-white/50 mt-1 font-mono tracking-wide">{tool.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
            
            {/* Recent Reflections & Activity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="bg-[#110f0f] border border-white/5 p-6 space-y-4">
                <h4 className="text-[10px] font-mono uppercase tracking-widest text-brand-gold font-bold">Recent Mood Overview</h4>
                <div className="space-y-3">
                   <div className="flex justify-between border-b border-white/5 pb-2 text-sm text-white/80"><span className="flex gap-2"><Smile size={16} className="text-emerald-400" /> Calm</span> <span className="text-[10px] font-mono text-white/40">Today</span></div>
                   <div className="flex justify-between border-b border-white/5 pb-2 text-sm text-white/80"><span className="flex gap-2"><Smile size={16} className="text-blue-400" /> Focused</span> <span className="text-[10px] font-mono text-white/40">Yesterday</span></div>
                </div>
              </div>
              <div className="bg-[#110f0f] border border-white/5 p-6 space-y-4">
                <h4 className="text-[10px] font-mono uppercase tracking-widest text-brand-gold font-bold">Recommended Session</h4>
                 <div className="flex gap-4 items-center mt-2 group cursor-pointer" onClick={() => setActiveTab('audio')}>
                    <div className="w-16 h-16 bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-brand-gold text-white/40 group-hover:text-brand-gold transition-colors">
                      <Play size={20} className="ml-1" />
                    </div>
                    <div>
                      <h5 className="font-bold text-white group-hover:text-brand-gold transition-colors">Deep Healing Sleep Soundscape</h5>
                      <span className="text-[10px] font-mono text-white/40">45 MIN • RELAXATION</span>
                    </div>
                 </div>
              </div>
            </div>

          </div>
        )}

        {/* GUIDED BREATHING */}
        {activeTab === 'breathing' && (
          <div className="space-y-6">
            <h3 className="text-xl font-serif font-black tracking-tight text-white uppercase text-center md:text-left">🌬️ Guided Breathing</h3>
            <div className="grid md:grid-cols-2 gap-6 items-center">
              <div className="p-12 border border-white/10 bg-[#110f0f] flex items-center justify-center relative overflow-hidden h-80">
                 <motion.div 
                    animate={{ scale: [1, 1.5, 1] }} 
                    transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
                    className="w-32 h-32 rounded-full border border-brand-gold/50 bg-brand-gold/10 flex items-center justify-center shadow-[0_0_50px_rgba(212,175,55,0.2)]"
                 >
                    <Wind className="text-brand-gold opacity-50" size={32} />
                 </motion.div>
                 <div className="absolute bottom-8 w-full text-center font-mono text-[10px] uppercase tracking-widest text-brand-gold">Inhale... Exhale...</div>
              </div>
              <div className="space-y-4">
                <p className="text-sm text-white/60 leading-relaxed">
                  Structured breathing to regulate stress, anxiety, and emotional overwhelm. Select a preset below.
                </p>
                <div className="flex flex-col gap-2">
                  <button onClick={() => triggerToast("Starting Box Breathing sequence.")} className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 flex justify-between items-center text-sm font-bold w-full transition-colors">
                    <span>Box Breathing (4-4-4-4)</span> <span className="text-[9px] font-mono text-brand-gold">STRESS RELIEF</span>
                  </button>
                  <button onClick={() => triggerToast("Starting 4-7-8 Sleep sequence.")} className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 flex justify-between items-center text-sm font-bold w-full transition-colors">
                    <span>4-7-8 Method</span> <span className="text-[9px] font-mono text-brand-gold">SLEEP PREP</span>
                  </button>
                  <button onClick={() => triggerToast("Starting Fertility Relaxation sequence.")} className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 flex justify-between items-center text-sm font-bold w-full transition-colors">
                    <span>Womb Healing Breaths</span> <span className="text-[9px] font-mono text-brand-gold">FERTILITY GROUNDING</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AUDIO & MUSIC */}
        {activeTab === 'audio' && (
          <div className="space-y-6">
            <h3 className="text-xl font-serif font-black tracking-tight text-white uppercase">🎧 Audio & Soundscapes</h3>
            <p className="text-xs text-white/50 mb-6 max-w-2xl">A curated library of guided meditations and therapeutic sound environments to calm the nervous system.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-[10px] font-mono uppercase tracking-widest text-white/40">Guided Meditations</h4>
                {['Stress Relief Meditation', 'Fertility Mindfulness', 'Body Awareness Scan'].map((title, i) => (
                  <div key={i} className="bg-[#110f0f] border border-white/5 p-4 flex justify-between items-center">
                    <div>
                      <h5 className="font-bold text-white text-sm">{title}</h5>
                      <p className="text-[9px] font-mono text-white/40 mt-1">10-15 MIN • AUDIO</p>
                    </div>
                    <button onClick={() => triggerToast(`Playing: ${title}`)} className="w-10 h-10 flex items-center justify-center bg-white/5 border border-white/10 hover:bg-brand-gold hover:border-brand-gold hover:text-black transition-all">
                      <Play size={14} className="ml-0.5" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                <h4 className="text-[10px] font-mono uppercase tracking-widest text-white/40">Relaxation Music</h4>
                {['Womb Healing Frequencies', 'Deep Sleep Soundscape', 'Nature Ambient Tones'].map((title, i) => (
                   <div key={i} className="bg-[#110f0f] border border-white/5 p-4 flex justify-between items-center">
                     <div className="flex gap-3 items-center">
                        <Music className="text-brand-gold/50" size={16} />
                        <div>
                          <h5 className="font-bold text-white text-sm">{title}</h5>
                          <p className="text-[9px] font-mono text-white/40 mt-1">CONTINUOUS LOOP</p>
                        </div>
                     </div>
                     <button onClick={() => triggerToast(`Playing soundscape: ${title}`)} className="w-10 h-10 flex items-center justify-center bg-white/5 border border-white/10 hover:bg-brand-gold hover:border-brand-gold hover:text-black transition-all">
                       <Play size={14} className="ml-0.5" />
                     </button>
                   </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MOOD TRACKER */}
        {activeTab === 'mood' && (
          <div className="space-y-6">
            <h3 className="text-xl font-serif font-black tracking-tight text-white uppercase text-center">😊 Daily Mood Tracker</h3>
            <p className="text-xs text-white/50 mb-6 text-center max-w-xl mx-auto">Track your daily emotional awareness to uncover mental wellness and hormonal insight correlations.</p>
            
            <div className="max-w-2xl mx-auto bg-[#110f0f] border border-white/5 p-6 sm:p-8 space-y-8">
              <div className="space-y-4">
                <label className="text-[10px] font-mono uppercase tracking-widest text-brand-gold font-bold">1. How are you feeling today?</label>
                <div className="flex flex-wrap gap-3">
                  {['Calm', 'Happy', 'Anxious', 'Sad', 'Energetic', 'Tired'].map(m => (
                    <button key={m} className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-sm transition-colors rounded-full">
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-4">
                <label className="text-[10px] font-mono uppercase tracking-widest text-brand-gold font-bold">2. What are the triggers? (Optional)</label>
                <div className="flex flex-wrap gap-2">
                  {['Work', 'Sleep', 'Cycle', 'Relationships', 'Health'].map(t => (
                    <button key={t} className="px-3 py-1.5 bg-white/[0.02] hover:bg-white/10 border border-white/5 text-white/70 text-xs transition-colors">
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-4">
                <label className="text-[10px] font-mono uppercase tracking-widest text-brand-gold font-bold">3. Brief thoughts</label>
                <textarea 
                  className="w-full bg-[#0a0a0a] border border-white/10 p-3 text-sm text-white focus:border-brand-gold outline-none min-h-[100px]"
                  placeholder="Record what's on your mind today..."
                />
              </div>
              
              <button onClick={() => triggerToast("Mood logged successfully.")} className="w-full py-3 bg-brand-gold hover:bg-white text-black font-black uppercase tracking-widest text-[10px] font-mono transition-colors">
                Save Daily Reflection
              </button>
            </div>
          </div>
        )}

        {/* JOURNALS */}
        {activeTab === 'journal' && (
          <div className="space-y-6">
            <h3 className="text-xl font-serif font-black tracking-tight text-white uppercase">📝 Journals</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-[#110f0f] border border-white/5 p-6 space-y-4">
                <div className="flex items-center gap-2 text-brand-gold font-bold text-[11px] font-mono uppercase tracking-widest">
                  <Heart size={14} /> Gratitude Journal
                </div>
                <p className="text-xs text-white/60 mb-2">A reflective tool designed to shift mindset. What brought you peace today?</p>
                <textarea 
                  className="w-full bg-black/50 border border-white/10 p-3 text-sm text-white focus:border-brand-gold outline-none min-h-[120px]"
                  placeholder="Today I am grateful for..."
                />
                <button onClick={() => triggerToast("Gratitude entry saved.")} className="w-full py-2 bg-white/5 hover:bg-brand-gold hover:text-black border border-white/10 uppercase tracking-widest text-[9px] font-mono transition-colors font-bold">
                  Save Gratitude
                </button>
              </div>

              <div className="bg-[#110f0f] border border-white/5 p-6 space-y-4">
                <div className="flex items-center gap-2 text-brand-gold font-bold text-[11px] font-mono uppercase tracking-widest">
                  <FileText size={14} /> Deep Reflection
                </div>
                <p className="text-xs text-white/60 mb-2">Space for emotional processing, tracking life transitions, and personal breakthroughs.</p>
                <textarea 
                  className="w-full bg-black/50 border border-white/10 p-3 text-sm text-white focus:border-brand-gold outline-none min-h-[120px]"
                  placeholder="Freewrite your thoughts here..."
                />
                <button onClick={() => triggerToast("Reflection entry saved.")} className="w-full py-2 bg-white/5 hover:bg-brand-gold hover:text-black border border-white/10 uppercase tracking-widest text-[9px] font-mono transition-colors font-bold">
                  Save Reflection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ASSESSMENTS */}
        {activeTab === 'tests' && (
          <div className="space-y-6">
             {isAssessing ? (
                 <WellnessAssessment 
                    onComplete={(tags) => {
                       setIsAssessing(false);
                       setRecommendedTags(tags);
                    }} 
                    onCancel={() => setIsAssessing(false)} 
                 />
             ) : recommendedTags ? (
                 <div id="prescriptive-roadmap-tools" className="bg-[#111111] p-8 border border-brand-gold/30 rounded-3xl text-center space-y-6 max-w-4xl mx-auto shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/10 blur-[100px] pointer-events-none" />
                    <Sparkles size={48} className="text-brand-gold mx-auto mb-4" />
                    <h3 className="text-3xl font-serif font-black tracking-tight text-white uppercase">Your Prescriptive Roadmap</h3>
                    <p className="text-sm font-sans text-white/70 max-w-xl mx-auto leading-relaxed">
                       Based on your current emotional and physical symptoms, we have curated the following therapeutic protocols to restore your internal balance.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-left mt-8">
                       {recommendedTags.includes('supplements') && (
                          <div className="p-5 bg-black/50 border border-white/10 rounded-2xl hover:border-brand-gold transition-colors">
                             <h4 className="text-sm font-bold text-brand-gold uppercase tracking-widest font-mono mb-2">Botanical Support</h4>
                             <p className="text-xs text-white/50 mb-4">Targeted vitamins and herbal blends to replenish micronutrients drained by chronic stress.</p>
                             <button className="text-[10px] uppercase font-black tracking-widest bg-white/5 hover:bg-brand-gold hover:text-black py-2 px-4 shadow-sm transition-colors border border-white/10 hover:border-brand-gold w-full text-center">View Supplements</button>
                          </div>
                       )}
                       {recommendedTags.includes('courses') && (
                          <div className="p-5 bg-black/50 border border-white/10 rounded-2xl hover:border-brand-gold transition-colors">
                             <h4 className="text-sm font-bold text-brand-gold uppercase tracking-widest font-mono mb-2">Masterclass Series</h4>
                             <p className="text-xs text-white/50 mb-4">Deep educational frameworks diving into female cycle optimization and nervous system regulation.</p>
                             <button className="text-[10px] uppercase font-black tracking-widest bg-white/5 hover:bg-brand-gold hover:text-black py-2 px-4 shadow-sm transition-colors border border-white/10 hover:border-brand-gold w-full text-center">Open Courses</button>
                          </div>
                       )}
                       {recommendedTags.includes('digital') && (
                          <div className="p-5 bg-black/50 border border-white/10 rounded-2xl hover:border-brand-gold transition-colors">
                             <h4 className="text-sm font-bold text-brand-gold uppercase tracking-widest font-mono mb-2">Somatic Practices</h4>
                             <p className="text-xs text-white/50 mb-4">Audio meditations and guided tracking templates to establish immediate body literacy.</p>
                             <button onClick={() => { setRecommendedTags(null); setActiveTab('audio'); }} className="text-[10px] uppercase font-black tracking-widest bg-white/5 hover:bg-brand-gold hover:text-black py-2 px-4 shadow-sm transition-colors border border-white/10 hover:border-brand-gold w-full text-center">Start Practice</button>
                          </div>
                       )}
                       {recommendedTags.includes('events') && (
                          <div className="p-5 bg-black/50 border border-white/10 rounded-2xl hover:border-brand-gold transition-colors">
                             <h4 className="text-sm font-bold text-brand-gold uppercase tracking-widest font-mono mb-2">Live Gatherings</h4>
                             <p className="text-xs text-white/50 mb-4">Register for expert-led live community sessions for real-time validation and group coaching.</p>
                             <button className="text-[10px] uppercase font-black tracking-widest bg-white/5 hover:bg-brand-gold hover:text-black py-2 px-4 shadow-sm transition-colors border border-white/10 hover:border-brand-gold w-full text-center">View Schedule</button>
                          </div>
                       )}
                       {recommendedTags.includes('herbal') && (
                          <div className="p-5 bg-black/50 border border-white/10 rounded-2xl hover:border-brand-gold transition-colors">
                             <h4 className="text-sm font-bold text-brand-gold uppercase tracking-widest font-mono mb-2">Apothecary</h4>
                             <p className="text-xs text-white/50 mb-4">Handcrafted holistic remedies designed strictly for female reproductive support.</p>
                             <button className="text-[10px] uppercase font-black tracking-widest bg-white/5 hover:bg-brand-gold hover:text-black py-2 px-4 shadow-sm transition-colors border border-white/10 hover:border-brand-gold w-full text-center">Visit Shop</button>
                          </div>
                       )}
                       {(!recommendedTags || recommendedTags.length === 0) && (
                          <div className="p-5 bg-black/50 border border-white/10 rounded-2xl col-span-full">
                             <h4 className="text-sm font-bold text-brand-gold uppercase tracking-widest font-mono mb-2">Foundational Reset</h4>
                             <p className="text-xs text-white/50 mb-4">Start with daily cycle tracking and 5 minutes of somatic breathing to establish baseline awareness before deeper interventions.</p>
                             <button onClick={() => { setRecommendedTags(null); setActiveTab('breathing'); }} className="text-[10px] uppercase font-black tracking-widest bg-white/5 hover:bg-brand-gold hover:text-black py-2 px-4 shadow-sm transition-colors border border-white/10 hover:border-brand-gold text-center">Begin Breathing Exercise</button>
                          </div>
                       )}
                    </div>
                    
                    <div className="flex items-center justify-center gap-4 mt-8">
                       <button onClick={async () => {
                         try {
                           const { default: html2canvas } = await import('html2canvas');
                           const { jsPDF } = await import('jspdf');
                           const element = document.getElementById('prescriptive-roadmap-tools');
                           if (element) {
                              const canvas = await html2canvas(element, { scale: 2 });
                              const imgData = canvas.toDataURL('image/png');
                              const pdf = new jsPDF({
                                orientation: 'portrait',
                                unit: 'pt',
                                format: [canvas.width, canvas.height]
                              });
                              pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
                              pdf.save('Wellness_Roadmap.pdf');
                           }
                         } catch (err) {
                           console.error('Failed to generate PDF', err);
                         }
                       }} className="text-[9px] uppercase font-mono tracking-widest text-[#D4AF37] hover:text-white border border-[#D4AF37]/50 px-4 py-2 hover:bg-[#D4AF37]/10 transition-colors">
                          Download PDF Summary
                       </button>
                       <button onClick={() => setRecommendedTags(null)} className="text-[9px] uppercase font-mono tracking-widest text-white/40 hover:text-white underline transition-colors">
                          Retake Assessment
                       </button>
                    </div>
                 </div>
             ) : (
                 <>
                   <h3 className="text-xl font-serif font-black tracking-tight text-white uppercase">🧠 Self-Assessment Tests</h3>
                   <p className="text-xs text-white/50 mb-6">Interactive wellness evaluations to increase self-awareness and guide personalized recommendations.</p>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {[
                       { title: 'Holistic Wellness & Optimization Check', q: 4, time: '2 MIN', primary: true },
                       { title: 'Stress Level Assessment', q: 10, time: '3 MIN' },
                       { title: 'Emotional Wellbeing Check', q: 15, time: '5 MIN' },
                       { title: 'Fertility Readiness', q: 20, time: '8 MIN' },
                       { title: 'Sleep Quality Evaluation', q: 12, time: '4 MIN' }
                     ].map((test, i) => (
                       <div key={i} className={`p-5 flex justify-between items-center group transition-colors ${test.primary ? 'bg-brand-gold/10 border border-brand-gold shadow-[0_0_15px_rgba(212,175,55,0.15)]' : 'border border-white/5 bg-[#110f0f] hover:border-brand-gold/30'}`}>
                         <div>
                           <h5 className="text-sm font-bold text-white">{test.title}</h5>
                           <p className="text-[9px] font-mono text-white/40 tracking-widest mt-1">{test.q} QUESTIONS • {test.time}</p>
                         </div>
                         <button onClick={() => {
                            if (test.primary) { setIsAssessing(true); setRecommendedTags(null); }
                            else { triggerToast(`Development Notice: ${test.title} will be available next week.`); }
                         }} className={`px-4 py-2 font-mono text-[9px] font-bold uppercase transition-colors whitespace-nowrap ${test.primary ? 'bg-brand-gold text-black hover:bg-white' : 'bg-white/5 hover:bg-brand-gold hover:text-black'}`}>
                           Start
                         </button>
                       </div>
                     ))}
                   </div>
                 </>
             )}
          </div>
        )}

        {/* INSIGHTS */}
        {activeTab === 'insights' && (
          <div className="space-y-6">
            <h3 className="text-xl font-serif font-black tracking-tight text-white uppercase text-center md:text-left">📊 Personal Wellness Insights</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 bg-[#110f0f] border border-white/5 p-6 md:p-8 h-80 flex flex-col justify-center items-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 blur-3xl" />
                <Activity className="text-brand-gold/20 mb-4" size={48} />
                <h4 className="text-lg font-black uppercase text-white font-serif text-center">Mood vs. Sleep Correlation</h4>
                <p className="text-xs text-white/50 text-center max-w-sm mt-2">Log consistently for 7 days to generate your first impact correlations mapped against your cycle.</p>
              </div>
              
              <div className="space-y-6">
                <div className="bg-[#110f0f] border border-white/5 p-6">
                   <h5 className="text-[10px] font-mono uppercase tracking-widest text-brand-gold font-bold mb-3">Tool Usage Consistency</h5>
                   <div className="flex gap-1 justify-between mb-2">
                     {[1,2,3,4,5,6,7].map(d => (
                       <div key={d} className={`h-8 w-6 border border-white/10 ${d < 4 ? 'bg-brand-gold/20' : 'bg-transparent'}`} />
                     ))}
                   </div>
                   <p className="text-[9px] text-white/40 font-mono tracking-widest text-right">3 DAY STREAK</p>
                </div>
                
                <div className="bg-[#110f0f] border border-white/5 p-6">
                   <h5 className="text-[10px] font-mono uppercase tracking-widest text-brand-gold font-bold mb-3">Smart Suggestion</h5>
                   <p className="text-xs text-white/70 italic">"Your stress assessments correlate with a drop in daily steps. A 10-minute walk with the 'Nature Ambient Tones' soundscape is highly recommended."</p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
