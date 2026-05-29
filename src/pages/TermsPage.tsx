import { Helmet } from 'react-helmet-async';
import { Scale } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useContent } from '../context/ContentContext';
import EditableText from '../components/EditableText';

export default function TermsPage() {
  const { content } = useContent();
  
  let sections = [];
  try {
    sections = JSON.parse(content.termsSectionsJson || '[]');
  } catch (e) {
    console.error("Failed to parse terms sections", e);
  }

  return (
    <div className="min-h-screen bg-brand-black text-brand-offwhite pt-24 font-sans">
      <Helmet>
        <title>{content.termsHeading || "Terms of Engagement"} - The Vagina Room</title>
      </Helmet>
      
      <Navigation />

      <main className="max-w-4xl mx-auto px-6 py-20 pb-32">
        <div className="flex items-center space-x-4 mb-12">
          <Scale className="text-brand-red w-10 h-10" />
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white">
            <EditableText field="termsHeading" className="inline-block" />
          </h1>
        </div>

        <div className="prose prose-invert prose-brand max-w-none space-y-8 text-white/80 font-light leading-relaxed">
          <p className="text-lg">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric'})}
          </p>

          <div className="whitespace-pre-wrap">
            <EditableText field="termsIntro" multiline />
          </div>

          {sections.map((section: any, idx: number) => (
            <section key={idx} className="space-y-4">
              <h2 className="text-2xl font-black tracking-widest uppercase text-brand-gold mt-12 mb-6">{section.title}</h2>
              <div className="whitespace-pre-wrap">{section.content}</div>
            </section>
          ))}

          <section className="space-y-4">
            <h2 className="text-2xl font-black tracking-widest uppercase text-brand-gold mt-12 mb-6">Contact Information</h2>
            <p>
              Direct any questions or concerns regarding these terms to:
            </p>
            <p className="font-mono text-sm bg-white/5 p-4 rounded border border-white/10 mt-4">
              {content.contactEmail}<br/>
              {content.contactPhone}
            </p>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
