import React, { useState, useEffect } from "react";
import { db } from "../../lib/firebase";
import { collection, query, orderBy, getDocs, doc, setDoc, deleteDoc, addDoc } from "firebase/firestore";
import { Plus, Edit, Trash2, Save, X, Eye, FileText, Image, Globe, Check, AlertCircle } from "lucide-react";
import { ImageUploader } from "./ImageUploader";

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  coverImageUrl: string;
  category: string;
  tags: string;
  status: "draft" | "published";
  author: string;
  createdAt: string;
  updatedAt: string;
}

const CATEGORIES = [
  "Holistic Health",
  "Reproductive Education",
  "Feminine Anatomy", 
  "Chiropractic Care",
  "Naturopathy & Herbs",
  "Community News & Bio"
];

export default function BlogManager() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<Partial<BlogPost> | null>(null);
  const [formStatus, setFormStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [errorText, setErrorText] = useState("");

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const postsCol = collection(db, "blogs");
      const q = query(postsCol, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const items: BlogPost[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as BlogPost);
      });
      setBlogs(items);
    } catch (e) {
      console.error("Could not load blogs count", e);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost({ ...post });
  };

  const handleCreateNew = () => {
    setEditingPost({
      title: "",
      slug: "",
      summary: "",
      content: "",
      coverImageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80",
      category: CATEGORIES[0],
      tags: "wellness, education",
      status: "draft",
      author: "Ambassador Dr. FID",
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this bog post reference?")) return;
    try {
      await deleteDoc(doc(db, "blogs", id));
      setBlogs((p) => p.filter((x) => x.id !== id));
    } catch (err: any) {
      console.error("Delete failed", err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost) return;

    if (!editingPost.title || !editingPost.slug) {
      setErrorText("Title and unique Slug parameters are mandatory.");
      setFormStatus("error");
      return;
    }

    setFormStatus("saving");
    setErrorText("");

    try {
      const id = editingPost.id || "blog_" + Date.now();
      const updatedPost = {
        ...editingPost,
        id,
        slug: editingPost.slug.toLowerCase().trim().replace(/[^a-z0-9-_]/g, "-"),
        createdAt: editingPost.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await setDoc(doc(db, "blogs", id), updatedPost);
      setEditingPost(null);
      setFormStatus("idle");
      fetchPosts();
    } catch (err: any) {
      console.error("Blog save failed", err);
      setErrorText(err.message || "Failed to update blog.");
      setFormStatus("error");
    }
  };

  const handleGenerateSlug = (title: string) => {
    const slugified = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
    setEditingPost((prev) => prev ? { ...prev, title, slug: slugified } : null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-brand-black/40 border border-white/5 p-6 rounded-xl">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-sm font-black text-brand-gold uppercase tracking-wider">CMS Blog Publication Manager</h3>
            <p className="text-white/40 text-xs mt-1">Manage, draft, publish, and delete blog articles shown dynamically to site visitors.</p>
          </div>
          {!editingPost && (
            <button
              onClick={handleCreateNew}
              className="h-10 px-5 bg-brand-gold hover:bg-brand-red text-brand-black hover:text-white transition-all rounded text-[11px] font-black uppercase tracking-widest flex items-center gap-2"
              id="add_new_blog_btn"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Article</span>
            </button>
          )}
        </div>

        {editingPost ? (
          /* Create or Edit dynamic blog form */
          <form onSubmit={handleSave} className="space-y-5" id="blog_editor_form">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <span className="text-[12px] uppercase tracking-wider font-bold text-brand-gold">
                {editingPost.id ? `Editing Article: ${editingPost.title}` : "Create New Blog Entry"}
              </span>
              <button
                type="button"
                onClick={() => setEditingPost(null)}
                className="text-white/40 hover:text-white transition-colors"
                title="Cancel"
                id="cancel_blog_edit_btn"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formStatus === "error" && (
              <div className="bg-brand-red/10 border border-brand-red/20 p-4 rounded text-xs text-brand-red flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{errorText}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-[10px] font-black tracking-wider text-white/50 uppercase block mb-1">Article Title</label>
                <input
                  type="text"
                  required
                  value={editingPost.title || ""}
                  onChange={(e) => handleGenerateSlug(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded h-11 px-3 text-xs text-white focus:outline-none focus:border-brand-gold"
                  placeholder="e.g. 5 Myths About Vaginal Steaming Debunked"
                  id="blog_title_input"
                />
              </div>

              <div>
                <label className="text-[10px] font-black tracking-wider text-white/50 uppercase block mb-1">Unique Slug URL</label>
                <input
                  type="text"
                  required
                  value={editingPost.slug || ""}
                  onChange={(e) => setEditingPost((prev) => prev ? { ...prev, slug: e.target.value } : null)}
                  className="w-full bg-white/5 border border-white/10 rounded h-11 px-3 text-xs text-white focus:outline-none focus:border-brand-gold font-mono"
                  placeholder="e.g. 5-myths-about-vaginal-steaming"
                  id="blog_slug_input"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-[10px] font-black tracking-wider text-white/50 uppercase block mb-1">Category</label>
                <select
                  value={editingPost.category || ""}
                  onChange={(e) => setEditingPost((prev) => prev ? { ...prev, category: e.target.value } : null)}
                  className="w-full bg-neutral-900 border border-white/10 rounded h-11 px-3 text-xs text-white focus:outline-none focus:border-brand-gold"
                  id="blog_category_select"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black tracking-wider text-white/50 uppercase block mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={editingPost.tags || ""}
                  onChange={(e) => setEditingPost((prev) => prev ? { ...prev, tags: e.target.value } : null)}
                  className="w-full bg-white/5 border border-white/10 rounded h-11 px-3 text-xs text-white focus:outline-none focus:border-brand-gold"
                  placeholder="e.g. health, reproductive, clinical"
                  id="blog_tags_input"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black tracking-wider text-white/50 uppercase block mb-1">Cover Image</label>
              <ImageUploader
                fieldKey="faviconUrl" // arbitrary, uploader takes custom success override
                label="Primary Article Banner Image"
                currentValue={editingPost.coverImageUrl}
                onUploadSuccess={(url) => setEditingPost((prev) => prev ? { ...prev, coverImageUrl: url } : null)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="text-[10px] font-black tracking-wider text-white/50 uppercase block mb-1">Author Name</label>
                <input
                  type="text"
                  value={editingPost.author || ""}
                  onChange={(e) => setEditingPost((prev) => prev ? { ...prev, author: e.target.value } : null)}
                  className="w-full bg-white/5 border border-white/10 rounded h-11 px-3 text-xs text-white focus:outline-none focus:border-brand-gold"
                  placeholder="e.g. Ambassador Dr. FID"
                  id="blog_author_input"
                />
              </div>

              <div>
                <label className="text-[10px] font-black tracking-wider text-white/50 uppercase block mb-1">Publish Status</label>
                <select
                  value={editingPost.status || "draft"}
                  onChange={(e) => setEditingPost((prev) => prev ? { ...prev, status: e.target.value as any } : null)}
                  className="w-full bg-neutral-900 border border-white/10 rounded h-11 px-3 text-xs text-white focus:outline-none focus:border-brand-gold"
                  id="blog_status_select"
                >
                  <option value="draft">Draft / Unpublished</option>
                  <option value="published">Published Live</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black tracking-wider text-white/50 uppercase block mb-1">Summary (Short Excerpt)</label>
                <input
                  type="text"
                  value={editingPost.summary || ""}
                  onChange={(e) => setEditingPost((prev) => prev ? { ...prev, summary: e.target.value } : null)}
                  className="w-full bg-white/5 border border-white/10 rounded h-11 px-3 text-xs text-white focus:outline-none focus:border-brand-gold"
                  placeholder="Keep it brief, 1-2 sentence preview..."
                  id="blog_summary_input"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black tracking-wider text-white/50 uppercase block mb-1">Article Body Content (Support Raw HTML & Markdown)</label>
              <textarea
                rows={12}
                value={editingPost.content || ""}
                onChange={(e) => setEditingPost((prev) => prev ? { ...prev, content: e.target.value } : null)}
                className="w-full bg-white/5 border border-white/10 rounded p-3 text-xs font-mono text-white focus:outline-none focus:border-brand-gold leading-relaxed"
                placeholder="Full article content goes here..."
                id="blog_content_textarea"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setEditingPost(null)}
                className="h-10 px-6 border border-white/10 text-white hover:bg-white/5 rounded text-[11px] font-black uppercase tracking-widest transition-all"
                id="cancel_blog_form_btn"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={formStatus === "saving"}
                className="h-10 px-8 bg-brand-gold text-brand-black font-black uppercase tracking-widest text-[11px] hover:bg-brand-red hover:text-white transition-all rounded flex items-center gap-2"
                id="submit_blog_form_btn"
              >
                {formStatus === "saving" ? "Publishing..." : "Save Blog Entry"}
              </button>
            </div>
          </form>
        ) : loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
            <p className="text-white/40 text-[10px] font-mono uppercase tracking-[0.2em]">Listing articles...</p>
          </div>
        ) : blogs.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-white/5 rounded-xl">
            <FileText className="w-8 h-8 text-white/10 mx-auto mb-2" />
            <p className="text-white/40 text-xs">No blog posts found. Hit "Create New Article" to write your first entry.</p>
          </div>
        ) : (
          /* Blogs collection grid and lists */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {blogs.map((item) => (
              <div
                key={item.id}
                className="bg-neutral-900 border border-white/5 p-4 rounded-lg flex gap-4 hover:border-brand-gold/40 transition-colors"
                id={`blog_list_card_${item.id}`}
              >
                <div className="w-24 h-24 bg-black rounded overflow-hidden flex-shrink-0 flex items-center justify-center border border-white/5">
                  <img
                    src={item.coverImageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-brand-gold/10 text-brand-gold text-[9px] font-bold uppercase rounded">
                        {item.category}
                      </span>
                      <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded ${
                        item.status === 'published' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-amber-400/10 text-amber-400'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-white truncate mt-1.5" title={item.title}>
                      {item.title}
                    </h4>
                    <p className="text-[10px] text-white/50 truncate mt-0.5">
                      {item.summary || "No description excerpt provided."}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/5 pt-2">
                    <span className="text-[9px] font-mono text-white/30">
                      By {item.author} • {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-1.5 hover:bg-white/5 rounded text-brand-gold hover:text-white transition-colors"
                        title="Edit Post"
                        id={`edit_blog_btn_${item.id}`}
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 hover:bg-white/5 rounded text-brand-red hover:text-white transition-colors"
                        title="Delete Post"
                        id={`delete_blog_btn_${item.id}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
