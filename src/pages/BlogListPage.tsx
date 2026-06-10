import React, { useState, useEffect } from "react";
import { db } from "../lib/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { Link } from "react-router-dom";
import SEO from "../components/SEO";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { FileText, Calendar, User, ArrowRight, Tag, BookOpen, Search } from "lucide-react";
import { motion } from "motion/react";

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  coverImageUrl: string;
  category: string;
  tags: string;
  createdAt: string;
  author: string;
}

export default function BlogListPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const q = query(
          collection(db, "blogs"),
          where("status", "==", "published")
        );
        const snapshot = await getDocs(q);
        const fetched: BlogPost[] = [];
        snapshot.forEach((doc) => {
          fetched.push({ id: doc.id, ...doc.data() } as BlogPost);
        });
        
        // Sort client-side by date to circumvent Firestore strict index mandates
        fetched.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setPosts(fetched);
      } catch (e) {
        console.error("Could not fetch published blog posts", e);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  const categories = ["All", ...Array.from(new Set(posts.map((p) => p.category)))];

  const filtered = posts.filter((post) => {
    const matchesSearch = post.title.toLowerCase().includes(search.toLowerCase()) || 
                          post.summary.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "All" || post.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <SEO 
        title="Community Resources & Wellness Insights | The Vagina Room"
        description="Explore articles and clinical education surrounding gynaecological empowerment, Naturopathy, herbal steam, and pelvic releasing."
      />
      <Navigation />
      <main className="min-h-screen bg-brand-black text-white pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Main header block */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-[10px] sm:text-xs font-black tracking-[0.4em] text-brand-gold uppercase block">The Room Gazette</span>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif text-white leading-tight">
              Our <span className="italic text-brand-gold">Blog.</span>
            </h1>
            <p className="text-sm sm:text-base text-white/50 leading-relaxed font-sans">
              Scientifically verified, clinical-grade education, wellness tips, and holistic recipes curated directly by Ambassador Dr. FID and partners.
            </p>
          </div>

          {/* Search bar & tabs */}
          <div className="space-y-6">
            <div className="relative max-w-xl mx-auto">
              <Search className="w-5 h-5 text-white/30 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search resources, articles, guides..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-full h-12 pl-12 pr-6 text-xs text-white focus:outline-none focus:border-brand-gold font-sans"
                id="blog_search_bar_input"
              />
            </div>

            {categories.length > 1 && (
              <div className="flex flex-wrap justify-center gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`h-9 px-5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all select-none ${
                      activeCategory === cat
                        ? "bg-brand-gold text-brand-black"
                        : "bg-white/5 border border-white/5 hover:border-white/10 text-white/70 hover:text-white"
                    }`}
                    id={`blog_cat_tab_btn_${(cat as string).replace(/\s+/g, '_')}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* List blogs catalog */}
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4">
              <div className="w-12 h-12 border-4 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
              <p className="text-brand-gold font-black uppercase tracking-[0.3em] font-mono text-[10px]">Assembling Publications Hub</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center border border-white/5 rounded-2xl bg-white/[0.02] max-w-md mx-auto">
              <BookOpen className="w-12 h-12 text-white/10 mx-auto mb-4 animate-pulse" />
              <h3 className="text-sm font-black uppercase tracking-wider text-brand-gold">No matched articles</h3>
              <p className="text-white/40 text-xs mt-1.5 px-4 font-sans">
                We couldn't locate any published columns matching your filter keys. Try broadening your keywords.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((item, idx) => (
                <motion.article
                  key={item.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  className="bg-neutral-900/40 border border-white/5 rounded-2xl overflow-hidden flex flex-col justify-between group hover:border-brand-gold/30 transition-all shadow-xl"
                  id={`article_card_${item.id}`}
                >
                  <div className="aspect-video bg-black relative overflow-hidden border-b border-white/5">
                    <img
                      src={item.coverImageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute top-4 left-4 px-3.5 py-1 bg-brand-black/80 backdrop-blur border border-white/10 text-brand-gold font-bold text-[9px] uppercase tracking-widest rounded-full font-mono">
                      {item.category}
                    </span>
                  </div>

                  <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 text-[10px] font-mono text-white/30">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(item.createdAt).toLocaleDateString("en-US", {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5" />
                          {item.author}
                        </span>
                      </div>
                      <h4 className="text-lg font-serif text-white group-hover:text-brand-gold transition-colors leading-snug">
                        {item.title}
                      </h4>
                      <p className="text-xs text-white/50 leading-relaxed font-sans line-clamp-3">
                        {item.summary || "No description overview provided for this column."}
                      </p>
                    </div>

                    <div className="border-t border-white/5 pt-4">
                      <Link
                        to={`/blog/${item.slug}`}
                        className="text-brand-gold hover:text-white font-mono text-[10px] uppercase font-black tracking-widest flex items-center gap-2 transition-colors select-none"
                        id={`read_article_link_${item.id}`}
                      >
                        <span>Extract Column</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}

        </div>
      </main>
      <Footer />
    </>
  );
}
