import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, MessageSquare, Lock, Eye } from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';

interface ThreadItem {
  id?: string;
  author: string;
  title: string;
  content: string;
  category: string;
  replies: number;
  lastActive: string;
  isPrivate: boolean;
  avatar: string;
  tags: string[];
}

export default function AdminCommunityTab() {
  const [threads, setThreads] = useState<ThreadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [formData, setFormData] = useState<ThreadItem>({
    author: 'Admin',
    title: '',
    content: '',
    category: 'announcement',
    replies: 0,
    lastActive: 'Just now',
    isPrivate: false,
    avatar: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=60&w=200',
    tags: []
  });

  const [tagInput, setTagInput] = useState('');

  const fetchThreads = async () => {
    try {
      const q = query(collection(db, 'community_threads'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setThreads(snap.docs.map(d => ({ id: d.id, ...d.data() } as ThreadItem)));
    } catch (err: any) {
      console.error(err);
      // Fallback
      const fallbackSnap = await getDocs(collection(db, 'community_threads'));
      setThreads(fallbackSnap.docs.map(d => ({ id: d.id, ...d.data() } as ThreadItem)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThreads();
  }, []);

  const handleOpenForm = (item?: ThreadItem) => {
    if (item) {
      setEditingId(item.id!);
      setFormData(item);
    } else {
      setEditingId(null);
      setFormData({
        author: 'Admin',
        title: '',
        content: '',
        category: 'announcement',
        replies: 0,
        lastActive: 'Just now',
        isPrivate: false,
        avatar: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=60&w=200',
        tags: []
      });
    }
    setIsFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await updateDoc(doc(db, 'community_threads', editingId), { ...formData, updatedAt: serverTimestamp() });
      } else {
        await addDoc(collection(db, 'community_threads'), { ...formData, createdAt: serverTimestamp() });
      }
      setIsFormOpen(false);
      fetchThreads();
    } catch (err: any) {
      setError('Failed to save community thread.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      setTimeout(() => setConfirmDeleteId(null), 3000);
      return;
    }
    try {
      await deleteDoc(doc(db, 'community_threads', id));
      setConfirmDeleteId(null);
      setThreads(threads.filter(t => t.id !== id));
    } catch (err: any) {
      setError('Failed to delete thread.');
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const removeTag = (t: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(x => x !== t) });
  };

  if (loading) return <div className="p-8 text-white/50 text-[10px] font-mono uppercase tracking-widest text-center">Loading Community Threads...</div>;

  return (
    <div className="space-y-8 flex flex-col items-center">
      <div className="w-full flex justify-between items-center bg-black/40 border border-white/5 p-6 shadow-2xl">
         <div>
            <h2 className="text-[10px] font-black uppercase text-brand-gold tracking-[0.2em]">Community Moderation</h2>
            <p className="text-white/40 text-[10px] mt-1 font-mono uppercase">Manage Threads, Announcements & Discussions</p>
         </div>
         <button 
           onClick={() => handleOpenForm()}
           className="bg-brand-gold text-brand-black px-4 py-2 text-[10px] uppercase font-black tracking-widest hover:bg-white transition-colors flex items-center gap-2"
         >
           <Plus size={14} /> Post Announcement
         </button>
      </div>

      {error && <div className="w-full p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-mono">{error}</div>}

      {isFormOpen && (
        <div className="w-full bg-black/60 border border-brand-gold/30 p-6 rounded relative">
           <form onSubmit={handleSave} className="space-y-6">
              <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-4">
                 <h3 className="text-xs font-black uppercase tracking-widest text-white">{editingId ? 'Edit Thread' : 'New Announcement Thread'}</h3>
                 <button type="button" onClick={() => setIsFormOpen(false)} className="text-white/40 hover:text-white p-2">
                    <X size={16} />
                 </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="md:col-span-2">
                    <label className="block text-[10px] font-black uppercase text-white/60 mb-2">Thread Title / Topic</label>
                    <input required type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full bg-black/40 border border-white/10 p-3 text-white text-xs" />
                 </div>
                 
                 <div className="md:col-span-2">
                    <label className="block text-[10px] font-black uppercase text-white/60 mb-2">Content / Initiating Post</label>
                    <textarea required value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} className="w-full bg-black/40 border border-white/10 p-3 text-white text-xs h-32" />
                 </div>

                 <div>
                    <label className="block text-[10px] font-black uppercase text-white/60 mb-2">Author Display Name</label>
                    <input required type="text" value={formData.author} onChange={e => setFormData({ ...formData, author: e.target.value })} className="w-full bg-black/40 border border-white/10 p-3 text-white text-xs" />
                 </div>

                 <div>
                    <label className="block text-[10px] font-black uppercase text-white/60 mb-2">Author Avatar URL</label>
                    <input required type="text" value={formData.avatar} onChange={e => setFormData({ ...formData, avatar: e.target.value })} className="w-full bg-black/40 border border-white/10 p-3 text-white text-xs" />
                 </div>

                 <div>
                    <label className="block text-[10px] font-black uppercase text-white/60 mb-2">Category</label>
                    <input required type="text" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full bg-black/40 border border-white/10 p-3 text-white text-xs placeholder:text-white/30" placeholder="e.g. general, announcement, health" />
                 </div>

                 <div className="flex items-center">
                    <label className="flex items-center gap-3 cursor-pointer mt-4">
                       <input type="checkbox" checked={formData.isPrivate} onChange={e => setFormData({ ...formData, isPrivate: e.target.checked })} className="form-checkbox text-brand-gold bg-black/40 border border-white/10 p-2" />
                       <span className="text-[10px] font-black uppercase text-white/60">Is Private (VVR VIP Only)?</span>
                    </label>
                 </div>

                 <div className="md:col-span-2">
                    <label className="block text-[10px] font-black uppercase text-white/60 mb-2">Tags / Keywords</label>
                    <div className="flex gap-2 mb-3">
                       <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }} className="flex-grow bg-black/40 border border-white/10 p-3 text-white text-xs" placeholder="e.g. herbalism" />
                       <button type="button" onClick={addTag} className="bg-white/10 px-4 text-xs font-black uppercase hover:bg-white/20 transition-colors">Add</button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                       {formData.tags?.map((t, i) => (
                         <div key={i} className="flex items-center gap-2 bg-brand-gold/10 border border-brand-gold/20 text-brand-gold px-3 py-1.5 text-xs">
                            {t}
                            <button type="button" onClick={() => removeTag(t)} className="hover:text-white"><X size={12}/></button>
                         </div>
                       ))}
                    </div>
                 </div>

                 <div className="md:col-span-2 mt-4 pt-4 border-t border-white/10 flex justify-end">
                    <button disabled={saving} type="submit" className="bg-brand-gold text-brand-black px-8 py-3 text-xs font-black uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50">
                       {saving ? 'Saving...' : 'Save Thread'}
                    </button>
                 </div>
              </div>
           </form>
        </div>
      )}

      {/* Grid List */}
      <div className="w-full space-y-4">
        {threads.map((thread) => (
          <div key={thread.id} className="bg-black/20 border border-white/5 p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-brand-gold/30 transition-colors">
            <div className="flex items-start gap-4 flex-1 overflow-hidden">
               <img src={thread.avatar} alt="Author" className="w-10 h-10 object-cover bg-white/5 shrink-0" />
               <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                     {thread.isPrivate && <Lock size={10} className="text-brand-gold" />}
                     <span className="text-[9px] font-mono uppercase bg-white/5 px-2 py-0.5 border border-white/10 text-brand-gold">{thread.category}</span>
                  </div>
                  <h3 className="text-sm font-bold text-white uppercase mb-1 line-clamp-1">{thread.title}</h3>
                  <p className="text-[10px] text-white/50 line-clamp-1 font-sans">{thread.content}</p>
                  <div className="flex items-center gap-3 mt-2 text-[9px] font-mono text-white/40 uppercase">
                     <span>By {thread.author}</span>
                     <span className="text-white/20">•</span>
                     <span className="flex items-center gap-1"><MessageSquare size={10}/> {thread.replies || 0} Replies</span>
                  </div>
               </div>
            </div>
            
            <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 border-white/5 pt-4 md:pt-0 w-full md:w-auto justify-end">
               <button onClick={() => { handleOpenForm(thread); window.scrollTo({top: 0, behavior: 'smooth'}); }} className="p-2.5 bg-white/5 hover:bg-brand-gold hover:text-black text-white transition-colors">
                  <Edit2 size={12} />
               </button>
               <button 
                  onClick={() => handleDelete(thread.id!)} 
                  className={`p-2.5 transition-colors ${confirmDeleteId === thread.id ? "bg-brand-red text-white border border-brand-red animate-pulse" : "bg-white/5 hover:bg-red-500 hover:text-white text-white"}`}
                  title={confirmDeleteId === thread.id ? "Confirm?" : "Delete"}
               >
                  <Trash2 size={12} />
               </button>
            </div>
          </div>
        ))}
        {threads.length === 0 && !loading && (
           <div className="py-16 text-center text-white/40 text-xs font-mono border border-dashed border-white/10">
              No community discussions active.
           </div>
        )}
      </div>
    </div>
  );
}
