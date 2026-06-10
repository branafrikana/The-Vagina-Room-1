import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Upload, AlertCircle, Clock, ShieldCheck } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { useAuth } from '../context/AuthContext';
import { useContent } from '../context/ContentContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';

export default function PaymentReviewPage() {
  const { user, userData } = useAuth();
  const { content, uploadImage } = useContent();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !userData || !user) return;
    setUploading(true);
    try {
      // Actually upload to Cloudinary using the context helper
      const uploadResult = await uploadImage(file, `proof_${user.uid}_${Date.now()}`);
      
      if (!uploadResult.success || !uploadResult.url) {
        throw new Error(uploadResult.error || "Cloudinary upload failed");
      }

      await updateDoc(doc(db, 'users', user.uid), {
        proofOfPaymentUrl: uploadResult.url, // Corrected from paymentProof
        paymentStatus: 'awaiting_approval',
        paymentProofSubmittedAt: new Date().toISOString()
      });
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      alert("Failed to upload proof: " + (err.message || "Unknown error"));
    } finally {
      setUploading(false);
    }
  };

  const config = JSON.parse(content?.generalSettingsJson || '{}');

  return (
    <>
      <SEO title="Payment Review | The Vagina Room" description="Review and upload proof of payment for membership activation." />
      <div className="min-h-screen bg-brand-black text-white relative overflow-hidden flex flex-col">
        <Navigation />
        
        {/* Ambient Background Accents */}
        <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-brand-gold/[0.03] rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-brand-gold/[0.02] rounded-full blur-[150px] pointer-events-none" />

        <main className="flex-grow pt-40 pb-20 px-6 max-w-4xl mx-auto w-full z-10 relative">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-950/50 border border-white/10 p-8 md:p-16 space-y-10 backdrop-blur-sm"
            >
                <div className="flex flex-col md:flex-row items-center gap-8 justify-between border-b border-white/5 pb-10">
                  <div className="text-center md:text-left space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-gold/10 border border-brand-gold/20 text-brand-gold text-[9px] font-mono uppercase tracking-widest">
                      <AlertCircle size={12} /> Pending Verification
                    </div>
                    <h1 className="text-4xl md:text-5xl font-serif font-black text-white uppercase tracking-tighter leading-none">Registration <br /><span className="text-brand-gold">Pending</span></h1>
                    <p className="text-white/50 text-sm italic font-light max-w-md">Your registration is received but access is pending manual payment validation. Please upload proof of payment to expedite the process.</p>
                  </div>
                  <div className="w-24 h-24 bg-brand-gold/5 flex items-center justify-center rounded-full border border-brand-gold/20 shrink-0">
                    <Clock size={40} className="text-brand-gold animate-pulse" />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-12">
                  {/* Left: Instructions */}
                  <div className="space-y-6">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-gold">Payment Instructions</h3>
                    <div className="space-y-4 font-mono text-xs">
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-white/30 uppercase">Bank</span>
                        <span className="text-white font-bold">{config.bankName || "Access Bank"}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-white/30 uppercase">Account</span>
                        <span className="text-white font-bold">{config.accountName || "The Vagina Room"}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-white/30 uppercase">Number</span>
                        <span className="text-brand-gold font-bold select-all">{config.accountNumber || "0123456789"}</span>
                      </div>
                    </div>
                    <div className="p-4 bg-white/[0.02] border border-white/5">
                      <p className="text-[9px] text-white/40 uppercase tracking-widest leading-relaxed">
                        Please include your email address as the payment reference to help us track your transaction more efficiently.
                      </p>
                    </div>
                  </div>

                  {/* Right: Upload */}
                  <div className="space-y-6">
                    {!success ? (
                      <div className="space-y-6">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-gold">Secure Upload Portal</h3>
                        <div className="relative group">
                          <input 
                            type="file" 
                            id="proof-upload"
                            accept="image/*,application/pdf" 
                            onChange={handleFileChange} 
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          />
                          <div className="border-2 border-dashed border-white/10 group-hover:border-brand-gold/30 p-10 transition-colors flex flex-col items-center justify-center gap-4 text-center">
                            <Upload size={32} className="text-white/20 group-hover:text-brand-gold transition-colors" />
                            <p className="text-[10px] text-white/40 uppercase tracking-widest group-hover:text-white transition-colors">Click to Select Proof (Image/PDF)</p>
                            {file && <p className="text-[10px] text-brand-gold font-mono truncate max-w-full">Selected: {file.name}</p>}
                          </div>
                        </div>
                        <button 
                            onClick={handleUpload} 
                            disabled={!file || uploading} 
                            className="w-full bg-brand-gold text-brand-black p-4 font-black uppercase text-xs tracking-widest hover:bg-white transition-all disabled:opacity-50 shadow-xl hover:shadow-brand-gold/20"
                        >
                            {uploading ? 'Processing Transaction...' : 'Submit Validated Proof'}
                        </button>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center gap-6 py-10 transition-all">
                        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/30">
                          <CheckCircle2 size={40} className="text-emerald-500" />
                        </div>
                        <div className="text-center space-y-2">
                          <p className="text-lg font-black uppercase text-white tracking-widest">Proof Submitted</p>
                          <p className="text-[10px] text-white/40 uppercase tracking-widest italic leading-relaxed">Your credentials are now under administrative review. This usually completes within 2-6 hours.</p>
                        </div>
                        <button onClick={() => navigate('/')} className="text-brand-gold text-[10px] uppercase font-black tracking-widest hover:text-white transition-colors border border-brand-gold/20 px-6 py-2">Return Home</button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                   <div className="flex gap-8 items-center">
                      <ShieldCheck size={20} />
                      <div className="text-[8px] uppercase tracking-widest font-mono">
                        <p className="text-white font-bold">Encrypted Node</p>
                        <p>End-to-end Secure</p>
                      </div>
                   </div>
                   <p className="text-[8px] font-mono uppercase tracking-[0.4em] italic">The Vagina Room Ecosystem / Verification Portal</p>
                </div>
            </motion.div>
        </main>
        <Footer />
      </div>
    </>
  );
}
