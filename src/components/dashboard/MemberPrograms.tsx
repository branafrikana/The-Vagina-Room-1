import React, { useState, useEffect } from 'react';
import { 
  Award, 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  Download, 
  Play, 
  Lock, 
  Sparkles, 
  FileCheck, 
  HeartHandshake,
  Search,
  Video,
  Headphones,
  FileText,
  Bookmark,
  Activity,
  ArrowRight,
  HelpCircle,
  Plus,
  Tv,
  Check,
  ChevronRight,
  RefreshCw,
  Calendar,
  AlertCircle,
  Percent,
  Printer,
  Badge,
  ShieldCheck,
  Zap,
  BookmarkCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { CourseProgram, LessonItem, defaultPrograms } from '../../lib/programs';
export default function MemberPrograms() {
  // Tabs for sub-navigation within Courses pane
  // 'active' = Active Programs, 'materials' = Course Materials, 'progress' = Progress Tracking, 'certificates' = Certificates (Future Feature)
  const [activeSubTab, setActiveSubTab] = useState<'active' | 'materials' | 'progress' | 'certificates'>('active');
  const [selectedProgramId, setSelectedProgramId] = useState<string>('prog-fertility');
  
  // Real-time interactive checklists
  const [completedLessonsMap, setCompletedLessonsMap] = useState<Record<string, boolean>>({});
  
  // Interactive material queries
  const [materialsSearchQuery, setMaterialsSearchQuery] = useState('');
  const [materialTypeFilter, setMaterialTypeFilter] = useState<'all' | 'video' | 'audio' | 'pdf' | 'quiz' | 'assessment'>('all');

  // Simulated live downloader State
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);

  // Soft toast state
  const [toastMessage, setToastMessage] = useState('');


  // Initialize completed state from localStorage or defaults
  useEffect(() => {
    try {
      const stored = localStorage.getItem('tvr_lesson_progress');
      if (stored) {
        setCompletedLessonsMap(JSON.parse(stored));
      } else {
        // Hydrate default completed states
        const initialMap: Record<string, boolean> = {};
        defaultPrograms.forEach(prog => {
          prog.lessons.forEach(l => {
            if (l.isCompleted) {
              initialMap[l.id] = true;
            }
          });
        });
        setCompletedLessonsMap(initialMap);
        localStorage.setItem('tvr_lesson_progress', JSON.stringify(initialMap));
      }
    } catch (e) {
      console.warn("Could not read progress state", e);
    }
  }, []);

  // Micro Notification
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Toggle single lesson completed state
  const handleToggleLesson = (lessonId: string, title: string) => {
    try {
      const current = !!completedLessonsMap[lessonId];
      const updated = { ...completedLessonsMap, [lessonId]: !current };
      setCompletedLessonsMap(updated);
      localStorage.setItem('tvr_lesson_progress', JSON.stringify(updated));
      
      if (!current) {
        showToast(`🎉 Verified: Completed lesson "${title}"! Progress registered.`);
      } else {
        showToast(`🔄 Lesson status reset: "${title}" is now pending.`);
      }
    } catch (e) {
      console.warn("Could not save lesson progress", e);
    }
  };

  // Compute stats dynamically per program
  const activeProgram = defaultPrograms.find(p => p.id === selectedProgramId) || defaultPrograms[0];
  
  const getProgramProgress = (prog: CourseProgram) => {
    const lessons = prog.lessons;
    if (lessons.length === 0) return 0;
    const completedCount = lessons.filter(l => !!completedLessonsMap[l.id]).length;
    return Math.round((completedCount / lessons.length) * 100);
  };

  const getCompletedLessonsCount = (prog: CourseProgram) => {
    return prog.lessons.filter(l => !!completedLessonsMap[l.id]).length;
  };

  // Gather overall learning stats across all courses
  const totalLessonsCount = defaultPrograms.reduce((acc, p) => acc + p.lessons.length, 0);
  const totalCompletedLessonsCount = defaultPrograms.reduce((acc, p) => {
    return acc + p.lessons.filter(l => !!completedLessonsMap[l.id]).length;
  }, 0);
  const overallCompletionRate = totalLessonsCount > 0 
    ? Math.round((totalCompletedLessonsCount / totalLessonsCount) * 100) 
    : 0;

  // Find last pending lesson of active program (Resume Lesson shortcut)
  const resumeLesson = activeProgram.lessons.find(l => !completedLessonsMap[l.id]) || activeProgram.lessons[0];

  // Materials listing logic
  const allMaterials = React.useMemo(() => {
    const list: { lesson: LessonItem; course: CourseProgram }[] = [];
    defaultPrograms.forEach(prog => {
      prog.lessons.forEach(les => {
        list.push({ lesson: les, course: prog });
      });
    });
    return list;
  }, []);

  const filteredMaterials = allMaterials.filter(item => {
    const matchesSearch = item.lesson.title.toLowerCase().includes(materialsSearchQuery.toLowerCase()) ||
                          item.lesson.description.toLowerCase().includes(materialsSearchQuery.toLowerCase()) ||
                          item.course.title.toLowerCase().includes(materialsSearchQuery.toLowerCase());
    
    if (materialTypeFilter === 'all') return matchesSearch;
    return matchesSearch && item.lesson.type === materialTypeFilter;
  });

  // Simulated Downloader Action
  const handleSimulatedDownload = (id: string, title: string) => {
    if (downloadingId) return;
    setDownloadingId(id);
    setDownloadProgress(0);

    const intvl = setInterval(() => {
      setDownloadProgress(p => {
        if (p >= 100) {
          clearInterval(intvl);
          setTimeout(() => {
            setDownloadingId(null);
            showToast(`📥 PDF File Saved: "${title}" completed successfully.`);
          }, 200);
          return 100;
        }
        return p + 25;
      });
    }, 150);
  };

  return (
    <div className="space-y-8 font-sans text-white text-left relative pb-20">
      
      {/* Dynamic Tiny Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className="fixed top-8 left-1/2 z-[100] bg-[#0c0a0a] border border-[#D4AF37] px-6 py-3.5 text-brand-gold font-mono text-[9px] uppercase tracking-widest font-bold flex items-center gap-2.5 shadow-2xl"
          >
            <Sparkles size={11} className="animate-spin text-brand-gold" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. ACADEMY HERO HEADER */}
      <div className="bg-gradient-to-br from-[#110f0f] via-zinc-950 to-[#070606] border border-white/5 rounded-none p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#D4AF37]/[0.02] blur-3xl rounded-full" />
        
        <div className="relative z-10 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <span className="text-[9px] font-mono text-brand-gold uppercase tracking-[0.3em] font-extrabold block">
                🎓 SOVEREIGN INTEGRATIVE ACADEMY
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-black uppercase text-white mt-1 leading-tight tracking-tight">
                🎓 Programs & Courses Portal
              </h2>
              <p className="text-xs text-white/50 max-w-xl font-light font-sans mt-1.5 leading-relaxed">
                Empowering you with structured knowledge for better understanding, better health, and better decisions. Align biological metrics with ancestral wellness systems.
              </p>
            </div>

            {/* Overall stats widget */}
            <div className="bg-black/80 border border-[#D4AF37]/30 p-3.5 shrink-0 font-mono text-[8.5px] uppercase tracking-widest text-[#D4AF37] text-left">
              <span className="text-white/40 block text-[7px] mb-0.5">ACADEMY PROGRESS METRIC</span>
              <p className="font-extrabold flex items-center gap-1.5 text-[11px]">
                <Percent size={12} /> {overallCompletionRate}% Overall Grade
              </p>
              <div className="w-full bg-white/10 h-1 mt-1.5 relative overflow-hidden">
                <div className="bg-brand-gold h-full" style={{ width: `${overallCompletionRate}%` }} />
              </div>
              <span className="text-[7px] text-white/50 block mt-1">
                {totalCompletedLessonsCount} OF {totalLessonsCount} LESSONS COMPLETED
              </span>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="pt-4 border-t border-white/5 flex flex-wrap gap-2 text-xs font-mono font-bold uppercase tracking-widest">
            <span className="text-white/30 self-center text-[8px] tracking-wider pr-1">⚡ QUICK ACTIONS:</span>
            
            {/* Quick Action 1: Continue Learning default toggle */}
            <button
              onClick={() => {
                setActiveSubTab('active');
                showToast(`Viewing active learning tracks.`);
              }}
              className={`px-3 py-1.5 border border-white/5 text-[8px] transition-all hover:border-[#D4AF37] ${
                activeSubTab === 'active' ? 'bg-[#D4AF37] text-black font-extrabold' : 'bg-black/60 text-white/70'
              }`}
            >
              Continue Learning
            </button>

            {/* Quick Action 2: Resume last lesson query */}
            {resumeLesson && (
              <button
                onClick={() => {
                  trackLastLesson(resumeLesson.title);
                  showToast(`Resuming Lesson: "${resumeLesson.title}"`);
                }}
                className="px-3 py-1.5 bg-brand-gold/10 hover:bg-[#D4AF37] border border-[#D4AF37]/35 text-[#D4AF37] hover:text-black text-[8px] transition-all font-black flex items-center gap-1"
              >
                <Zap size={9} />
                <span>Resume Last Lesson</span>
              </button>
            )}

            {/* Quick Action 3: Download course materials */}
            <button
              onClick={() => {
                setActiveSubTab('materials');
                setMaterialTypeFilter('pdf');
                showToast(`Loaded all downloadable course manuals.`);
              }}
              className={`px-3 py-1.5 border border-white/5 text-[8px] transition-all hover:border-[#D4AF37] ${
                activeSubTab === 'materials' && materialTypeFilter === 'pdf' ? 'bg-[#D4AF37] text-black font-extrabold' : 'bg-black/60 text-white/70'
              }`}
            >
              Download Materials
            </button>

            {/* Quick Action 4: Progress overview */}
            <button
              onClick={() => {
                setActiveSubTab('progress');
                showToast(`Auditing learning completion charts.`);
              }}
              className={`px-3 py-1.5 border border-white/5 text-[8px] transition-all hover:border-[#D4AF37] ${
                activeSubTab === 'progress' ? 'bg-[#D4AF37] text-black font-extrabold' : 'bg-black/60 text-white/70'
              }`}
            >
              Check Progress
            </button>

            {/* Quick Action 5: View All Programs directory reset */}
            <button
              onClick={() => {
                setActiveSubTab('active');
                setMaterialsSearchQuery('');
                setMaterialTypeFilter('all');
                showToast(`Loaded entire curriculum database.`);
              }}
              className="px-3 py-1.5 border border-white/5 text-[8px] transition-all bg-black/60 text-white/75 hover:border-[#D4AF37]"
            >
              View All Programs
            </button>
          </div>
        </div>
      </div>

      {/* 2. SUB-NAVIGATION CHRONOLOGY TABS */}
      <div className="flex border-b border-white/10 overflow-x-auto no-scrollbar font-mono text-[9.5px] uppercase tracking-widest bg-white/[0.01] p-1">
        <button
          onClick={() => setActiveSubTab('active')}
          className={`px-5 py-3 shrink-0 font-bold transition-all border-b-2 ${
            activeSubTab === 'active'
              ? 'border-[#D4AF37] text-[#D4AF37] bg-white/[0.02]'
              : 'border-transparent text-white/50 hover:text-white hover:bg-white/[0.01]'
          }`}
        >
          📘 Active Programs
        </button>

        <button
          onClick={() => setActiveSubTab('materials')}
          className={`px-5 py-3 shrink-0 font-bold transition-all border-b-2 ${
            activeSubTab === 'materials'
              ? 'border-[#D4AF37] text-[#D4AF37] bg-white/[0.02]'
              : 'border-transparent text-white/50 hover:text-white hover:bg-white/[0.01]'
          }`}
        >
          📚 Course Materials
        </button>

        <button
          onClick={() => setActiveSubTab('progress')}
          className={`px-5 py-3 shrink-0 font-bold transition-all border-b-2 ${
            activeSubTab === 'progress'
              ? 'border-[#D4AF37] text-[#D4AF37] bg-white/[0.02]'
              : 'border-transparent text-white/50 hover:text-white hover:bg-white/[0.01]'
          }`}
        >
          📊 Progress Tracking
        </button>

        <button
          onClick={() => setActiveSubTab('certificates')}
          className={`px-5 py-3 shrink-0 font-bold transition-all border-b-2 ${
            activeSubTab === 'certificates'
              ? 'border-[#D4AF37] text-[#D4AF37] bg-white/[0.02]'
              : 'border-transparent text-white/50 hover:text-white hover:bg-white/[0.01]'
          }`}
        >
          🏅 Certificates (Future)
        </button>
      </div>

      {/* SUB_TAB 1: ACTIVE PROGRAMS CURRICULUMS */}
      {activeSubTab === 'active' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Sidebar selector lists */}
          <div className="lg:col-span-1 space-y-4">
            <h4 className="text-[9.5px] font-mono uppercase tracking-widest text-[#D4AF37] font-black border-b border-white/5 pb-2">
              📂 SELECT ENROLLED PATHWAY
            </h4>

            <div className="space-y-3">
              {defaultPrograms.map((prog) => {
                const progProgress = getProgramProgress(prog);
                const isSelected = selectedProgramId === prog.id;

                return (
                  <button
                    key={prog.id}
                    onClick={() => {
                      setSelectedProgramId(prog.id);
                      showToast(`Opened track: ${prog.title}`);
                    }}
                    className={`w-full text-left p-4.5 rounded-none border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-zinc-950 border-[#D4AF37] shadow-xl'
                        : 'bg-white/[0.01] border-white/5 hover:border-white/15'
                    }`}
                  >
                    <div>
                      <span className="text-[7.5px] font-mono text-brand-gold uppercase tracking-wider block font-bold mb-1">
                        {prog.category}
                      </span>
                      <h4 className="text-xs font-serif font-black uppercase text-white leading-tight">
                        {prog.title}
                      </h4>
                      <p className="text-[9.5px] text-white/40 font-mono text-xs mt-1.5 lowercase">BY {prog.instructor}</p>
                    </div>

                    {/* Progress slider representation */}
                    <div className="mt-5 space-y-1.5 pt-3 border-t border-white/5">
                      <div className="flex justify-between font-mono text-[8px] uppercase tracking-wider text-white/50">
                        <span>Lesson Status</span>
                        <span className="text-brand-gold font-bold">{progProgress}% Complete</span>
                      </div>
                      <div className="w-full bg-white/5 h-1 rounded-none overflow-hidden relative">
                        <div 
                          className="bg-brand-gold h-full transition-all duration-500" 
                          style={{ width: `${progProgress}%` }}
                        />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Interactive Q&A Announcements frame */}
            <div className="p-4.5 bg-black/60 border border-white/5 rounded-none space-y-3 text-[11px] leading-relaxed">
              <span className="text-[8px] font-mono text-[#D4AF37] uppercase tracking-widest block font-extrabold">
                📢 TRACK ANNOUNCEMENTS
              </span>
              <div className="space-y-2.5">
                {activeProgram.announcements.map((ann, aIdx) => (
                  <p key={aIdx} className="text-white/60 font-sans italic border-l border-brand-gold/30 pl-2">
                    {ann}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Detailed Course Syllabus Viewer */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Upper Banner Detail */}
            <div className="bg-zinc-950 border border-white/5 p-6 rounded-none relative overflow-hidden">
              <div className="absolute top-0 right-0 w-44 h-44 bg-brand-gold/[0.01] blur-xl rounded-full" />
              <div className="space-y-3 relative z-10 text-left">
                <span className="text-[8.5px] font-mono text-brand-gold bg-brand-gold/10 border border-brand-gold/25 px-2.5 py-0.5 uppercase tracking-widest block w-fit">
                  {activeProgram.category}
                </span>
                <h3 className="text-md sm:text-lg font-serif font-black uppercase text-white tracking-wide">
                  {activeProgram.title}
                </h3>
                <p className="text-xs text-white/50 leading-relaxed font-sans font-light">
                  {activeProgram.description}
                </p>
                <div className="flex gap-4 pt-1 font-mono text-[9px] text-white/30 uppercase tracking-wider">
                  <span>FACULTY: <strong className="text-white/80">{activeProgram.instructor}</strong></span>
                  <span>•</span>
                  <span>{activeProgram.lessons.length} Modules Enrolled</span>
                </div>
              </div>
            </div>

            {/* List of lessons / check-off modules */}
            <div className="space-y-3.5">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <h4 className="text-[10px] font-mono text-[#D4AF37] uppercase tracking-widest font-black">
                  📖 LESSON SEQUENCE & PRACTICE LABS
                </h4>
                <span className="text-[8.5px] font-mono text-white/40 uppercase">
                  {getCompletedLessonsCount(activeProgram)} / {activeProgram.lessons.length} Passed
                </span>
              </div>

              {/* Syllabus listings */}
              <div className="space-y-3">
                {activeProgram.lessons.map((les, idx) => {
                  const isCompleted = !!completedLessonsMap[les.id];
                  
                  return (
                    <div
                      key={les.id}
                      className={`p-4 border transition-all text-left flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
                        isCompleted
                          ? 'bg-emerald-500/[0.02] border-emerald-500/20 text-emerald-300'
                          : 'bg-[#110f0f] border-white/5 hover:border-white/10 text-white'
                      }`}
                    >
                      {/* Left structure info */}
                      <div className="flex items-start gap-3.5">
                        
                        {/* Interactive toggle status checkbox */}
                        <button
                          type="button"
                          onClick={() => handleToggleLesson(les.id, les.title)}
                          className={`w-5 h-5 shrink-0 border rounded-sm flex items-center justify-center transition-all ${
                            isCompleted
                              ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                              : 'bg-black border-white/20 hover:border-brand-gold text-white/20'
                          }`}
                          title={isCompleted ? "Mark lesson as pending" : "Commit completed sequence"}
                        >
                          {isCompleted ? <Check size={12} strokeWidth={3} /> : <span className="text-[9px] font-mono">{idx + 1}</span>}
                        </button>

                        <div className="space-y-1">
                          <div className="flex flex-wrap gap-2 items-center">
                            <span className="text-[8px] font-mono uppercase bg-white/5 px-1.5 py-0.5 border border-white/10 text-white/55">
                              {les.type.toUpperCase()}
                            </span>
                            <span className="text-[8.5px] font-mono text-white/35">Duration: {les.duration}</span>
                          </div>
                          <h4 className={`text-xs font-black uppercase text-white mt-1 leading-snug ${isCompleted ? 'text-white/60 line-through decoration-white/20 pointer-events-none' : ''}`}>
                            {les.title}
                          </h4>
                          <p className="text-[10.5px] text-white/50 leading-relaxed font-sans font-light">
                            {les.description}
                          </p>
                        </div>
                      </div>

                      {/* Right direct triggers */}
                      <div className="shrink-0 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5 flex gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            trackLastLesson(les.title);
                            if (les.type === 'pdf' || les.type === 'case_study') {
                              handleSimulatedDownload(les.id, les.title);
                            } else if (les.type === 'quiz' || les.type === 'assessment') {
                              showToast(`Launching interactive ${les.type === 'quiz' ? 'knowledge check' : 'evaluation'}: "${les.title}".`);
                            } else {
                              showToast(`Initializing media stream: "${les.title}". Enjoy learning!`);
                            }
                          }}
                          className="px-3.5 py-2 hover:bg-white bg-white/5 text-white hover:text-black font-mono text-[8px] uppercase tracking-widest font-black transition-all flex items-center gap-1 border border-white/5"
                        >
                          {les.type === 'video' ? <Play size={8} fill="currentColor" /> : les.type === 'audio' ? <Headphones size={8} /> : (les.type === 'quiz' || les.type === 'assessment') ? <CheckCircle2 size={8} /> : <FileText size={8} />}
                          <span>{les.type === 'pdf' ? 'Download' : (les.type === 'quiz' || les.type === 'assessment') ? `Start ${les.type === 'quiz' ? 'Quiz' : 'Assessment'}` : 'Open Lesson'}</span>
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* SUB_TAB 2: COURSE MATERIALS REPOSITORY */}
      {activeSubTab === 'materials' && (
        <div className="space-y-6">
          
          {/* Keyword Search & Type Select panel */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/[0.01] p-4 border border-white/5">
            
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'all', label: 'All Resources' },
                { id: 'video', label: '🎥 Videos & Recordings' },
                { id: 'audio', label: '🎧 Audio Teachings' },
                { id: 'pdf', label: '📄 Workbooks & Guides' },
                { id: 'quiz', label: '🧠 Quizzes' },
                { id: 'assessment', label: '📋 Assessments' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setMaterialTypeFilter(cat.id as any);
                    showToast(`Filtering for type: ${cat.label}`);
                  }}
                  className={`px-3 py-1.5 font-mono text-[8.5px] uppercase tracking-wider transition-all border ${
                    materialTypeFilter === cat.id
                      ? 'bg-[#D4AF37] border-[#D4AF37] text-black font-extrabold'
                      : 'bg-black/40 border-white/5 text-white/50 hover:text-white hover:border-white/20'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Keyword Input */}
            <div className="relative w-full md:w-64">
              <input
                type="text"
                value={materialsSearchQuery}
                onChange={(e) => setMaterialsSearchQuery(e.target.value)}
                placeholder="Search course resources..."
                className="w-full bg-black/80 border border-white/10 focus:border-[#D4AF37] p-2 pl-8 font-mono text-[10px] text-white outline-none rounded-none"
              />
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/40" size={11} />
            </div>
          </div>

          {/* Grid listing */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMaterials.length === 0 ? (
              <div className="col-span-full py-12 text-center border border-dashed border-white/10 font-mono text-white/45">
                No course material directories matched your search criteria.
              </div>
            ) : (
              filteredMaterials.map(({ lesson, course }, idx) => {
                const isDownloadingThis = downloadingId === lesson.id;
                
                return (
                  <div
                    key={lesson.id}
                    className="bg-[#110f0f] border border-white/5 hover:border-white/10 p-5 rounded-none flex flex-col justify-between text-left space-y-4 group relative transition-all"
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <span className="text-[7.5px] font-mono bg-white/5 px-2 py-0.5 border border-white/10 text-brand-gold uppercase font-bold">
                          {lesson.type} • {lesson.duration}
                        </span>
                        
                        <span className="text-[7.5px] font-mono text-white/30 text-right truncate max-w-[120px]">
                          {course.title}
                        </span>
                      </div>

                      <h4 className="text-[13px] font-sans font-black uppercase text-white group-hover:text-brand-gold transition-colors leading-snug">
                        {lesson.title}
                      </h4>
                      
                      <p className="text-[10.5px] text-white/50 leading-relaxed font-sans font-light select-none">
                        {lesson.description}
                      </p>
                    </div>

                    <div className="pt-3.5 border-t border-white/5">
                      {isDownloadingThis ? (
                        /* Progress tracker simulation */
                        <div className="space-y-2 font-mono text-[8px] text-[#D4AF37] font-bold">
                          <div className="flex justify-between">
                            <span className="animate-pulse">TRANSFERRING DATA PACKET...</span>
                            <span>{downloadProgress}%</span>
                          </div>
                          <div className="w-full bg-white/5 h-1 overflow-hidden relative">
                            <motion.div 
                              className="bg-brand-gold h-full"
                              style={{ width: `${downloadProgress}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center gap-3">
                          <span className="text-[8.5px] font-mono text-white/30 uppercase leading-none">
                            Verified Track Asset
                          </span>

                          <button
                            type="button"
                            onClick={() => {
                              trackLastLesson(lesson.title);
                              if (lesson.type === 'pdf') {
                                handleSimulatedDownload(lesson.id, lesson.title);
                              } else if (lesson.type === 'quiz' || lesson.type === 'assessment') {
                                showToast(`Launching interactive ${lesson.type === 'quiz' ? 'knowledge check' : 'evaluation'}: "${lesson.title}".`);
                              } else {
                                showToast(`Starting streaming node for "${lesson.title}"`);
                              }
                            }}
                            className="px-3.5 py-1.5 text-[8.5px] font-mono font-black uppercase tracking-widest bg-black border border-[#D4AF37]/30 hover:border-brand-gold text-[#D4AF37] hover:bg-brand-gold hover:text-black transition-all flex items-center gap-1"
                          >
                            {(lesson.type === 'quiz' || lesson.type === 'assessment') ? <CheckCircle2 size={10} /> : (lesson.type === 'pdf') ? <Download size={10} /> : <Play size={10} />}
                            <span>{lesson.type === 'pdf' ? 'Download PDF' : (lesson.type === 'quiz' || lesson.type === 'assessment') ? `Start ${lesson.type === 'quiz' ? 'Quiz' : 'Assessment'}` : 'Stream Media'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>
      )}

      {/* SUB_TAB 3: PROGRESS TRACKING HUB */}
      {activeSubTab === 'progress' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Left overview metric card */}
            <div className="bg-[#110f0f] border border-white/5 p-6 rounded-none space-y-4">
              <span className="text-[8px] font-mono text-[#D4AF37] uppercase tracking-widest block font-extrabold">
                📊 QUANTITATIVE OVERVIEW
              </span>
              <h3 className="text-md font-black uppercase text-white font-sans">
                Curriculum Integration Index
              </h3>
              
              {/* Massive Completion Score Dial */}
              <div className="py-6 flex flex-col items-center justify-center space-y-2 select-none">
                <div className="w-28 h-28 border-4 border-white/5 rounded-full flex flex-col items-center justify-center relative bg-black/40">
                  <span className="text-3xl font-mono font-black text-brand-gold leading-none">
                    {overallCompletionRate}%
                  </span>
                  <span className="text-[7.5px] font-mono text-white/40 uppercase tracking-widest mt-1.5">
                    Passed
                  </span>
                  
                  {/* Subtle circular border mapping progress */}
                  <div 
                    className="absolute inset-0 border-4 border-[#D4AF37] rounded-full scale-100 opacity-20 pointer-events-none"
                    style={{ clipPath: `polygon(50% 50%, -50% -50%, ${overallCompletionRate}% -50%)` }}
                  />
                </div>
                <p className="text-[10px] text-white/40 font-mono text-center">
                  DATABASE VERIFIED SECURE
                </p>
              </div>

              <div className="space-y-2.5 font-mono text-[9px] uppercase tracking-wide text-white/60">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span>Completed Lessons</span>
                  <span className="text-white font-bold">{totalCompletedLessonsCount}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span>Pending Modules</span>
                  <span className="text-white font-bold">{totalLessonsCount - totalCompletedLessonsCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Syllabus Total</span>
                  <span className="text-white font-bold">{totalLessonsCount} Lessons</span>
                </div>
              </div>
            </div>

            {/* Right details lesson audit */}
            <div className="md:col-span-2 space-y-4 text-left">
              <h4 className="text-sm font-black uppercase text-white tracking-wide font-sans">
                🔒 Registered Course Milestones
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {defaultPrograms.map((prog, pIdx) => {
                  const rate = getProgramProgress(prog);
                  const isDone = rate === 100;

                  return (
                    <div 
                      key={prog.id}
                      className={`p-5 border flex flex-col justify-between gap-4 ${
                        isDone 
                          ? 'bg-emerald-500/[0.01] border-emerald-500/25' 
                          : 'bg-white/[0.01] border-white/5'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <CheckCircle2 size={16} className={isDone ? "text-emerald-400 animate-pulse" : "text-white/20"} />
                          <span className={`text-[8px] font-mono uppercase px-2 py-0.5 ${isDone ? 'bg-emerald-500/10 text-emerald-300' : 'bg-white/5 text-white/40'}`}>
                            {isDone ? 'Milestone Unlocked!' : 'In Progress'}
                          </span>
                        </div>

                        <h5 className="text-xs font-serif font-black uppercase text-white leading-tight">
                          {prog.title}
                        </h5>
                        <p className="text-[10px] text-white/50 leading-relaxed">
                          Author: {prog.instructor}
                        </p>
                      </div>

                      {/* Bar indicator */}
                      <div className="space-y-1.5 pt-3 border-t border-white/5 font-mono text-[8px] uppercase">
                        <div className="flex justify-between text-white/40">
                          <span>Progress Rate</span>
                          <span className="text-[#D4AF37] font-bold">{rate}%</span>
                        </div>
                        <div className="w-full bg-white/5 h-1 relative overflow-hidden">
                          <div className={`h-full ${isDone ? 'bg-emerald-400' : 'bg-[#D4AF37]'}`} style={{ width: `${rate}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Progress Assurance Warning */}
              <div className="bg-black/40 border border-white/5 p-4.5 font-sans leading-relaxed text-xs text-white/45 flex gap-3">
                <AlertCircle size={18} className="text-brand-gold shrink-0 self-start" />
                <div className="space-y-1">
                  <p className="font-mono text-[9.5px] uppercase tracking-wider text-white font-black">
                    Authenticating Academic Records
                  </p>
                  <p className="text-[10.5px]">
                    To claim certificates, check off completed lesson boxes globally. Your active device browser cache maintains secure synchronization logs internally.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* SUB_TAB 4: CERTIFICATES DISPLAY (FUTURE FEATURE WITH POLISHED DESIGN) */}
      {activeSubTab === 'certificates' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Side: Concept presentation about future certificates */}
            <div className="bg-[#110f0f] border border-white/5 p-6 rounded-none space-y-4 text-left">
              <span className="text-[8px] font-mono text-[#D4AF37] uppercase tracking-widest block font-extrabold flex items-center gap-1">
                <Award size={10} className="animate-bounce" /> METALLIC ACCREDITATIONS
              </span>
              <h3 className="text-md font-black uppercase text-white font-sans">
                Recognition of Learning
              </h3>
              <p className="text-xs text-white/50 leading-relaxed font-sans font-light">
                Secure digital certificates of completion, shareable achievement badges, and verifiable academic records will soon be registered directly on our sovereign member accounts.
              </p>

              <div className="border-t border-white/5 pt-4 space-y-3 font-mono text-[8.5px] uppercase text-white/40">
                <span className="text-[7.5px] text-[#D4AF37] block font-black">INCLUDED BLUEPRINT ADVANCEMENTS:</span>
                <div className="flex items-center gap-2">
                  <Check size={11} className="text-emerald-400" />
                  <span>Digital Certificates of Completion</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={11} className="text-emerald-400" />
                  <span>Shareable Achievement Badges</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={11} className="text-emerald-400" />
                  <span>Verified Ledger Learning Records</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={11} className="text-emerald-400" />
                  <span>Printable Certificate Templates</span>
                </div>
              </div>

              {/* Mock Claim button */}
              <button
                type="button"
                onClick={async () => {
                  showToast(`🧬 Generating verifiable credentials... Please wait.`);
                  const { default: html2canvas } = await import('html2canvas');
                  const { jsPDF } = await import('jspdf');
                  const element = document.getElementById('certificate-canvas');
                  if (element) {
                     const canvas = await html2canvas(element, { scale: 2 });
                     const imgData = canvas.toDataURL('image/png');
                     const pdf = new jsPDF({
                       orientation: 'landscape',
                       unit: 'pt',
                       format: [canvas.width, canvas.height]
                     });
                     pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
                     pdf.save('TVR_Certificate.pdf');
                     showToast(`✅ Certificate downloaded successfully.`);
                  }
                }}
                className="w-full py-2.5 bg-white/5 hover:bg-brand-gold border border-[#D4AF37]/35 hover:border-brand-gold text-[#D4AF37] hover:text-black font-mono text-[9px] uppercase tracking-widest font-black transition-all flex items-center justify-center gap-1.5"
              >
                <RefreshCw size={11} className="animate-spin text-brand-gold group-hover:text-black" style={{ animationDuration: '6s' }} />
                <span>Initialize Ledger Test & Download</span>
              </button>
            </div>

            {/* Right Side: Elegant Printable Mockup of Certificates completed */}
            <div className="lg:col-span-2 space-y-4 text-left">
              <h4 className="text-sm font-black uppercase text-[#D4AF37] tracking-wider font-sans">
                🏅 Preview Account Credentials
              </h4>

              {/* Certificate Canvas layout */}
              <div id="certificate-canvas" className="bg-gradient-to-br from-zinc-950 via-neutral-950 to-zinc-950 border-4 border-double border-[#D4AF37]/50 p-8 sm:p-12 relative overflow-hidden select-none shadow-2xl">
                
                {/* Vintage watermarks */}
                <div className="absolute inset-0 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 border border-[#D4AF37]/5 rounded-full loader-glow pointer-events-none" />

                <div className="relative z-10 space-y-6 text-center">
                  
                  {/* Top Seal Badge */}
                  <div className="w-14 h-14 bg-black border-2 border-brand-gold rounded-full flex items-center justify-center mx-auto shadow-md">
                    <Award size={24} className="text-brand-gold" />
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[8px] font-mono uppercase tracking-[0.4em] text-brand-gold font-bold">
                      THE VAGINA ROOM COMMUNITY
                    </span>
                    <h2 className="text-lg sm:text-xl font-serif font-bold uppercase text-white tracking-wide">
                      Certificate of Completion
                    </h2>
                    <p className="text-[10px] font-mono text-white/40 uppercase">
                      CRIMSON APOTHECARY CONVERGENCE LEDGER
                    </p>
                  </div>

                  {/* Certification wording */}
                  <div className="space-y-2 max-w-md mx-auto">
                    <p className="text-[11px] text-white/50 font-sans italic font-light">
                      This sovereign credential is mock-certified to acknowledge that our elite registered workspace member has studied, verified, and successfully integrated the cycle restoration parameters for the blueprint course:
                    </p>
                    <p className="text-xs sm:text-sm font-serif font-black uppercase text-[#D4AF37] tracking-wider py-1 border-t border-b border-white/5 my-2">
                      Clinical Fertility & Somatic Conception
                    </p>
                  </div>

                  {/* Signatures & Ledger tokens */}
                  <div className="grid grid-cols-2 gap-8 pt-6 border-t border-white/5 text-[9px] font-mono text-white/40 uppercase">
                    <div className="text-left space-y-1">
                      <span className="block text-white italic font-serif text-[11px] text-brand-gold">Dr. Audrey Finch</span>
                      <span className="block border-t border-white/10 pt-1">Senior Clinical OBGYN Council</span>
                    </div>

                    <div className="text-right space-y-1">
                      <span className="block text-white font-bold text-[9px] font-mono text-emerald-400">TVR-SYN-VERIFIED_PASS</span>
                      <span className="block border-t border-white/10 pt-1">Authorized Blockchain ID</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Utility print triggers */}
              <div className="flex justify-between items-center bg-white/[0.01] p-4.5 border border-white/5">
                <span className="text-[9.5px] font-mono text-white/40 uppercase tracking-widest">
                  Preview Template Active (Print Ready)
                </span>
                
                <button
                  type="button"
                  onClick={() => {
                    window.print();
                  }}
                  className="px-4 py-2 bg-white text-black hover:bg-brand-gold hover:text-black font-mono text-[8.5px] uppercase tracking-widest font-black transition-all flex items-center gap-1.5"
                >
                  <Printer size={11} />
                  <span>Print Credentials</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* 6. ENCRYPTED MOOD CAPTIONS FOOTER NOTES */}
      <div className="py-6 border-t border-white/5 text-center space-y-1 select-none">
        <p className="text-[11.5px] font-serif text-white/35 italic">
          &quot;Empowering you with structured knowledge for better understanding, better health, and better decisions.&quot; 🌸
        </p>
        <p className="text-[7.5px] font-mono uppercase tracking-[0.25em] text-[#D4AF37]/30">
          THE VAGINA ROOM ACADEMICS • ACCOUNT LEDGER ACTIVE
        </p>
      </div>

    </div>
  );

  // Quick helper to record learning tracks in local cache
  function trackLastLesson(titleStr: string) {
    try {
      localStorage.setItem('tvr_last_viewed_lesson', titleStr);
    } catch (e) {
      console.warn(e);
    }
  }
}
