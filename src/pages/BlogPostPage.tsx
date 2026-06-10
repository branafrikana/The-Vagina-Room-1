import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { db } from "../lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import SEO from "../components/SEO";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { ArrowLeft, User, Calendar, BookOpen, Clock, Tag, Link2, Check } from "lucide-react";
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
  author: string;
  createdAt: string;
}

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  useEffect(() => {
    const fetchArticleDetail = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const q = query(
          collection(db, "blogs"),
          where("slug", "==", slug.trim().toLowerCase()),
          where("status", "==", "published")
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const docSnap = snapshot.docs[0];
          setPost({ id: docSnap.id, ...docSnap.data() } as BlogPost);
        } else {
          setPost(null);
        }
      } catch (e) {
        console.error("Could not obtain article content", e);
      } finally {
        setLoading(false);
      }
    };
    fetchArticleDetail();
  }, [slug]);

  const renderedContent = post?.content ? post.content.replace(/\n/g, '<br/>') : '';

  return (
    <>
      {post ? (
        <SEO 
          title={`${post.title} | The Vagina Room Gazette`}
          description={post.summary}
        />
      ) : (
        <SEO 
          title="Article Not Found | The Vagina Room"
          description="We could not locate this column in our databases."
        />
      )}

      <Navigation />
      <main className="min-h-screen bg-brand-black text-white pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-10">
          
          <div className="pt-4">
            <Link
              to="/blogs"
              className="inline-flex items-center gap-2 text-white/50 hover:text-brand-gold font-mono text-[10px] uppercase font-bold tracking-wider transition-colors select-none"
              id="back_to_journals_link"
            >
              <ArrowLeft className="w-4.5 h-4.5" />
              <span>Back to Journals</span>
            </Link>
          </div>

          {loading ? (
            <div className="py-24 text-center space-y-4">
              <div className="w-12 h-12 border-4 border-brand-gold border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-white/40 text-xs font-mono uppercase tracking-widest">Extracting core transcript...</p>
            </div>
          ) : !post ? (
            <div className="py-24 text-center border border-white/5 bg-neutral-900/60 rounded-2xl max-w-md mx-auto">
              <BookOpen className="w-12 h-12 text-white/10 mx-auto mb-4" />
              <h1 className="text-lg font-bold text-brand-gold">Article Not Found</h1>
              <p className="text-white/40 text-xs mt-1.5 font-sans px-4">
                The specified wellness column matching your link isn't cataloged or has been set back to Draft mode.
              </p>
              <div className="mt-6">
                <Link to="/blogs" className="h-10 px-6 bg-brand-gold hover:bg-brand-red hover:text-white text-brand-black transition-all rounded text-[10px] font-black uppercase tracking-widest inline-flex items-center justify-center">
                  Consult Gazette
                </Link>
              </div>
            </div>
          ) : (
            <motion.article 
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
              id={`blog_article_body_${post.id}`}
            >
              {/* Header metrics */}
              <div className="space-y-4">
                <span className="px-3.5 py-1 bg-brand-gold/10 text-brand-gold border border-brand-gold/20 font-mono text-[9px] uppercase font-bold tracking-widest rounded-full">
                  {post.category}
                </span>
                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif text-white tracking-tight leading-tight">
                  {post.title}
                </h1>
                <p className="text-sm text-white/60 leading-relaxed font-sans border-l-2 border-brand-gold/40 pl-4 py-1 italic">
                  {post.summary}
                </p>

                <div className="flex flex-wrap items-center gap-6 text-[11px] font-mono text-white/40 pt-2 border-y border-white/5 py-3">
                  <span className="flex items-center gap-1.5">
                    <User className="w-4 h-4 text-brand-gold" />
                    <span>By {post.author}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-brand-gold" />
                    <span>
                      {new Date(post.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                      })}
                    </span>
                  </span>
                </div>
              </div>

              {/* Banner */}
              <div className="aspect-video bg-black rounded-2xl overflow-hidden border border-white/5 relative">
                <img
                  src={post.coverImageUrl}
                  alt={post.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Main reading content */}
              <div className="prose prose-invert max-w-none pt-4 font-sans text-sm sm:text-base text-white/80 leading-relaxed space-y-6">
                <div 
                  dangerouslySetInnerHTML={{ __html: renderedContent }} 
                  className="space-y-4 text-white/80 leading-[1.8] font-sans selection:bg-brand-gold selection:text-brand-black"
                />
              </div>

              {/* Tags */}
              {post.tags && (
                <div className="pt-6 border-t border-white/5 flex flex-wrap items-center gap-2">
                  <Tag className="w-4 h-4 text-brand-gold" />
                  {post.tags.split(",").map((tag) => (
                    <span 
                      key={tag}
                      className="px-2.5 py-1 bg-white/5 text-white/60 text-[9px] font-mono uppercase tracking-wider rounded border border-white/5"
                    >
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              )}

              {/* Share Insight across Social Media */}
              <div className="pt-8 border-t border-white/5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-xs font-black uppercase tracking-[0.20em] text-brand-gold font-sans">
                      Circulate Restorative Wisdom
                    </h3>
                    <p className="text-[9px] uppercase font-mono text-white/40">
                      Share this wellness gazette article across your platforms
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                        `Check out this transformative wellness insight from The Vagina Room: "${post.title}" at ${window.location.href}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 border border-white/10 bg-white/5 hover:bg-brand-gold hover:text-brand-black hover:border-brand-gold text-[9px] font-mono uppercase font-black tracking-wider transition-all flex items-center gap-1"
                      id="share_whatsapp_btn"
                    >
                      WhatsApp
                    </a>

                    <a
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                        `Transformative insights from The Vagina Room: "${post.title}"`
                      )}&url=${encodeURIComponent(window.location.href)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 border border-white/10 bg-white/5 hover:bg-brand-gold hover:text-brand-black hover:border-brand-gold text-[9px] font-mono uppercase font-black tracking-wider transition-all flex items-center gap-1"
                      id="share_twitter_btn"
                    >
                      Twitter
                    </a>

                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 border border-white/10 bg-white/5 hover:bg-brand-gold hover:text-brand-black hover:border-brand-gold text-[9px] font-mono uppercase font-black tracking-wider transition-all flex items-center gap-1"
                      id="share_facebook_btn"
                    >
                      Facebook
                    </a>

                    <a
                      href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 border border-white/10 bg-white/5 hover:bg-brand-gold hover:text-brand-black hover:border-brand-gold text-[9px] font-mono uppercase font-black tracking-wider transition-all flex items-center gap-1"
                      id="share_linkedin_btn"
                    >
                      LinkedIn
                    </a>

                    <button
                      onClick={handleCopyLink}
                      className={`px-3.5 py-2 border text-[9px] font-mono uppercase font-black tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
                        copied 
                          ? "border-green-500/30 bg-green-500/15 text-green-400" 
                          : "border-white/10 bg-white/5 hover:bg-brand-gold hover:text-brand-black hover:border-brand-gold text-white"
                      }`}
                      id="share_copy_link_btn"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Link2 className="w-3 h-3" />
                          <span>Copy Link</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

            </motion.article>
          )}

        </div>
      </main>
      <Footer />
    </>
  );
}
