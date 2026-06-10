import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Helmet } from "react-helmet-async";
import SEO from "../components/SEO";
import { useContent } from "../context/ContentContext";
import { safeJsonParse } from "../lib/json";
import { Link } from "react-router-dom";

const confettiColors = ["#D4AF37", "#0088cc", "#ffffff", "#facc15", "#4ade80"];

function ConfettiEffect() {
  const [particles, setParticles] = useState<{ id: number; x: number; color: string; size: number; duration: number; delay: number }[]>([]);

  useEffect(() => {
    // Generate particles only on client
    const newParticles = Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // percentage for viewport width
      color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
      size: Math.random() * 8 + 4,
      duration: Math.random() * 2.5 + 2,
      delay: Math.random() * 0.5,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ top: -20, left: `${p.x}vw`, opacity: 1, rotate: 0 }}
          animate={{
            top: "100vh",
            left: [`${p.x}vw`, `${p.x - 5}vw`, `${p.x + 5}vw`, `${p.x}vw`],
            opacity: [1, 1, 0.8, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: "easeOut",
          }}
          style={{
            position: "absolute",
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
          }}
        />
      ))}
    </div>
  );
}

export default function TelegramCommunityThankYouPage() {
  const { content } = useContent();
  const communityLink = content.contactThankYouTelegramLink || "https://t.me/";

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col font-sans selection:bg-brand-gold/30 relative">
      <SEO 
        title="Thank You for Joining" 
        description="Your request to join our community has been received." 
      />

      <ConfettiEffect />

      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center relative z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-brand-gold/5 blur-[100px] rounded-full pointer-events-none mix-blend-screen" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-xl mx-auto bg-zinc-900/50 border border-white/5 p-10 md:p-14 shadow-2xl shadow-[#0088cc]/5 backdrop-blur-xl rounded-[2rem] w-full"
        >
          <motion.div 
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
            className="mx-auto w-24 h-24 rounded-full bg-[#0088cc]/10 flex items-center justify-center border border-[#0088cc]/20 mb-8"
          >
            <CheckCircle2 className="text-[#0088cc]" size={48} />
          </motion.div>

          <div className="flex items-center justify-center gap-3 w-full max-w-xs mx-auto mb-8">
            <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden flex items-center">
                <motion.div 
                  initial={{ width: "50%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
                  className="h-full bg-[#0088cc] rounded-full shadow-[0_0_10px_#0088cc]" 
                />
            </div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#0088cc] whitespace-nowrap">Step 2 of 2</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h1 className="text-4xl lg:text-5xl font-serif text-white mb-4">
              Thank You!
            </h1>
            
            <p className="text-lg text-zinc-400 font-light leading-relaxed mb-10">
              Your details have been recorded. You are now officially invited to join our exclusive Telegram network.
            </p>

            <div className="flex flex-col gap-4">
              <a
                href={communityLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-full px-8 py-5 bg-[#0088cc] text-white font-bold text-lg hover:bg-[#007ab8] transition-all duration-300 rounded-xl uppercase tracking-widest shadow-xl shadow-[#0088cc]/20 gap-3 hover:scale-[1.02] active:scale-95 group border-none cursor-pointer"
              >
                Join Telegram Group <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </a>

              <Link
                to="/telegram"
                className="inline-flex items-center justify-center w-full px-8 py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-sm tracking-widest uppercase transition-all duration-300 rounded-xl gap-2 hover:scale-[1.02] active:scale-95 border border-white/5 cursor-pointer hover:border-white/10"
              >
                Return to Telegram Page
              </Link>
            </div>

            <Link to="/" className="inline-block mt-8 text-xs text-zinc-500 hover:text-[#0088cc] hover:underline transition-colors font-medium">
              Go to Website Homepage
            </Link>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
