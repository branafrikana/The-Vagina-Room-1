import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Users, 
  MapPin, 
  Check, 
  Sparkles, 
  Clock, 
  AlertCircle,
  Video,
  Play,
  Share2,
  Download,
  BellRing,
  Filter,
  ChevronLeft,
  ChevronRight,
  X,
  Search,
  CheckCircle2,
  Bookmark,
  CalendarDays,
  Heart,
  Volume2,
  VolumeX,
  Maximize2,
  FileText,
  MessageSquare,
  BookmarkCheck,
  Send,
  HelpCircle,
  Clock3,
  Info,
  Award,
  FileSignature
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

// Define core interfaces
interface EventItem {
  id: string;
  title: string;
  description: string;
  date: string; // "June 18, 2026"
  isoDate: string; // "2026-06-18"
  time: string;
  type: 'virtual' | 'physical' | 'hybrid';
  category: 'webinar' | 'masterclass' | 'therapy' | 'support' | 'physical' | string;
  location: string;
  hosts: string[];
  image: string;
  capacity: number;
  rsvpsCount: number;
  zoomLink?: string;
  isFeatured?: boolean;
}

interface ReplayItem {
  id: string;
  title: string;
  category: string;
  duration: string;
  date: string;
  speaker: string;
  image: string;
  description: string;
  views: number;
  youtubeId?: string; // or simulated player source
  videoUrl?: string;
  materials: { title: string; type: string }[];
}

export default function MemberEvents() {
  const { user, userData } = useAuth();
  
  // Navigation within Events module
  const [activeTab, setActiveTab] = useState<'upcoming' | 'calendar' | 'rsvp-manager' | 'replays' | 'notes' | 'certificates'>('upcoming');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // State for user interactions
  const [rsvpedEvents, setRsvpedEvents] = useState<string[]>([]);
  const [waitlistedEvents, setWaitlistedEvents] = useState<string[]>([]);
  const [favoriteReplays, setFavoriteReplays] = useState<string[]>([]);
  const [pastAttendanceHistory, setPastAttendanceHistory] = useState([
    { id: 'past-1', title: 'Yoni Steam Science Foundations', date: 'April 14, 2026', host: 'Dr. FID', status: 'Attended' },
    { id: 'past-2', title: 'Sacred Pelvic Alignment Summit', date: 'May 02, 2026', host: 'Amina Bello', status: 'Attended' },
    { id: 'past-3', title: 'Breath Control for Endometriosis Care', date: 'May 19, 2026', host: 'Onyeaka Nkem', status: 'No Show' }
  ]);

  // Calendar specific states (June 2026 focus)
  const [calendarView, setCalendarView] = useState<'month' | 'week'>('month');
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState<number>(5); // June is 5 (0-indexed)
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<number | null>(null);

  // Reminders configurations states
  const [activeReminderEvent, setActiveReminderEvent] = useState<EventItem | null>(null);
  const [reminderChannel, setReminderChannel] = useState<'whatsapp' | 'email' | 'both'>('whatsapp');
  const [reminderTimeframe, setReminderTimeframe] = useState<string>('24h');

  // Video Replay modal
  const [activeReplayVideo, setActiveReplayVideo] = useState<ReplayItem | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [videoProgress, setVideoProgress] = useState<number>(12);
  const [replayComments, setReplayComments] = useState<{ author: string; text: string; time: string }[]>([
    { author: "Ebele S.", text: "This was absolutely transformative, the botanical steam guides are so precise.", time: "2 days ago" },
    { author: "Chioma O.", text: "Perfect timing! Dr. FID answered exactly what I had trouble with.", time: "1 week ago" }
  ]);
  const [newCommentText, setNewCommentText] = useState<string>('');

  // Toast notification state
  const [showToast, setShowToast] = useState<string>('');

  // Primary live event list from Firestore
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const q = query(collection(db, 'events'));
        const snapshot = await getDocs(q);
        const evts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EventItem));
        setEvents(evts);
      } catch (e) {
        console.error("Failed to load events", e);
      } finally {
        setLoadingEvents(false);
      }
    };
    fetchEvents();
  }, []);

  // Replay archive from Resource Library
  const [replays, setReplays] = useState<any[]>([]);

  useEffect(() => {
    const fetchReplays = async () => {
      try {
        const q = query(collection(db, 'resource_library'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        const fetchedReplays = snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })).filter((item: any) => item.type === 'video').map((item: any) => ({
          id: item.id,
          title: item.title,
          category: item.category,
          duration: item.duration || 'Unknown duration',
          date: item.createdAt ? new Date(item.createdAt.seconds * 1000).toLocaleDateString() : 'Recent',
          speaker: item.author,
          image: item.thumbnail || 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=600',
          description: item.description,
          views: Math.floor(Math.random() * 500) + 100, // Synthetic view count
          materials: item.highlights ? item.highlights.map((h: string) => ({ title: h, type: 'Highlight' })) : [],
          videoUrl: item.url
        }));
        setReplays(fetchedReplays);
      } catch (err) {
        console.error("Failed to load replays from resource_library:", err);
      }
    };
    fetchReplays();
  }, []);

  // Live countdown generation (for evt-1: June 18, 2026)
  const [countdown, setCountdown] = useState({ days: 10, hours: 21, minutes: 44 });

  useEffect(() => {
    // Basic tick to make UI feel live
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59 };
        } else if (prev.days > 0) {
          return { days: prev.days - 1, hours: 23, minutes: 59 };
        }
        return prev;
      });
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Fetch RSVPs and waitlist from localstorage
  useEffect(() => {
    if (!user?.uid) return;
    const rsvpKey = `tvr_rsvp_${user.uid}`;
    const waitlistKey = `tvr_waitlist_${user.uid}`;
    
    const savedRsvp = localStorage.getItem(rsvpKey);
    if (savedRsvp) {
      try { setRsvpedEvents(JSON.parse(savedRsvp)); } catch (_) {}
    }
    const savedWaitlist = localStorage.getItem(waitlistKey);
    if (savedWaitlist) {
      try { setWaitlistedEvents(JSON.parse(savedWaitlist)); } catch (_) {}
    }
  }, [user]);

  const triggerToastNotice = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(''), 4000);
  };

  // Toggle RSVPs or Waitlist allocation
  const handleToggleRsvp = (event: EventItem) => {
    if (!user?.uid) {
      triggerToastNotice("🚨 Authenticated session node is required to RSVP.");
      return;
    }

    // CHECK IF SUBSCRIPTION IS ACTIVE/VALID AND HASN'T EXPIRED
    if (userData && userData.membershipExpiration) {
      const expirationDate = new Date(userData.membershipExpiration);
      const now = new Date();
      if (expirationDate < now) {
         triggerToastNotice("🚨 Your membership subscription has expired. Please renew your plan to RSVP for community events.");
         return;
      }
      
      // Also check if the event date is after the expiration date
      if (event.isoDate) {
        const eventDate = new Date(event.isoDate);
        if (eventDate > expirationDate) {
          triggerToastNotice("🚨 This event takes place after your current subscription registration valid duration. Please renew or upgrade your plan to register.");
          return;
        }
      }
    }
    
    const rsvpKey = `tvr_rsvp_${user.uid}`;
    const waitlistKey = `tvr_waitlist_${user.uid}`;
    
    const isCurrentlyRsvped = rsvpedEvents.includes(event.id);
    const isCurrentlyWaitlisted = waitlistedEvents.includes(event.id);
    const isAtCapacity = event.rsvpsCount >= event.capacity;

    let updatedRsvps = [...rsvpedEvents];
    let updatedWaitlist = [...waitlistedEvents];

    if (isCurrentlyRsvped) {
      // Cancel registration
      updatedRsvps = updatedRsvps.filter(id => id !== event.id);
      setRsvpedEvents(updatedRsvps);
      localStorage.setItem(rsvpKey, JSON.stringify(updatedRsvps));
      
      // Update local history
      setPastAttendanceHistory([
        { id: Math.random().toString(), title: event.title, date: event.date, host: event.hosts[0], status: 'Canceled RSVP' },
        ...pastAttendanceHistory
      ]);
      triggerToastNotice(`🗑️ RSVP canceled for "${event.title}". Spot is returned to sister reserves.`);
    } else if (isCurrentlyWaitlisted) {
      // Cancel waitlist
      updatedWaitlist = updatedWaitlist.filter(id => id !== event.id);
      setWaitlistedEvents(updatedWaitlist);
      localStorage.setItem(waitlistKey, JSON.stringify(updatedWaitlist));
      triggerToastNotice(`🗑️ Waitlist registration withdrawn for "${event.title}".`);
    } else {
      // Register
      if (isAtCapacity) {
        // Put in waitlist
        updatedWaitlist.push(event.id);
        setWaitlistedEvents(updatedWaitlist);
        localStorage.setItem(waitlistKey, JSON.stringify(updatedWaitlist));
        triggerToastNotice(`⏳ Standard seating limit reached. Placed in waitlist rank #${event.rsvpsCount - event.capacity + 1}`);
      } else {
        // Standard RSVP
        updatedRsvps.push(event.id);
        setRsvpedEvents(updatedRsvps);
        localStorage.setItem(rsvpKey, JSON.stringify(updatedRsvps));
        
        // Auto-add to past history as booking
        setPastAttendanceHistory([
          { id: Math.random().toString(), title: event.title, date: event.date, host: event.hosts[0], status: 'Confirmed RSVP Booked' },
          ...pastAttendanceHistory
        ]);
        triggerToastNotice(`🥳 Spot successfully reserved for "${event.title}"! Encryption key generated.`);
      }
    }
  };

  // Generate iCal ICS content for accurate client-side calendar save
  const handleSaveToCalendar = (event: EventItem) => {
    // Generate clean .ics format
    const startIso = event.isoDate.replace(/-/g, '') + 'T180000Z'; // fallback standard time 
    const endIso = event.isoDate.replace(/-/g, '') + 'T200000Z';
    
    const icsContent = 
      "BEGIN:VCALENDAR\n" +
      "VERSION:2.0\n" +
      "PRODID:-//The Vagina Room//Event Booking//EN\n" +
      "BEGIN:VEVENT\n" +
      `UID:${event.id}@thevaginaroom.com\n` +
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z\n` +
      `DTSTART:${startIso}\n` +
      `DTEND:${endIso}\n` +
      `SUMMARY:${event.title}\n` +
      `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}\n` +
      `LOCATION:${event.location}\n` +
      "END:VEVENT\n" +
      "END:VCALENDAR";

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `VaginaRoom_Event_${event.id}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToastNotice("📥 Calendar file ICS exported to offline organizer.");
  };

  // Manage WhatsApp Reminder Sync Link Trigger
  const handleLaunchReminderSync = () => {
    if (!activeReminderEvent) return;
    
    // In compliance with generalSettingsJson whatsapp rules from rules:
    // Prefilled whatsapp message sending
    const message = encodeURIComponent(
      `Hello Community Team, I would like to request active notification dispatch sync on WhatsApp for the upcoming gathering:\n\n` +
      `📋 Event ID: ${activeReminderEvent.id}\n` +
      `🌸 Title: ${activeReminderEvent.title}\n` +
      `📆 Date: ${activeReminderEvent.date}\n` +
      `📍 Mode: ${activeReminderEvent.type.toUpperCase()}\n\n` +
      `Please register my phone channel for real-time ping loops. Thank you!`
    );
    
    // Fallback support phone from the vagina room configuration
    const communityAdminPhone = "+2348123456789"; // sample fallback matching nigerian presence
    const whatsappUrl = `https://wa.me/${communityAdminPhone}?text=${message}`;
    
    window.open(whatsappUrl, '_blank');
    triggerToastNotice(`💬 WhatsApp liaison protocol initiated! Reminder synced to: ${reminderChannel}`);
    setActiveReminderEvent(null);
  };

  // Switch calendar month offset
  const handleCalendarMonthChange = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentCalendarMonth(prev => (prev === 0 ? 11 : prev - 1));
    } else {
      setCurrentCalendarMonth(prev => (prev === 11 ? 0 : prev + 1));
    }
    setSelectedCalendarDay(null);
  };

  // June 2026 Monthly Grid Builder logic
  // June 1 2026 is a Monday. Days: 30 days. Offset starts at index 0 (if calendar grid starts on Monday) or 1 (if starting Sunday).
  const buildCalendarGrid = () => {
    const isJune = currentCalendarMonth === 5;
    const isJuly = currentCalendarMonth === 6;
    
    let daysCount = 30;
    let startOffsetOnMondayIndex = 0; // June 1, 2026 is Monday (index 0 for Mon-Sun grid)
    
    if (isJuly) {
      daysCount = 31;
      startOffsetOnMondayIndex = 2; // July 1, 2026 is Wednesday
    } else if (!isJune && !isJuly) {
      // General fallbacks if navigation toggled
      daysCount = 28;
      startOffsetOnMondayIndex = 3;
    }

    const grid = [];
    // Pad initial offsets empty days
    for (let i = 0; i < startOffsetOnMondayIndex; i++) {
      grid.push({ dayNumber: null, isCurrentMonth: false, dateString: '' });
    }

    // Populate actual days
    for (let day = 1; day <= daysCount; day++) {
      const monthStr = String(currentCalendarMonth + 1).padStart(2, '0');
      const dayStr = String(day).padStart(2, '0');
      const dateString = `2026-${monthStr}-${dayStr}`;
      grid.push({ dayNumber: day, isCurrentMonth: true, dateString });
    }

    return grid;
  };

  const calendarGrid = buildCalendarGrid();
  const currentMonthName = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][currentCalendarMonth] + " 2026";

  // Filter Events by category and search
  const filteredEvents = events.filter(event => {
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          event.hosts.some(h => h.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Handle Comment Submission on replays
  const submitReplayComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    setReplayComments([
      ...replayComments,
      {
        author: user?.email ? user.email.split('@')[0].toUpperCase() : "SISTER NODE",
        text: newCommentText,
        time: "Just now"
      }
    ]);
    setNewCommentText('');
    triggerToastNotice("💬 Comments synchronized on the physical archive thread.");
  };

  return (
    <div className="space-y-8 font-sans text-white text-left relative">
      
      {/* Dynamic Toast System */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -30, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -30, x: "-50%" }}
            className="fixed top-6 left-1/2 z-[999] bg-[#0c0a0a] border border-[#D4AF37] px-5 py-3 text-brand-gold font-mono text-[9px] uppercase tracking-widest font-bold flex items-center gap-2 shadow-2xl"
          >
            <Sparkles size={12} className="animate-spin text-[#D4AF37]" strokeWidth={2.5} />
            <span>{showToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Top Header Block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-5 gap-4">
        <div>
          <span className="text-[9px] font-mono text-[#D4AF37] uppercase tracking-[0.3em] font-extrabold block">LIVE EXPERIENCES & GATHERINGS</span>
          <h1 className="text-2xl font-serif font-black tracking-tight text-white uppercase mt-1">
            📅 Events Center
          </h1>
          <p className="text-xs text-white/40 mt-1 max-w-xl font-light font-sans">
            Real-time learning, healing, and connection experiences through structured events designed to educate, support, and transform.
          </p>
        </div>

        {/* Quick Action Buttons Header */}
        <div className="flex flex-wrap gap-2">
          <button 
            type="button"
            onClick={() => {
              setActiveTab('upcoming');
              setSelectedCategory('all');
              triggerToastNotice("Showcasing all live assemblies");
            }}
            className="px-3.5 py-1.5 bg-black/60 hover:bg-white/[0.05] border border-white/10 hover:border-[#D4AF37] text-white/80 hover:text-white font-mono text-[8.5px] uppercase tracking-widest font-black transition-all"
          >
            All Events
          </button>
          
          <button 
            type="button"
            onClick={() => {
              setActiveTab('replays');
              triggerToastNotice("Loading recorded masterclasses vault...");
            }}
            className="px-3.5 py-1.5 bg-black/60 hover:bg-white/[0.05] border border-[#D4AF37]/30 hover:border-[#D4AF37] text-brand-gold font-mono text-[8.5px] uppercase tracking-widest font-black transition-all flex items-center gap-1.5"
          >
            <Play size={10} className="fill-brand-gold shrink-0" /> Playback Vault
          </button>
        </div>
      </div>

      {/* Sub-navigation panel */}
      <div className="flex border-b border-white/10 overflow-x-auto no-scrollbar font-mono text-[10px] uppercase tracking-widest bg-white/[0.02] p-1">
        {[
          { id: 'upcoming', label: '🌟 Upcoming Events', count: events.length },
          { id: 'calendar', label: '📆 Event Calendar', count: 'GRID' },
          { id: 'rsvp-manager', label: '✅ RSVP Hub', count: rsvpedEvents.length },
          { id: 'replays', label: '🎥 Recorded Replays', count: replays.length },
          { id: 'notes', label: '📝 Event Notes', count: 0 },
          { id: 'certificates', label: '🏆 Certificates', count: pastAttendanceHistory.filter(h => h.status === 'Attended').length },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as any);
              triggerToastNotice(`Switched section to: ${tab.label.split(' ')[1]}`);
            }}
            className={`px-5 py-3 transition-all font-bold shrink-0 flex items-center gap-2 border-b-2 ${
              activeTab === tab.id 
                ? 'border-[#D4AF37] text-[#D4AF37] bg-white/[0.02]' 
                : 'border-transparent text-white/50 hover:text-white hover:bg-white/[0.01]'
            }`}
          >
            <span>{tab.label}</span>
            <span className="text-[7.5px] px-1.5 py-0.5 bg-black text-white/40 block font-normal leading-normal">
              {tab.id === 'upcoming' ? filteredEvents.length : tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* RENDER VIEW 1: UPCOMING GATHERINGS */}
      {activeTab === 'upcoming' && (
        <div className="space-y-6">
          
          {/* Main Headliner Live Count Down Node */}
          <div className="relative p-6 sm:p-8 bg-gradient-to-br from-zinc-950 via-[#110f0f] to-black border border-[#D4AF37]/20 rounded-sm overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#D4AF37]/[0.02] blur-3xl pointer-events-none rounded-full" />
            
            <div className="relative z-10 flex flex-col xl:flex-row items-stretch justify-between gap-6">
              <div className="space-y-3 flex-1">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#D4AF37] font-mono text-[8.5px] uppercase font-bold tracking-widest rounded-sm">
                  <Sparkles size={10} className="animate-spin text-[#D4AF37]" /> Signature Live Council
                </span>
                <h3 className="text-xl sm:text-2xl font-serif font-black uppercase text-white tracking-tight leading-snug">
                  Womb Alchemy & Reproductive restoration circle <span className="text-[#D4AF37] italic font-light">Part II</span>
                </h3>
                <p className="text-xs text-white/60 leading-relaxed font-sans font-light max-w-2xl">
                  Connect globally for our monthly deep somatic sync led by Dr. FID and guest experts. We analyze cell membrane restoration, pelvic steam compress placement, and hormone rhythms.
                </p>
                
                <div className="flex flex-wrap items-center gap-4 text-[10px] font-mono uppercase tracking-widest text-white/40 pt-2">
                  <span className="flex items-center gap-1.5 text-brand-gold font-bold">
                    <CalendarDays size={12} /> June 18, 2026
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5 text-white/70">
                    <Clock3 size={12} /> 6:00 PM - 8:00 PM EST
                  </span>
                  <span>•</span>
                  <span className="text-[#D4AF37] bg-white/5 px-2 py-0.5 border border-white/5">
                    124 OF 150 SECURED
                  </span>
                </div>
              </div>

              {/* Live Remaining Countdown Tile */}
              <div className="bg-black/95 border border-white/10 p-5 rounded-none flex flex-col justify-center items-center text-center min-w-[260px] relative overflow-hidden shrink-0">
                <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-[#D4AF37]/5 blur-lg rounded-full" />
                <span className="text-[8px] font-mono uppercase text-white/30 tracking-widest mb-3 block">🕒 LEDGER COUNTDOWN TO COMMENCEMENT</span>
                
                <div className="flex items-center gap-3">
                  <div>
                    <span className="font-mono text-2xl font-black text-[#D4AF37] block bg-white/[0.02] p-1 border border-white/5">{String(countdown.days).padStart(2, '0')}</span>
                    <span className="text-[7px]_uppercase tracking-widest text-white/40 font-mono block mt-1">DAYS</span>
                  </div>
                  <span className="font-mono text-[#D4AF37] font-semibold text-lg">:</span>
                  <div>
                    <span className="font-mono text-2xl font-black text-[#D4AF37] block bg-white/[0.02] p-1 border border-white/5">{String(countdown.hours).padStart(2, '0')}</span>
                    <span className="text-[7px]_uppercase tracking-widest text-white/40 font-mono block mt-1">HOURS</span>
                  </div>
                  <span className="font-mono text-[#D4AF37] font-semibold text-lg">:</span>
                  <div>
                    <span className="font-mono text-2xl font-black text-[#D4AF37] block bg-white/[0.02] p-1 border border-white/5">{String(countdown.minutes).padStart(2, '0')}</span>
                    <span className="text-[7px]_uppercase tracking-widest text-white/40 font-mono block mt-1">MINS</span>
                  </div>
                </div>

                <div className="mt-4 w-full flex gap-2">
                  <button
                    onClick={() => events.length > 0 && handleToggleRsvp(events[0])}
                    className="flex-1 px-3 py-2 bg-[#D4AF37] hover:bg-white text-black transition-colors font-mono text-[9px] uppercase tracking-wider font-extrabold"
                  >
                    {events.length > 0 && rsvpedEvents.includes(events[0].id) ? 'RESERVED ✓' : 'SECURE MY PASS'}
                  </button>
                  <button
                    onClick={() => events.length > 0 && handleSaveToCalendar(events[0])}
                    title="Export ICS Calendar file"
                    className="p-2 border border-white/10 hover:border-[#D4AF37] text-white hover:text-brand-gold transition-colors"
                  >
                    <Download size={12} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Filtering Control Bar */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-white/[0.01] p-4 border border-white/5 rounded-none">
            
            {/* Category Select Toggles */}
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'all', label: 'All Gatherings' },
                { id: 'webinar', label: 'Webinars' },
                { id: 'masterclass', label: 'Masterclasses' },
                { id: 'therapy', label: 'Therapy Sessions' },
                { id: 'support', label: 'Support Groups' },
                { id: 'physical', label: 'Physical Events' },
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    triggerToastNotice(`Filter: ${cat.label}`);
                  }}
                  className={`px-3 py-1.5 font-mono text-[8.5px] uppercase tracking-wider transition-colors ${
                    selectedCategory === cat.id 
                      ? 'bg-[#D4AF37] text-black font-extrabold' 
                      : 'bg-black/60 text-white/60 hover:text-white border border-white/10'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Keyword Search Input */}
            <div className="relative w-full md:w-64">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search events, hosts or topics..."
                className="w-full bg-black/60 border border-white/10 focus:border-[#D4AF37] p-2 pl-8 font-mono text-[10px] text-white outline-none rounded-none"
              />
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/40" size={12} />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')} 
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                >
                  <X size={10} />
                </button>
              )}
            </div>

          </div>

          {/* Core Event Grid Listing */}
          <div className="space-y-6">
            {filteredEvents.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-white/10">
                <AlertCircle className="mx-auto text-white/20 mb-3" size={24} />
                <p className="font-mono text-[10px] uppercase text-white/50 tracking-wider">No matching active gatherings found.</p>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchTerm('');
                  }}
                  className="mt-3 text-[9px] font-mono uppercase text-brand-gold underline hover:text-white"
                >
                  Reset parameters list
                </button>
              </div>
            ) : (
              filteredEvents.map((evt, idx) => {
                const isRsvped = rsvpedEvents.includes(evt.id);
                const isWaitlisted = waitlistedEvents.includes(evt.id);
                const isAtCapacity = evt.rsvpsCount >= evt.capacity;
                
                return (
                  <motion.div
                    key={evt.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`flex flex-col lg:flex-row bg-[#110f0f] border ${
                      evt.isFeatured ? 'border-[#D4AF37]/50 bg-[#141212]' : 'border-white/5 hover:border-white/15'
                    } rounded-none overflow-hidden group transition-all duration-300`}
                  >
                    {/* Event Banner Image Overlay */}
                    <div className="lg:w-48 xl:w-56 h-44 lg:h-auto overflow-hidden relative shrink-0 bg-zinc-900 border-b lg:border-b-0 lg:border-r border-white/5">
                      <div className="absolute inset-0 bg-black/50 group-hover:bg-black/25 transition-colors duration-300 z-10" />
                      <img 
                        src={evt.image} 
                        alt={evt.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute top-3 left-3 z-20 px-2 py-0.5 text-[8px] font-mono font-black uppercase tracking-widest bg-black border border-[#D4AF37]/30 text-brand-gold">
                        {evt.type}
                      </span>
                      {isRsvped && (
                        <span className="absolute bottom-3 left-3 z-20 px-2 py-0.5 text-[8px] font-mono font-black uppercase tracking-widest bg-emerald-500/90 text-white rounded-sm flex items-center gap-1">
                          <Check size={8} strokeWidth={3} /> RESERVED
                        </span>
                      )}
                      {isWaitlisted && (
                        <span className="absolute bottom-3 left-3 z-20 px-2 py-0.5 text-[8px] font-mono font-black uppercase tracking-widest bg-amber-500/90 text-white rounded-sm flex items-center gap-1">
                          <Clock size={8} strokeWidth={3} /> WAITLISTED
                        </span>
                      )}
                    </div>

                    {/* Event Copy Details */}
                    <div className="p-6 flex-1 flex flex-col justify-between gap-4 text-left">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-3 text-[9px] font-mono uppercase tracking-widest text-[#D4AF37]">
                          <span className="font-extrabold pr-2 border-r border-white/10 uppercase tracking-widest">
                            ⚡ {evt.category}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <CalendarDays size={11} /> {evt.date}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1.5 text-white/60">
                            <Clock size={11} /> {evt.time}
                          </span>
                        </div>

                        <h4 className="text-md font-serif font-black uppercase tracking-tight text-white group-hover:text-brand-gold transition-colors leading-snug">
                          {evt.title}
                        </h4>

                        <p className="text-[11px] text-white/50 leading-relaxed font-sans font-light">
                          {evt.description}
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pt-4 border-t border-white/5 text-xs">
                        
                        <div className="space-y-1 font-mono text-[9px]">
                          <span className="text-white/30 uppercase block font-medium">COORDINATORS</span>
                          <p className="font-bold text-white/90 uppercase tracking-wider">{evt.hosts.join(' & ')}</p>
                          <p className="text-white/40 flex items-center gap-1 mt-0.5 lowercase tracking-normal">
                            <MapPin size={11} className="text-[#D4AF37]" /> {evt.location}
                          </p>
                        </div>

                        {/* Interactive Buttons Container */}
                        <div className="flex gap-2 w-full sm:w-auto shrink-0 font-mono text-[8.5px] uppercase tracking-widest font-black">
                          
                          {/* Calendar reminder setup */}
                          <button
                            type="button"
                            onClick={() => {
                              setActiveReminderEvent(evt);
                              triggerToastNotice(`Adjusting alerts for "${evt.title}"`);
                            }}
                            className="px-3 py-2 bg-[#1c1a1a] hover:bg-white/[0.05] border border-white/5 hover:border-white/20 text-white/70 hover:text-white transition-colors"
                            title="Configure Notifications"
                          >
                            <BellRing size={12} />
                          </button>

                          {/* Calendar ICS Download */}
                          <button
                            type="button"
                            onClick={() => handleSaveToCalendar(evt)}
                            className="px-3 py-2 bg-[#1c1a1a] hover:bg-white/[0.05] border border-white/5 hover:border-white/20 text-white/70 hover:text-white transition-colors"
                            title="Export Calendar Ticket (.ics)"
                          >
                            <Download size={12} />
                          </button>

                          {/* Main RSVP / Queue Join trigger */}
                          <button
                            type="button"
                            onClick={() => handleToggleRsvp(evt)}
                            className={`flex-1 sm:flex-none px-5 py-2.5 transition-all text-center leading-none ${
                              isRsvped 
                                ? 'bg-red-500/15 border border-red-500/40 hover:bg-red-500/30 text-red-300' 
                                : isWaitlisted 
                                ? 'bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-300'
                                : isAtCapacity 
                                ? 'bg-[#D4AF37]/15 border border-[#D4AF37] hover:bg-[#D4AF37]/30 text-brand-gold font-black'
                                : 'bg-brand-gold hover:bg-white text-black font-black'
                            }`}
                          >
                            {isRsvped && 'CANCEL RESERVATION ✘'}
                            {isWaitlisted && 'WITHDRAW WAITLIST ✕'}
                            {!isRsvped && !isWaitlisted && isAtCapacity && 'JOIN SEATING WAITLIST ⏳'}
                            {!isRsvped && !isWaitlisted && !isAtCapacity && 'CONFIRM ATTENDANCE'}
                          </button>

                        </div>

                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

        </div>
      )}


      {/* RENDER VIEW 2: EVENT CALENDAR */}
      {activeTab === 'calendar' && (
        <div className="space-y-6">
          <div className="bg-[#110f0f] border border-white/5 p-6 rounded-none text-left space-y-6">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/5 pb-4 gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleCalendarMonthChange('prev')}
                  className="p-2 border border-white/10 hover:border-brand-gold text-white hover:text-brand-gold transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <h3 className="text-md font-serif font-black uppercase text-white tracking-widest font-mono min-w-[130px] text-center">
                  {currentMonthName}
                </h3>
                <button
                  onClick={() => handleCalendarMonthChange('next')}
                  className="p-2 border border-white/10 hover:border-brand-gold text-white hover:text-brand-gold transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* View options select and export */}
              <div className="flex bg-black border border-white/10 p-1 font-mono text-[8.5px] uppercase tracking-wider">
                <button
                  onClick={() => {
                    setCalendarView('month');
                    triggerToastNotice("Month View engaged");
                  }}
                  className={`px-3 py-1 font-bold ${
                    calendarView === 'month' ? 'bg-[#D4AF37] text-black' : 'text-white/60 hover:text-white'
                  }`}
                >
                  Month View
                </button>
                <button
                  onClick={() => {
                    setCalendarView('week');
                    triggerToastNotice("Week List agenda engaged");
                  }}
                  className={`px-3 py-1 font-bold ${
                    calendarView === 'week' ? 'bg-[#D4AF37] text-black' : 'text-white/60 hover:text-white'
                  }`}
                >
                  Weekly List
                </button>
              </div>
            </div>

            {calendarView === 'month' ? (
              <div className="space-y-4">
                
                {/* Calendar grid wrapper */}
                <div className="grid grid-cols-7 gap-1 font-mono text-[9px] uppercase tracking-wider text-center border-b border-white/5 pb-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(dayName => (
                    <div key={dayName} className="text-[#D4AF37] font-black py-1">
                      {dayName}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-2 min-h-[300px]">
                  {calendarGrid.map((day, idx) => {
                    const isToday = day.dayNumber === 7 && currentCalendarMonth === 5; // Simulating today June 7 2026
                    
                    // Match events with this specific date
                    const dayEvents = events.filter(evt => evt.isoDate === day.dateString);
                    const hasEvents = dayEvents.length > 0;
                    const isSelected = selectedCalendarDay === day.dayNumber;

                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          if (day.dayNumber) {
                            setSelectedCalendarDay(day.dayNumber);
                            triggerToastNotice(`Checked Date: ${day.dateString}`);
                          }
                        }}
                        className={`p-2 min-h-[64px] border transition-all cursor-pointer flex flex-col justify-between text-left relative ${
                          !day.dayNumber 
                            ? 'bg-transparent border-transparent cursor-not-allowed opacity-15' 
                            : isSelected 
                            ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-white' 
                            : isToday 
                            ? 'bg-zinc-950 border-brand-gold-circle border-[#D4AF37]/50 text-white' 
                            : 'bg-black/60 border-white/5 hover:border-white/10 text-white/80'
                        }`}
                      >
                        <div className="flex justify-between items-center font-mono text-[10px]">
                          <span className={isToday ? "text-[#D4AF37] font-bold underline" : ""}>
                            {day.dayNumber}
                          </span>
                          {isToday && (
                            <span className="text-[6.5px] bg-[#D4AF37]/20 border border-[#D4AF37]/45 text-[#D4AF37] px-1 font-bold tracking-normal rounded-sm">
                              TODAY
                            </span>
                          )}
                        </div>

                        {/* Events Indicators */}
                        {hasEvents && day.dayNumber && (
                          <div className="space-y-0.5 mt-1 relative z-10">
                            {dayEvents.map(evt => {
                              const isAttending = rsvpedEvents.includes(evt.id);
                              return (
                                <div 
                                  key={evt.id}
                                  className={`text-[7px]_uppercase p-1 border truncate font-sans tracking-wide leading-tight ${
                                    isAttending 
                                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                                      : 'bg-brand-gold/15 border-brand-gold/20 text-[#D4AF37]'
                                  }`}
                                  title={evt.title}
                                >
                                  ⚡ {evt.title}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Day Detail Expansion Panel */}
                <div className="mt-4 p-4 bg-zinc-950 border border-white/5 rounded-none text-left text-xs font-sans">
                  {selectedCalendarDay ? (
                    (() => {
                      const selectedDayObj = calendarGrid.find(d => d.dayNumber === selectedCalendarDay);
                      if (!selectedDayObj) return null;
                      
                      const dayEvents = events.filter(evt => evt.isoDate === selectedDayObj.dateString);
                      
                      return (
                        <div className="space-y-3">
                          <h4 className="text-[11px] font-mono text-[#D4AF37] uppercase font-black border-l-2 border-[#D4AF37] pl-2 tracking-widest">
                            📑 SCHEDULED FOR SCHEDULE {selectedDayObj.dateString}
                          </h4>
                          
                          {dayEvents.length === 0 ? (
                            <p className="text-[10px] font-mono text-white/40 uppercase">No community workshops for this index.</p>
                          ) : (
                            <div className="grid grid-cols-1 gap-3">
                              {dayEvents.map(evt => {
                                const isRsvped = rsvpedEvents.includes(evt.id);
                                return (
                                  <div key={evt.id} className="p-3 bg-white/[0.01] border border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                    <div className="space-y-1">
                                      <span className="text-[8.5px] font-mono bg-white/5 border border-white/15 px-1.5 py-0.5 text-white/60 tracking-wider">
                                        {evt.time} ({evt.type})
                                      </span>
                                      <h5 className="font-bold text-white uppercase tracking-tight mt-1">{evt.title}</h5>
                                      <p className="text-[10.5px] text-white/50">{evt.description.slice(0, 110)}...</p>
                                    </div>

                                    <div className="flex gap-2 shrink-0">
                                      <button
                                        onClick={() => handleToggleRsvp(evt)}
                                        className="px-3.5 py-1.5 bg-[#D4AF37] hover:bg-white text-black font-mono text-[8px] uppercase tracking-wider font-extrabold"
                                      >
                                        {isRsvped ? 'CANCEL' : 'BOOK SPOT'}
                                      </button>
                                      <button
                                        onClick={() => handleSaveToCalendar(evt)}
                                        className="p-1 px-2 border border-white/10 hover:border-brand-gold text-white hover:text-brand-gold transition-colors font-mono text-[8px]"
                                      >
                                        ICS
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })()
                  ) : (
                    <p className="text-[10.5px] text-white/40 italic flex items-center gap-1.5">
                      <Info size={12} className="text-[#D4AF37]" /> Select any active grid slot to inspect the scheduled womb work indices.
                    </p>
                  )}
                </div>

              </div>
            ) : (
              // Weekly Schedule View Agenda
              <div className="space-y-4">
                <h4 className="text-[11px] font-mono text-[#D4AF37] uppercase font-bold tracking-widest pl-2 border-l-2 border-[#D4AF37]">
                  🗓️ Current Week Timeline
                </h4>
                
                <div className="space-y-3 font-sans text-xs">
                  {events.map(evt => {
                    const isRsvped = rsvpedEvents.includes(evt.id);
                    return (
                      <div key={evt.id} className="p-4 bg-zinc-950/60 border border-white/5 hover:border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="space-y-1">
                          <span className="font-mono text-[9px] text-[#D4AF37] tracking-widest uppercase font-bold mr-3">
                            {evt.date} • {evt.time}
                          </span>
                          <span className="text-[8px] font-mono border border-[#D4AF37]/30 text-brand-gold bg-black px-1.5 py-0.5 uppercase">
                            {evt.type}
                          </span>
                          <h5 className="font-bold text-white uppercase text-sm mt-1">{evt.title}</h5>
                          <p className="text-[10px] text-white/40">{evt.description}</p>
                        </div>

                        <div className="flex gap-2 w-full sm:w-auto shrink-0 font-mono text-[8px] uppercase tracking-widest leading-none font-bold">
                          <button
                            onClick={() => handleToggleRsvp(evt)}
                            className="flex-1 sm:flex-none px-4 py-2 bg-[#D4AF37] hover:bg-white text-black font-extrabold"
                          >
                            {isRsvped ? 'CANCEL RESERVATION ✘' : 'BOOK PLACE'}
                          </button>
                          <button
                            onClick={() => handleSaveToCalendar(evt)}
                            className="p-2 border border-white/10 hover:border-brand-gold text-white"
                          >
                            ICS
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-white/5 space-y-1 bg-black/40 p-4 font-mono text-[9px] uppercase tracking-wider text-white/50 space-y-2">
              <span className="text-[10px] font-black text-brand-gold block">🔔 REMINDERS AND ALERTS AGENT WARNINGS</span>
              <p className="text-white/40 leading-relaxed font-sans font-light normal-case">
                Ensure your notification configurations inside ⚙️ Profile Manager is calibrated to direct WhatsApp and email nodes to get calendar synchronization updates 24 hours prior to stream start.
              </p>
            </div>

          </div>
        </div>
      )}


      {/* RENDER VIEW 3: RSVP MANAGER HUB */}
      {activeTab === 'rsvp-manager' && (
        <div className="space-y-6">

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans text-xs">
            
            {/* Active RSVPs List Left Column */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-md font-serif font-black uppercase tracking-tight text-white pl-2 border-l-2 border-[#D4AF37]">
                🎫 Active Booking Seat Registrations
              </h3>

              {rsvpedEvents.length === 0 && waitlistedEvents.length === 0 ? (
                <div className="p-12 text-center border border-dashed border-white/5 text-xs font-mono bg-white/[0.01]">
                  <p className="text-white/40 uppercase tracking-wider">No active reservations secured inside the portal ledger.</p>
                  <button
                    onClick={() => {
                      setActiveTab('upcoming');
                      triggerToastNotice("Transited to directory");
                    }}
                    className="mt-4 px-4 py-2 bg-[#D4AF37] hover:bg-white text-black font-black uppercase text-[9px] tracking-widest"
                  >
                    Browse Active directory
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  
                  {/* RSVPs Loop */}
                  {events.filter(e => rsvpedEvents.includes(e.id)).map(evt => (
                    <div key={evt.id} className="p-4 bg-zinc-950 border border-emerald-500/20 hover:border-emerald-500/40 relative">
                      <span className="absolute top-0 right-0 px-2 py-0.5 bg-emerald-500/10 border-l border-b border-emerald-500/30 text-emerald-400 font-mono text-[8px] uppercase tracking-widest font-extrabold rounded-sm">
                        Approved Seat ✓
                      </span>

                      <div className="space-y-2 text-left">
                        <span className="text-[8.5px] font-mono text-white/50 block tracking-widest font-bold uppercase">{evt.date} • {evt.time}</span>
                        <h4 className="text-sm font-bold text-white uppercase">{evt.title}</h4>
                        <p className="text-[10px] text-white/40 font-light">{evt.description.slice(0, 140)}...</p>

                        <div className="pt-3 border-t border-white/5 flex flex-wrap justify-between items-center gap-3">
                          <p className="text-[9.5px] font-mono lowercase tracking-normal text-[#D4AF37] flex items-center gap-1">
                            <Video size={11} /> {evt.zoomLink ? "Zoom credentials provided via profile verification email." : "Awaiting transmission key."}
                          </p>

                          <div className="flex gap-2 font-mono text-[8px] uppercase tracking-widest">
                            {evt.zoomLink && (
                              <a
                                href={evt.zoomLink}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-1.5 bg-emerald-500 text-white font-black hover:bg-emerald-600 transition-colors flex items-center gap-1"
                              >
                                Join Shala Room
                              </a>
                            )}
                            <button
                              onClick={() => handleToggleRsvp(evt)}
                              className="px-3 py-1.5 bg-red-950/20 border border-red-500/20 hover:bg-red-900/40 text-red-400"
                            >
                              Revoke Spot
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Waitlist Loop */}
                  {events.filter(e => waitlistedEvents.includes(e.id)).map(evt => (
                    <div key={evt.id} className="p-4 bg-zinc-950 border border-amber-500/20 hover:border-amber-500/40 relative">
                      <span className="absolute top-0 right-0 px-2 py-0.5 bg-amber-500/10 border-l border-b border-amber-500/30 text-amber-400 font-mono text-[8px] uppercase tracking-widest font-extrabold rounded-sm">
                        Waitlisted Queue ⏳
                      </span>

                      <div className="space-y-2 text-left">
                        <span className="text-[8.5px] font-mono text-white/50 block tracking-widest font-bold uppercase">{evt.date} • {evt.time}</span>
                        <h4 className="text-sm font-bold text-white uppercase">{evt.title}</h4>
                        <p className="text-[10px] text-[#D4AF37]/80">Currently waitlisted. A sister seat release will automatically trigger approval.</p>

                        <div className="pt-3 border-t border-white/5 text-right">
                          <button
                            onClick={() => handleToggleRsvp(evt)}
                            className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/30 text-amber-400 font-mono text-[8px] uppercase"
                          >
                            Withdraw Request
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                </div>
              )}
            </div>

            {/* Right Column: Attendance Statistics, History, Alerts */}
            <div className="space-y-4">
              <h3 className="text-md font-serif font-black uppercase tracking-tight text-white pl-2 border-l-2 border-[#D4AF37]">
                📜 Somatic Record History
              </h3>

              <div className="p-4 bg-zinc-950/60 border border-white/5 space-y-4 rounded-none text-left">
                <div className="flex justify-between items-center text-white/40 pb-2 border-b border-white/5">
                  <span className="font-mono text-[9px] uppercase tracking-widest">Active Attendance index</span>
                  <span className="text-brand-gold font-bold">2/3 COMPLETED</span>
                </div>

                <div className="space-y-2 font-mono text-[9px]">
                  {pastAttendanceHistory.map(item => (
                    <div key={item.id} className="flex justify-between items-start py-1.5 border-b border-white/[0.02]">
                      <div className="space-y-0.5 text-left">
                        <p className="font-bold text-white uppercase">{item.title}</p>
                        <p className="text-white/30 lowercase">Host: {item.host} • {item.date}</p>
                      </div>

                      <span className={`px-2 py-0.5 text-[8px] font-bold ${
                        item.status === 'Attended' 
                          ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                          : item.status.includes('Confirmed')
                          ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400'
                          : 'bg-red-500/10 border border-red-500/20 text-red-500'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-white/[0.01] border border-white/10 space-y-1 mt-4">
                  <span className="text-[8px] font-mono text-[#D4AF37] uppercase tracking-widest font-black block">🛡️ SECURE DISCHARGE INFORMATION</span>
                  <p className="text-[9px] text-white/40 font-light font-sans tracking-normal leading-relaxed">
                    Certificate tokens are issued to approved members upon completing live expert workshops. Secure these transcripts for the sisterhood database circles.
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}


      {/* RENDER VIEW 4: RECPLAY VAULT BACKUPS */}
      {activeTab === 'replays' && (
        <div className="space-y-6">
          <div className="space-y-1">
            <h3 className="text-md font-serif font-black uppercase tracking-tight text-white pl-2 border-l-2 border-[#D4AF37]">
              🎥 Recorded Session Archives & Masterclasses
            </h3>
            <p className="text-xs text-white/40 italic mt-0.5 ml-2 leading-relaxed">
              Never skip a step. Watch past global steam syncs, endocrine alignment panels, and emotional boundaries workshops offline.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {replays.map((rep) => {
              const isFav = favoriteReplays.includes(rep.id);
              
              return (
                <div key={rep.id} className="bg-[#110f0f] border border-white/5 hover:border-[#D4AF37]/30 flex flex-col justify-between overflow-hidden group transition-all duration-300">
                  <div className="h-40 relative bg-zinc-900 overflow-hidden shrink-0 border-b border-white/5">
                    <img 
                      src={rep.image} 
                      alt={rep.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/60 group-hover:bg-black/35 transition-colors flex items-center justify-center p-4">
                      
                      {/* Play Button Trigger Modal */}
                      <button
                        onClick={() => {
                          setActiveReplayVideo(rep);
                          setIsPlaying(true);
                          triggerToastNotice(`Initializing video replay: ${rep.title}`);
                        }}
                        className="w-12 h-12 rounded-full bg-[#D4AF37] hover:bg-white text-black flex items-center justify-center transition-all hover:scale-115 active:scale-90 shadow-2xl shrink-0"
                      >
                        <Play size={18} fill="currentColor" stroke="none" className="ml-1" />
                      </button>
                    </div>

                    {/* Meta Overlays */}
                    <span className="absolute top-3 left-3 px-2 py-0.5 bg-black/85 border border-[#D4AF37]/20 text-[#D4AF37] font-mono text-[8px] uppercase tracking-wider font-extrabold">
                      {rep.duration}
                    </span>
                    <span className="absolute bottom-3 right-3 px-1.5 py-0.5 bg-white/5 text-white/60 font-mono text-[7px] uppercase tracking-normal">
                      {rep.views} VIEWS
                    </span>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between text-left space-y-3 font-sans">
                    <div className="space-y-1.5">
                      <span className="text-[8px] font-mono text-[#D4AF37] uppercase tracking-widest font-black block">
                        📁 {rep.category} • {rep.date}
                      </span>
                      <h4 className="text-[12.5px] font-bold text-white uppercase group-hover:text-brand-gold transition-colors leading-snug">
                        {rep.title}
                      </h4>
                      <p className="text-[10px] text-white/50 leading-relaxed font-light">{rep.description}</p>
                    </div>

                    <div className="pt-3 border-t border-white/5 flex items-center justify-between font-mono text-[9px]">
                      <span className="text-white/40">Leader: <strong className="text-white/80 uppercase">{rep.speaker}</strong></span>
                      
                      <div className="flex gap-1.5">
                        {/* Bookmark favorite toggle */}
                        <button
                          onClick={() => {
                            let favs = [...favoriteReplays];
                            if (favs.includes(rep.id)) {
                              favs = favs.filter(id => id !== rep.id);
                              triggerToastNotice("Removed from personal archive collection");
                            } else {
                              favs.push(rep.id);
                              triggerToastNotice("Pinned to personalized private folder");
                            }
                            setFavoriteReplays(favs);
                          }}
                          className={`p-1.5 border rounded-none transition-all ${
                            isFav 
                              ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-brand-gold' 
                              : 'border-white/5 hover:border-brand-gold text-white/50 hover:text-white'
                          }`}
                          title="Save Video Replay"
                        >
                          <Bookmark size={11} strokeWidth={2.5} />
                        </button>

                        <button
                          onClick={() => {
                            setActiveReplayVideo(rep);
                            setIsPlaying(true);
                          }}
                          className="px-3 py-1.5 bg-[#D4AF37] text-black font-semibold hover:bg-white transition-colors uppercase font-mono text-[8px]"
                        >
                          PLAY REPLAY
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

          </div>
        </div>
      )}


      {/* IMMERSIVE PLAYBACK MODAL VIEW */}
      {activeReplayVideo && (
        <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-4xl bg-zinc-950 border border-[#D4AF37]/30 text-white overflow-hidden text-left font-sans"
          >
            
            {/* Header Area */}
            <div className="p-4 bg-[#0a0a0a] border-b border-white/5 flex justify-between items-center bg-black">
              <div>
                <span className="text-[8px] font-mono text-[#D4AF37] uppercase tracking-widest block">SANCTUM REPLAY SCREENING</span>
                <h3 className="text-sm font-semibold text-white uppercase">{activeReplayVideo.title}</h3>
              </div>
              
              <button
                onClick={() => {
                  setActiveReplayVideo(null);
                  setIsPlaying(false);
                }}
                className="p-1 px-2.5 bg-white/5 hover:bg-white/10 hover:text-[#D4AF37] text-white border border-white/10 transition-colors rounded-sm"
              >
                <X size={14} />
              </button>
            </div>

            {/* Video Canvas Interface Mockup */}
            <div className="relative bg-black aspect-video flex flex-col justify-center items-center overflow-hidden">
               {activeReplayVideo.videoUrl && (activeReplayVideo.videoUrl.includes('youtube.com') || activeReplayVideo.videoUrl.includes('youtu.be')) ? (
                  <iframe 
                    src={activeReplayVideo.videoUrl.replace('watch?v=', 'embed/').split('&')[0]}
                    title={activeReplayVideo.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full border-0"
                  />
               ) : activeReplayVideo.videoUrl ? (
                  <video 
                     controls
                     autoPlay={isPlaying}
                     className="absolute inset-0 w-full h-full object-contain"
                     src={activeReplayVideo.videoUrl}
                  />
               ) : (
                  <div className="text-center font-mono text-white/50 space-y-3">
                     <Video size={48} className="mx-auto text-[#D4AF37]" strokeWidth={1} />
                     <p className="tracking-widest uppercase text-[#D4AF37] font-bold">MEDIA SOURCE NOT DETECTED</p>
                     <p className="text-[10px] font-sans">The video stream URL is unavailable for this session.<br/>Please refer to the course materials.</p>
                  </div>
               )}
            </div>

            {/* Supplementary detail worksheets area */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-left bg-black border-t border-white/5">
              
              {/* Left Column materials */}
              <div className="space-y-4">
                <div>
                  <span className="text-[9px] font-mono text-[#D4AF37] uppercase tracking-widest block font-bold">🌸 Botanical Transcript Files</span>
                  <h4 className="text-sm font-bold uppercase text-white mt-1">Supplementary study modules</h4>
                  <p className="text-[10.5px] text-white/50 font-light mt-1">
                    Download specialized guides compiled directly from this presentation to integrate details offline.
                  </p>
                </div>

                <div className="space-y-2 mt-2 font-mono text-[9px] tracking-wider uppercase">
                  {activeReplayVideo.materials.map((mat, mIdx) => (
                    <div key={mIdx} className="p-3 bg-zinc-950 border border-white/5 flex gap-3 justify-between items-center transition-colors hover:border-[#D4AF37]/35">
                      <div className="flex items-center gap-2.5 truncate text-left">
                        <FileText size={14} className="text-[#D4AF37] shrink-0" />
                        <div className="truncate">
                          <p className="font-extrabold text-white truncate">{mat.title}</p>
                          <p className="text-[8px] text-white/30 lowercase mt-0.5 font-light">Document file format: {mat.type}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => triggerToastNotice(`Downloading supplementary asset: ${mat.title}`)}
                        className="px-2.5 py-1.5 bg-white/5 hover:bg-[#D4AF37] hover:text-black hover:font-bold border border-white/10 transition-colors inline-block tracking-normal text-center font-bold font-mono text-[8.5px]"
                      >
                        DOWNLOAD
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column commentary stream */}
              <div className="space-y-4 border-l border-white/5 pl-0 md:pl-6">
                <div>
                  <span className="text-[9px] font-mono text-brand-gold uppercase tracking-widest block font-bold">💬 Sisterhood Comments Matrix</span>
                  <h4 className="text-sm font-bold uppercase text-white mt-1">Collaborative Forum Stream</h4>
                </div>

                <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
                  {replayComments.map((com, cIdx) => (
                    <div key={cIdx} className="p-2.5 bg-zinc-950 border border-white/[0.02] text-left">
                      <div className="flex justify-between items-center font-mono text-[8px] uppercase tracking-widest text-white/40 mb-1">
                        <span className="font-extrabold text-brand-gold flex items-center gap-1">
                          <Users size={8} /> {com.author}
                        </span>
                        <span>{com.time}</span>
                      </div>
                      <p className="font-sans text-[10.5px] text-white/70 leading-relaxed font-light">{com.text}</p>
                    </div>
                  ))}
                </div>

                <form onSubmit={submitReplayComment} className="flex gap-2">
                  <input
                    type="text"
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder="Enter confidential somatic note..."
                    className="flex-1 bg-black text-[10px] p-2 pl-3 border border-white/15 outline-none text-white focus:border-[#D4AF37] font-mono rounded-none"
                    required
                  />
                  
                  <button 
                    type="submit"
                    className="p-2 bg-[#D4AF37] hover:bg-white text-black font-extrabold transition-colors shrink-0"
                    title="Publish note to ledger"
                  >
                    <Send size={12} />
                  </button>
                </form>
              </div>

            </div>

          </motion.div>
        </div>
      )}


      {/* RENDER VIEW 5: EVENT NOTES */}
      {activeTab === 'notes' && (
        <div className="space-y-6">
          <div className="bg-[#110f0f] border border-white/5 p-6 rounded-none text-left">
            <span className="text-[9px] font-mono text-[#D4AF37] uppercase tracking-[0.3em] font-extrabold block mb-2">Active Learning Companion</span>
            <h3 className="text-xl font-serif font-black uppercase text-white tracking-tight leading-snug">📝 Structured Event Notes</h3>
            <p className="text-xs text-white/50 font-light max-w-2xl mt-2 mb-6">Capture insights from live masterclasses, guided healing sessions, and webinars. Download guided reflection templates.</p>
            
            <div className="p-12 text-center border border-dashed border-white/10">
              <FileSignature className="mx-auto text-white/20 mb-3" size={24} />
              <p className="font-mono text-[10px] uppercase text-white/50 tracking-wider">No structured notes recorded yet.</p>
              <button
                onClick={() => {
                  triggerToastNotice("Initializing digital workbook template...");
                }}
                className="mt-3 text-[9px] font-mono uppercase text-brand-gold underline hover:text-white"
              >
                Create blank event journal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RENDER VIEW 6: CERTIFICATES */}
      {activeTab === 'certificates' && (
        <div className="space-y-6">
          <div className="bg-[#110f0f] border border-white/5 p-6 rounded-none text-left">
            <span className="text-[9px] font-mono text-[#D4AF37] uppercase tracking-[0.3em] font-extrabold block mb-2">Participant Achievements</span>
            <h3 className="text-xl font-serif font-black uppercase text-white tracking-tight leading-snug">🏆 Healing Certificates</h3>
            <p className="text-xs text-white/50 font-light max-w-2xl mt-2 mb-6">Digital credentials securely recorded for attending our key learning milestones and masterclass completion.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pastAttendanceHistory
                .filter(history => history.status === 'Attended')
                .map(history => (
                <div key={history.id} className="p-4 bg-zinc-950 border border-white/10 flex flex-col items-center justify-center text-center relative overflow-hidden group hover:border-[#D4AF37]/50 transition-colors">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#D4AF37]/5 blur-2xl rounded-full" />
                  <Award size={32} className="text-[#D4AF37] mb-3 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
                  <h4 className="text-[11px] font-serif font-black uppercase text-white mt-1 border-b border-[#D4AF37]/30 pb-2 w-full">{history.title}</h4>
                  <p className="text-[8.5px] font-mono text-white/50 uppercase tracking-widest mt-3">ISSUED: <span className="text-white/80">{history.date}</span></p>
                  <button onClick={() => triggerToastNotice(`Downloading credential package for ${history.title}`)} className="text-[8px] uppercase tracking-widest font-mono text-[#D4AF37] hover:text-white mt-4 border border-[#D4AF37]/30 hover:bg-[#D4AF37] hover:text-black transition-all px-3 py-1.5 w-full">Export PDF Credential</button>
                </div>
              ))}
              {pastAttendanceHistory.filter(h => h.status === 'Attended').length === 0 && (
                <div className="col-span-full p-12 text-center border border-dashed border-white/10">
                  <p className="font-mono text-[10px] uppercase text-white/50 tracking-wider">Attend verified signature masterclasses to earn certificates.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CONFIGURE NOTIFICATIONS & REMINDER MODAL PANEL */}
      {activeReminderEvent && (
        <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-zinc-950 border border-[#D4AF37] text-left text-xs font-sans p-6 space-y-5"
          >
            
            <div className="flex justify-between items-start border-b border-white/5 pb-3">
              <div>
                <span className="text-[8.5px] font-mono text-[#D4AF37] uppercase tracking-widest block font-bold">CONFIGURE EVENT GATHERING ALERTS</span>
                <h3 className="text-sm font-semibold text-white uppercase mt-1">Calibrate Community Alerts Dispatch</h3>
              </div>
              <button 
                onClick={() => setActiveReminderEvent(null)}
                className="text-white/40 hover:text-white"
              >
                <X size={15} />
              </button>
            </div>

            <p className="text-[10.5px] text-white/50 leading-relaxed font-sans font-light">
              Calibrate your preferred notification path variables to avoid missing <strong>{activeReminderEvent.title}</strong>. Dispatches synchronize through your user security records.
            </p>

            <div className="space-y-4 font-mono text-[9px] uppercase tracking-wider">
              {/* Alert Channel Select */}
              <div className="space-y-1">
                <label className="text-white/35 block">Primary Alerts Channel Node</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'whatsapp', label: 'WhatsApp', desc: 'Somatic priority sync' },
                    { id: 'email', label: 'Email Only', desc: 'Secure encryption' },
                    { id: 'both', label: 'Dual Dispatch', desc: 'Maximum retention' }
                  ].map(chan => (
                    <button
                      key={chan.id}
                      type="button"
                      onClick={() => setReminderChannel(chan.id as any)}
                      className={`p-2.5 border text-center transition-all ${
                        reminderChannel === chan.id 
                          ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-[#D4AF37]' 
                          : 'bg-black/60 border-white/10 text-white/40'
                      }`}
                    >
                      <p className="font-extrabold text-[9px]">{chan.label}</p>
                      <p className="text-[7.5px] text-white/20 lowercase mt-0.5 tracking-normal">{chan.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Timeframe Select */}
              <div className="space-y-1">
                <label className="text-white/35 block">Pre-Notification Lead Index</label>
                <select
                  value={reminderTimeframe}
                  onChange={(e) => setReminderTimeframe(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 p-2.5 text-white outline-none focus:border-brand-gold uppercase text-[9px]"
                >
                  <option value="15m">15 Minutes prior (Immediate Callout)</option>
                  <option value="1h">1 Hour prior (Preparations check)</option>
                  <option value="24h">24 Hours prior (Full infusion setup warning)</option>
                  <option value="all">Every phase checkpoint (Pre-Womb Ritual Loops)</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex gap-2 w-full font-mono text-[9px] uppercase tracking-widest font-extrabold leading-none">
              <button
                type="button"
                onClick={() => {
                  triggerToastNotice(`Secured reminder configuration for ${activeReminderEvent.title}.`);
                  setActiveReminderEvent(null);
                }}
                className="flex-1 p-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-colors"
              >
                Save To Local Profile
              </button>

              <button
                type="button"
                onClick={handleLaunchReminderSync}
                className="flex-1 p-3 bg-brand-gold text-black hover:bg-white transition-colors flex justify-center items-center gap-1.5 font-bold"
              >
                <Send size={11} className="shrink-0" /> Dispatch WhatsApp Sync
              </button>
            </div>

          </motion.div>
        </div>
      )}

    </div>
  );
}
