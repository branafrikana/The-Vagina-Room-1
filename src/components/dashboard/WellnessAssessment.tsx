import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, ArrowLeft, CheckCircle2, Sparkles, Brain, Moon, Smile, HeartPulse, Info, Save } from 'lucide-react';

interface Question {
  id: string;
  category: string;
  question: string;
  tooltip?: string;
  options: { label: string; value: string; tags: string[] }[];
}

const ASSESSMENT_QUESTIONS: Question[] = [
  {
    id: 'primary_goal',
    category: 'Welcome',
    question: "What is your primary focus right now?",
    tooltip: "We will prioritize resources targeting this specific goal.",
    options: [
      { label: "Balancing my hormones and cycle", value: "hormones", tags: ["supplements", "programs"] },
      { label: "Preparing for pregnancy", value: "fertility", tags: ["kits", "courses"] },
      { label: "Managing stress and emotional wellness", value: "stress", tags: ["digital", "events"] },
      { label: "Relieving specific discomforts (PMS, cramps)", value: "pain", tags: ["herbal", "supplements"] },
    ]
  },
  {
    id: 'cycle_regularity',
    category: 'Physical Body',
    question: "How would you describe your menstrual cycle?",
    tooltip: "A 'regular' cycle typically ranges from 24-38 days with consistent variation of no more than 7-9 days between longest and shortest cycles.",
    options: [
      { label: "Regular and predictable", value: "regular", tags: [] },
      { label: "Irregular or missing", value: "irregular", tags: ["courses"] },
      { label: "Heavy or painful", value: "heavy", tags: ["herbal"] },
      { label: "I am in peri/menopause", value: "menopause", tags: ["supplements"] },
    ]
  },
  {
    id: 'energy_levels',
    category: 'Daily Energy',
    question: "How are your energy levels throughout the day?",
    options: [
      { label: "Consistent and strong", value: "high", tags: [] },
      { label: "Frequent crashes or fatigue", value: "fatigue", tags: ["supplements", "digital"] },
      { label: "Wired but tired (anxious)", value: "anxious", tags: ["events", "digital"] },
    ]
  },
  {
    id: 'sleep_quality',
    category: 'Recovery',
    question: "How well are you resting right now?",
    tooltip: "Quality sleep means falling asleep within 20 mins, minimal to no waking during the night, and feeling refreshed.",
    options: [
      { label: "Deep, restorative sleep", value: "good", tags: [] },
      { label: "Difficulty falling asleep", value: "insomnia", tags: ["herbal", "digital"] },
      { label: "Waking up unrefreshed", value: "unrefreshed", tags: ["supplements"] },
    ]
  }
];

export default function WellnessAssessment({ onComplete, onCancel }: { onComplete: (tags: string[]) => void, onCancel: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [collectedTags, setCollectedTags] = useState<string[]>([]);
  const [showTooltip, setShowTooltip] = useState(false);
  const [saveIndicator, setSaveIndicator] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('tvr_assessment_progress');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCurrentStep(parsed.currentStep || 0);
        setAnswers(parsed.answers || {});
        setCollectedTags(parsed.collectedTags || []);
      } catch (err) {
        console.error("Failed to parse saved assessment state");
      }
    }
  }, []);

  const handleSelectOption = (questionId: string, optionValue: string, tags: string[]) => {
    const newAnswers = { ...answers, [questionId]: optionValue };
    const newTags = [...collectedTags, ...tags];
    
    setAnswers(newAnswers);
    setCollectedTags(newTags);
    
    setTimeout(() => {
       if (currentStep < ASSESSMENT_QUESTIONS.length - 1) {
         setCurrentStep(prev => prev + 1);
       } else {
         handleFinish(newTags);
       }
    }, 400);
  };

  const handleSaveProgress = () => {
    localStorage.setItem('tvr_assessment_progress', JSON.stringify({ currentStep, answers, collectedTags }));
    setSaveIndicator(true);
    setTimeout(() => setSaveIndicator(false), 2000);
  };

  const handleFinish = (finalTags: string[] = collectedTags) => {
    localStorage.removeItem('tvr_assessment_progress'); // Clear on finish

    // Deduplicate and count tags to figure out primary recommendations
    const tagCounts = finalTags.reduce((acc, tag) => {
       acc[tag] = (acc[tag] || 0) + 1;
       return acc;
    }, {} as Record<string, number>);
    
    // Sort tags by frequency
    const sortedTags = Object.keys(tagCounts).sort((a, b) => tagCounts[b] - tagCounts[a]);
    onComplete(sortedTags);
  };

  const currentQ = ASSESSMENT_QUESTIONS[currentStep];
  const progress = ((currentStep + 1) / ASSESSMENT_QUESTIONS.length) * 100;

  return (
    <div className="bg-[#111111] border border-white/5 rounded-3xl p-6 md:p-10 max-w-3xl mx-auto shadow-2xl relative overflow-hidden">
       {/* Background accents */}
       <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/5 blur-[100px] pointer-events-none" />
       
       {/* Header */}
       <div className="flex items-center justify-between mb-8 relative z-10">
          <button onClick={onCancel} className="text-white/40 hover:text-white transition-colors flex items-center gap-2 text-xs font-mono uppercase tracking-widest">
             <ArrowLeft size={14} /> Quit
          </button>
          <div className="flex items-center gap-4">
             <button 
                onClick={handleSaveProgress}
                className="text-white/40 hover:text-brand-gold transition-colors flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest"
             >
                <Save size={14} /> {saveIndicator ? 'Saved!' : 'Save Progress'}
             </button>
             <div className="text-[10px] font-mono uppercase tracking-widest text-brand-gold font-bold">
                Step {currentStep + 1} of {ASSESSMENT_QUESTIONS.length}
             </div>
          </div>
       </div>

       {/* Progress Visualizer */}
       <div className="flex gap-2 w-full mb-10 relative z-10">
          {ASSESSMENT_QUESTIONS.map((_, idx) => {
             const isActive = idx === currentStep;
             const isCompleted = idx < currentStep;
             return (
                <div key={idx} className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden relative">
                   <motion.div 
                      className={`absolute inset-0 h-full ${isCompleted ? 'bg-brand-gold' : 'bg-brand-gold/50'}`}
                      initial={{ width: "0%" }}
                      animate={{ width: isCompleted ? "100%" : isActive ? "100%" : "0%" }}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                      style={{ originX: 0 }}
                   />
                </div>
             );
          })}
       </div>

       {/* Question Container */}
       <div className="relative z-10 min-h-[300px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
             <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
             >
                <div className="text-center space-y-2">
                   <p className="text-xs uppercase tracking-[0.2em] text-white/50 font-black">{currentQ.category}</p>
                   <div className="flex items-center justify-center gap-2 relative">
                     <h3 className="text-2xl md:text-3xl font-serif font-black text-white">{currentQ.question}</h3>
                     {currentQ.tooltip && (
                       <div 
                         className="relative" 
                         onMouseEnter={() => setShowTooltip(true)} 
                         onMouseLeave={() => setShowTooltip(false)}
                       >
                         <Info size={16} className="text-white/40 hover:text-brand-gold cursor-help transition-colors" />
                         <AnimatePresence>
                           {showTooltip && (
                             <motion.div 
                               initial={{ opacity: 0, y: 5 }}
                               animate={{ opacity: 1, y: 0 }}
                               exit={{ opacity: 0, y: 5 }}
                               className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-black border border-white/10 text-[10px] font-sans text-white/80 rounded z-50 text-center"
                             >
                               {currentQ.tooltip}
                             </motion.div>
                           )}
                         </AnimatePresence>
                       </div>
                     )}
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {currentQ.options.map((opt, i) => {
                     const isSelected = answers[currentQ.id] === opt.value;
                     return (
                        <button
                           key={i}
                           onClick={() => handleSelectOption(currentQ.id, opt.value, opt.tags)}
                           className={`p-5 rounded-2xl border text-left transition-all duration-300 flex items-center justify-between group ${
                              isSelected 
                                 ? 'bg-brand-gold/10 border-brand-gold text-brand-gold shadow-[0_0_20px_rgba(212,175,55,0.2)]' 
                                 : 'bg-black/50 border-white/10 hover:border-brand-gold/50 hover:bg-white/5 text-white'
                           }`}
                        >
                           <span className="font-sans text-sm font-medium">{opt.label}</span>
                           <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                              isSelected ? 'border-brand-gold bg-brand-gold text-black' : 'border-white/20 group-hover:border-brand-gold/50'
                           }`}>
                              {isSelected && <CheckCircle2 size={12} strokeWidth={4} />}
                           </div>
                        </button>
                     );
                   })}
                </div>
             </motion.div>
          </AnimatePresence>
       </div>
    </div>
  );
}
