import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Heart, 
  Wind, 
  GraduationCap, 
  Stethoscope, 
  Bot, 
  User, 
  BrainCircuit, 
  ShieldAlert,
  ArrowRight,
  BookOpen,
  CalendarCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';

type Message = {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  source?: 'resource' | 'escalation' | 'program';
  timestamp: string;
  suggestions?: string[];
  actionLink?: {
     label: string;
     type: 'course' | 'consultation' | 'article' | 'tool';
  };
};

export default function AIAssistant() {
  const { userData } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome_1',
      sender: 'ai',
      text: `Hello ${userData?.firstName || 'Sister'}. I am Dr. FID AI, your intelligent health and wellness guide. I am here to help you understand your fertility, hormonal health, and emotional wellbeing. How can I support your journey today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: [
        'How do I know my fertile window is accurate?',
        'Why are my periods irregular?',
        'Can stress affect my reproductive health?',
        'Which program should I start with?'
      ]
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const newUserMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, newUserMsg]);
    setInputValue('');
    setIsTyping(true);

    // Remove suggestions from previous messages
    setMessages(prev => prev.map(msg => ({ ...msg, suggestions: undefined })));

    // Simulate AI reasoning and response
    setTimeout(() => {
      generateResponse(text);
    }, 1500);
  };

  const generateResponse = async (userText: string) => {
    try {
       // Only send a subset as history to save tokens
       const recentHistory = messages.slice(-5);
       
       const response = await fetch("/api/gemini/chat", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ prompt: userText, history: recentHistory }),
       });
       
       if (!response.ok) {
           const errData = await response.json();
           throw new Error(errData.error || "Server responded with an error");
       }
       
       const data = await response.json();
       
       let newMsg: Message = {
           id: Date.now().toString(),
           sender: 'ai',
           text: data.text,
           timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
       };
       
       if (userText.toLowerCase().includes('pain') || userText.toLowerCase().includes('severe')) {
           newMsg.source = 'escalation';
           newMsg.actionLink = {
              label: 'Book Priority Consultation',
              type: 'consultation'
           };
       }
       
       setIsTyping(false);
       setMessages(prev => [...prev, newMsg]);
    } catch(err: any) {
       console.error("AI Assistant Error:", err);
       setIsTyping(false);
       setMessages(prev => [...prev, {
           id: Date.now().toString(),
           sender: 'ai',
           text: "I'm having trouble connecting to my intelligence engine right now. Please try again later.",
           timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
       }]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputValue);
    }
  };

  return (
    <div className="font-sans text-left relative pb-4 h-[calc(100vh-160px)] min-h-[600px] flex flex-col">
      
      {/* Header */}
      <div className="bg-[#110f0f] border border-white/5 p-6 rounded-t-2xl relative overflow-hidden shrink-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/[0.02] blur-3xl rounded-full select-none pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-3">
             <span className="text-[9px] font-mono text-[#D4AF37] uppercase tracking-[0.3em] font-extrabold flex items-center gap-1">
                <BrainCircuit size={10} /> Intelligence Engine
             </span>
             <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 text-[8px] font-mono uppercase tracking-widest font-bold">Online</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-black uppercase text-white tracking-tight flex items-center gap-2">
            Ask Dr. FID AI <Sparkles size={20} className="text-[#D4AF37]" />
          </h2>
          <p className="text-xs text-white/50 max-w-lg font-light font-sans leading-relaxed">
            Your personalized guide for fertility, hormonal health, and emotional wellbeing. Powered by clinical frameworks and community knowledge.
          </p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-black/50 border-x border-white/5 p-4 sm:p-6 overflow-y-auto custom-scrollbar flex flex-col gap-6">
         {messages.map((msg, index) => (
            <motion.div 
               key={msg.id}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.3 }}
               className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} w-full`}
            >
               <div className={`max-w-[85%] sm:max-w-[75%] flex gap-3 sm:gap-4 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  
                  {/* Avatar */}
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex shrink-0 items-center justify-center border ${
                     msg.sender === 'ai' 
                        ? (msg.source === 'escalation' ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'bg-[#D4AF37]/10 border-[#D4AF37]/30 text-[#D4AF37]')
                        : 'bg-white/10 border-white/20 text-white/70'
                  }`}>
                     {msg.sender === 'ai' ? <Bot size={18} /> : <User size={18} />}
                  </div>

                  {/* Message Bubble */}
                  <div className="flex flex-col gap-1 min-w-0">
                     <div className={`flex items-baseline gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-white/40">
                           {msg.sender === 'ai' ? 'Dr. FID AI' : 'You'}
                        </span>
                        <span className="text-[8px] font-mono text-white/20">{msg.timestamp}</span>
                     </div>
                     
                     <div className={`p-4 text-sm font-light leading-relaxed whitespace-pre-wrap rounded-2xl ${
                        msg.sender === 'user'
                           ? 'bg-white/10 text-white border border-white/5 rounded-tr-sm'
                           : (msg.source === 'escalation' 
                                 ? 'bg-red-500/5 text-red-100 border border-red-500/20 rounded-tl-sm shadow-[0_0_15px_rgba(239,68,68,0.05)]' 
                                 : 'bg-[#110f0f] text-white/90 border border-white/5 rounded-tl-sm')
                     }`}>
                        {msg.source === 'escalation' && (
                           <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-black text-red-400 mb-2 border-b border-red-500/20 pb-2">
                              <ShieldAlert size={12} /> Clinical Escalation Recommended
                           </div>
                        )}
                        {msg.text}

                        {/* Action Link Rendering */}
                        {msg.actionLink && (
                           <div className="mt-4 pt-3 border-t border-white/10">
                              <button className={`flex items-center justify-between w-full p-3 rounded-lg border transition-colors ${
                                 msg.actionLink.type === 'consultation' 
                                    ? 'bg-red-500/10 border-red-500/30 hover:bg-red-500/20 text-red-200' 
                                    : 'bg-[#D4AF37]/10 border-[#D4AF37]/30 hover:bg-[#D4AF37]/20 text-[#D4AF37]'
                              }`}>
                                 <div className="flex items-center gap-3">
                                    {msg.actionLink.type === 'course' && <GraduationCap size={16} />}
                                    {msg.actionLink.type === 'consultation' && <Stethoscope size={16} />}
                                    {msg.actionLink.type === 'article' && <BookOpen size={16} />}
                                    {msg.actionLink.type === 'tool' && <Wind size={16} />}
                                    <span className="text-xs font-bold font-sans">{msg.actionLink.label}</span>
                                 </div>
                                 <ArrowRight size={14} />
                              </button>
                           </div>
                        )}
                     </div>

                     {/* Suggestions */}
                     {msg.suggestions && msg.suggestions.length > 0 && (
                        <div className={`flex flex-wrap gap-2 mt-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                           {msg.suggestions.map((suggestion, i) => (
                              <button 
                                 key={i}
                                 onClick={() => handleSendMessage(suggestion)}
                                 className="px-3 py-1.5 bg-zinc-900 hover:bg-[#D4AF37] hover:text-black border border-white/10 text-[10px] font-mono text-white/60 tracking-wider transition-colors text-left"
                              >
                                 {suggestion}
                              </button>
                           ))}
                        </div>
                     )}
                  </div>
               </div>
            </motion.div>
         ))}
         
         {isTyping && (
            <div className="flex justify-start w-full">
               <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#D4AF37]/5 border border-[#D4AF37]/10 flex items-center justify-center shrink-0">
                     <Bot size={18} className="text-[#D4AF37]/50" />
                  </div>
                  <div className="bg-[#110f0f] border border-white/5 rounded-2xl rounded-tl-sm p-4 flex items-center gap-2 h-[52px]">
                     <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0 }} className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full" />
                     <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full" />
                     <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }} className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full" />
                  </div>
               </div>
            </div>
         )}
         
         <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-[#0a0a0a] border border-white/5 p-4 rounded-b-2xl shrink-0">
         <div className="relative max-w-4xl mx-auto">
            <textarea
               value={inputValue}
               onChange={(e) => setInputValue(e.target.value)}
               onKeyDown={handleKeyPress}
               placeholder="Ask about fertility, emotional wellness, or our programs..."
               className="w-full bg-[#110f0f] border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50 resize-none min-h-[50px] custom-scrollbar focus:ring-1 focus:ring-[#D4AF37]/20 transition-all font-sans"
               rows={1}
               style={{ height: 'auto', minHeight: '52px', maxHeight: '120px' }}
            />
            <button
               onClick={() => handleSendMessage(inputValue)}
               disabled={!inputValue.trim()}
               className="absolute right-2 bottom-2 w-9 h-9 rounded-lg bg-[#D4AF37] text-black flex items-center justify-center hover:bg-white transition-colors disabled:opacity-50 disabled:hover:bg-[#D4AF37]"
            >
               <Send size={16} />
            </button>
         </div>
         <p className="text-center text-[9px] font-mono text-white/30 tracking-widest uppercase mt-3">
            Dr. FID AI acts as an educational guide, not a substitute for clinical diagnosis.
         </p>
      </div>

    </div>
  );
}
