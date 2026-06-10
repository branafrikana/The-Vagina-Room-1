import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { db } from "../lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import SEO from "../components/SEO";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { ArrowLeft, Sparkles, BookOpen, Layers, Zap, Heart } from "lucide-react";
import { motion } from "motion/react";

interface PageSection {
  id: string;
  type: "hero" | "text" | "grid" | "cta";
  title: string;
  subtitle?: string;
  bodyText?: string;
  imageUrl?: string;
  btnText?: string;
  btnLink?: string;
  items?: string; // Serialized string of list items
}

interface CustomPage {
  id: string;
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  seoKeywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
  status: "draft" | "published";
  sections: PageSection[];
}

export default function DynamicPageRenderer() {
  const location = useLocation();
  const currentPath = location.pathname.toLowerCase().trim();
  const [page, setPage] = useState<CustomPage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomPage = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, "pages"),
          where("slug", "==", currentPath),
          where("status", "==", "published")
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const docSnap = snapshot.docs[0];
          setPage({ id: docSnap.id, ...docSnap.data() } as CustomPage);
        } else {
          setPage(null);
        }
      } catch (err) {
        console.error("Dynamic page evaluation failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomPage();
  }, [currentPath]);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
          <p className="text-brand-gold font-mono tracking-[0.2em] text-[10px] uppercase">Rethreading dynamic canvas...</p>
        </div>
      </div>
    );
  }

  if (!page) {
    /* Premium 404 fallback card if page not published/found */
    return (
      <>
        <SEO title="Page Not Found | The Vagina Room" description="The requested path could not be found." />
        <Navigation />
        <main className="min-h-screen bg-brand-black text-white flex items-center justify-center px-4 py-24">
          <div className="max-w-md w-full bg-neutral-900/60 border border-white/5 rounded-2xl p-8 text-center space-y-6 shadow-2xl">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-gold block">Coordinate Lost</span>
            <h1 className="text-4xl font-serif text-white">404 <span className="italic text-brand-gold">Void.</span></h1>
            <p className="text-xs text-white/50 leading-relaxed font-sans">
              The layout or corridor you are attempting to trace is either absent, unreleased, or has been folded from the directory.
            </p>
            <div className="border-t border-white/5 pt-6 flex justify-center">
              <Link
                to="/"
                className="h-10 px-6 bg-brand-gold text-brand-black hover:bg-brand-red hover:text-white transition-all font-mono text-[10px] uppercase font-black tracking-widest inline-flex items-center justify-center rounded"
              >
                Return to Core
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Parse custom items JSON safely
  const parseItems = (serialized: string | undefined): any[] => {
    if (!serialized) return [];
    try {
      return JSON.parse(serialized);
    } catch (e) {
      // Return safe fallback
      return [];
    }
  };

  return (
    <>
      <SEO 
        title={page.metaTitle || `${page.title} | The Vagina Room`} 
        description={page.metaDescription || "Dynamic custom structured layout."} 
        keywords={page.seoKeywords}
        ogTitle={page.ogTitle}
        ogDescription={page.ogDescription}
        ogImage={page.ogImage}
        ogType={page.ogType || 'website'}
      />
      <Navigation />
      <main className="min-h-screen bg-brand-black text-white pt-20">
        <div className="space-y-16">
          {page.sections?.map((sec, idx) => {
            switch (sec.type) {
              case "hero":
                return (
                  <section 
                    key={sec.id} 
                    className="relative min-h-[60vh] flex items-center justify-center bg-black overflow-hidden py-16 border-b border-white/5"
                    id={`custom_hero_${sec.id}`}
                  >
                    {sec.imageUrl && (
                      <div className="absolute inset-0 z-0">
                        <img 
                          src={sec.imageUrl} 
                          alt="Banner Cover" 
                          className="w-full h-full object-cover opacity-35"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/60 to-black/80" />
                      </div>
                    )}
                    <div className="max-w-4xl mx-auto px-6 text-center space-y-6 relative z-10">
                      {sec.subtitle && (
                        <span className="text-[10px] sm:text-xs font-black tracking-[0.4em] text-brand-gold uppercase block">
                          {sec.subtitle}
                        </span>
                      )}
                      <h2 className="text-3xl sm:text-5xl lg:text-6xl font-serif text-white tracking-tight leading-tight">
                        {sec.title}
                      </h2>
                      {sec.bodyText && (
                        <p className="text-xs sm:text-sm text-white/60 max-w-2xl mx-auto leading-relaxed font-sans">
                          {sec.bodyText}
                        </p>
                      )}
                      {sec.btnText && sec.btnLink && (
                        <div className="pt-4">
                          <Link 
                            to={sec.btnLink}
                            className="h-10 px-8 bg-brand-gold hover:bg-brand-red text-brand-black hover:text-white transition-all text-[10px] font-black uppercase tracking-widest inline-flex items-center justify-center rounded"
                          >
                            {sec.btnText}
                          </Link>
                        </div>
                      )}
                    </div>
                  </section>
                );

              case "text":
                return (
                  <section 
                    key={sec.id} 
                    className="max-w-4xl mx-auto px-6 py-8 space-y-6 font-sans"
                    id={`custom_text_${sec.id}`}
                  >
                    {sec.title && (
                      <h3 className="text-xl sm:text-2xl font-serif text-brand-gold tracking-tight border-b border-white/5 pb-2">
                        {sec.title}
                      </h3>
                    )}
                    {sec.bodyText && (
                      <div 
                        className="text-white/70 leading-[1.8] text-sm sm:text-base space-y-4 font-sans prose prose-invert"
                        dangerouslySetInnerHTML={{ __html: sec.bodyText.replace(/\n/g, "<br/>") }}
                      />
                    )}
                  </section>
                );

              case "grid":
                const cards = parseItems(sec.items);
                return (
                  <section 
                    key={sec.id} 
                    className="max-w-7xl mx-auto px-6 py-8 space-y-8"
                    id={`custom_grid_${sec.id}`}
                  >
                    {sec.title && (
                      <div className="text-center space-y-2">
                        <h3 className="text-xl sm:text-3xl font-serif text-white">{sec.title}</h3>
                        {sec.subtitle && <p className="text-xs text-white/40 font-mono tracking-wider uppercase">{sec.subtitle}</p>}
                      </div>
                    )}
                    {cards.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {cards.map((card, cIdx) => (
                          <div 
                            key={cIdx} 
                            className="bg-neutral-900/40 border border-white/5 p-6 rounded-xl space-y-3 shadow-md hover:border-brand-gold/30 transition-all group"
                          >
                            <Sparkles className="w-5 h-5 text-brand-gold group-hover:rotate-12 transition-transform" />
                            <h4 className="text-xs font-black uppercase tracking-wider text-white">{card.title || "Feature"}</h4>
                            <p className="text-xs text-white/50 leading-relaxed font-sans">{card.desc || ""}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                );

              case "cta":
                return (
                  <section 
                    key={sec.id} 
                    className="max-w-4xl mx-auto px-6 py-6"
                    id={`custom_cta_${sec.id}`}
                  >
                    <div className="bg-gradient-to-r from-brand-red to-brand-red/60 border border-white/10 rounded-2xl p-8 sm:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
                      <div className="space-y-2 relative z-10 max-w-xl">
                        <h4 className="text-xl sm:text-2xl font-serif text-white tracking-tight leading-tight">{sec.title}</h4>
                        {sec.bodyText && <p className="text-white/70 text-xs sm:text-sm font-sans">{sec.bodyText}</p>}
                      </div>
                      {sec.btnText && sec.btnLink && (
                        <div className="relative z-10 flex-shrink-0">
                          <Link 
                            to={sec.btnLink}
                            className="h-10 px-8 bg-brand-gold text-brand-black hover:bg-white transition-all text-[11px] font-black uppercase tracking-widest inline-flex items-center justify-center rounded"
                          >
                            {sec.btnText}
                          </Link>
                        </div>
                      )}
                    </div>
                  </section>
                );

              default:
                return null;
            }
          })}
        </div>
      </main>
      <Footer />
    </>
  );
}
