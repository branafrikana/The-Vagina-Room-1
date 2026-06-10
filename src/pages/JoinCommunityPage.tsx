import { motion } from 'motion/react';
import SEO from '../components/SEO';
import { ShieldCheck, BookOpen, Users, Heart, ArrowRight, CheckCircle2, Star, Check } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useContent } from '../context/ContentContext';
import EditableText from '../components/EditableText';
import { Link } from 'react-router-dom';

export default function JoinCommunityPage() {
  const { content } = useContent();

  const getBenefitIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShieldCheck': return <ShieldCheck size={32} />;
      case 'BookOpen': return <BookOpen size={32} />;
      case 'Users': return <Users size={32} />;
      case 'Heart': return <Heart size={32} />;
      default: return <Star size={32} />;
    }
  };

  let benefits = [];
  try {
    benefits = JSON.parse(content.joinCommunityBenefitsJson || '[]');
  } catch (e) {
    console.error("Error parsing joinCommunityBenefitsJson", e);
  }

  let whatYouGet = [];
  try {
    whatYouGet = JSON.parse(content.joinCommunityWhatYouGetJson || '[]');
  } catch (e) {
    console.error("Error parsing joinCommunityWhatYouGetJson", e);
  }

  return (
    <>
      <SEO 
        title={content.joinCommunityTitle || "Join The Community"} 
        description={content.joinCommunitySubheading}
      />
      
      <div className="bg-brand-black text-white min-h-screen selection:bg-brand-gold selection:text-brand-black">
        <Navigation />
        
        <main className="pt-32">
          {/* Hero Section */}
          <section className="relative py-24 px-6 overflow-hidden">
            <div 
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage: `url(${content.joinCommunityHeroBgUrl || "https://images.unsplash.com/photo-1518152006812-edab29b069ac?auto=format&fit=crop&q=80&w=1600"})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-brand-black via-transparent to-brand-black pointer-events-none" />
            
            <div className="max-w-7xl mx-auto relative z-10 text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="text-brand-gold font-black tracking-[0.5em] uppercase text-[10px] mb-8 block">
                  <EditableText field="joinCommunityHeroLabel" />
                </div>
                <h1 className="text-4xl sm:text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none mb-10">
                  <EditableText field="joinCommunityHeading" fancyMode="inline" />
                </h1>
                <p className="text-xl text-white/60 max-w-2xl mx-auto italic font-light leading-relaxed mb-12">
                  <EditableText field="joinCommunitySubheading" multiline />
                </p>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-col items-center gap-6"
                >
                  <a 
                    href="#pricing"
                    className="bg-brand-gold text-brand-black px-12 py-5 rounded-none text-xs font-black tracking-[0.4em] uppercase hover:bg-white transition-all duration-500 shadow-2xl flex items-center group"
                  >
                    <EditableText field="joinCommunityCtaText" />
                    <ArrowRight className="ml-4 group-hover:translate-x-1.5 transition-transform" size={14} />
                  </a>
                </motion.div>
              </motion.div>
            </div>
          </section>

          {/* Benefits Grid */}
          <section className="py-32 px-6 border-y border-white/5 relative">
            <div className="max-w-7xl mx-auto">
              <EditableText field="joinCommunityBenefitsJson" multiline className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 block" as="div">
                {benefits.map((benefit: any, i: number) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="p-8 bg-white/[0.02] border border-white/5 hover:border-brand-gold/30 transition-all group"
                  >
                    <div className="text-brand-gold mb-6 group-hover:scale-110 transition-transform duration-500 origin-left">
                      {getBenefitIcon(benefit.icon)}
                    </div>
                    <h3 className="text-lg font-black uppercase tracking-widest text-white mb-4">{benefit.title}</h3>
                    <p className="text-[13px] text-white/40 italic leading-relaxed font-light">{benefit.text}</p>
                  </motion.div>
                ))}
              </EditableText>
            </div>
          </section>

          {/* Pricing Section */}
          <section id="pricing" className="py-32 px-6 bg-white/[0.01]">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-black uppercase tracking-widest text-center text-white mb-16">Membership Plans</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-8 bg-black border border-white/10 flex flex-col">
                  <h3 className="text-xl font-black uppercase text-brand-gold mb-2">Gold Plan</h3>
                  <p className="text-[10px] text-white/40 uppercase font-mono tracking-wider mb-4">Three Months Subscription (Quarterly)</p>
                  <div className="mb-4">
                    <p className="text-4xl font-black text-white">₦{Number(content.membershipPriceGoldNGN || "25000").toLocaleString()}</p>
                    <p className="text-2xl font-black text-white/40">${Number(content.membershipPriceGoldUSD || "45").toLocaleString()}</p>
                  </div>
                  <ul className="text-sm text-white/60 space-y-4 mb-8 flex-grow">
                    <li className="flex items-center gap-2"><Check size={16} className="text-brand-gold"/> 3 months access</li>
                    <li className="flex items-center gap-2"><Check size={16} className="text-brand-gold"/> Live workshop access</li>
                    <li className="flex items-center gap-2"><Check size={16} className="text-brand-gold"/> Community lounge</li>
                  </ul>
                  <Link to="/register?plan=gold" className="w-full bg-white/10 text-white text-center py-4 font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">Select Gold Plan</Link>
                </div>
                <div className="p-8 bg-brand-gold text-brand-black flex flex-col relative">
                  <div className="absolute top-4 right-4 bg-black text-brand-gold text-[10px] font-black px-2 py-1 uppercase">Best Value</div>
                  <h3 className="text-xl font-black uppercase mb-2">Diamond Plan</h3>
                  <p className="text-[10px] opacity-60 uppercase font-mono tracking-wider mb-4">One Year Subscription (Annual)</p>
                  <div className="mb-4">
                    <p className="text-4xl font-black">₦{Number(content.membershipPriceDiamondNGN || "85000").toLocaleString()}</p>
                    <p className="text-2xl font-black opacity-40">${Number(content.membershipPriceDiamondUSD || "150").toLocaleString()}</p>
                  </div>
                  <ul className="text-sm opacity-80 space-y-4 mb-8 flex-grow">
                    <li className="flex items-center gap-2 font-bold"><Check size={16} /> 12 months access</li>
                    <li className="flex items-center gap-2 font-bold"><Check size={16} /> Live workshop access</li>
                    <li className="flex items-center gap-2 font-bold"><Check size={16} /> Priority support</li>
                    <li className="flex items-center gap-2 font-bold"><Check size={16} /> Community lounge</li>
                  </ul>
                  <Link to="/register?plan=diamond" className="w-full bg-black text-brand-gold text-center py-4 font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">Select Diamond Plan</Link>
                </div>
              </div>
            </div>
          </section>

          {/* Detailed Deliverables */}
          <section className="py-32 px-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(circle_at_70%_50%,rgba(212,175,55,0.05)_0%,transparent_70%)] pointer-events-none" />
            
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <div className="text-brand-red font-black tracking-[0.5em] uppercase text-[10px] mb-8">
                  <EditableText field="joinCommunityExclusiveLabel" />
                </div>
                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-12 leading-tight">
                  <EditableText field="joinCommunityDeliveryHeading" />
                </h2>
                <EditableText field="joinCommunityWhatYouGetJson" multiline className="space-y-6 block" as="div">
                  {whatYouGet.map((item: string, i: number) => (
                    <div key={i} className="flex items-center space-x-4 group">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full border border-brand-gold/30 flex items-center justify-center text-brand-gold group-hover:bg-brand-gold group-hover:text-brand-black transition-all">
                        <CheckCircle2 size={12} />
                      </div>
                      <span className="text-lg text-white/60 font-light italic group-hover:text-white transition-colors">{item}</span>
                    </div>
                  ))}
                </EditableText>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="aspect-square bg-white/5 border border-white/10 p-12 flex flex-col justify-center items-center text-center space-y-10 relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 text-[15rem] font-serif italic text-white/[0.02] select-none uppercase">Join</div>
                  
                  <Heart className="text-brand-red animate-pulse" size={64} fill="currentColor" />
                  
                  <div className="space-y-4">
                    <h3 className="text-2xl font-black uppercase tracking-tighter">
                      <EditableText field="joinCommunityReadyHeading" />
                    </h3>
                    <p className="text-white/40 text-sm italic font-light max-w-xs mx-auto">
                      <EditableText field="joinCommunityReadyDesc" multiline />
                    </p>
                  </div>

                  <a 
                    href="#pricing"
                    className="w-full bg-brand-black border border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-brand-black transition-all duration-500 py-6 text-xs font-black tracking-[0.5em] uppercase relative z-10 text-center"
                  >
                    <EditableText field="joinCommunityUnlockBtnText" />
                  </a>
                  
                  <p className="text-[10px] text-white/20 font-mono tracking-widest uppercase italic">
                    {/* Secure Registration */}
                  </p>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Simple Final CTA Banner */}
          <section className="py-40 px-6 bg-brand-gold text-brand-black text-center relative overflow-hidden">
            <div className="max-w-4xl mx-auto relative z-10">
              <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter mb-10 leading-none">
                <EditableText field="joinCommunityFinalHeading" />
              </h2>
              <p className="text-[11px] font-black uppercase tracking-[0.5em] opacity-60 mb-12">
                <EditableText field="joinCommunityFinalLabel" />
              </p>
              <div className="w-24 h-[1px] bg-brand-black mx-auto" />
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}
