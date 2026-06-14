import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { useContent } from '../../context/ContentContext';
import { defaultPrograms } from '../../lib/programs';
import WellnessAssessment from './WellnessAssessment';
import DailyAffirmation from './DailyAffirmation';
import { 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  CalendarCheck, 
  DollarSign, 
  GraduationCap, 
  MessageSquare, 
  Award, 
  ArrowRight,
  BookOpen,
  Calendar,
  ShoppingBag,
  HeartHandshake,
  Heart,
  Droplet,
  Moon,
  BatteryMedium,
  Smile,
  Activity,
  PlayCircle,
  User,
  Users
} from 'lucide-react';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface DashboardHomeProps {
  setActiveTab: (tab: any) => void;
  enabledFeatures: Record<string, boolean>;
}

export default function DashboardHome({ setActiveTab, enabledFeatures }: DashboardHomeProps) {
  const { user, userData } = useAuth();
  const { content } = useContent();
  const [completedLessonsMap, setCompletedLessonsMap] = useState<Record<string, boolean>>({});
  const [recentReflection, setRecentReflection] = useState<any>(null);
  const [isAssessing, setIsAssessing] = useState(false);
  const [recommendedTags, setRecommendedTags] = useState<string[] | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('tvr_lesson_progress');
      if (stored) {
        setCompletedLessonsMap(JSON.parse(stored));
      }
    } catch (e) {
      console.warn("Could not read progress state", e);
    }

    const fetchLatestReflection = async () => {
      if (!user) return;
      try {
        const q = query(
          collection(db, 'wellnessReflections'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(1)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          setRecentReflection({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
        }
      } catch (err) {
        console.error("Error fetching latest reflection:", err);
      }
    };
    fetchLatestReflection();
  }, [user]);

  const formatExpirationDate = (dateStr: string | undefined | null) => {
    if (!dateStr) return '15 Dec 2026';
    try {
      const date = new Date(dateStr);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    } catch {
      return '15 Dec 2026';
    }
  };

  const getMembershipDisplayLabel = () => {
    if (userData?.role === 'admin' || userData?.isAdmin === true) return '🛡️ System Administrator';
    if (userData?.isFreeMemberForLife) return '💎 Lifetime Member';
    const tier = userData?.membershipType || 'gold';
    const t = tier.toLowerCase();
    if (t === 'gold' || t === 'quarterly') return '🌟 Gold Plan Member';
    if (t === 'diamond' || t === 'yearly') return '🌟 Diamond Plan Member';
    return `🌟 ${tier.charAt(0).toUpperCase() + tier.slice(1)} Member`;
  };

  const calculateDaysSinceJoin = () => {
    if (!userData?.createdAt) return 0;
    
    let joinDate: Date;
    if (typeof userData.createdAt === 'string') {
        joinDate = new Date(userData.createdAt);
    } else if (userData.createdAt?.toDate) {
        joinDate = userData.createdAt.toDate();
    } else if (userData.createdAt?.seconds) {
        joinDate = new Date(userData.createdAt.seconds * 1000);
    } else {
        return 0; // Fallback if format is unknown
    }
    
    if (isNaN(joinDate.getTime())) return 0; // Check for invalid date

    const now = new Date();
    const diffTime = Math.abs(now.getTime() - joinDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };


  const totalLessons = defaultPrograms.reduce((acc, p) => acc + p.lessons.length, 0);
  const totalCompleted = defaultPrograms.reduce((acc, p) => acc + p.lessons.filter(l => !!completedLessonsMap[l.id]).length, 0);
  const progress = totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0;

  let activePrograms = defaultPrograms.filter(prog => {
    const completed = prog.lessons.filter(l => !!completedLessonsMap[l.id]).length;
    return completed > 0 && completed < prog.lessons.length;
  });

  if (activePrograms.length === 0 && defaultPrograms.length > 0) {
     activePrograms = [defaultPrograms[0]];
  }

  // Very basic wellness score calculation based on last reflection
  const calculateWellnessScore = () => {
    if (!recentReflection) return 85; // Default if none
    const moodScore = (recentReflection.mood || 3) * 20; // 1-5 -> 20-100
    const energyScore = (recentReflection.energyLevel || 3) * 20; // 1-5 -> 20-100
    return Math.round((moodScore + energyScore) / 2);
  };

  const wellnessScore = calculateWellnessScore();

  if (isAssessing) {
     return (
        <div className="py-8">
           <WellnessAssessment 
              onComplete={(tags) => {
                 setIsAssessing(false);
                 setRecommendedTags(tags);
              }} 
              onCancel={() => setIsAssessing(false)} 
           />
        </div>
     );
  }

  if (recommendedTags) {
     return (
        <div className="py-8">
           <div id="prescriptive-roadmap" className="bg-[#111111] p-8 border border-brand-gold/30 rounded-3xl text-center space-y-6 max-w-4xl mx-auto shadow-2xl relative overflow-hidden">
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
                       <button onClick={() => setActiveTab('shop')} className="text-[10px] uppercase font-black tracking-widest bg-white/5 hover:bg-brand-gold hover:text-black py-2 px-4 shadow-sm transition-colors border border-white/10 hover:border-brand-gold w-full text-center">View Supplements</button>
                    </div>
                 )}
                 {recommendedTags.includes('courses') && (
                    <div className="p-5 bg-black/50 border border-white/10 rounded-2xl hover:border-brand-gold transition-colors">
                       <h4 className="text-sm font-bold text-brand-gold uppercase tracking-widest font-mono mb-2">Masterclass Series</h4>
                       <p className="text-xs text-white/50 mb-4">Deep educational frameworks diving into female cycle optimization and nervous system regulation.</p>
                       <button onClick={() => setActiveTab('programs')} className="text-[10px] uppercase font-black tracking-widest bg-white/5 hover:bg-brand-gold hover:text-black py-2 px-4 shadow-sm transition-colors border border-white/10 hover:border-brand-gold w-full text-center">Open Courses</button>
                    </div>
                 )}
                 {recommendedTags.includes('digital') && (
                    <div className="p-5 bg-black/50 border border-white/10 rounded-2xl hover:border-brand-gold transition-colors">
                       <h4 className="text-sm font-bold text-brand-gold uppercase tracking-widest font-mono mb-2">Somatic Practices</h4>
                       <p className="text-xs text-white/50 mb-4">Audio meditations and guided tracking templates to establish immediate body literacy.</p>
                       <button onClick={() => setActiveTab('wellness_tools')} className="text-[10px] uppercase font-black tracking-widest bg-white/5 hover:bg-brand-gold hover:text-black py-2 px-4 shadow-sm transition-colors border border-white/10 hover:border-brand-gold w-full text-center">Start Practice</button>
                    </div>
                 )}
                 {recommendedTags.includes('events') && (
                    <div className="p-5 bg-black/50 border border-white/10 rounded-2xl hover:border-brand-gold transition-colors">
                       <h4 className="text-sm font-bold text-brand-gold uppercase tracking-widest font-mono mb-2">Live Gatherings</h4>
                       <p className="text-xs text-white/50 mb-4">Register for expert-led live community sessions for real-time validation and group coaching.</p>
                       <button onClick={() => setActiveTab('events')} className="text-[10px] uppercase font-black tracking-widest bg-white/5 hover:bg-brand-gold hover:text-black py-2 px-4 shadow-sm transition-colors border border-white/10 hover:border-brand-gold w-full text-center">View Schedule</button>
                    </div>
                 )}
                 {recommendedTags.includes('herbal') && (
                    <div className="p-5 bg-black/50 border border-white/10 rounded-2xl hover:border-brand-gold transition-colors">
                       <h4 className="text-sm font-bold text-brand-gold uppercase tracking-widest font-mono mb-2">Apothecary</h4>
                       <p className="text-xs text-white/50 mb-4">Handcrafted holistic remedies designed strictly for female reproductive support.</p>
                       <button onClick={() => setActiveTab('shop')} className="text-[10px] uppercase font-black tracking-widest bg-white/5 hover:bg-brand-gold hover:text-black py-2 px-4 shadow-sm transition-colors border border-white/10 hover:border-brand-gold w-full text-center">Visit Shop</button>
                    </div>
                 )}
                 {(!recommendedTags || recommendedTags.length === 0) && (
                    <div className="p-5 bg-black/50 border border-white/10 rounded-2xl col-span-full">
                       <h4 className="text-sm font-bold text-brand-gold uppercase tracking-widest font-mono mb-2">Foundational Reset</h4>
                       <p className="text-xs text-white/50 mb-4">Start with daily cycle tracking and 5 minutes of somatic breathing to establish baseline awareness before deeper interventions.</p>
                       <button onClick={() => setActiveTab('wellness_tools')} className="text-[10px] uppercase font-black tracking-widest bg-white/5 hover:bg-brand-gold hover:text-black py-2 px-4 shadow-sm transition-colors border border-white/10 hover:border-brand-gold text-center">Begin Breathing Exercise</button>
                    </div>
                 )}
              </div>
              
              <div className="flex items-center justify-center gap-4 mt-8">
                 <button onClick={async () => {
                   try {
                     const { default: html2canvas } = await import('html2canvas');
                     const { jsPDF } = await import('jspdf');
                     const element = document.getElementById('prescriptive-roadmap');
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
                    Back to Dashboard
                 </button>
                 <button onClick={() => { setRecommendedTags(null); setIsAssessing(true); }} className="text-[9px] uppercase font-mono tracking-widest text-[#D4AF37] hover:text-[#D4AF37]/80 transition-colors">
                    Retake Assessment
                 </button>
              </div>
           </div>
        </div>
     );
  }

  return (
    <div className="space-y-8">
      {/* 1. Welcome Panel */}
      <div className="relative p-6 sm:p-8 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black border border-brand-gold/20 rounded overflow-hidden">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 pointer-events-none" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/5 rounded-full filter blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 text-left">
            <span className="text-[9px] font-mono text-brand-gold uppercase tracking-[0.25em] font-normal flex items-center gap-1.5">
              <Sparkles size={11} className="animate-spin-slow text-brand-gold" /> The Vagina Room Community
            </span>
            <h3 className="text-xl sm:text-2xl font-black uppercase text-white font-sans tracking-tight flex flex-wrap items-center gap-3">
              Your Wellness Dashboard
              <span className="bg-white/10 text-white border border-white/20 text-[9px] px-2 py-0.5 rounded font-black tracking-widest flex items-center gap-1">
                {userData?.membershipId || 'TVR-001'}
              </span>
            </h3>
            <p className="text-xs text-white/60 max-w-xl leading-relaxed font-light">
              You are {calculateDaysSinceJoin()} days into your wellness journey. Keep showing up for yourself. We are thrilled to support your pelvic, somatic, and clinical restoration journey.
            </p>
          </div>

          <div className="flex flex-col gap-4 shrink-0 mt-4 md:mt-0">
             <button
                onClick={() => setActiveTab('live_class')}
                className="bg-brand-gold text-brand-black hover:bg-white text-[10px] uppercase font-black tracking-widest px-6 py-3 transition-colors rounded shadow-[0_0_15px_rgba(212,175,55,0.4)] flex items-center justify-center gap-2"
             >
                <PlayCircle size={14} /> Attend Live Class
             </button>
             {/* Quote from Dr FID */}
             <div className="bg-white/5 border border-white/10 p-4 rounded text-left max-w-xs hidden sm:block">
                <p className="text-[9px] italic text-white/70">"Healing is not a linear progression; it's a daily practice of listening to your body's deepest whispers."</p>
                <p className="text-[8px] text-brand-gold uppercase font-bold tracking-widest mt-2">— Dr. FID</p>
             </div>
          </div>
        </div>
      </div>
      
      {/* Quick Navigation Modules */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         {[
            { id: 'fertility', label: 'Fertility Center', icon: Heart, color: 'text-brand-red' },
            { id: 'womens_wellness', label: "Women's Wellness", icon: Activity, color: 'text-brand-gold' },
            { id: 'programs', label: 'Learning Center', icon: GraduationCap, color: 'text-[#3B82F6]' },
            { id: 'consultation', label: 'Expert Booking', icon: User, color: 'text-emerald-400' },
            { id: 'community', label: 'Community Hub', icon: Users, color: 'text-[#A855F7]' },
            { id: 'resources', label: 'Resource Library', icon: BookOpen, color: 'text-white' },
            { id: 'wellness_tools', label: 'Wellness Tools', icon: Heart, color: 'text-orange-400' },
            { id: 'ai_assistant', label: 'Ask AI', icon: Sparkles, color: 'text-brand-gold' }
         ].map(mod => {
            const Icon = mod.icon;
            return (
               <button 
                 key={mod.id}
                 onClick={() => setActiveTab(mod.id)}
                 className="p-4 bg-zinc-900 border border-white/5 rounded-xl hover:bg-white/5 hover:border-white/20 transition-all flex flex-col items-center justify-center text-center gap-3 cursor-pointer group"
               >
                 <Icon size={24} className={`${mod.color} group-hover:scale-110 transition-transform`} />
                 <span className="text-[10px] font-black uppercase tracking-widest text-white/80 group-hover:text-white">{mod.label}</span>
               </button>
            )
         })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Assessment Promo */}
        <div className="lg:col-span-3 p-6 bg-gradient-to-br from-zinc-950 to-black border border-brand-gold/40 rounded-xl relative overflow-hidden group flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_0_30px_rgba(212,175,55,0.05)] text-left">
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
                <div className="w-16 h-16 bg-brand-gold/10 rounded-full flex items-center justify-center border border-brand-gold/20 shrink-0 shadow-[0_0_15px_rgba(212,175,55,0.2)]">
                    <Activity size={24} className="text-brand-gold group-hover:scale-110 transition-transform" />
                </div>
                <div>
                   <span className="text-[10px] font-mono text-brand-gold uppercase tracking-[0.2em] font-black mb-1 block">Recommend For You</span>
                   <h4 className="text-xl font-serif font-black text-white tracking-tight uppercase">Personalized Wellness Assessment</h4>
                   <p className="text-xs text-white/60 font-sans max-w-xl mt-2 leading-relaxed">Take our 2-minute holistic evaluation to generate a prescriptive roadmap tailored specifically to your current hormonal, emotional, and physical needs.</p>
                </div>
            </div>
            <button 
              onClick={() => setIsAssessing(true)}
              className="relative z-10 w-full md:w-auto px-8 py-3 bg-brand-gold text-black text-[10px] font-mono font-black uppercase tracking-widest hover:bg-white transition-colors rounded shadow-[0_0_20px_rgba(212,175,55,0.3)] whitespace-nowrap shrink-0"
            >
                Start Assessment
            </button>
        </div>

        {/* 0. Featured Member Benefits */}
        <div className="lg:col-span-3 p-5 bg-brand-gold/5 border border-brand-gold/20 rounded overflow-hidden relative group text-left flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/10 rounded-full filter blur-[40px] pointer-events-none transition-opacity opacity-50 group-hover:opacity-100" />
            <div className="relative z-10 flex items-center gap-4">
                <div className="w-10 h-10 bg-brand-gold rounded flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.3)] shrink-0">
                    <Sparkles className="text-black" size={16} />
                </div>
                <div>
                    <p className="text-[9px] font-mono text-brand-gold uppercase tracking-[0.2em] font-bold">New Benefit Unlocked</p>
                    <h4 className="text-sm font-black text-white mt-1 uppercase tracking-tight">15% Off All Organic Botanical Blends</h4>
                </div>
            </div>
            <button onClick={() => setActiveTab('shop')} className="relative z-10 px-4 py-2 bg-brand-gold text-black text-[9px] uppercase font-black tracking-widest hover:bg-white transition-colors whitespace-nowrap rounded">
                Activate Perk
            </button>
        </div>

        {/* 2. Membership Status */}
        <div className="p-6 bg-gradient-to-br from-zinc-950 to-zinc-900 border border-white/14 rounded flex flex-col justify-between text-left">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[8px] font-mono uppercase tracking-[0.25em] text-white/30">Membership Status</p>
              <h4 className="text-sm font-black uppercase text-white mt-1.5 tracking-tight flex items-center gap-1.5">
                <CheckCircle2 className="text-emerald-400 shrink-0" size={14} /> Active Verification
              </h4>
            </div>
            <div className="text-right">
                <span className="px-2 py-0.5 bg-brand-gold/15 border border-brand-gold/30 rounded-[2px] text-[8px] text-brand-gold uppercase font-bold font-mono">
                  {getMembershipDisplayLabel()}
                </span>
            </div>
          </div>
          <div className="mt-8 pt-4 border-t border-white/5 space-y-2">
            <div className="flex items-center justify-between">
                <span className="text-[9px] uppercase tracking-wider text-white/40 font-mono">Valid Until</span>
                <span className="font-mono text-[9px] text-white/60">
                {formatExpirationDate(userData?.membershipExpiration)}
                </span>
            </div>
          </div>
        </div>

        {/* 3. Daily Wellness Score & Streak */}
        <div className="p-6 bg-gradient-to-br from-zinc-950 to-zinc-900 border border-brand-gold/20 rounded flex flex-col justify-between text-left relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/10 rounded-full filter blur-[50px] pointer-events-none transition-opacity opacity-50 group-hover:opacity-100" />
            <div className="relative z-10">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-[8px] font-mono uppercase tracking-[0.25em] text-brand-gold">Daily Wellness Score</p>
                        <h4 className="text-3xl font-black uppercase text-white mt-1.5 tracking-tight flex items-end gap-1.5">
                        {wellnessScore}<span className="text-sm text-white/40 mb-1">%</span>
                        </h4>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-brand-gold flex items-center justify-center text-brand-black shadow-[0_0_15px_rgba(212,175,55,0.4)]">
                        <Activity size={18} />
                    </div>
                </div>

                {/* Wellness Streak Tracker */}
                <div className="mt-4 flex items-center gap-2">
                    <div className="flex -space-x-1">
                        {[1,2,3,4,5,6,7].map((day, i) => (
                             <div key={day} className={`w-5 h-5 rounded-full flex items-center justify-center text-[7px] font-bold border border-zinc-900 ${i < 4 ? 'bg-brand-gold text-black' : 'bg-white/10 text-white/40'}`}>
                                {i < 4 ? '✓' : day}
                             </div>
                        ))}
                    </div>
                    <span className="text-[9px] text-white/60 uppercase font-black tracking-wider"><span className="text-brand-gold">4 Day</span> Streak</span>
                </div>

                <div className="mt-5 pt-4 border-t border-white/5">
                    <div className="flex gap-4">
                        <div className="flex items-center gap-1.5">
                           <Smile size={10} className="text-brand-gold" />
                           <span className="text-[9px] font-mono uppercase text-white/60">Mood: {recentReflection?.mood || '-'}/5</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                           <BatteryMedium size={10} className="text-brand-gold" />
                           <span className="text-[9px] font-mono uppercase text-white/60">Energy: {recentReflection?.energyLevel || '-'}/5</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* 4. Today's Reflection Space */}
        <div className="p-6 bg-[#1a1a1a] border border-white/10 rounded flex flex-col justify-between text-left">
            <div>
              <p className="text-[8px] font-mono uppercase tracking-[0.25em] text-white/30">Today's Reflection</p>
              <h4 className="text-xs font-black uppercase text-white mt-2 tracking-tight leading-snug">
                "What is one thing your body is grateful for today?"
              </h4>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5">
                <button
                    onClick={() => setActiveTab('reflection')}
                    className="w-full py-2 bg-brand-gold hover:bg-white text-brand-black text-[9px] uppercase font-black tracking-widest transition-colors rounded"
                >
                    Write Journal Entry
                </button>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 5. Program Progress */}
        <div className="lg:col-span-2 p-6 bg-gradient-to-br from-zinc-950 to-zinc-900 border border-white/10 rounded space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-sm font-black uppercase text-brand-gold tracking-tight flex items-center gap-2">
                    <GraduationCap size={16} /> Learning Progress
                </h3>
                <span className="text-brand-gold font-mono text-xs font-bold">{progress}% Overall</span>
            </div>
            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                <div className="bg-brand-gold h-full transition-all duration-700" style={{ width: `${progress}%` }} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activePrograms.slice(0, 2).map(prog => {
                    const completed = prog.lessons.filter(l => !!completedLessonsMap[l.id]).length;
                    const total = prog.lessons.length;
                    const progPercent = total > 0 ? Math.round((completed / total) * 100) : 0;
                    return (
                        <div key={prog.id} className="bg-white/5 border border-white/10 p-4 rounded text-left hover:border-brand-gold/30 transition-colors cursor-pointer" onClick={() => setActiveTab('programs')}>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 rounded bg-brand-gold/10 flex items-center justify-center text-brand-gold">
                                    <PlayCircle size={14} />
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-black uppercase text-white tracking-wider line-clamp-1">{prog.title}</h4>
                                    <span className="text-[8px] text-brand-gold uppercase font-mono">{completed}/{total} Lessons</span>
                                </div>
                            </div>
                            <div className="w-full bg-black h-1 rounded-full overflow-hidden">
                                <div className="bg-emerald-400 h-full transition-all duration-700" style={{ width: `${progPercent}%` }} />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

        {/* 6. Achievement Center */}
        <div className="p-6 bg-gradient-to-br from-zinc-950 to-neutral-900 border border-white/10 rounded space-y-4 text-left flex flex-col justify-between">
            <div>
                <h3 className="text-sm font-black uppercase text-white tracking-tight flex items-center gap-2">
                    <Award size={16} className="text-brand-gold" /> Achievement Center
                </h3>
                <p className="text-[9px] text-white/50 uppercase tracking-widest mt-1">Milestones Unlocked</p>
            </div>
            
            <div className="grid grid-cols-3 gap-3 pt-2">
                {/* Unlocked Badge */}
                <div className="flex flex-col items-center justify-center p-3 border border-brand-gold/30 bg-brand-gold/10 rounded group cursor-default transition-all hover:bg-brand-gold/20">
                    <div className="w-8 h-8 rounded-full bg-brand-gold flex items-center justify-center mb-2 shadow-[0_0_15px_rgba(212,175,55,0.4)] group-hover:scale-110 transition-transform">
                        <Heart size={14} className="text-black" />
                    </div>
                    <p className="text-[7px] uppercase font-black text-white text-center leading-tight">First<br/>Reflection</p>
                </div>
                {/* Locked Badge */}
                <div className="flex flex-col items-center justify-center p-3 border border-white/10 bg-white/5 rounded opacity-50 grayscale hover:opacity-80 transition-all cursor-default">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mb-2">
                        <GraduationCap size={14} className="text-white" />
                    </div>
                    <p className="text-[7px] uppercase font-black text-white text-center leading-tight">Program<br/>Finisher</p>
                </div>
                {/* Locked Badge */}
                <div className="flex flex-col items-center justify-center p-3 border border-white/10 bg-white/5 rounded opacity-50 grayscale hover:opacity-80 transition-all cursor-default">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mb-2">
                        <MessageSquare size={14} className="text-white" />
                    </div>
                    <p className="text-[7px] uppercase font-black text-white text-center leading-tight">Community<br/>Pioneer</p>
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* 7. Upcoming Events */}
         <div className="lg:col-span-2 p-6 bg-gradient-to-br from-zinc-950 to-zinc-900 border border-white/10 rounded space-y-4 text-left">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-black uppercase text-white tracking-tight flex items-center gap-2">
                    <Calendar size={16} className="text-brand-gold" /> Upcoming Events
                </h3>
                <button onClick={() => setActiveTab('events')} className="text-[9px] uppercase tracking-widest text-brand-gold hover:underline font-black">View All</button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {/* Dummy event data for visual structure */}
               <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-3 rounded">
                  <div className="bg-brand-gold/10 text-brand-gold p-3 rounded text-center min-w-[50px] border border-brand-gold/20">
                     <p className="text-[8px] uppercase font-black tracking-widest">Oct</p>
                     <p className="text-sm font-black">24</p>
                  </div>
                  <div>
                     <p className="text-[10px] font-black uppercase text-white">Womb Healing Masterclass</p>
                     <p className="text-[8px] text-white/50 uppercase tracking-wider font-mono mt-0.5">Live Session • 4:00 PM</p>
                  </div>
               </div>
               <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-3 rounded">
                  <div className="bg-brand-gold/10 text-brand-gold p-3 rounded text-center min-w-[50px] border border-brand-gold/20">
                     <p className="text-[8px] uppercase font-black tracking-widest">Nov</p>
                     <p className="text-sm font-black">12</p>
                  </div>
                  <div>
                     <p className="text-[10px] font-black uppercase text-white">Community Q&A</p>
                     <p className="text-[8px] text-white/50 uppercase tracking-wider font-mono mt-0.5">Roundtable • 6:30 PM</p>
                  </div>
               </div>
            </div>
         </div>

         {/* 8. Recommended Resources */}
         <div className="p-6 bg-gradient-to-br from-zinc-950 to-neutral-900 border border-white/10 rounded space-y-4 text-left flex flex-col">
            <h3 className="text-sm font-black uppercase text-white tracking-tight flex items-center gap-2">
                <BookOpen size={16} className="text-brand-gold" /> Recommended
            </h3>
            
            <div className="flex-1 space-y-4 pt-2">
                <div className="bg-black/50 p-3 rounded border border-white/5 hover:border-brand-gold/30 cursor-pointer transition-colors" onClick={() => setActiveTab('resources')}>
                    <span className="text-brand-gold font-mono text-[8px] uppercase tracking-[0.2em] block mb-1">Guide</span>
                    <h5 className="text-[10px] uppercase font-black text-white">Pelvic thermal temperature matrix</h5>
                </div>
                <div className="bg-black/50 p-3 rounded border border-white/5 hover:border-brand-gold/30 cursor-pointer transition-colors" onClick={() => setActiveTab('resources')}>
                    <span className="text-emerald-400 font-mono text-[8px] uppercase tracking-[0.2em] block mb-1">Video</span>
                    <h5 className="text-[10px] uppercase font-black text-white">Somatic Breathwork Basics</h5>
                </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
         {/* 9. Community Updates */}
         <div className="p-6 bg-gradient-to-br from-zinc-950 to-neutral-900 border border-white/10 rounded space-y-4 text-left">
            <h3 className="text-sm font-black uppercase text-white tracking-tight flex items-center gap-2">
                <MessageSquare size={16} className="text-brand-gold" /> Community Discourse
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-4 p-4 border border-white/5 rounded bg-black/40">
                    <div className="w-8 h-8 rounded-full bg-brand-gold flex items-center justify-center shrink-0">
                        <span className="text-[10px] text-black font-black">DR</span>
                    </div>
                    <div>
                        <p className="text-[10px] text-brand-gold font-black uppercase">Dr. FID</p>
                        <p className="text-[11px] text-white/70 leading-relaxed mt-1">Welcome to our new members! Remember to join the orientation this weekend.</p>
                    </div>
                </div>
                <div className="flex items-start gap-4 p-4 border border-white/5 rounded bg-black/40">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                        <span className="text-[10px] text-white font-black">S</span>
                    </div>
                    <div>
                        <p className="text-[10px] text-white font-black uppercase">Sarah M.</p>
                        <p className="text-[11px] text-white/70 leading-relaxed mt-1">Does anyone have the link to the somatic tracking spreadsheet?</p>
                    </div>
                </div>
            </div>
            <button
                onClick={() => setActiveTab('community')}
                className="w-full sm:w-auto text-[9px] mt-2 uppercase font-black tracking-widest text-brand-black bg-brand-gold hover:bg-white px-6 py-2.5 rounded transition-colors"
            >
                Enter Member Lounge
            </button>
         </div>
      </div>

      {/* 9. Quick Actions */}
      <div className="p-6 bg-white/[0.01] border border-white/10 rounded text-left space-y-4">
        <h4 className="text-xs font-black uppercase tracking-widest text-brand-gold">
          ⚡ QUICK ACTIONS
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {enabledFeatures.programs !== false && (
            <button onClick={() => setActiveTab('programs')} className="bg-zinc-950 border border-white/5 hover:border-brand-gold/40 p-4 text-center rounded transition-colors group flex flex-col items-center">
              <GraduationCap size={16} className="text-brand-gold mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-[8px] font-black uppercase text-white text-center">Continue Learning</p>
            </button>
          )}
          {enabledFeatures.events !== false && (
            <button onClick={() => setActiveTab('events')} className="bg-zinc-950 border border-white/5 hover:border-brand-gold/40 p-4 text-center rounded transition-colors group flex flex-col items-center">
              <Calendar size={16} className="text-brand-gold mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-[8px] font-black uppercase text-white text-center">Register Event</p>
            </button>
          )}
          {enabledFeatures.community !== false && (
            <button onClick={() => setActiveTab('community')} className="bg-zinc-950 border border-white/5 hover:border-brand-gold/40 p-4 text-center rounded transition-colors group flex flex-col items-center">
              <MessageSquare size={16} className="text-brand-gold mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-[8px] font-black uppercase text-white text-center">Community Lounge</p>
            </button>
          )}
          {enabledFeatures.resources !== false && (
            <button onClick={() => setActiveTab('resources')} className="bg-zinc-950 border border-white/5 hover:border-brand-gold/40 p-4 text-center rounded transition-colors group flex flex-col items-center">
              <BookOpen size={16} className="text-brand-gold mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-[8px] font-black uppercase text-white text-center">Resource Library</p>
            </button>
          )}
          {enabledFeatures.reflection !== false && (
            <button onClick={() => setActiveTab('reflection')} className="bg-zinc-950 border border-white/5 hover:border-brand-gold/40 p-4 text-center rounded transition-colors group flex flex-col items-center">
              <Heart size={16} className="text-brand-gold mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-[8px] font-black uppercase text-white text-center">Wellness Check-in</p>
            </button>
          )}
          {enabledFeatures.referral !== false && (
            <button onClick={() => setActiveTab('referral')} className="bg-zinc-950 border border-white/5 hover:border-brand-gold/40 p-4 text-center rounded transition-colors group flex flex-col items-center">
              <HeartHandshake size={16} className="text-brand-gold mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-[8px] font-black uppercase text-white text-center">Refer a Friend</p>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
