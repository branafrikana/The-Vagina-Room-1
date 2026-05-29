import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useContent } from '../context/ContentContext';
import EditableText from './EditableText';

export const STATIC_FAQS = [
  {
    question: "What is The Vagina Room?",
    answer: "The Vagina Room is a women-centered wellness, education, and support platform focused on intimate health, emotional wellness, reproductive wellbeing, and holistic healing."
  },
  {
    question: "Who is The Vagina Room for?",
    answer: "The platform is designed for teen girls, young women, married women, mothers, women navigating hormonal or fertility challenges, and anyone seeking trusted women’s wellness education and support."
  },
  {
    question: "Is the community confidential?",
    answer: "Yes. Privacy, confidentiality, and emotional safety are core values of The Vagina Room. We are committed to maintaining a respectful and judgment-free environment."
  },
  {
    question: "What topics are discussed inside the community?",
    answer: "Topics include: Vaginal health & hygiene, Menstrual health, Fertility & hormonal wellness, Sexual wellness, Intimacy & relationships, Emotional wellbeing, Infection prevention, Pregnancy & postpartum care, and Holistic wellness support."
  },
  {
    question: "Is this a medical platform?",
    answer: "The Vagina Room provides educational, awareness, and wellness support content. It does not replace professional medical diagnosis or emergency healthcare services."
  },
  {
    question: "How do I join the community?",
    answer: "Simply complete the registration form and follow the onboarding instructions to gain access to the community."
  },
  {
    question: "Can I ask personal questions privately?",
    answer: "Yes. The platform is designed to encourage safe, respectful, and confidential conversations around women’s health and wellness concerns."
  },
  {
    question: "Is The Vagina Room only for women experiencing health challenges?",
    answer: "No. The platform is also for women who simply want to better understand their bodies, improve their wellness, and gain access to trusted health education."
  },
  {
    question: "Will there be trainings and educational sessions?",
    answer: "Yes. Members may gain access to wellness trainings, educational resources, awareness sessions, and supportive conversations focused on women’s intimate and reproductive health."
  },
  {
    question: "What makes The Vagina Room different?",
    answer: "We combine trusted education, emotional support, holistic wellness awareness, confidentiality, and a judgment-free community experience designed specifically for women."
  }
];

export default function FAQ() {
  const { content } = useContent();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  let faqs = STATIC_FAQS;
  if (content.faqDataJson) {
    try {
      faqs = JSON.parse(content.faqDataJson);
    } catch (e) {
      faqs = STATIC_FAQS;
    }
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <section id="faq-section" className="bg-brand-black py-32 border-t border-white/5 relative overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Decorative background element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-red/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-24"
        >
          <p className="text-brand-gold font-black tracking-[0.5em] uppercase text-[10px] mb-8">
            <EditableText field="faqTitle" />
          </p>
          <h2 className="font-sans text-5xl md:text-7xl font-black text-white leading-tight tracking-tighter uppercase mb-6">
            <EditableText field="faqHeading" fancyMode="inline" />
          </h2>
          <p className="text-white/40 font-light max-w-xl mx-auto block">
            <EditableText field="faqDesc" multiline />
          </p>
        </motion.div>

        <EditableText field="faqDataJson" multiline className="space-y-4 block" as="div">
          {faqs.map((faq, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`border backdrop-blur-sm overflow-hidden transition-all duration-300 ${
                openIndex === index 
                  ? "border-brand-gold/40 bg-white/[0.04]" 
                  : "border-white/10 bg-white/[0.02]"
              }`}
            >
              <button 
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-8 text-left group transition-colors hover:bg-white/[0.05]"
              >
                <span className="text-lg md:text-xl font-medium text-white/90 group-hover:text-white transition-colors">
                  {faq.question}
                </span>
                <motion.div 
                  className="flex-shrink-0 ml-4 text-brand-gold"
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  {openIndex === index ? <Minus size={20} /> : <Plus size={20} />}
                </motion.div>
              </button>
              
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="px-8 pb-8 text-lg text-white/50 leading-relaxed font-light">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </EditableText>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-20 text-center"
        >
          <p className="text-white/20 text-[10px] font-black tracking-[0.3em] uppercase">
            Still have questions? <Link to="/contact" className="text-brand-gold hover:underline">Contact Support</Link>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
