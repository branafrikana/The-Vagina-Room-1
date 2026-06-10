import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { 
  Play, 
  Square, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Sparkles, 
  Wind, 
  Heart, 
  Flame, 
  Info,
  Calendar,
  CheckCircle,
  HelpCircle,
  Brain,
  ChevronRight,
  Sparkle,
  Lock,
  ArrowRight
} from 'lucide-react';

interface BreathPhase {
  name: 'Inhale' | 'Hold' | 'Exhale' | 'HoldEmpty';
  duration: number; // in seconds
  cue: string;
  visualScale: number;
}

interface BreathingRhythm {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  phases: BreathPhase[];
}

const BREATHING_RHYTHMS: BreathingRhythm[] = [
  {
    id: 'box_breathing',
    name: 'Box Breathing',
    subtitle: 'High Cognitive Focus & Tactical Calm',
    description: 'Employed to quiet mental noise, neutralize panic loops, and restore flawless physiological balance under intense cognitive pressure.',
    phases: [
      { name: 'Inhale', duration: 4, cue: 'Lifting energy. Elevate your spine...', visualScale: 1.4 },
      { name: 'Hold', duration: 4, cue: 'Sustaining balance. Let distractions fade...', visualScale: 1.4 },
      { name: 'Exhale', duration: 4, cue: 'Gently casting out residual static and heat...', visualScale: 0.9 },
      { name: 'HoldEmpty', duration: 4, cue: 'Perfect stillness. Clean slate inside...', visualScale: 0.9 }
    ]
  },
  {
    id: 'calming_478',
    name: '4-7-8',
    subtitle: 'Anxiety Reset & Sleep Preparation',
    description: 'The standard modern breathing pattern designed to suppress fight-or-flight, quickly lower elevated heart rates, and induce peaceful sleep states.',
    phases: [
      { name: 'Inhale', duration: 4, cue: 'Fill up quietly through your nose...', visualScale: 1.5 },
      { name: 'Hold', duration: 7, cue: 'Suspending breath. Feel your heart slow...', visualScale: 1.5 },
      { name: 'Exhale', duration: 8, cue: 'Slowly let go with a soft whoosh sound...', visualScale: 0.8 }
    ]
  },
  {
    id: 'deep_relaxation',
    name: 'Deep Relaxation',
    subtitle: 'Womb Recovery & Autonomous Healing',
    description: 'Specifically crafted to reset chronic tension, release stored emotional trauma, and restore deep somatic restorative flow.',
    phases: [
      { name: 'Inhale', duration: 5, cue: 'Breathe down to the low sacrum, expanding gently...', visualScale: 1.4 },
      { name: 'Hold', duration: 5, cue: 'Resting in the space of complete fullness...', visualScale: 1.4 },
      { name: 'Exhale', duration: 5, cue: 'Slow release through a soft, slow sigh...', visualScale: 0.9 },
      { name: 'HoldEmpty', duration: 5, cue: 'Quiet. Comfort. Surrendering into calm...', visualScale: 0.9 }
    ]
  },
  {
    id: 'somatic_pelvic',
    name: 'Somatic Pelvic Release',
    subtitle: 'Nervous System & Pelvic floor Relaxation',
    description: 'Specifically crafted to reset chronic tension in the pelvic floor, release stored emotional trauma in the womb space, and restore deep abdominal somatic flow.',
    phases: [
      { name: 'Inhale', duration: 4, cue: 'Abdomen & Pelvic floor expanding gently...', visualScale: 1.5 },
      { name: 'Hold', duration: 4, cue: 'Resting in the space of complete fullness...', visualScale: 1.5 },
      { name: 'Exhale', duration: 6, cue: 'Deep release through a soft, slow sigh...', visualScale: 0.85 },
      { name: 'HoldEmpty', duration: 2, cue: 'Sanctuary of peace. Relaxing into comfort...', visualScale: 0.85 }
    ]
  }
];

// Voice speech trigger logic for standard local compliance
const speakCue = (text: string) => {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel(); // Stop active speaking queue immediately
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    // Prefer soft standard english voices to fit wellness focus
    const bestVoice = voices.find(v => 
      v.lang.startsWith('en') && 
      (v.name.toLowerCase().includes('google') || v.name.toLowerCase().includes('natural') || v.name.toLowerCase().includes('samantha'))
    );
    if (bestVoice) {
      utterance.voice = bestVoice;
    }
    utterance.rate = 0.82; // Calming, slightly slower rate of reading
    utterance.pitch = 1.05; // Friendly, warm atmospheric sound
    utterance.volume = 0.7; // Moderate levels
    window.speechSynthesis.speak(utterance);
  }
};

const somaticBioGuidelines = {
  Inhale: "Breathe down to the vagina & lower sacrum. Expand your low belly outward like a warm balloon, relaxing pelvic floor muscles downwards completely.",
  Hold: "Keep your abdomen softened and expanded. Cradle the warm lifeforce inside your low womb. Maintain complete jaw and neck relaxation.",
  Exhale: "Exhale through parted lips. Sigh softly, feeling your belly recoil, expelling every drop of negative energy. Let the pelvic wall return to safe rest.",
  HoldEmpty: "Rest in the empty sanctuary. Feel the security of absolute stillness. Sense the light biological pulses balancing your nervous system."
};

export default function SomaticBreathingPage({ isDashboardTab = false }: { isDashboardTab?: boolean }) {
  const { user, loading, hasActiveMembership } = useAuth();
  const [selectedRhythm, setSelectedRhythm] = useState<BreathingRhythm>(BREATHING_RHYTHMS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [timeLeftInPhase, setTimeLeftInPhase] = useState(selectedRhythm.phases[0].duration);
  const [soundMode, setSoundMode] = useState<'432hz' | 'singing_bowl' | 'space_hum' | 'vocal_coach' | 'silent'>('vocal_coach');
  const [targetDuration, setTargetDuration] = useState<number>(300); // 5 minutes default
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  
  // Local persistence stats
  const [streak, setStreak] = useState<number>(0);
  const [totalSessions, setTotalSessions] = useState<number>(0);
  const [totalMinutes, setTotalMinutes] = useState<number>(0);

  // Sound Synthesizers references
  const audioCtxRef = useRef<AudioContext | null>(null);
  const synthNodesRef = useRef<OscillatorNode[]>([]);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Ambient synthesizer references
  const ambientAudioCtxRef = useRef<AudioContext | null>(null);
  const ambientNodesRef = useRef<any[]>([]);
  const [ambientTrack, setAmbientTrack] = useState<'none' | 'nature' | 'piano'>('none');
  const [isAmbientPlaying, setIsAmbientPlaying] = useState(false);

  // Timekeepers
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const totalTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Read local stats
    const rawStreak = localStorage.getItem('tvr_breathing_streak');
    const rawTotalSessions = localStorage.getItem('tvr_breathing_total_sessions');
    const rawTotalSecs = localStorage.getItem('tvr_breathing_total_seconds');
    const lastSessionDate = localStorage.getItem('tvr_breathing_last_date');

    if (rawStreak) setStreak(parseInt(rawStreak, 10));
    if (rawTotalSessions) setTotalSessions(parseInt(rawTotalSessions, 10));
    if (rawTotalSecs) {
      setTotalMinutes(Math.round(parseInt(rawTotalSecs, 10) / 60));
    }

    // Daily streak logic
    if (lastSessionDate) {
      const today = new Date().toDateString();
      const last = new Date(lastSessionDate).toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      if (last !== today && last !== yesterday) {
        setStreak(0);
        localStorage.setItem('tvr_breathing_streak', '0');
      }
    }

    return () => {
      stopBreathing();
    };
  }, []);

  // Sync state on pattern changes
  useEffect(() => {
    if (!isPlaying) {
      setCurrentPhaseIndex(0);
      setTimeLeftInPhase(selectedRhythm.phases[0].duration);
    }
  }, [selectedRhythm, isPlaying]);

  // Handle live changes of sound modes during exercises
  useEffect(() => {
    if (isPlaying) {
      // Re-initialize correct sounds matching active options
      initAudio();
    }
  }, [soundMode]);

  if (loading && !isDashboardTab) {
    return (
      <div className="bg-brand-black text-white min-h-screen font-sans flex flex-col justify-center items-center">
        <div className="flex flex-col items-center gap-4 z-10">
          <div className="w-12 h-12 border-4 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
          <p className="text-brand-gold font-black uppercase tracking-[0.3em] font-mono text-[10px]">Verifying Sanctuary Credentials</p>
        </div>
      </div>
    );
  }

  if ((!user || !hasActiveMembership) && !isDashboardTab) {
    return (
      <>
        <SEO 
          title="Inner Sanctuary Locked - The Vagina Room" 
          description="Somatic breathing and womb-healing frequency resources are reserved for active members of The Vagina Room Inner Circle."
        />
        
        <div className="bg-brand-black text-white min-h-screen font-sans flex flex-col selection:bg-brand-gold selection:text-brand-black">
          <Navigation />

          <main className="flex-grow pt-32 pb-24 px-6 relative overflow-hidden flex flex-col justify-center items-center">
            {/* Subtle premium background glow */}
            <div className="absolute top-1/4 left-1/4 w-[35rem] h-[35rem] bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.03)_0%,transparent_70%)] rounded-full pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-[35rem] h-[35rem] bg-[radial-gradient(circle_at_center,rgba(196,30,58,0.03)_0%,transparent_70%)] rounded-full pointer-events-none" />

            <div className="max-w-xl w-full text-center relative z-10 mt-12 mb-6">
              
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="bg-white/[0.01] border border-brand-gold/20 p-8 sm:p-12 rounded-2xl shadow-[0_4px_30px_rgba(212,175,55,0.03)] backdrop-blur-sm"
              >
                {/* Gold Hex/Circular Lock Shield Icon */}
                <div className="w-16 h-16 rounded-full bg-brand-gold/10 border border-brand-gold/25 flex items-center justify-center text-brand-gold mx-auto mb-6">
                  <Lock className="w-6 h-6" />
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-gold/5 border border-brand-gold/15 rounded-full mb-4">
                  <Sparkles className="text-brand-gold w-3 h-3" />
                  <span className="text-[8px] font-mono tracking-[0.25em] uppercase text-brand-gold font-bold">Members Only Sanctuary</span>
                </div>

                <h1 className="text-3xl sm:text-4xl font-serif text-brand-cream italic tracking-tight mb-4">
                  The Inner Sanctuary
                </h1>
                
                <p className="text-white/50 text-xs leading-relaxed max-w-sm mx-auto mb-8 font-light italic">
                  "Each breath is sacred." This premium somatic space, featuring real-time biometric breathing loops, Solfeggio 432Hz sound frequencies, and vocal coaching, is exclusively reserved for members of The Vagina Room.
                </p>

                {/* Benefits List */}
                <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl text-left space-y-3 mb-8">
                  <div className="flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-gold mt-1.5 shrink-0" />
                    <p className="text-[11px] text-white/60"><strong className="text-white">Custom Flow Rhythms:</strong> Access Box Breathing, 4-7-8, and our signature Pelvic Release cycles.</p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-gold mt-1.5 shrink-0" />
                    <p className="text-[11px] text-white/60"><strong className="text-white">Acoustic Audio Therapies:</strong> Real-time synthesized 432Hz sine drones, Tibetan signing bowls, and vocal coaching cues.</p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-gold mt-1.5 shrink-0" />
                    <p className="text-[11px] text-white/60"><strong className="text-white">Progress Preservation:</strong> Save workout streaks, total meditation-mindful minutes, and daily reflections.</p>
                  </div>
                </div>

                {/* Call-to-actions based on current auth state */}
                <div className="space-y-3">
                  {!user ? (
                    <>
                      <Link
                        to="/register"
                        className="w-full py-3.5 bg-brand-gold hover:bg-[#C49B2F] text-brand-black rounded-lg text-xs uppercase font-extrabold tracking-widest font-sans hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(212,175,55,0.15)]"
                      >
                        Join the Sisterhood <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                      <div className="flex items-center justify-center gap-1.5 pt-2">
                        <span className="text-[10px] text-white/40">Already have sanctuary access?</span>
                        <Link to="/login" className="text-[10px] text-brand-gold hover:underline font-bold">
                          Login here
                        </Link>
                      </div>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/join-community"
                        className="w-full py-3.5 bg-brand-gold hover:bg-[#C49B2F] text-brand-black rounded-lg text-xs uppercase font-extrabold tracking-widest font-sans hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(212,175,55,0.15)]"
                      >
                        Activate Your Membership <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                      <div className="flex items-center justify-center gap-1.5 pt-2">
                        <span className="text-[10px] text-white/40">Not ready yet?</span>
                        <Link to="/" className="text-[10px] text-brand-cream hover:underline">
                          Return to Home
                        </Link>
                      </div>
                    </>
                  )}
                </div>

              </motion.div>

            </div>
          </main>

          <Footer />
        </div>
      </>
    );
  }

  // Synthesizer setup
  const initAudio = () => {
    try {
      if (soundMode === 'silent' || soundMode === 'vocal_coach') {
        stopAudioOnly();
        return;
      }

      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Cleanup prior node instances
      synthNodesRef.current.forEach(node => {
        try { node.stop(); node.disconnect(); } catch (e) {}
      });
      synthNodesRef.current = [];

      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.connect(ctx.destination);
      gainNodeRef.current = gainNode;

      if (soundMode === '432hz') {
        // Soothing solid 108Hz drone (432Hz Subharmonic resonant wave)
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(108, ctx.currentTime);
        osc.connect(gainNode);
        osc.start();
        synthNodesRef.current.push(osc);
      } else if (soundMode === 'singing_bowl') {
        // Multi-layered Solfeggio frequency chords recreating deep singing bowl resonance
        const frequencies = [220, 330, 396, 432]; 
        frequencies.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
          osc.detune.setValueAtTime(idx * 2.8, ctx.currentTime); // choral drift

          const subGain = ctx.createGain();
          subGain.gain.setValueAtTime(0.2 / frequencies.length, ctx.currentTime);

          osc.connect(subGain);
          subGain.connect(gainNode);
          osc.start();
          synthNodesRef.current.push(osc);
        });
      } else if (soundMode === 'space_hum') {
        // Comforting low-pitched warm hum
        const osc1 = ctx.createOscillator();
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(65, ctx.currentTime);

        const osc2 = ctx.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(130, ctx.currentTime);

        osc1.connect(gainNode);
        osc2.connect(gainNode);
        
        osc1.start();
        osc2.start();
        
        synthNodesRef.current.push(osc1, osc2);
      }

      // Lift initial volume smoothly
      gainNode.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 1.0);
    } catch (e) {
      console.warn("Web Audio Context initialized with constraints:", e);
    }
  };

  const adjustAudioPitchAndVolume = (phaseName: string, durationRemaining: number, phaseDuration: number) => {
    if (soundMode === 'silent' || soundMode === 'vocal_coach' || !gainNodeRef.current || !audioCtxRef.current) return;
    
    const ctx = audioCtxRef.current;
    const now = ctx.currentTime;
    
    // Wave dynamic modulation matching breathing phase expansion & deflation
    if (phaseName === 'Inhale') {
      gainNodeRef.current.gain.linearRampToValueAtTime(0.18, now + 0.6);
    } else if (phaseName === 'Hold') {
      gainNodeRef.current.gain.linearRampToValueAtTime(0.11, now + 0.6);
    } else if (phaseName === 'Exhale') {
      gainNodeRef.current.gain.linearRampToValueAtTime(0.08, now + 0.6);
    } else {
      // Empty target
      gainNodeRef.current.gain.linearRampToValueAtTime(0.02, now + 0.9);
    }
  };

  const stopAudioOnly = () => {
    if (gainNodeRef.current && audioCtxRef.current) {
      try {
        gainNodeRef.current.gain.linearRampToValueAtTime(0, audioCtxRef.current.currentTime + 0.3);
      } catch (e) {}
    }
    setTimeout(() => {
      try {
        synthNodesRef.current.forEach(node => {
          try { node.stop(); node.disconnect(); } catch (err) {}
        });
        synthNodesRef.current = [];
      } catch (e) {}
    }, 400);
  };

  const startAmbientSynth = (track: 'nature' | 'piano') => {
    try {
      stopAmbientSynthOnly();
      
      if (!ambientAudioCtxRef.current) {
        ambientAudioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const ctx = ambientAudioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0, ctx.currentTime);
      masterGain.connect(ctx.destination);
      ambientNodesRef.current.push(masterGain);

      if (track === 'nature') {
        // Nature: White Noise + Lowpass Filter modulated by a very slow LFO simulating heavy wind or gentle ocean waves
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.Q.setValueAtTime(1.0, ctx.currentTime);

        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.08, ctx.currentTime); // slow swell

        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(300, ctx.currentTime); // sweep range

        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);
        filter.frequency.setValueAtTime(450, ctx.currentTime);

        whiteNoise.connect(filter);
        filter.connect(masterGain);

        lfo.start();
        whiteNoise.start();

        ambientNodesRef.current.push(whiteNoise, filter, lfo, lfoGain);
      } else if (track === 'piano') {
        // Calm Piano: Slow, soothing bell-like warm spacious piano chords
        const notes = [
          [130.81, 164.81, 196.00, 246.94], // Cmaj7
          [146.83, 174.61, 220.00, 261.63], // Dm7
          [110.00, 138.59, 164.81, 220.00], // A Major
          [116.54, 138.59, 164.81, 207.65]  // Bbmaj7
        ];

        let chordIndex = 0;
        
        const playNextChord = () => {
          if (!ambientAudioCtxRef.current) return;
          const currentCtx = ambientAudioCtxRef.current;
          if (currentCtx.state === 'closed') return;
          
          const t = currentCtx.currentTime;
          const chord = notes[chordIndex];
          chordIndex = (chordIndex + 1) % notes.length;

          chord.forEach((freq, idx) => {
            const osc = currentCtx.createOscillator();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, currentCtx.currentTime);
            
            const pGain = currentCtx.createGain();
            pGain.gain.setValueAtTime(0, t);
            pGain.gain.linearRampToValueAtTime(0.03, t + 0.1 + (idx * 0.05));
            pGain.gain.exponentialRampToValueAtTime(0.001, t + 4.5 + (idx * 0.2));

            const pFilter = currentCtx.createBiquadFilter();
            pFilter.type = 'lowpass';
            pFilter.frequency.setValueAtTime(800, t);

            osc.connect(pFilter);
            pFilter.connect(pGain);
            pGain.connect(masterGain);

            osc.start(t);
            osc.stop(t + 6);
          });
        };

        playNextChord();
        const chordInterval = setInterval(playNextChord, 5000);
        (window as any)._pianoInterval = chordInterval;
      }

      masterGain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 1.5);
      setIsAmbientPlaying(true);
    } catch (e) {
      console.warn("Error starting ambient synthesizer:", e);
    }
  };

  const stopAmbientSynthOnly = () => {
    if ((window as any)._pianoInterval) {
      clearInterval((window as any)._pianoInterval);
      (window as any)._pianoInterval = null;
    }
    
    const currentNodes = ambientNodesRef.current;
    if (ambientAudioCtxRef.current && currentNodes.length > 0) {
      const masterGain = currentNodes[0];
      try {
        masterGain.gain.linearRampToValueAtTime(0, ambientAudioCtxRef.current.currentTime + 0.8);
      } catch (err) {}
    }

    setTimeout(() => {
      try {
        currentNodes.forEach(node => {
          try { node.stop(); node.disconnect(); } catch (e) {}
        });
      } catch (e) {}
      ambientNodesRef.current = [];
      setIsAmbientPlaying(false);
    }, 1000);
  };

  const stopAudio = () => {
    stopAudioOnly();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  const startBreathing = () => {
    setIsPlaying(true);
    setShowSummary(false);
    initAudio();
    if (ambientTrack !== 'none') {
      startAmbientSynth(ambientTrack as 'nature' | 'piano');
    }
    
    const currentRhythm = selectedRhythm;
    let phaseIdx = currentPhaseIndex;
    let secondsLeft = currentPhaseIndex === 0 ? currentRhythm.phases[0].duration : timeLeftInPhase;
    let overallElapsed = elapsedTime;

    if (soundMode === 'vocal_coach') {
      const activePhase = currentRhythm.phases[phaseIdx];
      speakCue(`${activePhase.name}. ${activePhase.cue}`);
    }

    totalTimerRef.current = setInterval(() => {
      overallElapsed += 1;
      setElapsedTime(overallElapsed);

      if (targetDuration > 0 && overallElapsed >= targetDuration) {
        completeSession(overallElapsed);
      }
    }, 1000);

    countdownIntervalRef.current = setInterval(() => {
      secondsLeft -= 1;
      
      const activePhase = currentRhythm.phases[phaseIdx];
      adjustAudioPitchAndVolume(activePhase.name, secondsLeft, activePhase.duration);

      if (secondsLeft < 0) {
        const nextIdx = (phaseIdx + 1) % currentRhythm.phases.length;
        phaseIdx = nextIdx;
        setCurrentPhaseIndex(nextIdx);
        secondsLeft = currentRhythm.phases[nextIdx].duration;

        const nextPhase = currentRhythm.phases[nextIdx];
        if (soundMode === 'vocal_coach') {
          speakCue(`${nextPhase.name}. ${nextPhase.cue}`);
        }
      }
      
      setTimeLeftInPhase(secondsLeft);
    }, 1000);
  };

  const stopBreathing = () => {
    setIsPlaying(false);
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    if (totalTimerRef.current) {
      clearInterval(totalTimerRef.current);
      totalTimerRef.current = null;
    }
    stopAudio();
    stopAmbientSynthOnly();
  };

  const completeSession = (totalTime: number) => {
    stopBreathing();
    setShowSummary(true);

    const today = new Date().toDateString();
    const lastSessionDate = localStorage.getItem('tvr_breathing_last_date');
    let currentStreak = parseInt(localStorage.getItem('tvr_breathing_streak') || '0', 10);

    if (lastSessionDate === today) {
      // Retain daily streak
    } else if (lastSessionDate === new Date(Date.now() - 86400000).toDateString()) {
      currentStreak += 1;
    } else {
      currentStreak = 1;
    }

    const currentTotalSessions = parseInt(localStorage.getItem('tvr_breathing_total_sessions') || '0', 10) + 1;
    const currentTotalSecs = parseInt(localStorage.getItem('tvr_breathing_total_seconds') || '0', 10) + totalTime;

    setStreak(currentStreak);
    setTotalSessions(currentTotalSessions);
    setTotalMinutes(Math.round(currentTotalSecs / 60));

    localStorage.setItem('tvr_breathing_streak', currentStreak.toString());
    localStorage.setItem('tvr_breathing_total_sessions', currentTotalSessions.toString());
    localStorage.setItem('tvr_breathing_total_seconds', currentTotalSecs.toString());
    localStorage.setItem('tvr_breathing_last_date', today);
  };

  const resetAll = () => {
    stopBreathing();
    setCurrentPhaseIndex(0);
    setTimeLeftInPhase(selectedRhythm.phases[0].duration);
    setElapsedTime(0);
    setShowSummary(false);
  };

  const activePhase = selectedRhythm.phases[currentPhaseIndex];
  
  // Segmented calculations
  const totalCycleDuration = selectedRhythm.phases.reduce((sum, p) => sum + p.duration, 0);
  
  // Left side relative offsets calculation
  let elapsedSecondsInCycle = 0;
  for (let i = 0; i < currentPhaseIndex; i++) {
    elapsedSecondsInCycle += selectedRhythm.phases[i].duration;
  }
  elapsedSecondsInCycle += (selectedRhythm.phases[currentPhaseIndex].duration - timeLeftInPhase);
  const cycleProgressPercent = (elapsedSecondsInCycle / totalCycleDuration) * 100;

  return (
    <>
      {!isDashboardTab && (
        <SEO 
          title="Somatic Breathing Space - Live Breathing & Audio Tools" 
          description="Connect with your body, regulate your nervous system, and dissolve mental or physical stress with tailored womb and pelvic healing breathing patterns."
        />
      )}
      
      <div className={isDashboardTab ? "w-full text-white font-sans flex flex-col selection:bg-brand-gold selection:text-brand-black" : "bg-brand-black text-white min-h-screen font-sans flex flex-col selection:bg-brand-gold selection:text-brand-black"}>
        {!isDashboardTab && <Navigation />}

        <main className={isDashboardTab ? "flex-grow pt-4 pb-12 px-2 relative overflow-hidden flex flex-col justify-center items-center" : "flex-grow pt-32 pb-24 px-6 relative overflow-hidden flex flex-col justify-center items-center"}>
          {/* Subtle cosmic background glows */}
          <div className="absolute top-1/4 left-1/4 w-[35rem] h-[35rem] bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.02)_0%,transparent_70%)] rounded-full pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-[35rem] h-[35rem] bg-[radial-gradient(circle_at_center,rgba(196,30,58,0.03)_0%,transparent_70%)] rounded-full pointer-events-none" />

          <div className="max-w-5xl w-full flex flex-col items-center">
            
            {/* Header Title Gimmicks */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8 w-full"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-gold/5 border border-brand-gold/20 rounded-full mb-4">
                <Wind className="text-brand-gold w-3.5 h-3.5 animate-pulse" />
                <span className="text-[9px] font-mono tracking-[0.25em] uppercase text-brand-gold font-bold">Divine Soma Breathwork</span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif italic text-brand-cream tracking-tight mb-2">
                Somatic Breathing Space
              </h1>
              <p className="text-white/45 max-w-xl mx-auto text-xs italic font-light">
                Calibrate biological rhythms, optimize heart rate variability (HRV), and relax chronic contractions. Pair custom presets with soothing Web Audio soundscapes and live speech coaching rules.
              </p>
            </motion.div>

            {/* Stats Panel */}
            <div className="grid grid-cols-3 gap-3 w-full max-w-xl bg-white/[0.02] border border-white/5 p-4 rounded-xl mb-10 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-brand-gold/5 to-transparent pointer-events-none" />
              <div>
                <span className="text-white/30 text-[8px] uppercase tracking-wider block mb-1">Active Streak</span>
                <span className="text-base sm:text-lg font-bold text-brand-gold flex items-center justify-center gap-1.5 font-mono">
                  <Flame className="w-4 h-4 text-brand-gold/80" /> {streak} {streak === 1 ? 'Day' : 'Days'}
                </span>
              </div>
              <div className="border-x border-white/5">
                <span className="text-white/30 text-[8px] uppercase tracking-wider block mb-1">Total Meditations</span>
                <span className="text-base sm:text-lg font-bold text-brand-cream flex items-center justify-center gap-1.5 font-mono">
                  <CheckCircle className="w-4 h-4 text-brand-cream/60" /> {totalSessions}
                </span>
              </div>
              <div>
                <span className="text-white/30 text-[8px] uppercase tracking-wider block mb-1">Duration Mindful</span>
                <span className="text-base sm:text-lg font-bold text-brand-red flex items-center justify-center gap-1.5 font-mono">
                  <Brain className="w-4 h-4 text-brand-red/60" /> {totalMinutes}m
                </span>
              </div>
            </div>

            {/* Main Segment Stage */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 w-full items-start">
              
              {/* Controls Column */}
              <div className="lg:col-span-5 space-y-4">
                
                {/* Advanced Dropdown Selector */}
                <div className="bg-brand-black/40 border border-brand-gold/30 p-4 rounded-xl space-y-2.5">
                  <label htmlFor="breathing-technique-dropdown" className="text-brand-gold text-[9.5px] uppercase tracking-widest font-mono font-black block">
                    ⚡ Select Active Technique (Dropdown)
                  </label>
                  <select
                    id="breathing-technique-dropdown"
                    value={selectedRhythm.id}
                    onChange={(e) => {
                      const rhythm = BREATHING_RHYTHMS.find(r => r.id === e.target.value);
                      if (rhythm && !isPlaying) {
                        setSelectedRhythm(rhythm);
                      }
                    }}
                    disabled={isPlaying}
                    className="w-full bg-brand-black border border-white/15 text-white text-xs px-3.5 py-2 rounded-lg focus:border-brand-gold focus:outline-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all font-mono"
                  >
                    {BREATHING_RHYTHMS.map((r) => (
                      <option key={r.id} value={r.id} className="bg-brand-black text-white">
                        {r.name}
                      </option>
                    ))}
                  </select>
                  {isPlaying && (
                    <p className="text-[8px] text-brand-red font-mono italic animate-pulse">
                      ⚠️ Session in progress. Stop the timer to select another rhythm.
                    </p>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <h3 className="text-white/40 text-[9px] uppercase tracking-widest font-mono font-bold">Select Active Preset</h3>
                  <span className="text-[8px] font-mono text-brand-gold border border-brand-gold/15 bg-brand-gold/5 px-2 py-0.5 rounded uppercase">Responsive presets</span>
                </div>

                <div className="space-y-3">
                  {BREATHING_RHYTHMS.map((rhythm) => {
                    const isSelected = selectedRhythm.id === rhythm.id;
                    return (
                      <button
                        key={rhythm.id}
                        onClick={() => {
                          if (!isPlaying) {
                            setSelectedRhythm(rhythm);
                          }
                        }}
                        disabled={isPlaying}
                        className={`w-full text-left p-4 rounded-xl border transition-all relative overflow-hidden group ${
                          isSelected 
                            ? 'bg-brand-gold/[0.05] border-brand-gold text-white shadow-[0_4px_24px_rgba(212,175,55,0.05)]' 
                            : 'bg-white/[0.01] border-white/5 text-white/50 hover:border-white/20 hover:text-white/80'
                        } ${isPlaying ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        {isSelected && (
                          <div className="absolute right-3 top-3 w-1.5 h-1.5 bg-brand-gold rounded-full animate-ping" />
                        )}
                        <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider font-sans mb-1 group-hover:text-white transition-colors">
                          {rhythm.name}
                        </h4>
                        <p className="text-[10px] italic text-white/40 mb-2 font-serif">
                          {rhythm.subtitle}
                        </p>
                        <p className="text-[10px] leading-relaxed line-clamp-2">
                          {rhythm.description}
                        </p>
                        
                        {/* Interactive Timing Segments */}
                        <div className="mt-3 flex items-center gap-1.5">
                          {rhythm.phases.map((ph, idx) => (
                            <span 
                              key={idx} 
                              className={`text-[8px] font-mono px-2 py-0.5 rounded border uppercase ${
                                isSelected 
                                  ? 'bg-brand-gold/10 border-brand-gold/20 text-brand-gold' 
                                  : 'bg-white/5 border-white/5 text-white/30'
                              }`}
                            >
                              {ph.name.substring(0, 3)} {ph.duration}s
                            </span>
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Sounds & Guides settings */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white/[0.01] border border-white/5 p-4 rounded-xl space-y-4"
                >
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <h4 className="text-[9px] uppercase font-mono tracking-wider font-bold text-white/50">Custom Sound & Voice Guides</h4>
                    <span className="text-[8px] font-mono text-white/30">Active Live update</span>
                  </div>

                  {/* Soundscapes Grid Select */}
                  <div className="space-y-2">
                    {[
                      { id: 'vocal_coach', label: '🌸 Guided Vocal Coach', desc: 'Somatic spoken instructions transitions' },
                      { id: '432hz', label: '🪶 432Hz Healing Core', desc: 'Low harmonic solfeggio subharmonic drone' },
                      { id: 'singing_bowl', label: '🔔 Tibetan Singing Bowls', desc: 'Multi-layered rich detuned chord oscillations' },
                      { id: 'space_hum', label: '🌠 Deep Space Somatic Hum', desc: 'Cozy comforting low frequency noise rumble' },
                      { id: 'silent', label: '🔇 Complete Silence Only', desc: 'Focus strictly on visual indicator rhythm' }
                    ].map((mode) => {
                      const active = soundMode === mode.id;
                      return (
                        <button
                          key={mode.id}
                          onClick={() => setSoundMode(mode.id as any)}
                          className={`w-full text-left p-2.5 rounded border transition-all flex items-center justify-between ${
                            active
                              ? 'bg-brand-gold/10 border-brand-gold/30 text-white'
                              : 'bg-white/[0.01] border-white/5 text-white/50 hover:text-white/80 hover:border-white/10'
                          }`}
                        >
                          <div>
                            <p className="text-[10px] font-bold text-white uppercase tracking-wide">{mode.label}</p>
                            <p className="text-[8.5px] text-white/40 italic">{mode.desc}</p>
                          </div>
                          {active && (
                            <div className="w-1.5 h-1.5 bg-brand-gold rounded-full" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Ambient Background Tracks */}
                  <div className="border-t border-white/5 pt-3 space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="text-[9px] uppercase font-mono tracking-wider font-bold text-white/50">Ambient Background Tracks</h4>
                      {isAmbientPlaying && (
                        <div className="flex items-center gap-1.5 bg-brand-gold/10 border border-brand-gold/25 px-2 py-0.5 rounded-full animate-pulse">
                          <span className="w-1 h-1 rounded-full bg-brand-gold" />
                          <span className="text-[7.5px] font-mono font-bold text-brand-gold uppercase">AMBIENT ENGAGED</span>
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'none', label: '🔇 Ambient Off' },
                        { id: 'nature', label: '🌊 Nature Wave' },
                        { id: 'piano', label: '🎹 Calm Piano' }
                      ].map((track) => {
                        const active = ambientTrack === track.id;
                        return (
                          <button
                            key={track.id}
                            type="button"
                            onClick={() => {
                              setAmbientTrack(track.id as any);
                              if (track.id === 'none') {
                                stopAmbientSynthOnly();
                              } else {
                                startAmbientSynth(track.id as 'nature' | 'piano');
                              }
                            }}
                            className={`py-2 px-1 text-[9.5px] font-mono rounded border transition-all text-center cursor-pointer ${
                              active
                                ? 'bg-brand-gold/10 border-brand-gold text-brand-gold font-bold shadow-[0_0_12px_rgba(212,175,55,0.08)]'
                                : 'bg-white/[0.01] border-white/5 text-white/40 hover:text-white/75 hover:border-white/15'
                            }`}
                          >
                            <span className="block font-bold truncate">{track.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Target Session Duration selector */}
                  {!isPlaying && (
                    <div className="border-t border-white/5 pt-3 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] uppercase font-mono tracking-wider font-bold text-white/50">Target Duration</span>
                        <SpanTime duration={targetDuration} />
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {[60, 120, 300, 600].map((sec) => (
                          <button
                            key={sec}
                            onClick={() => setTargetDuration(sec)}
                            className={`py-1 text-[9px] font-mono rounded border transition-all ${
                              targetDuration === sec 
                                ? 'bg-brand-red/10 border-brand-red text-brand-red' 
                                : 'bg-white/[0.02] border-white/5 text-white/40 hover:text-white/70 hover:border-white/10'
                            }`}
                          >
                            {sec / 60} min
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Breath Circular Area Column */}
              <div className="lg:col-span-7 flex flex-col items-center bg-white/[0.01] border border-white/5 p-6 sm:p-8 rounded-2xl relative">
                
                {/* Active Session trackers and metadata */}
                <div className="w-full flex justify-between items-center mb-6 text-[10px] text-white/30 font-mono">
                  <span>ACTIVE TECHNIQUE: <strong className="text-white">{selectedRhythm.name.toUpperCase()}</strong></span>
                  <div className="flex items-center gap-4">
                    <span>ELAPSED: <strong className="text-white font-bold">{Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}</strong></span>
                    {targetDuration > 0 && (
                      <span>GOAL: <strong className="text-white">{targetDuration / 60}:00</strong></span>
                    )}
                  </div>
                </div>

                {/* Circular Indicator */}
                <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center my-6">
                  
                  {/* Outer Pulsative Waves using AnimatePresence */}
                  <AnimatePresence>
                    {isPlaying && (
                      <motion.div 
                        initial={{ opacity: 0.1, scale: 0.8 }}
                        animate={{ 
                          opacity: [0.12, 0.22, 0.12],
                          scale: activePhase.visualScale + 0.15,
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ 
                          duration: activePhase.duration,
                          ease: "easeInOut",
                        }}
                        key={`outer-glow-${currentPhaseIndex}`}
                        className="absolute inset-0 rounded-full bg-gradient-to-tr from-brand-gold/10 via-transparent to-brand-red/15 blur-2xl pointer-events-none"
                      />
                    )}
                  </AnimatePresence>

                  {/* Concentric Decorative Rings */}
                  <div className="absolute inset-4 rounded-full border border-white/[0.02] pointer-events-none" />
                  <div className="absolute inset-10 rounded-full border border-white/[0.03] pointer-events-none" />
                  <div className="absolute inset-20 rounded-full border border-white/[0.04] pointer-events-none" />

                  {/* Core Breath Circle scaling with active phase duration */}
                  <motion.div
                    animate={{
                      scale: isPlaying ? activePhase.visualScale : 1.0,
                    }}
                    transition={{
                      duration: isPlaying ? activePhase.duration : 1,
                      ease: "easeInOut"
                    }}
                    className={`rounded-full flex flex-col justify-center items-center relative aspect-square shadow-[0_0_50px_rgba(212,175,55,0.05)] border-2 transition-all duration-300 ${
                      isPlaying 
                        ? activePhase.name === 'Inhale' 
                          ? 'w-48 h-48 bg-brand-gold/[0.08] border-brand-gold/50 shadow-brand-gold/15'
                          : activePhase.name === 'Hold' 
                          ? 'w-48 h-48 bg-brand-red/[0.08] border-brand-red/50 shadow-brand-red/15'
                          : activePhase.name === 'Exhale'
                          ? 'w-48 h-48 bg-white/[0.03] border-white/20 shadow-white/5'
                          : 'w-48 h-48 bg-brand-black/40 border-white/10 shadow-transparent'
                        : 'w-48 h-48 bg-white/[0.03] border-white/10'
                    }`}
                  >
                    
                    {/* Circle Stroke Timer Arc */}
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                      <circle
                        cx="50%"
                        cy="50%"
                        r="47%"
                        className="stroke-white/5 fill-transparent"
                        strokeWidth="1.5"
                      />
                      {isPlaying && (
                        <motion.circle
                          key={`arc-${currentPhaseIndex}-${timeLeftInPhase}`}
                          cx="50%"
                          cy="50%"
                          r="47%"
                          className={`${
                            activePhase.name === 'Inhale' 
                              ? 'stroke-brand-gold' 
                              : activePhase.name === 'Hold' 
                              ? 'stroke-brand-red' 
                              : 'stroke-white/40'
                          } fill-transparent`}
                          strokeWidth="2.5"
                          strokeDasharray="300"
                          initial={{ strokeDashoffset: 0 }}
                          animate={{ 
                            strokeDashoffset: 350 - (350 * (timeLeftInPhase / activePhase.duration)) 
                          }}
                          transition={{ duration: 1, ease: "linear" }}
                        />
                      )}
                    </svg>

                    {/* Numeric Seconds leftover */}
                    {isPlaying ? (
                      <motion.span 
                        key={timeLeftInPhase}
                        initial={{ opacity: 0.1, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-4xl sm:text-5xl font-serif text-brand-cream"
                      >
                        {timeLeftInPhase}
                      </motion.span>
                    ) : (
                      <Wind className="w-10 h-10 text-brand-gold/40 animate-pulse" />
                    )}

                    {/* Active State name */}
                    <span className="text-[10px] uppercase font-mono tracking-[0.3em] font-bold text-white/50 mt-1">
                      {isPlaying ? activePhase.name : "READY"}
                    </span>

                    {/* Audio Playback Indicator */}
                    {isPlaying && (soundMode !== 'silent' || ambientTrack !== 'none') && (
                      <div className="flex items-center gap-1.5 mt-2 bg-brand-gold/10 border border-brand-gold/20 px-2.5 py-0.5 rounded-full shadow-[0_0_10px_rgba(212,175,55,0.05)]">
                        <Volume2 size={8} className="text-brand-gold animate-bounce" />
                        <div className="flex gap-0.5 items-end h-2.5">
                          <motion.div animate={{ height: [4, 10, 4] }} transition={{ repeat: Infinity, duration: 1.0, ease: "easeInOut" }} className="w-[1.5px] bg-brand-gold rounded-full" />
                          <motion.div animate={{ height: [8, 3, 8] }} transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut" }} className="w-[1.5px] bg-brand-gold rounded-full" />
                          <motion.div animate={{ height: [3, 9, 3] }} transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }} className="w-[1.5px] bg-brand-gold rounded-full" />
                        </div>
                        <span className="text-[7px] font-mono text-brand-gold uppercase tracking-wider font-extrabold truncate max-w-[55px]">
                          {ambientTrack !== 'none' ? `${ambientTrack.toUpperCase()}+GUIDE` : 'GUIDE'}
                        </span>
                      </div>
                    )}
                  </motion.div>
                </div>

                {/* Horizontal Segmented Progress/Track Timeline using motion */}
                <div className="w-full max-w-md bg-white/[0.02] border border-white/5 p-4 rounded-xl mt-3 mb-6">
                  <div className="flex justify-between items-center text-[9px] font-mono text-white/45 mb-2">
                    <span className="flex items-center gap-1"><Sparkle className="w-2.5 h-2.5 text-brand-gold" /> CURRENT BREATH CYCLE PROGRESS</span>
                    <span className="font-bold text-brand-cream">{elapsedSecondsInCycle}s / {totalCycleDuration}s</span>
                  </div>

                  {/* Proportional custom Segmented track */}
                  <div className="relative h-3 bg-white/5 rounded-full overflow-hidden flex">
                    {selectedRhythm.phases.map((ph, idx) => {
                      const pct = (ph.duration / totalCycleDuration) * 100;
                      const isActive = isPlaying && currentPhaseIndex === idx;
                      return (
                        <div
                          key={idx}
                          style={{ width: `${pct}%` }}
                          className={`h-full border-r border-black/25 relative transition-all duration-300 ${
                            isActive
                              ? ph.name === 'Inhale'
                                ? 'bg-brand-gold/25'
                                : ph.name === 'Hold'
                                ? 'bg-brand-red/25'
                                : ph.name === 'Exhale'
                                ? 'bg-brand-cream/20'
                                : 'bg-white/10'
                              : 'bg-white/[0.04]'
                          }`}
                        >
                          <span className="absolute inset-0 flex items-center justify-center text-[7px] font-mono uppercase tracking-wider text-white/40 truncate">
                            {ph.name.substring(0,3)}
                          </span>
                        </div>
                      );
                    })}

                    {/* Visual glowing slider indicator tracking cycle percentage with Framer Motion */}
                    {isPlaying && (
                      <motion.div
                        className="absolute top-0 bottom-0 left-0 bg-brand-gold shadow-[0_0_12px_rgba(212,175,55,0.7)]"
                        animate={{ width: `${cycleProgressPercent}%` }}
                        transition={{ ease: "linear", duration: 0.5 }}
                      />
                    )}
                  </div>

                  {/* Detailed stage phases */}
                  <div className="flex justify-between mt-2 text-[8px] font-mono text-white/40">
                    {selectedRhythm.phases.map((ph, idx) => (
                      <div 
                        key={idx} 
                        className={`flex items-center gap-1 transition-colors ${
                          isPlaying && currentPhaseIndex === idx ? 'text-brand-gold font-bold' : ''
                        }`}
                      >
                        <div className={`w-1 h-1 rounded-full ${
                          isPlaying && currentPhaseIndex === idx ? 'bg-brand-gold animate-bounce' : 'bg-white/10'
                        }`} />
                        <span>{ph.name} ({ph.duration}s)</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Adaptive instruction guide block */}
                <div className="w-full max-w-md h-24 text-center">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={isPlaying ? `${currentPhaseIndex}-${targetDuration}` : "idle"}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-1.5 px-4"
                    >
                      <h4 className="text-xs font-bold text-brand-gold uppercase tracking-widest h-5 flex items-center justify-center gap-1.5">
                        {isPlaying ? (
                          activePhase.name === 'Inhale' ? '🌸 LUNG & CELLULAR EXPANSION' :
                          activePhase.name === 'Hold' ? '✨ SUSTAINED STILLNESS' :
                          activePhase.name === 'Exhale' ? '💨 COMPASSIONATE OUTBREATH' :
                          '🧘 EMPTY SPACE STILLNESS'
                        ) : 'Ready to start your breath space'}
                      </h4>
                      <p className="text-[11px] leading-relaxed italic text-white/50">
                        {isPlaying 
                          ? somaticBioGuidelines[activePhase.name] 
                          : "This calming holistic practice stabilizes stress hormones, promotes circulatory health to pelvic tissues, and grounds somatic memory. Select custom patterns or ambient guides to start."
                        }
                      </p>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Primary dynamic actions */}
                <div className="flex items-center gap-4 mt-6">
                  {isPlaying ? (
                    <>
                      <button
                        onClick={stopBreathing}
                        className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-full flex items-center gap-2 hover:bg-white/10 active:scale-95 transition-all text-xs uppercase font-mono font-bold tracking-wider cursor-pointer"
                      >
                        <Square className="w-3.5 h-3.5 text-brand-red fill-brand-red" /> Pause Space
                      </button>
                      <button
                        onClick={resetAll}
                        className="p-3 bg-white/5 border border-white/10 text-white rounded-full hover:bg-brand-red/10 hover:border-brand-red/20 hover:text-brand-red transition-all cursor-pointer"
                        title="Reset Space"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={startBreathing}
                      className="px-8 py-4 bg-brand-gold hover:bg-[#C49B2F] text-brand-black rounded-full flex items-center gap-2.5 shadow-[0_4px_24px_rgba(212,175,55,0.25)] active:scale-95 hover:scale-105 transition-all text-xs uppercase font-extrabold tracking-widest font-sans cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-brand-black" /> Begin Breathing Ritual
                    </button>
                  )}
                </div>

              </div>

            </div>

            {/* Somatic integration insights cards */}
            <div className="mt-16 w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-white/5 pt-12">
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-lg bg-brand-gold/10 flex items-center justify-center text-brand-gold mb-3">
                  <Brain className="w-4 h-4" />
                </div>
                <h4 className="text-xs uppercase font-mono text-white/80 font-bold tracking-wider">Acoustic Resonance Coaching</h4>
                <p className="text-[11px] italic leading-relaxed text-white/40">
                  Switch sound modes to access detuned sine waves simulating heavy singing bowl frequencies or turn on our Guided Vocal Coach voice synthesis to receive calm, spoken cues throughout transitions automatically.
                </p>
              </div>

              <div className="space-y-2">
                <div className="w-8 h-8 rounded-lg bg-brand-red/10 flex items-center justify-center text-brand-red mb-3">
                  <Heart className="w-4 h-4" />
                </div>
                <h4 className="text-xs uppercase font-mono text-white/80 font-bold tracking-wider">Pelvic Floor Releases</h4>
                <p className="text-[11px] italic leading-relaxed text-white/40">
                  Deep cycles target localized blockages around reproductive systems. By inhaling fully, abdominal pressure safely extends pelvic structures, releasing accumulated adrenaline and restoring complete biological comfort.
                </p>
              </div>

              <div className="space-y-2">
                <div className="w-8 h-8 rounded-lg bg-amber-950/20 border border-amber-900/30 flex items-center justify-center text-amber-500 mb-3">
                  <Flame className="w-4 h-4" />
                </div>
                <h4 className="text-xs uppercase font-mono text-white/80 font-bold tracking-wider">Hormonal Coherence</h4>
                <p className="text-[11px] italic leading-relaxed text-white/40">
                  Sustained box and equal diaphragmatic breathing calms amygdala responses, decreasing excessive night sweats, promoting healthy natural lubricants, and syncing ovarian-endocrinal hormone communication.
                </p>
              </div>
            </div>

          </div>
        </main>

        {/* Celebrate Session Completed Modal Backdrop */}
        <AnimatePresence>
          {showSummary && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-6"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                transition={{ type: "spring", damping: 25, stiffness: 350 }}
                className="bg-[#0b0b0c] border border-brand-gold/30 p-8 sm:p-12 max-w-lg w-full rounded-2xl relative text-center shadow-[0_10px_50px_rgba(212,175,55,0.12)] block"
              >
                <div className="absolute top-6 left-6 text-brand-gold/25 animate-pulse"><Sparkles className="w-6 h-6" /></div>
                <div className="absolute bottom-6 right-6 text-brand-red/25 animate-pulse"><Sparkles className="w-6 h-6" /></div>

                <div className="w-16 h-16 rounded-full bg-brand-gold/10 flex items-center justify-center text-brand-gold mx-auto mb-6">
                  <Sparkles className="w-8 h-8" />
                </div>

                <span className="text-brand-gold font-mono uppercase tracking-[0.25em] text-[10px] font-bold block mb-2">Sanctuary Space Complete</span>
                <h3 className="text-3xl font-serif text-white mb-4 italic">Session Completed!</h3>
                <p className="text-xs text-white/50 leading-relaxed italic max-w-sm mx-auto mb-8">
                  "Each breath is a return to complete restorative knowledge. You have successfully aligned your physical temple, nourished your cell networks, and calmed your biological signals."
                </p>

                {/* Session Stats grid */}
                <div className="grid grid-cols-2 gap-4 bg-white/[0.02] border border-white/5 p-4 rounded-xl text-center mb-8">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-white/30 block mb-1">Time Meditated</span>
                    <span className="text-lg font-bold text-brand-gold font-mono">
                      {Math.floor(elapsedTime / 60)}m {elapsedTime % 60}s
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-white/30 block mb-1">Pattern Used</span>
                    <span className="text-xs font-bold text-white uppercase tracking-wider block leading-6 line-clamp-1">
                      {selectedRhythm.name}
                    </span>
                  </div>
                </div>

                {/* Confirm Streak Progress */}
                <div className="flex items-center justify-center gap-2 mb-8 bg-brand-gold/5 border border-brand-gold/10 py-3 px-6 rounded-lg w-fit mx-auto">
                  <Flame className="w-5 h-5 text-brand-gold" />
                  <span className="text-xs font-bold text-brand-gold uppercase tracking-wider">
                    {streak} {streak === 1 ? 'Day' : 'Days'} Active Streak!
                  </span>
                </div>

                <button
                  onClick={() => setShowSummary(false)}
                  className="w-full py-4 bg-brand-cream hover:bg-white text-brand-black rounded-lg text-xs uppercase font-extrabold tracking-widest font-sans hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-lg"
                >
                  Return to Sanctuary Space
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {!isDashboardTab && <Footer />}
      </div>
    </>
  );
}

function SpanTime({ duration }: { duration: number }) {
  if (duration === 0) return <span className="text-[10px] font-mono text-brand-gold uppercase">Continuous</span>;
  return <span className="text-[10px] font-mono text-brand-gold uppercase">{duration / 60} Minutes Target</span>;
}
