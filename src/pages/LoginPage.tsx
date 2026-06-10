import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { KeyRound, Mail, Eye, EyeOff, ChevronRight, Info, LogIn } from 'lucide-react';
import SEO from '../components/SEO';
import Navigation from '../components/Navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/member-dashboard';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check if user is admin for special redirect
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();
      
      const adminEmails = ['branafrikana@gmail.com', 'admin@thevaginaroom.com'];
      const userEmailLower = user.email?.toLowerCase();
      
      const isAdmin = 
        userData?.role === 'admin' || 
        userData?.isAdmin === true ||
        (userEmailLower && adminEmails.includes(userEmailLower));

      if (isAdmin) {
        // If they were trying to go somewhere else, go there, otherwise admin dashboard
        navigate((location.state as any)?.from?.pathname || '/admin');
      } else {
        navigate(from);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to authorize session. Check credentials.');
      setLoading(false);
    }
  };

  return (
    <>
      <SEO title="Member Login" description="Access your Member Portal and community dashboard." />
      <div className="min-h-screen bg-brand-black text-white selection:bg-brand-gold selection:text-brand-black">
        <Navigation />
        
        <div className="pt-32 pb-20 px-6 flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md relative"
          >
            <div className="absolute -inset-4 bg-brand-gold/10 blur-3xl opacity-20 pointer-events-none" />
            
            <div className="relative bg-brand-black/40 backdrop-blur-xl border border-white/10 p-8 md:p-10">
              <div className="w-12 h-12 bg-brand-gold/10 border border-brand-gold/30 flex items-center justify-center mb-8">
                <KeyRound className="text-brand-gold" size={24} />
              </div>

              <h1 className="text-3xl font-black uppercase tracking-tighter text-white mb-2">
                Authorized <span className="text-brand-gold italic">Login</span>
              </h1>
              <p className="text-[10px] text-white/40 uppercase tracking-[0.3em] font-black mb-10">
                Member Portal Access
              </p>
              
              {error && (
                <div className="mb-8 p-4 bg-brand-red/10 border border-brand-red/20 text-brand-red text-[10px] font-mono uppercase tracking-widest flex items-center gap-2">
                  <Info size={14} /> {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Email Connection</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                    <input 
                      type="email" 
                      placeholder="email@example.com" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/10 p-4 pl-12 text-sm focus:border-brand-gold outline-none transition-all placeholder:text-white/10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Security Key</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/10 p-4 text-sm focus:border-brand-gold outline-none transition-all placeholder:text-white/10"
                      required
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="pt-4">
                  <motion.button 
                    type="submit" 
                    disabled={loading}
                    whileTap={{ scale: 0.95 }}
                    className="w-full bg-brand-gold text-brand-black p-4 min-h-[44px] font-black uppercase text-xs tracking-widest hover:bg-white transition-all group flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-brand-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        Verify & Enter
                        <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </motion.button>
                </div>

                <div className="flex flex-col gap-4 text-center">
                   <p className="text-[9px] text-white/30 uppercase tracking-[0.2em] font-black">
                    New to the community? <Link to="/register" className="text-brand-gold hover:text-white transition-colors">Join Now</Link>
                  </p>
                  <Link to="/" className="text-[9px] text-white/20 uppercase tracking-[0.2em] font-black hover:text-white transition-colors">
                    Return to Foundation
                  </Link>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
