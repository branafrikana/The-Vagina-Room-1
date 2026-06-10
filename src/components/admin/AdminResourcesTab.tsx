import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, Link as LinkIcon, FileText, Image as ImageIcon, Video, Headphones, Heart } from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';

interface ResourceItem {
  id?: string;
  title: string;
  description: string;
  type: 'video' | 'audio' | 'pdf' | 'wellness';
  url: string;
  duration?: string;
  fileSize?: string;
  author: string;
  category: string;
  thumbnail: string;
  highlights: string[];
}

export default function AdminResourcesTab() {
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<ResourceItem>({
    title: '',
    description: '',
    type: 'pdf',
    url: '',
    duration: '',
    fileSize: '',
    author: '',
    category: '',
    thumbnail: '',
    highlights: []
  });
  
  const [highlightInput, setHighlightInput] = useState('');

  const fetchResources = async () => {
    try {
      const q = query(collection(db, 'resource_library'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setResources(snap.docs.map(d => ({ id: d.id, ...d.data() } as ResourceItem)));
    } catch (err: any) {
      console.error(err);
      // fallback without ordering if index is missing
      const fallbackSnap = await getDocs(collection(db, 'resource_library'));
      setResources(fallbackSnap.docs.map(d => ({ id: d.id, ...d.data() } as ResourceItem)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleOpenForm = (item?: ResourceItem) => {
    if (item) {
      setEditingId(item.id!);
      setFormData(item);
    } else {
      setEditingId(null);
      setFormData({
        title: '',
        description: '',
        type: 'pdf',
        url: '',
        duration: '',
        fileSize: '',
        author: '',
        category: '',
        thumbnail: '',
        highlights: []
      });
    }
    setIsFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await updateDoc(doc(db, 'resource_library', editingId), { ...formData, updatedAt: serverTimestamp() });
      } else {
        await addDoc(collection(db, 'resource_library'), { ...formData, createdAt: serverTimestamp() });
      }
      setIsFormOpen(false);
      fetchResources();
    } catch (err: any) {
      setError('Failed to save resource.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this resource from the library?")) return;
    try {
      await deleteDoc(doc(db, 'resource_library', id));
      setResources(resources.filter(r => r.id !== id));
    } catch (err: any) {
      setError('Failed to delete resource.');
    }
  };

  const addHighlight = () => {
    if (highlightInput.trim() && !formData.highlights.includes(highlightInput.trim())) {
      setFormData({ ...formData, highlights: [...formData.highlights, highlightInput.trim()] });
      setHighlightInput('');
    }
  };

  const removeHighlight = (h: string) => {
    setFormData({ ...formData, highlights: formData.highlights.filter(x => x !== h) });
  };

  if (loading) return <div className="p-8 text-white/50 text-[10px] font-mono uppercase tracking-widest text-center">Loading Resource Library...</div>;

  return (
    <div className="space-y-8 flex flex-col items-center">
      <div className="w-full flex justify-between items-center bg-black/40 border border-white/5 p-6 shadow-2xl">
         <div>
            <h2 className="text-[10px] font-black uppercase text-brand-gold tracking-[0.2em]">Resource Library Control</h2>
            <p className="text-white/40 text-[10px] mt-1 font-mono uppercase">Manage member PDFs, Videos, and Audio links</p>
         </div>
         <button 
           onClick={() => handleOpenForm()}
           className="bg-brand-gold text-brand-black px-4 py-2 text-[10px] uppercase font-black tracking-widest hover:bg-white transition-colors flex items-center gap-2"
         >
           <Plus size={14} /> Upload Resource
         </button>
      </div>

      {error && <div className="w-full p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-mono">{error}</div>}

      {isFormOpen && (
        <div className="w-full bg-black/60 border border-brand-gold/30 p-6 rounded relative" id="resource-form">
           <form onSubmit={handleSave} className="space-y-6">
              <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-4">
                 <h3 className="text-xs font-black uppercase tracking-widest text-white">{editingId ? 'Edit Resource' : 'New Resource'}</h3>
                 <button type="button" onClick={() => setIsFormOpen(false)} className="text-white/40 hover:text-white p-2">
                    <X size={16} />
                 </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="md:col-span-2">
                    <label className="block text-[10px] font-black uppercase text-white/60 mb-2">Resource Title</label>
                    <input required type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full bg-black/40 border border-white/10 p-3 text-white text-xs" />
                 </div>
                 
                 <div className="md:col-span-2">
                    <label className="block text-[10px] font-black uppercase text-white/60 mb-2">Short Description</label>
                    <textarea required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full bg-black/40 border border-white/10 p-3 text-white text-xs h-20" />
                 </div>

                 <div>
                    <label className="block text-[10px] font-black uppercase text-white/60 mb-2">Resource Type</label>
                    <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as any })} className="w-full bg-black/40 border border-white/10 p-3 text-white text-xs">
                       <option value="pdf">PDF / Document</option>
                       <option value="video">Video</option>
                       <option value="audio">Audio</option>
                       <option value="wellness">Wellness Article</option>
                    </select>
                 </div>
                 
                 <div>
                    <label className="block text-[10px] font-black uppercase text-white/60 mb-2">Category (e.g. Masterclass, Framework)</label>
                    <input required type="text" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full bg-black/40 border border-white/10 p-3 text-white text-xs" />
                 </div>

                 <div>
                    <label className="block text-[10px] font-black uppercase text-white/60 mb-2">Author / Host</label>
                    <input required type="text" value={formData.author} onChange={e => setFormData({ ...formData, author: e.target.value })} className="w-full bg-black/40 border border-white/10 p-3 text-white text-xs" />
                 </div>

                 <div>
                    <label className="block text-[10px] font-black uppercase text-white/60 mb-2">Thumbnail URL</label>
                    <input required type="text" value={formData.thumbnail} onChange={e => setFormData({ ...formData, thumbnail: e.target.value })} className="w-full bg-black/40 border border-white/10 p-3 text-white text-xs" />
                 </div>

                 <div className="md:col-span-2">
                    <label className="block text-[10px] font-black uppercase text-white/60 mb-2">Access URL / Download Link</label>
                    <input required type="text" value={formData.url} onChange={e => setFormData({ ...formData, url: e.target.value })} className="w-full bg-black/40 border border-brand-gold/30 p-3 text-white text-xs placeholder:text-white/20" placeholder="https://..." />
                 </div>

                 <div>
                    <label className="block text-[10px] font-black uppercase text-white/60 mb-2">Duration (for Media) e.g. "45:00"</label>
                    <input type="text" value={formData.duration || ''} onChange={e => setFormData({ ...formData, duration: e.target.value })} className="w-full bg-black/40 border border-white/10 p-3 text-white text-xs" />
                 </div>

                 <div>
                    <label className="block text-[10px] font-black uppercase text-white/60 mb-2">File Size (for PDF) e.g. "12.4 MB"</label>
                    <input type="text" value={formData.fileSize || ''} onChange={e => setFormData({ ...formData, fileSize: e.target.value })} className="w-full bg-black/40 border border-white/10 p-3 text-white text-xs" />
                 </div>

                 <div className="md:col-span-2">
                    <label className="block text-[10px] font-black uppercase text-white/60 mb-2">Key Highlights / Takeaways</label>
                    <div className="flex gap-2 mb-3">
                       <input type="text" value={highlightInput} onChange={e => setHighlightInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addHighlight(); } }} className="flex-grow bg-black/40 border border-white/10 p-3 text-white text-xs placeholder:text-white/30" placeholder="Type a bullet point and press Enter/Add" />
                       <button type="button" onClick={addHighlight} className="bg-white/10 px-4 text-xs font-black uppercase hover:bg-white/20 transition-colors">Add</button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                       {formData.highlights.map((h, i) => (
                         <div key={i} className="flex items-center gap-2 bg-brand-gold/10 border border-brand-gold/20 text-brand-gold px-3 py-1.5 text-xs">
                            {h}
                            <button type="button" onClick={() => removeHighlight(h)} className="hover:text-white"><X size={12}/></button>
                         </div>
                       ))}
                       {formData.highlights.length === 0 && <span className="text-white/30 text-xs italic">No highlights added</span>}
                    </div>
                 </div>

                 <div className="md:col-span-2 mt-4 pt-4 border-t border-white/10 flex justify-end">
                    <button disabled={saving} type="submit" className="bg-brand-gold text-brand-black px-8 py-3 text-xs font-black uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50">
                       {saving ? 'Saving...' : 'Save Resource'}
                    </button>
                 </div>
              </div>
           </form>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full gap-6">
        {resources.map((res) => (
          <div key={res.id} className="bg-black/20 border border-white/5 relative group hover:border-brand-gold/30 transition-colors flex flex-col">
            <div className="h-32 bg-white/5 relative overflow-hidden">
               {res.thumbnail ? (
                 <img src={res.thumbnail} alt={res.title} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-white/10"><ImageIcon size={32}/></div>
               )}
               <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent"></div>
               <div className="absolute bottom-3 left-3 flex gap-2">
                 <span className="bg-black/50 text-brand-gold px-2 py-1 text-[9px] font-black uppercase tracking-widest backdrop-blur-sm border border-white/10 flex flex-row items-center gap-1.5">
                   {res.type === 'video' && <Video size={10} />}
                   {res.type === 'pdf' && <FileText size={10} />}
                   {res.type === 'audio' && <Headphones size={10} />}
                   {res.type === 'wellness' && <Heart size={10} />}
                   {res.type}
                 </span>
               </div>
            </div>
            <div className="p-5 flex-1 flex flex-col">
               <h3 className="text-sm font-bold text-white uppercase mb-1 line-clamp-2">{res.title}</h3>
               <p className="text-[10px] text-white/40 uppercase font-mono mb-4">{res.category} • {res.author}</p>
               
               <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center">
                  <a href={res.url} target="_blank" rel="noreferrer" className="text-[9px] text-[#D4AF37] uppercase font-bold hover:underline flex items-center gap-1">
                     <LinkIcon size={12} /> View Link
                  </a>
                  <div className="flex gap-2">
                     <button onClick={() => { handleOpenForm(res); window.scrollTo({top: 0, behavior: 'smooth'}); }} className="p-2 bg-white/5 hover:bg-brand-gold hover:text-black text-white transition-colors">
                        <Edit2 size={12} />
                     </button>
                     <button onClick={() => handleDelete(res.id!)} className="p-2 bg-white/5 hover:bg-red-500 hover:text-white text-white transition-colors">
                        <Trash2 size={12} />
                     </button>
                  </div>
               </div>
            </div>
          </div>
        ))}
        {resources.length === 0 && !loading && (
           <div className="col-span-full py-16 text-center text-white/40 text-xs font-mono border border-dashed border-white/10 bg-black/20">
              No resources found in the library.
           </div>
        )}
      </div>
    </div>
  );
}
