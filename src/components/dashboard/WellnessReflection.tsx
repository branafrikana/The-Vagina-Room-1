import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Plus, 
  History, 
  TrendingUp, 
  MessageSquare, 
  Activity,
  ChevronRight,
  Save,
  Loader2,
  Calendar,
  Smile,
  Meh,
  Frown,
  AlertCircle,
  Trophy,
  Target,
  CheckCircle2,
  BookOpen,
  Sparkles,
  Trash2
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot, 
  serverTimestamp,
  updateDoc,
  doc,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';

const MOODS = [
  { value: 1, icon: Frown, label: 'Low', color: 'text-red-400' },
  { value: 2, icon: Meh, label: 'Struggling', color: 'text-orange-400' },
  { value: 3, icon: Meh, label: 'Stable', color: 'text-yellow-400' },
  { value: 4, icon: Smile, label: 'Good', color: 'text-emerald-400' },
  { value: 5, icon: Heart, label: 'Excellent', color: 'text-brand-gold' },
];

const COMMON_SYMPTOMS = [
  'Bloating', 'Cramping', 'Fatigue', 'Mood Swings', 
  'Headache', 'Discomfort', 'Spotting', 'Insomnia'
];

const GOAL_CATEGORIES = [
  { id: 'health', icon: Heart, label: 'Health' },
  { id: 'education', icon: BookOpen, label: 'Education' },
  { id: 'spiritual', icon: Sparkles, label: 'Spiritual' },
  { id: 'other', icon: Target, label: 'Other' },
];

export default function WellnessReflection() {
  const { user, userData } = useAuth();
  const [reflections, setReflections] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Reflection Form State
  const [mood, setMood] = useState(3);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  // Goal Form State
  const [goalTitle, setGoalTitle] = useState('');
  const [goalCategory, setGoalCategory] = useState('health');

  useEffect(() => {
    if (!user?.uid) return;

    // Fetch Reflections
    const qRef = query(
      collection(db, 'wellnessReflections'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(30)
    );

    const unsubscribeRef = onSnapshot(qRef, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().createdAt?.toDate()?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      })).reverse();
      setReflections(data);
      setLoading(false);
    }, (err) => {
      console.error("Failed to fetch reflections", err);
      setLoading(false);
    });

    // Fetch Goals
    const qGoals = query(
      collection(db, 'wellnessGoals'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeGoals = onSnapshot(qGoals, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setGoals(data);
    }, (err) => {
      console.error("WellnessReflection: Failed to fetch goals for user", user.uid, err);
      // Check for common permission or index errors
      if (err.message.includes("permissions") || err.code === 'permission-denied') {
        console.warn("WellnessReflection: Permission denied. Ensure your firestore.rules allow list/read on wellnessGoals for this userId.");
      }
    });

    return () => {
      unsubscribeRef();
      unsubscribeGoals();
    };
  }, [user?.uid]);

  const toggleSymptom = (s: string) => {
    setSymptoms(prev => 
      prev.includes(s) ? prev.filter(item => item !== s) : [...prev, s]
    );
  };

  const handleSaveReflection = async () => {
    if (!user?.uid) return;
    setSaving(true);
    try {
      await addDoc(collection(db, 'wellnessReflections'), {
        userId: user.uid,
        mood,
        symptoms,
        notes,
        createdAt: serverTimestamp()
      });
      setShowForm(false);
      setMood(3);
      setSymptoms([]);
      setNotes('');
    } catch (err) {
      console.error("Save failed", err);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveGoal = async () => {
    if (!user?.uid || !goalTitle) return;
    setSaving(true);
    try {
      await addDoc(collection(db, 'wellnessGoals'), {
        userId: user.uid,
        title: goalTitle,
        category: goalCategory,
        progress: 0,
        isCompleted: false,
        createdAt: serverTimestamp()
      });
      setShowGoalForm(false);
      setGoalTitle('');
      setGoalCategory('health');
    } catch (err) {
      console.error("Goal save failed", err);
    } finally {
      setSaving(false);
    }
  };

  const updateGoalProgress = async (goalId: string, newProgress: number) => {
    try {
      const goalRef = doc(db, 'wellnessGoals', goalId);
      await updateDoc(goalRef, {
        progress: newProgress,
        isCompleted: newProgress >= 100
      });
    } catch (err) {
      console.error("Update goal failed", err);
    }
  };

  const deleteGoal = async (goalId: string) => {
    if (!confirm("Are you sure you want to delete this goal?")) return;
    try {
      await deleteDoc(doc(db, 'wellnessGoals', goalId));
    } catch (err) {
      console.error("Delete goal failed", err);
    }
  };

  const chartData = reflections.map(r => ({
    date: r.date,
    mood: r.mood
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 bg-white/[0.02] border border-white/5">
        <Loader2 className="animate-spin text-brand-gold" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Header & Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/5">
        <div>
          <h3 className="text-xl font-black uppercase tracking-widest text-brand-gold flex items-center gap-3">
            <Activity className="text-brand-gold" size={24} /> Wellness Sanctuary
          </h3>
          <p className="text-[10px] text-white/40 font-mono mt-1 italic uppercase tracking-wider">Your personal space for reflection, restoration, and growth.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setShowForm(!showForm);
              setShowGoalForm(false);
            }}
            className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${showForm ? 'bg-white text-brand-black' : 'bg-brand-gold text-brand-black hover:bg-white'}`}
          >
            {showForm ? 'Cancel' : 'Reflection'}
            {showForm ? <ChevronRight size={14} /> : <Plus size={14} />}
          </button>
          <button
            onClick={() => {
              setShowGoalForm(!showGoalForm);
              setShowForm(false);
            }}
            className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${showGoalForm ? 'bg-white text-brand-black' : 'bg-white/10 text-white hover:bg-white/20'}`}
          >
            {showGoalForm ? 'Cancel' : 'Set Goal'}
            {showGoalForm ? <ChevronRight size={14} /> : <Target size={14} />}
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {showForm ? (
          <motion.div
            key="reflection-form"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="p-8 bg-zinc-950 border border-brand-gold/20 space-y-10"
          >
            {/* Mood Picker */}
            <div className="space-y-6">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white/60 text-center">How are you feeling today?</h4>
              <div className="flex justify-between max-w-xl mx-auto gap-4">
                {MOODS.map((m) => {
                  const Icon = m.icon;
                  const isActive = mood === m.value;
                  return (
                    <button
                      key={m.value}
                      onClick={() => setMood(m.value)}
                      className={`flex flex-col items-center gap-3 transition-all group ${isActive ? 'scale-110' : 'opacity-40 grayscale hover:opacity-100 hover:grayscale-0'}`}
                    >
                      <div className={`p-4 rounded-full border ${isActive ? 'bg-brand-gold/20 border-brand-gold' : 'bg-white/5 border-white/10 group-hover:border-white/30'}`}>
                        <Icon size={24} className={isActive ? 'text-brand-gold' : 'text-white'} />
                      </div>
                      <span className={`text-[9px] font-bold uppercase tracking-widest ${isActive ? 'text-brand-gold' : 'text-white/40'}`}>
                        {m.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Symptom Tracker */}
            <div className="space-y-6 pt-6 border-t border-white/5">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white/60">Symptom Tracking (Optional)</h4>
              <div className="flex flex-wrap gap-3">
                {COMMON_SYMPTOMS.map((s) => {
                  const isActive = symptoms.includes(s);
                  return (
                    <button
                      key={s}
                      onClick={() => toggleSymptom(s)}
                      className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest border transition-all ${
                        isActive 
                        ? 'bg-brand-gold border-brand-gold text-brand-black' 
                        : 'bg-white/5 border-white/10 text-white/40 hover:border-white/30'
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-4 pt-6 border-t border-white/5">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white/60 flex items-center gap-2">
                <MessageSquare size={14} /> Personal Thoughts
              </h4>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Share your journey for today... This is your private sanctuary."
                className="w-full h-32 bg-black/60 border border-white/10 p-6 text-white text-sm focus:border-brand-gold outline-none rounded-none transition-all resize-none font-serif italic"
              />
            </div>

            <div className="flex justify-end pt-6">
              <button
                onClick={handleSaveReflection}
                disabled={saving}
                className="px-10 py-4 bg-brand-gold hover:bg-white text-brand-black text-xs font-black uppercase tracking-widest flex items-center gap-3 transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                Lock Reflection
              </button>
            </div>
          </motion.div>
        ) : showGoalForm ? (
          <motion.div
            key="goal-form"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="p-8 bg-zinc-950 border border-white/10 space-y-8"
          >
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-brand-gold">Define a New Milestone</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[9px] text-white/40 uppercase tracking-widest block font-mono">Goal Title / Milestone</label>
                <input 
                  type="text"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  placeholder="e.g. Complete Reproductive Biology Module 1"
                  className="w-full bg-white/5 border border-white/10 p-4 text-white text-xs focus:border-brand-gold outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] text-white/40 uppercase tracking-widest block font-mono">Category</label>
                <div className="grid grid-cols-2 gap-2">
                  {GOAL_CATEGORIES.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setGoalCategory(c.id)}
                      className={`flex items-center gap-2 px-4 py-3 border text-[10px] font-black uppercase tracking-wider transition-all ${
                        goalCategory === c.id 
                        ? 'border-brand-gold bg-brand-gold/10 text-brand-gold' 
                        : 'border-white/5 bg-white/5 text-white/40 hover:bg-white/10'
                      }`}
                    >
                      <c.icon size={12} />
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-white/5">
              <button
                onClick={handleSaveGoal}
                disabled={saving || !goalTitle}
                className="px-10 py-4 bg-white text-brand-black text-xs font-black uppercase tracking-widest flex items-center gap-3 transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 className="animate-spin" size={18} /> : <Trophy size={18} />}
                Set Milestone
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="dashboard-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-12"
          >
            {/* Goals Tracking Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 flex items-center gap-2">
                  <Trophy size={14} className="text-brand-gold" /> Personal Milestones
                </h4>
                <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest">
                  {goals.filter(g => g.isCompleted).length} Completed / {goals.length} Total
                </span>
              </div>

              {goals.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {goals.map((goal) => {
                    const CategoryIcon = GOAL_CATEGORIES.find(c => c.id === goal.category)?.icon || Target;
                    return (
                      <div key={goal.id} className="p-6 bg-zinc-950 border border-white/5 hover:border-brand-gold/20 transition-all group relative overflow-hidden">
                        {goal.isCompleted && (
                          <div className="absolute top-0 right-0 p-2 text-brand-gold">
                            <CheckCircle2 size={16} />
                          </div>
                        )}
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/5 rounded text-white/40">
                              <CategoryIcon size={14} />
                            </div>
                            <h5 className="text-[10px] font-black uppercase tracking-widest text-white/80 truncate">
                              {goal.title}
                            </h5>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between items-end">
                              <span className="text-[8px] font-mono text-white/30 uppercase">Progress</span>
                              <span className="text-[10px] font-black text-brand-gold">{goal.progress}%</span>
                            </div>
                            <div className="h-1 bg-white/5 w-full relative overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${goal.progress}%` }}
                                className="absolute top-0 left-0 h-full bg-brand-gold shadow-[0_0_10px_rgba(212,175,55,0.4)]"
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center gap-2">
                              {[25, 50, 75, 100].map((val) => (
                                <button
                                  key={val}
                                  onClick={() => updateGoalProgress(goal.id, val)}
                                  className={`w-5 h-5 flex items-center justify-center text-[7px] font-bold rounded-full transition-all border ${
                                    goal.progress >= val 
                                    ? 'bg-brand-gold border-brand-gold text-brand-black' 
                                    : 'border-white/10 text-white/30 hover:border-white/30'
                                  }`}
                                >
                                  {val}
                                </button>
                              ))}
                            </div>
                            <button 
                              onClick={() => deleteGoal(goal.id)}
                              className="p-2 text-white/10 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-12 text-center bg-white/[0.01] border border-dashed border-white/10">
                  <Target size={32} className="mx-auto text-white/10 mb-4" />
                  <p className="text-[10px] text-white/30 font-mono uppercase tracking-widest">
                    No active milestones. Define your path to restoration.
                  </p>
                </div>
              )}
            </div>

            {/* Reflection Dashboard Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Chart Column */}
              <div className="lg:col-span-2 space-y-6">
                <div className="p-8 bg-zinc-950 border border-white/10">
                  <div className="flex items-center justify-between mb-8">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-gold flex items-center gap-2">
                      <TrendingUp size={14} /> Mood Restoration Trend
                    </h4>
                    <div className="text-[9px] text-white/30 font-mono uppercase tracking-widest bg-white/5 px-3 py-1 border border-white/5">
                      Restoration Analytics
                    </div>
                  </div>
                  
                  <div className="h-64 w-full">
                    {chartData.length > 1 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                          <XAxis 
                            dataKey="date" 
                            stroke="#ffffff20" 
                            fontSize={8} 
                            tickLine={false}
                            axisLine={false}
                            dy={10}
                          />
                          <YAxis 
                            domain={[1, 5]} 
                            ticks={[1, 2, 3, 4, 5]}
                            stroke="#ffffff20" 
                            fontSize={8}
                            tickLine={false}
                            axisLine={false}
                            dx={-10}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#09090b', 
                              border: '1px solid #D4AF3740',
                              borderRadius: '0px',
                              fontSize: '10px',
                              fontFamily: 'monospace'
                            }}
                            itemStyle={{ color: '#D4AF37' }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="mood" 
                            stroke="#D4AF37" 
                            strokeWidth={3} 
                            dot={{ fill: '#D4AF37', strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, fill: '#fff', stroke: '#D4AF37' }}
                            animationDuration={1500}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                        <TrendingUp size={32} className="text-white/10" />
                        <p className="text-[10px] text-white/30 font-mono uppercase tracking-widest">
                          Trend visible after multiple reflections.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Recent Feed Column */}
              <div className="space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 flex items-center gap-2">
                  <History size={12} /> Sacred Journal
                </h4>
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {reflections.slice().reverse().slice(0, 10).map((r) => (
                    <div key={r.id} className="p-5 bg-white/[0.02] border border-white/5 hover:border-brand-gold/20 transition-all">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-brand-gold/10 rounded-full text-brand-gold scale-75">
                            {React.createElement(MOODS.find(m => m.value === r.mood)?.icon || Meh, { size: 16 })}
                          </div>
                          <span className="text-[9px] font-mono text-white/30">{r.date}</span>
                        </div>
                      </div>
                      {r.notes && (
                        <p className="text-[11px] text-white/50 font-serif italic line-clamp-3 leading-relaxed">
                          "{r.notes}"
                        </p>
                      )}
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {r.symptoms?.map((s: string) => (
                          <span key={s} className="px-2 py-0.5 bg-brand-gold/5 text-[7px] text-brand-gold/60 uppercase tracking-tighter border border-brand-gold/10">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  {reflections.length === 0 && (
                    <div className="p-10 text-center bg-white/[0.01] border border-white/5">
                      <AlertCircle size={20} className="mx-auto text-white/10 mb-2" />
                      <p className="text-[9px] text-white/20 uppercase font-mono tracking-widest">Empty Ledger</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

