import React, { useState, useEffect } from "react";
import { db } from "../../lib/firebase";
import { collection, query, orderBy, getDocs, doc, setDoc, deleteDoc, addDoc } from "firebase/firestore";
import { Plus, Edit, Trash2, Save, X, Layout, Layers, Check, AlertCircle, ArrowUp, ArrowDown, HelpCircle, Eye } from "lucide-react";
import { ImageUploader } from "./ImageUploader";

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
  slug: string; // e.g. /holistic-care
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
  createdAt: string;
  updatedAt: string;
}

const SECTION_TYPES = [
  { value: "hero", label: "Full Header Banner" },
  { value: "text", label: "Structured Paragraph Section" },
  { value: "grid", label: "Adaptive Feature Bento Grid" },
  { value: "cta", label: "Call-to-Action Closing Strip" }
];

export default function PageManager() {
  const [pages, setPages] = useState<CustomPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPage, setEditingPage] = useState<Partial<CustomPage> | null>(null);
  const [formStatus, setFormStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [errorText, setErrorText] = useState("");

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "pages"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const items: CustomPage[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as CustomPage);
      });
      setPages(items);
    } catch (e) {
      console.error("Could not query dynamic pages collection", e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setEditingPage({
      title: "",
      slug: "",
      metaTitle: "",
      metaDescription: "",
      seoKeywords: "",
      ogTitle: "",
      ogDescription: "",
      ogImage: "",
      ogType: "website",
      status: "draft",
      sections: [
        {
          id: "sec_hero",
          type: "hero",
          title: "Our Holistic Healing Center",
          subtitle: "Clinical Gynaecology paired with ancestral therapeutic restore",
          bodyText: "Explore our state-sanctioned advocacy",
          imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80",
          btnText: "Learn More",
          btnLink: "#details"
        }
      ]
    });
  };

  const handleEdit = (page: CustomPage) => {
    setEditingPage({ ...page });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently erase this dynamic page layout?")) return;
    try {
      await deleteDoc(doc(db, "pages", id));
      setPages((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Erase page failed", err);
    }
  };

  const handleAddSection = () => {
    if (!editingPage || !editingPage.sections) return;
    const newSection: PageSection = {
      id: "sec_" + Date.now(),
      type: "text",
      title: "New Block Title",
      subtitle: "Optional Subtitle text tag",
      bodyText: "Enter default block body content paragraphs here. HTML and typography are fully responsive.",
    };
    setEditingPage({
      ...editingPage,
      sections: [...editingPage.sections, newSection]
    });
  };

  const handleRemoveSection = (secId: string) => {
    if (!editingPage || !editingPage.sections) return;
    setEditingPage({
      ...editingPage,
      sections: editingPage.sections.filter((s) => s.id !== secId)
    });
  };

  const handleMoveSection = (index: number, direction: "up" | "down") => {
    if (!editingPage || !editingPage.sections) return;
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= editingPage.sections.length) return;

    const sections = [...editingPage.sections];
    const temp = sections[index];
    sections[index] = sections[targetIdx];
    sections[targetIdx] = temp;

    setEditingPage({ ...editingPage, sections });
  };

  const handleSectionFieldChange = (secId: string, field: keyof PageSection, value: any) => {
    if (!editingPage || !editingPage.sections) return;
    const sections = editingPage.sections.map((sec) => {
      if (sec.id === secId) {
        return { ...sec, [field]: value };
      }
      return sec;
    });
    setEditingPage({ ...editingPage, sections });
  };

  const handleSavePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPage) return;

    if (!editingPage.title || !editingPage.slug) {
      setErrorText("Page Title and Unique Route Slug are required.");
      setFormStatus("error");
      return;
    }

    setFormStatus("saving");
    setErrorText("");

    try {
      const id = editingPage.id || "page_" + Date.now();
      
      // Enforce clean path slugs starting with leading slash
      let cleanSlug = editingPage.slug.trim().toLowerCase();
      if (!cleanSlug.startsWith("/")) {
        cleanSlug = "/" + cleanSlug;
      }

      const updatedPage: CustomPage = {
        ...editingPage,
        id,
        slug: cleanSlug,
        createdAt: editingPage.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as CustomPage;

      await setDoc(doc(db, "pages", id), updatedPage);
      setEditingPage(null);
      setFormStatus("idle");
      fetchPages();
    } catch (e: any) {
      console.error("Save Page Err", e);
      setErrorText(e.message || "Failed to catalog CMS Page data to Firestore.");
      setFormStatus("error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-brand-black/40 border border-white/5 p-6 rounded-xl">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-sm font-black text-brand-gold uppercase tracking-wider font-sans">CMS Custom Page Layout Manager</h3>
            <p className="text-white/40 text-xs mt-1">Design raw custom modules, configure dynamic navigation destinations, and control global publishing.</p>
          </div>
          {!editingPage && (
            <button
              onClick={handleCreateNew}
              className="h-10 px-5 bg-brand-gold hover:bg-brand-red text-brand-black hover:text-white transition-all rounded text-[11px] font-black uppercase tracking-widest flex items-center gap-2"
              id="create_dynamic_page_btn"
            >
              <Plus className="w-4.5 h-4.5" />
              <span>Create Custom Page</span>
            </button>
          )}
        </div>

        {editingPage ? (
          /* Page Builder Form Interface */
          <form onSubmit={handleSavePage} className="space-y-6" id="page_builder_custom_form">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <span className="text-[12px] uppercase tracking-wider font-bold text-brand-gold">
                {editingPage.id ? `Layout Architect: ${editingPage.title}` : "Create Dynamic Page"}
              </span>
              <button
                type="button"
                onClick={() => setEditingPage(null)}
                className="text-white/40 hover:text-white transition-colors"
                id="cancel_editing_page_close_btn"
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

            {/* Core page coordinates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-[10px] font-black tracking-wider text-white/50 uppercase block mb-1">Navbar Menu/Page Title</label>
                <input
                  type="text"
                  required
                  value={editingPage.title || ""}
                  onChange={(e) => setEditingPage((prev) => prev ? { ...prev, title: e.target.value } : null)}
                  className="w-full bg-white/5 border border-white/10 rounded h-11 px-3 text-xs text-white focus:outline-none focus:border-brand-gold"
                  placeholder="e.g. Clinical Steaming Center"
                  id="page_title_input_field"
                />
              </div>

              <div>
                <label className="text-[10px] font-black tracking-wider text-white/50 uppercase block mb-1">Route Path Slug (leading /)</label>
                <input
                  type="text"
                  required
                  value={editingPage.slug || ""}
                  onChange={(e) => setEditingPage((prev) => prev ? { ...prev, slug: e.target.value } : null)}
                  className="w-full bg-white/5 border border-white/10 rounded h-11 px-3 text-xs text-white focus:outline-none focus:border-brand-gold font-mono"
                  placeholder="e.g. /steaming-wellness"
                  id="page_slug_input_field"
                />
              </div>
            </div>

            {/* SEO & Open Graph Meta Tags Manager */}
            <div className="border border-white/5 p-5 rounded-lg bg-neutral-900/60 space-y-5">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-brand-gold block font-sans">Page SEO & Open Graph Configurator</span>
                <span className="text-[9px] text-white/40 font-mono">(XML Head Injection Meta Controls)</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-bold text-white/40 uppercase block mb-1">SEO Title Override</label>
                  <input
                    type="text"
                    value={editingPage.metaTitle || ""}
                    onChange={(e) => setEditingPage((prev) => prev ? { ...prev, metaTitle: e.target.value } : null)}
                    className="w-full bg-white/5 border border-white/10 rounded h-10 px-3 text-xs text-white focus:outline-none focus:border-brand-gold font-sans"
                    placeholder="e.g. Clinical Steaming Care Asaba | Dr. FID"
                    id="page_meta_title_input"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-white/40 uppercase block mb-1">SEO Meta Description</label>
                  <input
                    type="text"
                    value={editingPage.metaDescription || ""}
                    onChange={(e) => setEditingPage((prev) => prev ? { ...prev, metaDescription: e.target.value } : null)}
                    className="w-full bg-white/5 border border-white/10 rounded h-10 px-3 text-xs text-white focus:outline-none focus:border-brand-gold font-sans"
                    placeholder="e.g. Read trusted gynecological tips and coordinate your private booking consultations..."
                    id="page_meta_desc_input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-bold text-white/40 uppercase block mb-1">SEO Keywords (comma separated)</label>
                  <input
                    type="text"
                    value={editingPage.seoKeywords || ""}
                    onChange={(e) => setEditingPage((prev) => prev ? { ...prev, seoKeywords: e.target.value } : null)}
                    className="w-full bg-white/5 border border-white/10 rounded h-10 px-3 text-xs text-white focus:outline-none focus:border-brand-gold font-sans"
                    placeholder="e.g. gynaecology, wellness, vaginal steam, herbal care"
                    id="page_seo_keywords_input"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-white/40 uppercase block mb-1">Open Graph Content Type</label>
                  <select
                    value={editingPage.ogType || "website"}
                    onChange={(e) => setEditingPage((prev) => prev ? { ...prev, ogType: e.target.value as any } : null)}
                    className="w-full bg-neutral-950 border border-white/10 rounded h-10 px-3 text-xs text-white focus:outline-none focus:border-brand-gold font-sans"
                    id="page_og_type_select"
                  >
                    <option value="website">Website (General Directory Pages)</option>
                    <option value="article">Article (Educational Reports & Insights)</option>
                    <option value="product">Product (Therapeutic Oils & Washes)</option>
                  </select>
                </div>
              </div>

              {/* Advanced Open Graph Social Media Card Overrides */}
              <div className="pt-3 border-t border-white/5 space-y-4">
                <span className="text-[9px] font-bold uppercase text-white/50 tracking-wider block font-sans">Advanced Social Media Cards (Open Graph Overrides)</span>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] font-bold text-white/40 uppercase block mb-1">OG Title Override (Optional)</label>
                    <input
                      type="text"
                      value={editingPage.ogTitle || ""}
                      onChange={(e) => setEditingPage((prev) => prev ? { ...prev, ogTitle: e.target.value } : null)}
                      className="w-full bg-white/5 border border-white/10 rounded h-10 px-3 text-xs text-white focus:outline-none focus:border-brand-gold font-sans"
                      placeholder="e.g. Custom shareable headline"
                      id="page_og_title_input"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-white/40 uppercase block mb-1">OG Description Override (Optional)</label>
                    <input
                      type="text"
                      value={editingPage.ogDescription || ""}
                      onChange={(e) => setEditingPage((prev) => prev ? { ...prev, ogDescription: e.target.value } : null)}
                      className="w-full bg-white/5 border border-white/10 rounded h-10 px-3 text-xs text-white focus:outline-none focus:border-brand-gold font-sans"
                      placeholder="e.g. Custom text for shares on WhatsApp, iMessage, etc."
                      id="page_og_description_input"
                    />
                  </div>
                </div>

                {/* Secure Cloudinary Image Upload for OG image */}
                <div>
                  <label className="text-[9px] font-bold text-white/40 uppercase block mb-1 font-sans">OG Image Reference (Will appear in shared links)</label>
                  <ImageUploader
                    fieldKey="faviconUrl"
                    label="Open Graph Image Asset"
                    currentValue={editingPage.ogImage || ""}
                    onUploadSuccess={(url) => setEditingPage((prev) => prev ? { ...prev, ogImage: url } : null)}
                  />
                  {editingPage.ogImage && (
                    <div className="mt-2 flex items-center justify-between bg-neutral-950 p-2 rounded border border-white/5">
                      <span className="text-[9px] text-white/40 font-mono select-all truncate max-w-xl">{editingPage.ogImage}</span>
                      <button
                        type="button"
                        onClick={() => setEditingPage((prev) => prev ? { ...prev, ogImage: "" } : null)}
                        className="text-[9px] uppercase font-bold text-brand-red/70 hover:text-brand-red font-sans transition-colors"
                        id="clear_og_image_btn"
                      >
                        Clear Image
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Layout Section blocks editor */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <span className="text-[11px] font-black uppercase tracking-widest text-white/60">Canvas Section Elements</span>
                <span className="text-[10px] text-white/30">(Organize, edit, or stack rows dynamically)</span>
              </div>

              {editingPage.sections?.length === 0 ? (
                <div className="py-10 text-center border border-dashed border-white/10 rounded-lg">
                  <p className="text-white/40 text-xs text-center mb-2">No layouts in this canvas yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {editingPage.sections?.map((sec, idx) => (
                    <div
                      key={sec.id}
                      className="border border-white/10 rounded-lg bg-neutral-900/60 p-5 space-y-4 flex flex-col relative"
                      id={`builder_sec_card_${sec.id}`}
                    >
                      {/* Controls header */}
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4 text-brand-gold" />
                          <span className="text-xs font-bold text-white uppercase">{SECTION_TYPES.find(t=>t.value===sec.type)?.label || "Block"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleMoveSection(idx, "up")}
                            className="p-1 hover:bg-white/5 rounded text-white/40 hover:text-white transition-colors"
                            title="Move Row Up"
                            id={`move_up_sec_btn_${sec.id}`}
                          >
                            <ArrowUp className="w-4.5 h-4.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveSection(idx, "down")}
                            className="p-1 hover:bg-white/5 rounded text-white/40 hover:text-white transition-colors"
                            title="Move Row Down"
                            id={`move_down_sec_btn_${sec.id}`}
                          >
                            <ArrowDown className="w-4.5 h-4.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveSection(sec.id)}
                            className="p-1 hover:bg-white/5 rounded text-brand-red/60 hover:text-white hover:bg-brand-red transition-colors"
                            title="Delete Section Row"
                            id={`remove_sec_btn_${sec.id}`}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Coordinates fields based on type */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[9px] font-bold text-white/40 uppercase block mb-1">Section Component Type</label>
                          <select
                            value={sec.type}
                            onChange={(e) => handleSectionFieldChange(sec.id, "type", e.target.value as any)}
                            className="w-full bg-neutral-950 border border-white/10 rounded h-10 px-3 text-xs text-white focus:outline-none focus:border-brand-gold"
                            id={`sec_type_select_${sec.id}`}
                          >
                            {SECTION_TYPES.map((t) => (
                              <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-[9px] font-bold text-white/40 uppercase block mb-1">Headline</label>
                          <input
                            type="text"
                            value={sec.title}
                            onChange={(e) => handleSectionFieldChange(sec.id, "title", e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded h-10 px-3 text-xs text-white focus:outline-none focus:border-brand-gold"
                            placeholder="Headline Text"
                            id={`sec_title_input_${sec.id}`}
                          />
                        </div>
                      </div>

                      {sec.type === "hero" && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="text-[9px] font-bold text-white/40 uppercase block mb-1">Sub-headline / Tagline</label>
                              <input
                                type="text"
                                value={sec.subtitle || ""}
                                onChange={(e) => handleSectionFieldChange(sec.id, "subtitle", e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded h-10 px-3 text-xs text-white focus:outline-none focus:border-brand-gold"
                                placeholder="Sub-heading description text"
                                id={`hero_sub_input_${sec.id}`}
                              />
                            </div>
                            <div>
                              <label className="text-[9px] font-bold text-white/40 uppercase block mb-1">Row Banner Cover</label>
                              <ImageUploader
                                fieldKey="faviconUrl"
                                label="Background Banner"
                                currentValue={sec.imageUrl}
                                onUploadSuccess={(url) => handleSectionFieldChange(sec.id, "imageUrl", url)}
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="text-[9px] font-bold text-white/40 uppercase block mb-1">Button Overlay Label</label>
                              <input
                                type="text"
                                value={sec.btnText || ""}
                                onChange={(e) => handleSectionFieldChange(sec.id, "btnText", e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded h-10 px-3 text-xs text-white focus:outline-none focus:border-brand-gold"
                                placeholder="e.g. Schedule Call"
                                id={`hero_btn_text_${sec.id}`}
                              />
                            </div>
                            <div>
                              <label className="text-[9px] font-bold text-white/40 uppercase block mb-1">Button Redirection Destination</label>
                              <input
                                type="text"
                                value={sec.btnLink || ""}
                                onChange={(e) => handleSectionFieldChange(sec.id, "btnLink", e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded h-10 px-3 text-xs text-white focus:outline-none focus:border-brand-gold"
                                placeholder="e.g. /contact or #booking"
                                id={`hero_btn_link_${sec.id}`}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {sec.type === "text" && (
                        <div>
                          <label className="text-[9px] font-bold text-white/40 uppercase block mb-1">Paragraph text blocks (Supports HTML/Markdown)</label>
                          <textarea
                            rows={5}
                            value={sec.bodyText || ""}
                            onChange={(e) => handleSectionFieldChange(sec.id, "bodyText", e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded p-3 text-xs font-mono text-white focus:outline-none focus:border-brand-gold"
                            placeholder="Full detailed section paragraph text..."
                            id={`text_body_input_${sec.id}`}
                          />
                        </div>
                      )}

                      {sec.type === "grid" && (
                        <div>
                          <label className="text-[9px] font-bold text-white/40 uppercase block mb-1">Bento Grid Boxes (Title & Desc JSON array)</label>
                          <textarea
                            rows={4}
                            value={sec.items || ""}
                            onChange={(e) => handleSectionFieldChange(sec.id, "items", e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded p-3 text-xs font-mono text-white focus:outline-none focus:border-brand-gold"
                            placeholder='[\n  {"title": "Purity Focus", "desc": "Low acidic wash formulations"},\n  {"title": "Accredited Counseling", "desc": "Private gynaecologists"}\n]'
                            id={`grid_items_input_${sec.id}`}
                          />
                        </div>
                      )}

                      {sec.type === "cta" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-[9px] font-bold text-white/40 uppercase block mb-1 font-bold">Action Button Text</label>
                            <input
                              type="text"
                              value={sec.btnText || ""}
                              onChange={(e) => handleSectionFieldChange(sec.id, "btnText", e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded h-10 px-3 text-xs text-white focus:outline-none focus:border-brand-gold"
                              placeholder="e.g. Register"
                              id={`cta_btn_text_${sec.id}`}
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-bold text-white/40 uppercase block mb-1 font-bold">Action Redirect Destination</label>
                            <input
                              type="text"
                              value={sec.btnLink || ""}
                              onChange={(e) => handleSectionFieldChange(sec.id, "btnLink", e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded h-10 px-3 text-xs text-white focus:outline-none focus:border-brand-gold"
                              placeholder="e.g. /register"
                              id={`cta_btn_link_${sec.id}`}
                            />
                          </div>
                        </div>
                      )}

                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={handleAddSection}
                className="w-full h-11 border border-dashed border-white/15 hover:border-brand-gold flex items-center justify-center gap-2 text-white/50 hover:text-brand-gold transition-colors text-xs uppercase font-black tracking-widest rounded-lg"
                id="add_new_section_block_row_btn"
              >
                <Plus className="w-4 h-4" />
                <span>Append Section Component</span>
              </button>
            </div>

            {/* Publishing details coordinates */}
            <div>
              <label className="text-[10px] font-black tracking-wider text-white/50 uppercase block mb-1">Global Visibility</label>
              <select
                value={editingPage.status || "draft"}
                onChange={(e) => setEditingPage((prev) => prev ? { ...prev, status: e.target.value as any } : null)}
                className="w-full bg-neutral-900 border border-white/10 rounded h-11 px-3 text-xs text-white focus:outline-none focus:border-brand-gold"
                id="page_status_v_select"
              >
                <option value="draft">Draft (Do not render live)</option>
                <option value="published">Published (Available immediately under URL slug)</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
              <button
                type="button"
                onClick={() => setEditingPage(null)}
                className="h-10 px-6 border border-white/10 text-white hover:bg-white/5 rounded text-[11px] font-black uppercase tracking-widest transition-all"
                id="cancel_re_arch_page_btn"
              >
                Cancel Page Build
              </button>
              <button
                type="submit"
                className="h-10 px-8 bg-brand-gold text-brand-black font-black uppercase tracking-widest text-[11px] hover:bg-brand-red hover:text-white transition-all rounded"
                id="save_dynamic_layout_page_btn"
              >
                Save Page Design
              </button>
            </div>
          </form>
        ) : loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
            <p className="text-white/40 text-[10px] font-mono uppercase tracking-[0.2em]">Listing layout items...</p>
          </div>
        ) : pages.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-white/5 rounded-xl">
            <Layout className="w-8 h-8 text-white/10 mx-auto mb-2" />
            <p className="text-white/40 text-xs">No CMS dynamic pages found. Click "Create Custom Page" to generate one.</p>
          </div>
        ) : (
          /* Render simple list of custom configured pages */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pages.map((item) => (
              <div
                key={item.id}
                className="bg-neutral-900 border border-white/5 p-5 rounded-lg flex items-center justify-between hover:border-brand-gold/35 transition-colors"
                id={`custom_page_node_${item.id}`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-white">{item.title}</h4>
                    <span className={`px-2 py-0.5 text-[8px] font-bold uppercase rounded ${
                      item.status === 'published' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-amber-400/10 text-amber-400'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <p className="text-[10px] font-mono text-white/40 mt-1 select-all">{item.slug}</p>
                  <p className="text-[9px] text-white/30 block mt-1">
                    {item.sections?.length || 0} layouts row stack • Updated {new Date(item.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-2 bg-white/5 hover:bg-white/10 rounded text-brand-gold hover:text-white transition-all"
                    title="Edit Custom Page Design"
                    id={`edit_custom_page_btn_${item.id}`}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 bg-white/5 hover:bg-brand-red/20 rounded text-brand-red hover:text-white transition-all"
                    title="Delete Page Layout"
                    id={`delete_custom_page_btn_${item.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
