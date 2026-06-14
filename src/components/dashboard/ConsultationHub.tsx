import React, { useState } from 'react';
import { 
  CalendarCheck, 
  Clock, 
  UserPlus, 
  History, 
  FileText, 
  Star, 
  MessageSquare,
  Video,
  ChevronRight,
  Bell,
  Stethoscope,
  Heart,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';

export default function ConsultationHub() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'experts' | 'history' | 'notes'>('upcoming');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState<any>(null);

  const [toastMessage, setToastMessage] = useState('');

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const experts = [
    {
      id: 'drfid',
      name: 'Dr. FID',
      title: 'Lead Consultant',
      icon: Stethoscope,
      focus: ['Fertility Education', 'Reproductive Wellness', 'Hormonal Balance', 'Lifestyle Transformation'],
      availability: 'Next available: Tomorrow, 2:00 PM UTC',
      rating: 5.0,
      reviews: 124
    },
    {
      id: 'wellness_coach',
      name: 'Wellness Coaches',
      title: 'Lifestyle & Stress Support',
      icon: Heart,
      focus: ['Stress Management', 'Emotional Balance', 'Nutrition', 'Daily Routines'],
      availability: 'Next available: Today, 4:00 PM UTC',
      rating: 4.9,
      reviews: 89
    },
    {
      id: 'fertility_coach',
      name: 'Fertility Coaches',
      title: 'Conception Readiness',
      icon: Activity,
      focus: ['Cycle Interpretation', 'Fertility Awareness', 'Preconception Planning'],
      availability: 'Next available: Wednesday, 10:00 AM UTC',
      rating: 4.8,
      reviews: 56
    },
    {
      id: 'specialists',
      name: 'Advanced Specialists',
      title: 'Clinical Escalation',
      icon: Star,
      focus: ['Hormonal Imbalances', 'Reproductive Complications', 'Advanced Fertility Concerns'],
      availability: 'Schedule varies by specialist',
      rating: 4.9,
      reviews: 42
    }
  ];

  const upcomingAppointments = [
    {
      id: 'app-1',
      expert: 'Dr. FID',
      type: 'Initial Consultation',
      date: 'June 20, 2026',
      time: '14:00 UTC',
      status: 'Confirmed',
      link: '#'
    }
  ];

  const pastHistory = [
    {
      id: 'hist-1',
      expert: 'Wellness Coach',
      type: 'Stress Management Check-in',
      date: 'May 10, 2026',
      status: 'Completed',
      notesId: 'note-1'
    }
  ];

  const sessionNotes = [
    {
      id: 'note-1',
      title: 'Stress Management Check-in Notes',
      date: 'May 10, 2026',
      expert: 'Wellness Coach',
      summary: 'Discussed high cortisol impacts on sleep. Recommended magnesium glycinate and 15 mins evening breathing exercises.',
      actionSteps: ['Start magnesium supplement', 'Evening breathing routine', 'Follow-up in 4 weeks']
    }
  ];

  const handleBookSession = (expert: any) => {
    setSelectedExpert(expert);
    setShowBookingModal(true);
  };

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
            <Bell size={18} />
            <div>
              <h4 className="font-bold text-[11px] uppercase tracking-widest font-mono">System Notice</h4>
              <p className="text-sm font-medium">{toastMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Header */}
      <div className="bg-[#110f0f] border border-white/5 p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#D4AF37]/[0.02] blur-3xl rounded-full select-none pointer-events-none" />
        <div className="relative z-10">
          <span className="text-[9px] font-mono text-brand-gold uppercase tracking-[0.3em] font-extrabold block">
            Personalized Expert Care Layers
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-black uppercase text-white mt-1 tracking-tight">
            👩🏽‍⚕️ Consultation Hub
          </h2>
          <p className="text-xs text-white/50 max-w-2xl font-light font-sans mt-3 leading-relaxed">
            Personalized Expert Guidance for Deep Wellness Support. Bridge education, community learning, and real professional care support ensuring you are never alone on your healing journey.
          </p>
        </div>
      </div>

      {/* Dynamic Smart Recommendation Engine Panel */}
      <div className="bg-gradient-to-r from-[#D4AF37]/10 to-transparent border border-[#D4AF37]/30 p-5 rounded-none flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-[10px] font-mono uppercase tracking-widest text-[#D4AF37] font-bold">🎯 Smart Recommendation</h3>
          <p className="text-xs text-white/80 mt-1">Based on your recent fertility tracking metrics, a session with a <strong>Fertility Coach</strong> to review ovulation patterns is recommended.</p>
        </div>
        <button
          onClick={() => handleBookSession(experts.find(e => e.id === 'fertility_coach'))}
          className="shrink-0 px-4 py-2 bg-[#D4AF37] text-black text-[9px] font-mono font-black uppercase tracking-widest hover:bg-white transition-colors"
        >
          Schedule Assessment
        </button>
      </div>

      {/* Sub-navigation panel */}
      <div className="flex border-b border-white/10 overflow-x-auto no-scrollbar font-mono text-[10px] uppercase tracking-widest bg-white/[0.02] p-1">
        {[
          { id: 'upcoming', label: '📅 Upcoming & Pending', count: upcomingAppointments.length },
          { id: 'experts', label: '🧑🏽‍⚕️ Available Experts', count: experts.length },
          { id: 'history', label: '📍 Consultation History', count: pastHistory.length },
          { id: 'notes', label: '📝 Session Notes', count: sessionNotes.length },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 whitespace-nowrap transition-all border-b-2 flex items-center gap-2 ${
              activeTab === tab.id 
                ? 'border-[#D4AF37] text-[#D4AF37] font-bold bg-[#D4AF37]/5' 
                : 'border-transparent text-white/40 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`px-1.5 py-0.5 text-[8px] ${activeTab === tab.id ? 'bg-[#D4AF37] text-black' : 'bg-white/10 text-white/50'}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content Areas */}
      <div className="min-h-[400px]">

        {/* UPCOMING APPOINTMENTS */}
        {activeTab === 'upcoming' && (
          <div className="space-y-6">
            <h3 className="text-xl font-serif font-black tracking-tight text-white uppercase">Your Schedule</h3>
            
            {upcomingAppointments.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-white/10 bg-zinc-950">
                <CalendarCheck className="mx-auto text-white/20 mb-3" size={24} />
                <p className="font-mono text-[10px] uppercase text-white/50 tracking-wider">No active bookings.</p>
                <button onClick={() => setActiveTab('experts')} className="mt-4 text-[#D4AF37] underline text-xs">Browse Available Experts</button>
              </div>
            ) : (
              <div className="grid gap-4">
                {upcomingAppointments.map((app) => (
                  <div key={app.id} className="bg-zinc-950 p-5 border border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group hover:border-[#D4AF37]/50 transition-colors">
                    <div className="space-y-1">
                      <div className="text-[10px] font-mono text-[#D4AF37] uppercase tracking-widest">{app.type}</div>
                      <h4 className="text-lg font-bold text-white">{app.expert}</h4>
                      <div className="flex items-center gap-4 text-xs text-white/60">
                        <span className="flex items-center gap-1"><CalendarCheck size={12} /> {app.date}</span>
                        <span className="flex items-center gap-1"><Clock size={12} /> {app.time}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 w-full md:w-auto">
                      <button onClick={() => triggerToast("Initializing secure video bridge...")} className="flex-1 md:flex-none px-4 py-2 bg-[#D4AF37] text-black font-mono text-[10px] uppercase tracking-widest font-bold hover:bg-white transition-colors flex items-center justify-center gap-2">
                        <Video size={14} /> Join Session
                      </button>
                      <button onClick={() => triggerToast("Rescheduling request submitted.")} className="px-3 py-2 bg-white/5 border border-white/10 text-white/80 hover:text-white font-mono text-[10px] uppercase tracking-widest font-bold">
                        Reschedule
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* EXPERTS */}
        {activeTab === 'experts' && (
          <div className="space-y-6">
            <h3 className="text-xl font-serif font-black tracking-tight text-white uppercase flex items-center gap-2 justify-between">
              Professional Wellness Team
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {experts.map(expert => {
                const Icon = expert.icon;
                return (
                  <div key={expert.id} className="bg-zinc-950 border border-white/5 p-6 hover:border-[#D4AF37]/30 transition-colors">
                    <div className="flex gap-4 items-start">
                      <div className="w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                        <Icon size={24} className="text-[#D4AF37]" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-white">{expert.name}</h4>
                        <div className="text-[10px] font-mono text-[#D4AF37] uppercase tracking-widest">{expert.title}</div>
                        <div className="flex items-center gap-1 mt-1 text-[10px] text-white/50">
                          <Star size={10} className="fill-[#D4AF37] text-[#D4AF37]" /> {expert.rating} ({expert.reviews} reviews)
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 mb-5">
                      <div className="text-[9px] font-mono uppercase text-white/40 mb-2">Focus Areas:</div>
                      <div className="flex flex-wrap gap-1.5">
                        {expert.focus.map((f, i) => (
                          <span key={i} className="px-2 py-1 bg-white/5 border border-white/10 text-[9px] text-white/70">
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-3 pt-4 border-t border-white/5">
                      <div className="text-[10px] text-white/50 flex items-center gap-1">
                        <Clock size={12} className="text-emerald-400" /> {expert.availability}
                      </div>
                      <button
                        onClick={() => handleBookSession(expert)}
                        className="w-full py-2.5 bg-white/5 hover:bg-[#D4AF37] border border-white/10 hover:border-[#D4AF37] text-white hover:text-black font-mono text-[10px] uppercase font-black tracking-widest transition-colors flex items-center justify-center gap-2"
                      >
                        <CalendarCheck size={14} /> Book Private Session
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* HISTORY */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <h3 className="text-xl font-serif font-black tracking-tight text-white uppercase">Consultation History</h3>
            <div className="grid gap-3">
              {pastHistory.map((hist) => (
                <div key={hist.id} className="bg-zinc-950 p-4 border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <div className="text-[10px] font-mono text-[#D4AF37] uppercase tracking-widest">{hist.date}</div>
                    <h4 className="text-md font-bold text-white mt-1">{hist.expert}</h4>
                    <span className="text-xs text-white/50">{hist.type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-[9px] font-mono uppercase border border-emerald-500/20 mr-2">
                      {hist.status}
                    </span>
                    <button onClick={() => setActiveTab('notes')} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-[9px] font-mono text-white uppercase border border-white/10">
                      View Notes
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* NOTES */}
        {activeTab === 'notes' && (
          <div className="space-y-6">
            <h3 className="text-xl font-serif font-black tracking-tight text-white uppercase">📝 Session Notes</h3>
            <div className="grid gap-6">
              {sessionNotes.map((note) => (
                <div key={note.id} className="bg-zinc-950 border border-white/10 p-6 space-y-4 relative">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#D4AF37]" />
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-lg font-bold text-white">{note.title}</h4>
                      <p className="text-[10px] font-mono text-[#D4AF37] uppercase mt-1">With {note.expert} • {note.date}</p>
                    </div>
                    <button onClick={() => triggerToast("Exporting notes to PDF...")} className="text-white/40 hover:text-white"><FileText size={16} /></button>
                  </div>
                  
                  <div className="space-y-2">
                    <h5 className="text-xs font-bold text-white/70 uppercase tracking-wider">Summary</h5>
                    <p className="text-sm text-white/90 leading-relaxed bg-[#111] p-3 border border-white/5">{note.summary}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <h5 className="text-xs font-bold text-white/70 uppercase tracking-wider">Action Steps</h5>
                    <ul className="space-y-1">
                      {note.actionSteps.map((step, idx) => (
                        <li key={idx} className="text-sm text-white/80 flex items-start gap-2">
                          <ChevronRight size={14} className="text-[#D4AF37] shrink-0 mt-0.5" /> {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {showBookingModal && selectedExpert && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-lg bg-zinc-950 border border-[#D4AF37]/50 p-6 space-y-5 text-left relative"
            >
              <button
                onClick={() => setShowBookingModal(false)}
                className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
              >
                ✕
              </button>
              
              <div>
                <h3 className="text-lg font-serif font-black uppercase tracking-widest text-[#D4AF37]">Schedule Session</h3>
                <p className="text-xs text-white/50">{selectedExpert.name} • {selectedExpert.title}</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-white/60">Select Focus Area</label>
                  <select className="w-full bg-[#111] border border-white/10 p-2.5 text-xs text-white outline-none focus:border-[#D4AF37] appearance-none cursor-pointer">
                    {selectedExpert.focus.map((f: string, i: number) => (
                      <option key={i} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-white/60">Preferred Date & Time</label>
                  <input type="datetime-local" className="w-full bg-[#111] border border-white/10 p-2 text-xs text-white outline-none focus:border-[#D4AF37]" />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-white/60">Pre-Session Notes (Optional)</label>
                  <textarea 
                    placeholder="Briefly describe what you'd like to focus on..." 
                    className="w-full bg-[#111] border border-white/10 p-2.5 text-xs text-white h-24 resize-none outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>
              
              <div className="pt-2">
                <button
                  onClick={() => {
                    triggerToast("Booking request confirmed! Confirmation sent to your inbox.");
                    setShowBookingModal(false);
                  }}
                  className="w-full bg-[#D4AF37] hover:bg-white text-black font-mono text-[10px] font-black uppercase tracking-widest py-3 transition-colors"
                >
                  Confirm Booking
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
