import React, { useState, useEffect } from 'react';
import { useContent } from '../../context/ContentContext';
import { Plus, Edit2, Trash2, Calendar as CalendarIcon, Save, X, Image as ImageIcon } from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';

interface EventItem {
  id?: string;
  title: string;
  description: string;
  date: string;
  isoDate: string;
  time: string;
  type: 'virtual' | 'physical' | 'hybrid';
  category: 'wellness' | 'fertility' | 'workshop' | 'gathering' | 'expert';
  location: string;
  hosts: string[];
  image: string;
  capacity: number;
  rsvpsCount: number;
  zoomLink?: string;
  isFeatured?: boolean;
}

export default function AdminEventsTab() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [formData, setFormData] = useState<EventItem>({
    title: '',
    description: '',
    date: '',
    isoDate: '',
    time: '',
    type: 'virtual',
    category: 'wellness',
    location: '',
    hosts: [],
    image: '',
    capacity: 0,
    rsvpsCount: 0,
    zoomLink: '',
    isFeatured: false
  });

  const [hostInput, setHostInput] = useState('');

  const fetchEvents = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'events'));
      const evts = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() } as EventItem));
      setEvents(evts);
    } catch (err: any) {
      setError(err.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleOpenForm = (evt?: EventItem) => {
    if (evt) {
      setEditingId(evt.id!);
      setFormData(evt);
    } else {
      setEditingId(null);
      setFormData({
        title: '',
        description: '',
        date: '',
        isoDate: '',
        time: '',
        type: 'virtual',
        category: 'wellness',
        location: '',
        hosts: [],
        image: '',
        capacity: 0,
        rsvpsCount: 0,
        zoomLink: '',
        isFeatured: false
      });
    }
    setIsFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await updateDoc(doc(db, 'events', editingId), { ...formData, updatedAt: serverTimestamp() });
      } else {
        await addDoc(collection(db, 'events'), { ...formData, createdAt: serverTimestamp() });
      }
      setIsFormOpen(false);
      fetchEvents();
    } catch (err: any) {
      setError('Failed to save event.');
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
      await deleteDoc(doc(db, 'events', id));
      setConfirmDeleteId(null);
      setEvents(events.filter(e => e.id !== id));
    } catch (err: any) {
      setError('Failed to delete event.');
    }
  };

  const addHost = () => {
    if (hostInput.trim() && !formData.hosts.includes(hostInput.trim())) {
      setFormData({ ...formData, hosts: [...formData.hosts, hostInput.trim()] });
      setHostInput('');
    }
  };

  const removeHost = (h: string) => {
    setFormData({ ...formData, hosts: formData.hosts.filter(hx => hx !== h) });
  };

  if (loading) return <div className="p-8 text-white/50 text-[10px] font-mono uppercase tracking-widest text-center">Loading Events Database...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-black/40 border border-white/5 p-6 shadow-2xl">
         <div>
            <h2 className="text-[10px] font-black uppercase text-brand-gold tracking-[0.2em]">Community Events Management</h2>
            <p className="text-white/40 text-[10px] mt-1 font-mono uppercase">Publish & manage live workshops and gatherings (Firestore /events)</p>
         </div>
         <button 
           onClick={() => handleOpenForm()}
           className="bg-brand-gold text-brand-black px-4 py-2 text-[10px] uppercase font-black tracking-widest hover:bg-white transition-colors flex items-center gap-2"
         >
           <Plus size={14} /> Create Event
         </button>
      </div>

      {error && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-mono">{error}</div>}

      {isFormOpen && (
        <div className="bg-black/60 border border-brand-gold/30 p-6 rounded" id="event-form">
           <form onSubmit={handleSave} className="space-y-6">
              <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-4">
                 <h3 className="text-xs font-black uppercase tracking-widest text-white">{editingId ? 'Edit Event' : 'New Event'}</h3>
                 <button type="button" onClick={() => setIsFormOpen(false)} className="text-white/40 hover:text-white p-2">
                    <X size={16} />
                 </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label className="block text-[10px] font-black uppercase text-white/60 mb-2">Event Title</label>
                    <input required type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full bg-black/40 border border-white/10 p-3 text-white text-xs" />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black uppercase text-white/60 mb-2">Display Date (ex: June 18, 2026)</label>
                    <input required type="text" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="w-full bg-black/40 border border-white/10 p-3 text-white text-xs" />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black uppercase text-white/60 mb-2">ISO Format Date (YYYY-MM-DD)</label>
                    <input required type="text" value={formData.isoDate} onChange={e => setFormData({ ...formData, isoDate: e.target.value })} className="w-full bg-black/40 border border-white/10 p-3 text-white text-xs" />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black uppercase text-white/60 mb-2">Time (ex: 6:00 PM EST)</label>
                    <input required type="text" value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} className="w-full bg-black/40 border border-white/10 p-3 text-white text-xs" />
                 </div>
                 <div className="md:col-span-2">
                    <label className="block text-[10px] font-black uppercase text-white/60 mb-2">Description</label>
                    <textarea required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full bg-black/40 border border-white/10 p-3 text-white text-xs h-24" />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black uppercase text-white/60 mb-2">Event Type</label>
                    <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as any })} className="w-full bg-black/40 border border-white/10 p-3 text-white text-xs">
                       <option value="virtual">Virtual</option>
                       <option value="physical">Physical</option>
                       <option value="hybrid">Hybrid</option>
                    </select>
                 </div>
                 <div>
                    <label className="block text-[10px] font-black uppercase text-white/60 mb-2">Category</label>
                    <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value as any })} className="w-full bg-black/40 border border-white/10 p-3 text-white text-xs">
                       <option value="wellness">Wellness</option>
                       <option value="fertility">Fertility</option>
                       <option value="workshop">Workshop</option>
                       <option value="gathering">Gathering</option>
                       <option value="expert">Expert</option>
                    </select>
                 </div>
                 <div>
                    <label className="block text-[10px] font-black uppercase text-white/60 mb-2">Location/Platform</label>
                    <input required type="text" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} className="w-full bg-black/40 border border-white/10 p-3 text-white text-xs" />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black uppercase text-white/60 mb-2">Zoom/Streaming Link</label>
                    <input type="text" value={formData.zoomLink} onChange={e => setFormData({ ...formData, zoomLink: e.target.value })} className="w-full bg-black/40 border border-white/10 p-3 text-white text-xs placeholder:text-white/20" placeholder="https://zoom.us/..." />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black uppercase text-white/60 mb-2">Capacity</label>
                    <input required type="number" min="0" value={formData.capacity} onChange={e => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })} className="w-full bg-black/40 border border-white/10 p-3 text-white text-xs" />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black uppercase text-white/60 mb-2">Cover Image URL</label>
                    <input required type="text" value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} className="w-full bg-black/40 border border-white/10 p-3 text-white text-xs" />
                 </div>
                 
                 <div className="md:col-span-2">
                    <label className="block text-[10px] font-black uppercase text-white/60 mb-2">Hosts (Speakers/Trainers)</label>
                    <div className="flex gap-2 mb-3">
                       <input type="text" value={hostInput} onChange={e => setHostInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addHost(); } }} className="flex-grow bg-black/40 border border-white/10 p-3 text-white text-xs placeholder:text-white/30" placeholder="Type name and click Add" />
                       <button type="button" onClick={addHost} className="bg-white/10 px-4 text-xs font-black uppercase hover:bg-white/20 transition-colors">Add</button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                       {formData.hosts.map((h, i) => (
                         <div key={i} className="flex items-center gap-2 bg-brand-gold/10 border border-brand-gold/20 text-brand-gold px-3 py-1.5 text-xs">
                            {h}
                            <button type="button" onClick={() => removeHost(h)} className="hover:text-white"><X size={12}/></button>
                         </div>
                       ))}
                       {formData.hosts.length === 0 && <span className="text-white/30 text-xs italic">No hosts added</span>}
                    </div>
                 </div>

                 <div className="md:col-span-2 mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div className="relative inline-block w-10 h-5">
                        <input type="checkbox" checked={formData.isFeatured} onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })} className="peer sr-only" />
                        <div className="w-10 h-5 bg-white/10 rounded-full peer peer-checked:bg-brand-gold transition-colors"></div>
                        <div className="absolute left-1 top-1 bg-white w-3 h-3 rounded-full transition-transform peer-checked:translate-x-5"></div>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/80">Feature Event (Highlight on top)</span>
                    </label>

                    <button disabled={saving} type="submit" className="bg-brand-gold text-brand-black px-8 py-3 text-xs font-black uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50">
                       {saving ? 'Saving...' : 'Save Document'}
                    </button>
                 </div>
              </div>
           </form>
        </div>
      )}

      {/* Events List View */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
         {events.map((evt) => (
           <div key={evt.id} className="bg-black/20 border border-white/5 relative group hover:border-brand-gold/30 transition-colors overflow-hidden">
             {evt.isFeatured && (
               <div className="absolute top-3 left-3 bg-brand-gold text-brand-black text-[9px] font-black px-2 py-1 uppercase z-10">Featured</div>
             )}
             <div className="h-32 bg-white/5 relative overflow-hidden">
               {evt.image ? (
                 <img src={evt.image} alt={evt.title} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-white/10"><ImageIcon size={32}/></div>
               )}
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
               <div className="absolute bottom-3 left-3 right-3 text-[11px] font-mono text-brand-gold truncate">
                 {evt.isoDate} • {evt.type}
               </div>
             </div>
             
             <div className="p-5">
               <h3 className="text-sm font-bold text-white uppercase mb-2 truncate" title={evt.title}>{evt.title}</h3>
               <p className="text-white/40 text-[10px] uppercase font-mono mb-4">{evt.category} • Capacity: {evt.capacity}</p>
               
               <div className="flex justify-between items-center pt-4 border-t border-white/5 mt-4">
                  <div className="text-[9px] font-black text-white/50">{evt.rsvpsCount} RSVPs recorded</div>
                  <div className="flex gap-2">
                     <button onClick={() => { handleOpenForm(evt); window.scrollTo({top: 0, behavior: 'smooth'}); }} className="p-2 bg-white/5 hover:bg-brand-gold hover:text-black text-white transition-colors">
                        <Edit2 size={12} />
                     </button>
                     <button 
                        onClick={() => handleDelete(evt.id!)} 
                        className={`p-2 transition-colors ${confirmDeleteId === evt.id ? "bg-brand-red text-white border border-brand-red animate-pulse" : "bg-white/5 hover:bg-red-500 hover:text-white text-white"}`}
                        title={confirmDeleteId === evt.id ? "Confirm?" : "Delete"}
                     >
                        <Trash2 size={12} />
                     </button>
                  </div>
               </div>
             </div>
           </div>
         ))}
         {events.length === 0 && !loading && (
           <div className="col-span-full py-16 text-center text-white/40 text-xs font-mono border border-dashed border-white/10 bg-black/20">
              No events found in the database. Create the first event to populate the member dashboard.
           </div>
         )}
      </div>
    </div>
  );
}
