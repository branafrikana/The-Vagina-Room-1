import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, Sparkles, Heart, Shield, Users, Star, ArrowRight, ArrowLeft, MapPin,
  BookOpen, Brain, Activity, Flower2, HandHeart, CheckCircle2,
  Baby, Droplets, Smile, MessageCircleHeart
} from "lucide-react";
import SEO from "../components/SEO";
import { useContent } from "../context/ContentContext";
import { safeJsonParse } from "../lib/json";
import heroBg from "../assets/images/wellness_bg_hero_1780780675207.png";
import communityImg from "../assets/images/women_community_1780781882048.png";

// Sample Data for Bento Grid Showcase
const topics = [
  { icon: Flower2, title: "Fertility & Reproductive", color: "text-rose-400", bg: "bg-rose-500/10" },
  { icon: BookOpen, title: "Women's Health Education", color: "text-blue-400", bg: "bg-blue-500/10" },
  { icon: Droplets, title: "Menstrual & Cycle Awareness", color: "text-red-400", bg: "bg-red-500/10" },
  { icon: Activity, title: "Hormonal Health", color: "text-purple-400", bg: "bg-purple-500/10" },
  { icon: Baby, title: "Pregnancy Preparation", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { icon: Smile, title: "Vaginal Health & Hygiene", color: "text-pink-400", bg: "bg-pink-500/10" },
  { icon: Brain, title: "Emotional Healing", color: "text-indigo-400", bg: "bg-indigo-500/10" },
  { icon: Heart, title: "Sexual Health Education", color: "text-brand-gold", bg: "bg-brand-gold/10" },
  { icon: HandHeart, title: "Intimate Self-Care", color: "text-orange-400", bg: "bg-orange-500/10" },
  { icon: MessageCircleHeart, title: "Relationship Wellness", color: "text-rose-300", bg: "bg-rose-500/10" },
  { icon: Sparkles, title: "Holistic Solutions", color: "text-teal-400", bg: "bg-teal-500/10" },
  { icon: Users, title: "Personal Growth", color: "text-brand-gold", bg: "bg-brand-gold/10" },
];

const CONTINENT_COUNTRIES: Record<string, string[]> = {
  "Africa": ["Nigeria", "Ghana", "Kenya", "South Africa", "Rwanda", "Uganda", "Cameroon", "Egypt", "Ethiopia", "Tanzania", "Other African Country"],
  "North America": ["United States", "Canada", "Jamaica", "Trinidad and Tobago", "Other North American Country"],
  "Europe": ["United Kingdom", "Germany", "France", "Netherlands", "Ireland", "Italy", "Spain", "Other European Country"],
  "South America": ["Brazil", "Colombia", "Argentina", "Other South American Country"],
  "Asia": ["India", "United Arab Emirates", "Saudi Arabia", "Singapore", "Japan", "Other Asian Country"],
  "Oceania": ["Australia", "New Zealand", "Other Oceanian Country"]
};

const SUBDIVISIONS: Record<string, { label: string; placeholder: string; options?: string[] }> = {
  "Nigeria": {
    label: "State",
    placeholder: "Select State",
    options: [
      "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT - Abuja", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"
    ]
  },
  "Kenya": {
    label: "County",
    placeholder: "Select County",
    options: [
      "Nairobi", "Mombasa", "Kiambu", "Nakuru", "Kisumu", "Uasin Gishu", "Machakos", "Kajiado", "Nyeri", "Makueni", "Kilifi", "Kakamega", "Other County"
    ]
  },
  "Ghana": {
    label: "Region",
    placeholder: "Select Region",
    options: [
      "Greater Accra", "Ashanti", "Western", "Eastern", "Central", "Volta", "Northern", "Brong-Ahafo", "Upper East", "Upper West", "Other Region"
    ]
  },
  "South Africa": {
    label: "Province",
    placeholder: "Select Province",
    options: [
      "Gauteng", "Western Cape", "KwaZulu-Natal", "Eastern Cape", "Free State", "Limpopo", "Mpumalanga", "North West", "Northern Cape"
    ]
  },
  "United States": {
    label: "State",
    placeholder: "Select State",
    options: [
      "California", "Texas", "New York", "Florida", "Illinois", "Georgia", "North Carolina", "Pennsylvania", "Ohio", "Michigan", "Other State"
    ]
  },
  "Canada": {
    label: "Province",
    placeholder: "Select Province",
    options: [
      "Ontario", "Quebec", "British Columbia", "Alberta", "Manitoba", "Other Province"
    ]
  },
  "United Kingdom": {
    label: "Country/Region",
    placeholder: "Select Country/Region",
    options: ["England", "Scotland", "Wales", "Northern Ireland", "Other Region"]
  }
};

export default function TelegramCommunityPage() {
  const { content, submitFormSubmission } = useContent();
  const branding = safeJsonParse(content.brandingSettingsJson, {} as any);
  let tData: any = {};
  try {
    tData = JSON.parse(content.telegramLandingPageJson || "{}");
  } catch(e) {}

  // Use content URLs if available, otherwise fallback
  const heroBgUrl = content.telegramHeroBgUrl || "";
  const communityImgUrl = content.telegramCommunityImgUrl || "";
  const founderImageUrl = content.telegramFounderImageUrl || content.drFidImageUrl || "";

  // Preferred Logo Values from JSON or Global Config
  const heroLogoUrl = tData.logoUrl || content.telegramHeroLogoUrl || "";
  const heroLogoHeight = tData.logoHeight || content.telegramHeroLogoHeight || 150;
  const heroLogoType = tData.logoType || content.telegramHeroLogoType || "text";
  const heroLogoText = tData.heroHeaderTextLogo || content.telegramHeroHeaderTextLogo || "The Vagina Room";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    continent: "",
    country: "",
    subdivision: "",
    city: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const openModal = () => {
    setStep(1);
    setFormData({
      name: "",
      email: "",
      phone: "",
      continent: "",
      country: "",
      subdivision: "",
      city: ""
    });
    setError("");
    setIsModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNextStep = () => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setError("Please fill out your name, email, and Telegram number.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(formData.email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    setError("");
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.continent) {
      setError("Please select your continent.");
      return;
    }
    if (!formData.country) {
      setError("Please select your country.");
      return;
    }
    if (!formData.subdivision.trim()) {
      const subConfig = SUBDIVISIONS[formData.country];
      const label = subConfig ? subConfig.label : "State / Region / Province";
      setError(`Please select or specify your ${label}.`);
      return;
    }
    if (!formData.city.trim()) {
      setError("Please specify your city.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitFormSubmission("telegram_community", formData);

      if (!res.success) {
        throw new Error("Failed to submit request.");
      }

      // Automatically go to the thank you page
      navigate("/telegram/thank-you");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
  };

  // Section Individual Rendering Helpers
  const renderHeroSection = () => (
    <section key="telegram_hero" className="relative px-6 pt-40 pb-32 lg:pt-48 lg:pb-32 flex flex-col items-center text-center min-h-[90vh] justify-center overflow-hidden">
      <img src={heroBgUrl || heroBg} alt="Hero Background" referrerPolicy="no-referrer" className="absolute inset-x-0 top-0 w-full h-[120%] object-cover object-top opacity-30 select-none pointer-events-none mix-blend-screen" />
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/40 via-zinc-950/80 to-zinc-950 pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-full max-w-2xl h-[500px] bg-brand-gold/10 blur-[130px] rounded-full pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-0 right-1/4 w-full max-w-xl h-[400px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-5xl mx-auto space-y-8 relative z-10 flex flex-col items-center"
      >
        {heroLogoType === 'image' && heroLogoUrl && heroLogoUrl.trim() !== "" ? (
          <motion.div variants={itemVariants} className="mb-2">
            <img 
              src={heroLogoUrl} 
              alt="The Vagina Room Logo" 
              style={{ height: `${heroLogoHeight}px` }}
              className="w-auto object-contain mx-auto drop-shadow-[0_0_15px_rgba(212,175,55,0.4)]" 
              referrerPolicy="no-referrer" 
            />
          </motion.div>
        ) : (
          <motion.div variants={itemVariants} className="mb-6 font-sans text-3xl font-black tracking-tighter text-white uppercase group flex items-center gap-2 justify-center">
            <span className="text-3xl tracking-tighter uppercase">
              {heroLogoText}
            </span>
          </motion.div>
        )}

        <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-brand-gold text-xs font-mono uppercase tracking-widest mb-4 backdrop-blur-md font-bold">
          <Sparkles size={14} /> {tData.heroBadge || "Welcome to the safe space"}
        </motion.div>

        <motion.h1 
          variants={itemVariants} 
          className="text-4xl md:text-6xl lg:text-7xl font-serif text-white leading-[1.1] tracking-tight"
          dangerouslySetInnerHTML={{ __html: tData.heroTitle || "Welcome To <br/><span class='text-transparent bg-clip-text bg-gradient-to-r from-brand-gold via-yellow-200 to-brand-gold italic pr-2'>The Vagina Room</span><br/>Free Telegram Community" }}
        />
        
        <motion.p variants={itemVariants} className="text-lg md:text-2xl text-zinc-400 font-light leading-relaxed max-w-3xl mx-auto">
          {tData.heroSubtitle || "A private, judgment-free collective dedicated to women's health, healing, and holistic empowerment."}
        </motion.p>

        <motion.div variants={itemVariants} className="pt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={openModal}
            className="group relative inline-flex items-center justify-center px-8 py-5 bg-zinc-100 text-zinc-950 font-bold text-base md:text-lg hover:bg-white transition-all duration-300 rounded-full shadow-xl shadow-white/5 active:scale-95 gap-3 w-full sm:w-auto cursor-pointer"
          >
            {tData.heroBtnText || "Join Our Free Community"}
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-5 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-zinc-500 text-xs font-mono uppercase tracking-widest"
      >
        <span>Scroll</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-zinc-500 to-transparent" />
      </motion.div>
    </section>
  );

  const renderPurposePainSection = () => (
    <section key="telegram_purpose_pain" className="py-24 px-6 md:py-32 relative border-t border-white/5 bg-zinc-950">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-rose-500/5 blur-[120px] rounded-full pointer-events-none mix-blend-screen translate-x-1/3 -translate-y-1/2" />
      
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-gold/10 text-brand-gold text-xs font-mono uppercase tracking-widest font-bold">
            {tData.purposeLabel || "Our Purpose"}
          </div>
          <h2 className="text-4xl md:text-5xl font-serif text-white leading-tight" dangerouslySetInnerHTML={{ __html: tData.purposeTitle || "Why The Vagina Room <span class='italic text-brand-gold'>Exists</span>" }} />
          <div className="space-y-6 text-lg text-zinc-400 font-light leading-relaxed">
            <p className="text-xl text-zinc-200">{tData.purposeP1 || "Too many women suffer in silence."}</p>
            <p>{tData.purposeP2 || "Many women struggle with questions about fertility, menstrual health, hormonal changes, intimate wellness, pregnancy preparation, emotional wellbeing, and reproductive health without access to reliable information or supportive communities."}</p>
            <p>{tData.purposeP3 || "The Vagina Room was created to bridge that gap by providing a safe, supportive environment where women can learn, ask questions, access expert guidance, and gain the confidence to make informed decisions about their health."}</p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="bg-zinc-900/40 border border-white/5 rounded-3xl p-8 md:p-10 backdrop-blur-sm relative"
        >
          <div className="absolute -top-6 -left-6 w-16 h-16 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center rotate-[-10deg]">
            <Heart className="text-rose-400" size={28} />
          </div>
          <h3 className="text-2xl font-serif text-white mb-8 mt-2">{tData.painLabel || "Are You Experiencing Any of These?"}</h3>
          <ul className="space-y-4">
            {(tData.painItems || [
              "Irregular menstrual cycles",
              "Fertility concerns or difficulty conceiving",
              "Hormonal imbalances",
              "Recurrent vaginal infections",
              "Pregnancy-related questions",
              "Emotional stress related to reproductive health",
              "Lack of clarity about your reproductive system",
              "Confusion from conflicting online health information",
              "Feelings of isolation during your fertility journey"
            ]).map((item: string, i: number) => (
              <motion.li 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 + 0.3 }}
                className="flex items-start gap-3"
              >
                <div className="text-rose-400/80 mt-1 shrink-0"><X size={16} /></div>
                <span className="text-zinc-300 font-light">{item}</span>
              </motion.li>
            ))}
          </ul>
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 1 }}
            className="mt-8 pt-6 border-t border-white/5 text-brand-gold italic text-lg"
          >
            {tData.painFooter || "If any of these sound familiar, you are not alone."}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );

  const renderBentoSection = () => (
    <section key="telegram_bento" className="py-24 px-6 max-w-7xl mx-auto">
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
        className="grid grid-cols-1 lg:grid-cols-12 gap-6"
      >
        <motion.div variants={itemVariants} className="lg:col-span-8 bg-zinc-900/50 border border-white/5 rounded-3xl p-8 md:p-12 backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/5 blur-[80px] rounded-full group-hover:bg-brand-gold/10 transition-colors duration-700" />
          <div className="relative z-10 flex flex-col h-full justify-between gap-12">
            <Heart className="text-brand-gold/50" size={40} />
            <div className="space-y-6">
              <h2 className="text-3xl md:text-5xl font-serif text-white">{tData.bentoTitle || "What is The Vagina Room?"}</h2>
              <p className="text-lg text-zinc-400 font-light leading-relaxed max-w-2xl">
                <strong className="text-zinc-200 font-medium">{tData.bentoSubtitle || "The Vagina Room is more than a community."}</strong>
              </p>
              <p className="text-lg text-zinc-400 font-light leading-relaxed max-w-2xl">
                {tData.bentoText1 || "It is a safe, confidential, and empowering space where women gain access to practical knowledge, expert guidance, meaningful conversations, and supportive resources that help them make informed decisions about their health and wellbeing."}
              </p>
              <p className="text-lg text-zinc-400 font-light leading-relaxed max-w-2xl">
                {tData.bentoText2 || "Whether you are navigating fertility challenges, hormonal changes, menstrual concerns, pregnancy preparation, emotional healing, intimate health questions, or simply seeking a deeper understanding of your body, you belong here."}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="lg:col-span-4 bg-zinc-900/50 border border-white/5 rounded-3xl p-8 md:p-10 backdrop-blur-sm overflow-hidden group">
          <div className="flex flex-col h-full">
            <div className="mb-0 sm:mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 mb-6">
                <Shield size={28} />
              </div>
              <h3 className="text-2xl font-serif text-white mb-4">{tData.bentoDiffTitle || "What Makes Us Different?"}</h3>
              <p className="text-sm text-zinc-400 font-light leading-relaxed mb-6">
                {tData.bentoDiffDesc || "Unlike random social media advice or unverified online discussions, we provide:"}
              </p>
            </div>
            
            <ul className="space-y-4 flex-1">
              {(tData.bentoDiffItems || [
                "Structured wellness education",
                "Evidence-informed insights",
                "Expert-led discussions",
                "Safe & respectful environment",
                "Holistic wellness approaches"
              ]).map((item: string, i: number) => (
                <li key={i} className="flex items-center gap-3 text-zinc-300 text-sm">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );

  const renderShowcaseSection = () => (
    <section key="telegram_showcase" className="py-24 px-6 relative">
      <div className="max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-4">
          <h2 className="text-4xl md:text-5xl font-serif text-white">{tData.showcaseTitle || "Inside The Community"}</h2>
          <p className="text-zinc-400 max-w-2xl mx-auto text-lg">{tData.showcaseSubtitle || "Everything you need to learn, heal, and thrive."}</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {topics.map((topic, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="p-6 bg-zinc-900/30 border border-white/5 rounded-2xl backdrop-blur-sm group cursor-pointer"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${topic.bg}`}>
                <topic.icon className={topic.color} size={24} />
              </div>
              <h3 className="text-zinc-200 font-medium text-lg leading-tight">{topic.title}</h3>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );

  const renderBenefitsSection = () => (
    <section key="telegram_benefits" className="py-24 px-6 md:py-32 relative border-t border-white/5 bg-zinc-950">
      <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-brand-gold/5 blur-[120px] rounded-full pointer-events-none mix-blend-screen -translate-y-1/2" />
      
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-serif text-white">{tData.benefitsTitle || "What You Get When You Join"}</h2>
          <p className="text-zinc-400 max-w-2xl mx-auto text-lg">{tData.benefitsSubtitle || "As a member of our free Telegram community, you will receive:"}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {(tData.benefitsItems || [
            { title: "Weekly Tips", desc: "Fertility and reproductive wellness tips", icon: "Heart", color: "text-rose-400" },
            { title: "Health Sessions", desc: "Women's health education sessions", icon: "BookOpen", color: "text-blue-400" },
            { title: "Wellness Challenges", desc: "Access to wellness challenges and activities", icon: "Activity", color: "text-emerald-400" },
            { title: "Guides & Resources", desc: "Educational resources and guides", icon: "BookOpen", color: "text-amber-400" },
            { title: "Community Support", desc: "Community discussions and support", icon: "Users", color: "text-brand-gold" },
            { title: "Program Updates", desc: "Updates on upcoming trainings & programs", icon: "Sparkles", color: "text-indigo-400" },
            { title: "Expert Q&A", desc: "Opportunities to ask questions from experts", icon: "Brain", color: "text-pink-400" },
            { title: "Live Sessions", desc: "Exclusive invitations to webinars & lives", icon: "Activity", color: "text-red-400" }
          ]).map((item: any, i: number) => {
            const iconMap: Record<string, any> = { Heart, BookOpen, Activity, Users, Sparkles, Brain };
            const IconComp = iconMap[item.icon] || Sparkles;
            return (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="bg-zinc-900/40 border border-white/5 p-6 rounded-2xl backdrop-blur-sm hover:bg-zinc-900/60 transition-colors"
              >
                <div className={`p-3 rounded-xl bg-white/5 inline-flex mb-4 ${item.color || "text-brand-gold"}`}>
                  <IconComp size={24} />
                </div>
                <h3 className="text-white font-medium mb-2">{item.title}</h3>
                <p className="text-zinc-400 text-sm font-light leading-relaxed">{item.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );

  const renderWhoShouldJoinSection = () => (
    <section key="telegram_who_should_join" className="py-24 px-6 bg-zinc-900/20 border-y border-white/5 relative overflow-hidden">
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-brand-gold/5 blur-[100px] rounded-full -translate-y-1/2 pointer-events-none" />
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-emerald-500/5 blur-[100px] rounded-full -translate-y-1/2 pointer-events-none" />
      
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-serif text-white">{tData.whoJoinTitle || "Who Should Join?"}</h2>
          <p className="text-zinc-400 max-w-2xl mx-auto text-lg">{tData.whoJoinSubtitle || "This community is for:"}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(tData.whoJoinItems || [
            "Women seeking better understanding of their bodies",
            "Women preparing for pregnancy",
            "Women navigating fertility challenges",
            "Women interested in hormonal and reproductive wellness",
            "Married women and couples seeking fertility education",
            "Women looking for a supportive and judgment-free wellness community",
            "Women committed to living healthier, more empowered lives",
            "Women seeking holistic and expert-led approaches to intimate health"
          ]).map((item: string, i: number) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex items-start gap-4 p-6 bg-zinc-950/50 border border-white/5 rounded-2xl backdrop-blur-md group hover:border-brand-gold/30 transition-colors"
            >
              <div className="p-2 rounded-full bg-brand-gold/10 text-brand-gold shrink-0 mt-1 group-hover:scale-110 transition-transform">
                <CheckCircle2 size={20} />
              </div>
              <span className="text-zinc-300 text-lg leading-relaxed">{item}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );

  const renderFounderSection = () => (
    <section key="telegram_founder" className="py-24 px-6 md:py-32 relative border-t border-white/5 bg-black">
      <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-brand-gold/5 blur-[120px] rounded-full pointer-events-none mix-blend-screen -translate-y-1/2" />
      
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-5 relative"
        >
          <div className="aspect-[4/5] bg-zinc-900 border border-white/10 rounded-[2rem] overflow-hidden relative">
            {founderImageUrl ? (
              <img src={founderImageUrl} alt="Founder" className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <>
                <div className="absolute inset-0 bg-gradient-to-tr from-brand-gold/20 to-transparent z-10 mix-blend-overlay" />
                <div className="absolute inset-0 flex items-center justify-center opacity-20">
                    <Star className="text-white w-32 h-32" />
                </div>
              </>
            )}
          </div>
          
          <div className="absolute -bottom-6 -right-6 bg-zinc-900 border border-white/10 p-6 rounded-2xl shadow-xl backdrop-blur-md">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-brand-gold/10 text-brand-gold flex items-center justify-center">
                <Star size={24} />
              </div>
              <div>
                <h4 className="text-white font-serif text-lg">{tData.founderName ? tData.founderName.split('(').pop()?.replace(')', '') || "Dr. FID" : "Dr. FID"}</h4>
                <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest">{tData.founderBadge || "Founder"}</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-7 space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-gold/10 text-brand-gold text-xs font-mono uppercase tracking-widest font-bold">
            {tData.founderBadge || "Our Founder"}
          </div>
          <h2 className="text-4xl md:text-5xl font-serif text-white leading-tight">
            {tData.founderTitle || "Meet Your Community Founder"}
          </h2>
          
          <div className="space-y-6 text-lg text-zinc-400 font-light leading-relaxed">
            <p>
              <strong className="text-white font-medium">{tData.founderName || "Ambassador Dr. Damilola Awoyemi (Dr. FID)"}</strong>
            </p>
            <p>
              {tData.founderText1 || "Ambassador Dr. Damilola Awoyemi (Dr. FID) is a Holistic Wellness Expert, Women's Wellness Advocate, Fertility & Reproductive Wellness Educator, SPA Business Consultant, and Founder of FID SPA Aesthetic & Chiropractic Clinic."}
            </p>
            <p>
              {tData.founderText2 || "Through The Vagina Room, she is committed to helping women replace confusion with clarity, fear with understanding, and silence with informed conversations about their health and wellbeing."}
            </p>
          </div>

          <div className="border-t border-white/10 pt-8 mt-8">
            <p className="text-xl font-serif text-white italic">
              "{tData.founderQuote || "Replacing confusion with clarity, fear with understanding, and silence with informed conversations."}"
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );

  const renderPromiseSection = () => (
    <section key="telegram_promise" className="py-24 px-6 md:py-32 relative bg-zinc-900/20 border-t border-white/5 overflow-hidden">
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-brand-gold/5 blur-[100px] rounded-full -translate-y-1/2 pointer-events-none" />
      
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-gold/10 text-brand-gold text-xs font-mono uppercase tracking-widest font-bold">
            {tData.promiseLabel || "Our Commitment"}
          </div>
          <h2 className="text-4xl md:text-5xl font-serif text-white leading-tight" dangerouslySetInnerHTML={{ __html: tData.promiseTitle || "Our Promise <span class='italic text-brand-gold'>To You</span>" }} />
          <p className="text-lg text-zinc-400 font-light leading-relaxed">
            {tData.promiseP1 || "We promise to create a safe, respectful, and empowering environment where women can:"}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          {(tData.promiseItems || [
            { text: "Learn without shame.", icon: "BookOpen" },
            { text: "Ask questions without fear.", icon: "MessageCircleHeart" },
            { text: "Grow without limitations.", icon: "Flower2" },
            { text: "Heal without stigma.", icon: "Heart" },
            { text: "Connect without judgment.", icon: "Users" },
            { text: "And thrive with confidence.", icon: "Sparkles" }
          ]).map((item: any, i: number) => {
            const IconNames: any = { BookOpen, MessageCircleHeart, Flower2, Heart, Users, Sparkles };
            const IconComp = IconNames[item.icon] || Sparkles;
            return (
              <div key={i} className="flex items-center gap-4 bg-zinc-950/50 p-6 rounded-2xl border border-white/5">
                <div className="w-10 h-10 rounded-full bg-brand-gold/10 flex items-center justify-center shrink-0">
                  <IconComp size={18} className="text-brand-gold" />
                </div>
                <span className="text-zinc-200 font-medium">{item.text}</span>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );

  const renderSisterhoodSection = () => (
    <section key="telegram_community_sisterhood" className="py-24 px-6 md:py-32 relative border-t border-white/5 bg-zinc-950">
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-brand-gold/5 blur-[100px] rounded-full -translate-y-1/2 pointer-events-none" />
      
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          <div className="aspect-[4/3] rounded-[2rem] overflow-hidden border border-white/10 relative shadow-2xl">
            <img src={communityImgUrl || communityImg} alt="Women Community" referrerPolicy="no-referrer" className="absolute inset-0 w-full h-full object-cover opacity-80 hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent mix-blend-multiply" />
          </div>
          <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-brand-gold/10 rounded-full blur-[40px] pointer-events-none" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-gold/10 text-brand-gold text-xs font-mono uppercase tracking-widest font-bold">
            {tData.ctaCommunityLabel || "Our Community"}
          </div>
          <h2 className="text-4xl md:text-5xl font-serif text-white leading-tight" dangerouslySetInnerHTML={{ __html: tData.ctaCommunityTitle || "Join a Growing <br /> <span class='italic text-brand-gold'>Community</span> of Women" }} />
          
          <div className="space-y-6 text-lg text-zinc-400 font-light leading-relaxed">
            <p>
              <strong className="text-white font-medium">{tData.ctaCommunityP1 || "You do not have to navigate your health journey alone."}</strong>
            </p>
            <p>{tData.ctaCommunityP2 || "Inside The Vagina Room, you will find a community of women committed to learning, healing, supporting one another, and becoming healthier versions of themselves."}</p>
            <p>{tData.ctaCommunityP3 || "Together, we are building stronger women, healthier families, and more informed communities."}</p>
          </div>
        </motion.div>
      </div>
    </section>
  );

  const renderCtaSection = () => (
    <section key="telegram_cta" className="py-24 px-6 relative">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-br from-zinc-900 to-black border border-white/10 rounded-[3rem] p-10 md:p-16 relative overflow-hidden shadow-2xl text-center"
        >
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-gold/5 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none mix-blend-screen" />
          
          <div className="relative z-10 space-y-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0088cc]/10 text-[#0088cc] text-xs font-mono uppercase tracking-widest mb-2 font-bold">
              {tData.ctaFinalLabel || "Your Next Step"}
            </div>
            
            <h2 className="text-4xl md:text-5xl font-serif text-white leading-tight max-w-2xl mx-auto" dangerouslySetInnerHTML={{ __html: tData.ctaFinalTitle || "Take the first step toward better understanding your <span class='text-brand-gold italic'>body.</span>" }} />
            
            <div className="space-y-6 text-lg text-zinc-400 font-light leading-relaxed max-w-2xl mx-auto">
              <p>{tData.ctaFinalDesc || "Improve your wellness and join a supportive community that truly cares. Join The Vagina Room Free Telegram Community Today."}</p>
            </div>

            <div className="pt-4 max-w-md mx-auto">
              <button
                onClick={openModal}
                className="w-full inline-flex items-center justify-center px-8 py-5 bg-[#0088cc] text-white font-bold text-lg hover:bg-[#007ab8] transition-all duration-300 rounded-xl shadow-lg shadow-[#0088cc]/20 gap-3 active:scale-95 group cursor-pointer border-none"
              >
                {tData.ctaFinalBtnText || "Join Telegram Group"} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="mt-8 pt-6 border-t border-white/5 text-brand-gold font-serif italic text-xl flex items-center justify-center gap-2">
                {tData.ctaFinalFooterText || "Learn. Heal. Thrive."}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );

  const renderSection = (id: string) => {
    switch (id) {
      case "telegram_hero":
        return renderHeroSection();
      case "telegram_purpose_pain":
        return renderPurposePainSection();
      case "telegram_bento":
        return renderBentoSection();
      case "telegram_showcase":
        return renderShowcaseSection();
      case "telegram_benefits":
        return renderBenefitsSection();
      case "telegram_who_should_join":
        return renderWhoShouldJoinSection();
      case "telegram_founder":
        return renderFounderSection();
      case "telegram_promise":
        return renderPromiseSection();
      case "telegram_community_sisterhood":
        return renderSisterhoodSection();
      case "telegram_cta":
        return renderCtaSection();
      default:
        return null;
    }
  };

  let sectionIds = [
    "telegram_hero",
    "telegram_purpose_pain",
    "telegram_bento",
    "telegram_showcase",
    "telegram_benefits",
    "telegram_who_should_join",
    "telegram_founder",
    "telegram_promise",
    "telegram_community_sisterhood",
    "telegram_cta"
  ];

  if (content.telegramPageSectionsOrder) {
    try {
      const parsed = JSON.parse(content.telegramPageSectionsOrder);
      if (Array.isArray(parsed)) {
        sectionIds = parsed;
      }
    } catch (e) {
      console.warn("Error parsing telegramPageSectionsOrder", e);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-brand-gold/30 relative">
      <SEO 
        title="Welcome to The Vagina Room | Join Our Telegram Community" 
        description="A Safe Space for Women's Health, Healing & Empowerment. Join our free Telegram community today." 
      />

      {/* Sticky Glassmorphic Header */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${scrolled ? 'bg-zinc-950/70 backdrop-blur-xl border-b border-white/5 py-3' : 'bg-transparent py-6'}`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link to="/" className="font-sans text-xl font-black tracking-tighter text-white uppercase group flex items-center gap-2">
            {content.telegramHeaderLogoType === 'image' && content.telegramHeaderLogoUrl && content.telegramHeaderLogoUrl.trim() !== "" ? (
              <img 
                src={content.telegramHeaderLogoUrl} 
                alt="The Vagina Room"
                style={{ height: `${content.telegramHeaderLogoHeight || 44}px` }}
                className="w-auto object-contain transition-transform group-hover:scale-105" 
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="text-xl tracking-tighter uppercase">
                The <span className="text-brand-gold italic font-light lowercase transition-transform group-hover:scale-110 inline-block">Vagina</span> Room
              </span>
            )}
          </Link>
          <button 
            onClick={openModal}
            className="hidden md:block text-sm font-semibold uppercase tracking-widest bg-white text-black px-5 py-2.5 rounded-full hover:scale-105 active:scale-95 transition-transform cursor-pointer border-none"
          >
            Join Community
          </button>
        </div>
      </motion.header>

      <main className="flex-grow">
        {sectionIds.map(id => renderSection(id))}
      </main>

      <footer className="py-12 border-t border-white/5 text-center space-y-4 bg-zinc-950">
        <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest">
          &copy; {new Date().getFullYear()} The Vagina Room
        </p>
        <p className="text-zinc-600 text-[11px] font-mono italic max-w-sm mx-auto px-6">
          A Safe Space for Women's Wellness, Reproductive Health & Empowerment.
        </p>
      </footer>

      {/* Modern Glassmorphic Location Registration Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 animate-fade-in"
              onClick={() => !isSubmitting && setIsModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-zinc-950/90 backdrop-blur-2xl border border-white/10 p-8 md:p-10 rounded-[2.5rem] shadow-2xl z-50 transition-all duration-300 ${step === 2 ? "overflow-y-auto max-h-[90vh]" : ""}`}
            >
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
                className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors bg-white/5 p-2 rounded-full cursor-pointer"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-gold/10 text-brand-gold text-[10px] font-mono uppercase tracking-widest mb-6 font-bold">
                Step {step} of 2
              </div>

              <h2 className="text-3xl font-serif text-white mb-2">
                {step === 1 ? "Join Our Community" : "Your Location"}
              </h2>
              <p className="text-zinc-400 text-sm mb-8 font-light leading-relaxed">
                {step === 1 
                  ? "Provide your details below to receive the exclusive invite link."
                  : "We track where our global sisterhood footprint is registering from."}
              </p>

              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl">
                  {error}
                </div>
              )}

              {step === 1 ? (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="name" className="block text-[11px] font-mono text-zinc-500 uppercase tracking-wider ml-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-brand-gold/50 focus:bg-white/5 transition-all text-sm"
                      placeholder="Jane Doe"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="email" className="block text-[11px] font-mono text-zinc-500 uppercase tracking-wider ml-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-brand-gold/50 focus:bg-white/5 transition-all text-sm"
                      placeholder="name@example.com"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="phone" className="block text-[11px] font-mono text-zinc-500 uppercase tracking-wider ml-1">
                      Telegram Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-brand-gold/50 focus:bg-white/5 transition-all text-sm"
                      placeholder="+234 802 729 4320"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="w-full mt-6 bg-zinc-100 text-zinc-950 rounded-xl px-6 py-4 font-bold text-sm hover:bg-white transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer border-none"
                  >
                    Continue to Location <ArrowRight size={16} />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1 rounded-none">
                    <label htmlFor="continent" className="block text-[11px] font-mono text-zinc-500 uppercase tracking-wider ml-1">
                      Continent
                    </label>
                    <div className="relative">
                      <select
                        id="continent"
                        name="continent"
                        required
                        value={formData.continent}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData({
                            ...formData,
                            continent: val,
                            country: "",
                            subdivision: "",
                            city: ""
                          });
                        }}
                        className="w-full bg-zinc-900 border border-white/10 rounded-xl p-4 pr-10 text-white focus:outline-none focus:border-brand-gold/50 transition-all text-sm appearance-none cursor-pointer"
                      >
                        <option value="" disabled className="bg-zinc-900 text-zinc-400">Select Continent</option>
                        {Object.keys(CONTINENT_COUNTRIES).map((cont) => (
                          <option key={cont} value={cont} className="bg-zinc-900 text-white font-sans">{cont}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-zinc-500 text-xs">▼</div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="country" className="block text-[11px] font-mono text-zinc-500 uppercase tracking-wider ml-1">
                      Country
                    </label>
                    <div className="relative">
                      <select
                        id="country"
                        name="country"
                        required
                        disabled={!formData.continent}
                        value={formData.country}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData({
                            ...formData,
                            country: val,
                            subdivision: "",
                            city: ""
                          });
                        }}
                        className={`w-full bg-zinc-900 border border-white/10 rounded-xl p-4 pr-10 text-white focus:outline-none focus:border-brand-gold/50 transition-all text-sm appearance-none cursor-pointer ${!formData.continent ? "opacity-40 cursor-not-allowed" : ""}`}
                      >
                        <option value="" disabled className="bg-zinc-900 text-zinc-400">Select Country</option>
                        {formData.continent && CONTINENT_COUNTRIES[formData.continent]?.map((c) => (
                          <option key={c} value={c} className="bg-zinc-900 text-white font-sans">{c}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-zinc-500 text-xs">▼</div>
                    </div>
                  </div>

                  {formData.country && (
                    <>
                      <div className="space-y-1">
                        <label htmlFor="subdivision" className="block text-[11px] font-mono text-zinc-500 uppercase tracking-wider ml-1">
                          {SUBDIVISIONS[formData.country] ? SUBDIVISIONS[formData.country].label : "State / Region / Province"}
                        </label>
                        {SUBDIVISIONS[formData.country]?.options ? (
                          <div className="relative">
                            <select
                              id="subdivision"
                              name="subdivision"
                              required
                              value={formData.subdivision}
                              onChange={(e) => setFormData({ ...formData, subdivision: e.target.value })}
                              className="w-full bg-zinc-900 border border-white/10 rounded-xl p-4 pr-10 text-white focus:outline-none focus:border-brand-gold/50 transition-all text-sm appearance-none cursor-pointer"
                            >
                              <option value="" disabled className="bg-zinc-900 text-zinc-400">Select Option</option>
                              {SUBDIVISIONS[formData.country].options.map((opt) => (
                                <option key={opt} value={opt} className="bg-zinc-900 text-white font-sans">{opt}</option>
                              ))}
                              <option value="Other" className="bg-zinc-900 text-white font-sans">Other / Custom</option>
                            </select>
                            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-zinc-500 text-xs">▼</div>
                          </div>
                        ) : (
                          <input
                            type="text"
                            id="subdivision"
                            name="subdivision"
                            required
                            value={formData.subdivision}
                            onChange={(e) => setFormData({ ...formData, subdivision: e.target.value })}
                            className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-brand-gold/50 focus:bg-white/5 transition-all text-sm"
                            placeholder={SUBDIVISIONS[formData.country] ? SUBDIVISIONS[formData.country].placeholder : "e.g., Delta / California"}
                          />
                        )}
                      </div>

                      {formData.subdivision === "Other" && (
                        <div className="space-y-1.5">
                          <label htmlFor="customSubdivision" className="block text-[11px] font-mono text-zinc-500 uppercase tracking-wider ml-1">
                            Specify {SUBDIVISIONS[formData.country] ? SUBDIVISIONS[formData.country].label : "Local Area"}
                          </label>
                          <input
                            type="text"
                            id="customSubdivision"
                            name="subdivision"
                            required
                            onChange={(e) => setFormData({ ...formData, subdivision: e.target.value })}
                            className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-brand-gold/50 focus:bg-white/5 transition-all text-sm"
                            placeholder="Specify custom location name"
                          />
                        </div>
                      )}

                      <div className="space-y-1.5">
                        <label htmlFor="city" className="block text-[11px] font-mono text-zinc-500 uppercase tracking-wider ml-1">
                          City
                        </label>
                        <input
                          type="text"
                          id="city"
                          name="city"
                          required
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-brand-gold/50 focus:bg-white/5 transition-all text-sm"
                          placeholder="e.g. Asaba, Los Angeles"
                        />
                      </div>
                    </>
                  )}

                  <div className="pt-4 flex items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={() => { setError(""); setStep(1); }}
                      className="px-5 py-4 border border-white/10 text-zinc-400 font-bold text-sm hover:text-white hover:bg-white/5 transition-all rounded-xl active:scale-95 flex items-center justify-center gap-2 cursor-pointer bg-white/5"
                    >
                      <ArrowLeft size={16} /> Back
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-zinc-100 text-zinc-950 rounded-xl px-6 py-4 font-bold text-sm hover:bg-white transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer border-none"
                    >
                      {isSubmitting ? (
                        <div className="h-5 w-5 border-2 border-zinc-950/20 border-t-zinc-950 rounded-full animate-spin" />
                      ) : (
                        <>Submit & Get Link <MapPin size={16} className="text-zinc-950" /></>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
