import React, { useState, useEffect, useRef } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, updateDoc, doc, limit } from 'firebase/firestore';
import { MessageSquare, Send, User, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';

interface Question {
  id: string;
  text: string;
  userName: string;
  userId: string;
  createdAt: any;
  isAnswered: boolean;
  isAnonymous: boolean;
}

export default function LiveClassQA({ isAdmin = false }: { isAdmin?: boolean }) {
  const { userData } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(collection(db, "live_class_qa"), orderBy("createdAt", "desc"), limit(100));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const qData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Question[];
      setQuestions(qData.reverse());
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [questions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || !userData) return;
    
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "live_class_qa"), {
        text: newQuestion.trim(),
        userName: isAnonymous ? "Anonymous Member" : `${userData.firstName} ${userData.lastName}`,
        userId: userData.uid,
        isAnonymous,
        isAnswered: false,
        createdAt: serverTimestamp()
      });
      setNewQuestion("");
    } catch (err) {
      console.error("Failed to post question:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const markAsAnswered = async (id: string, currentStatus: boolean) => {
    if (!isAdmin) return;
    try {
      await updateDoc(doc(db, "live_class_qa", id), {
        isAnswered: !currentStatus
      });
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp || typeof timestamp.toDate !== 'function') return 'Just now';
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  };

  return (
    <div className="bg-black/50 border border-white/5 rounded-2xl overflow-hidden flex flex-col h-[500px]">
      <div className="p-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#0088cc]/10 flex items-center justify-center text-[#0088cc]">
            <MessageSquare size={14} />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase text-white font-sans tracking-widest">Live Q&A</h3>
            <p className="text-[10px] text-white/50 uppercase tracking-widest">{questions.length} Questions</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        <AnimatePresence initial={false}>
          {questions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-2 opacity-50">
              <MessageSquare size={24} className="text-brand-gold" />
              <p className="text-xs font-mono text-white/70 uppercase tracking-widest">No questions yet</p>
              <p className="text-[10px] font-sans text-white/40">Be the first to ask Dr. FID or the team.</p>
            </div>
          ) : (
            questions.map(q => (
              <motion.div 
                key={q.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white/[0.03] border ${q.isAnswered ? 'border-emerald-500/20' : 'border-white/5'} p-4 rounded-xl relative group`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <User size={12} className={q.isAnonymous ? "text-white/30" : "text-brand-gold"} />
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${q.isAnonymous ? 'text-white/50' : 'text-brand-gold'}`}>
                      {q.userName}
                    </span>
                    <span className="text-[9px] text-white/30 font-mono tracking-widest px-2">{formatTime(q.createdAt)}</span>
                  </div>
                  
                  {isAdmin && (
                    <button 
                      onClick={() => markAsAnswered(q.id, q.isAnswered)}
                      className={`text-[9px] px-2 py-0.5 rounded font-mono uppercase tracking-widest transition-colors ${q.isAnswered ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-white/50 hover:bg-white/20'}`}
                    >
                      {q.isAnswered ? 'Answered' : 'Mark Answered'}
                    </button>
                  )}
                  {!isAdmin && q.isAnswered && (
                     <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-mono uppercase tracking-widest">
                       Answered
                     </span>
                  )}
                </div>
                <p className="text-sm font-light text-white/90 leading-relaxed font-sans">{q.text}</p>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {!isAdmin && (
        <form onSubmit={handleSubmit} className="p-4 bg-white/[0.02] border-t border-white/5 space-y-3">
          <div className="flex items-center gap-2 px-1">
             <label className="flex items-center gap-2 cursor-pointer group" onClick={() => setIsAnonymous(!isAnonymous)}>
               <div className={`w-4 h-4 border border-white/20 rounded flex items-center justify-center transition-colors ${isAnonymous ? 'bg-brand-gold border-brand-gold' : 'group-hover:border-white/40'}`}>
                 {isAnonymous && <div className="w-2 h-2 bg-black rounded-sm" />}
               </div>
               <span className="text-[10px] font-mono text-white/60 group-hover:text-white/90 uppercase tracking-widest select-none">Ask Anonymously</span>
             </label>
          </div>
          <div className="flex gap-2">
            <input 
              type="text"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="Drop your question here..."
              className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-gold/50 transition-colors"
              disabled={isSubmitting}
            />
            <button
              type="submit"
              disabled={!newQuestion.trim() || isSubmitting}
              className="bg-brand-gold text-brand-black px-4 rounded-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors"
            >
              <Send size={16} />
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
