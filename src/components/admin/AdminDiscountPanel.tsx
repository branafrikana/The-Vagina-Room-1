import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';
import { collection, getDocs, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';                
import { db } from '../../lib/firebase';                

export default function AdminDiscountPanel() {
  const [codes, setCodes] = useState<any[]>([]);
  const [newCode, setNewCode] = useState({ code: '', type: 'percentage', value: 0, expiryDate: '' });

  useEffect(() => {
    loadCodes();
  }, []);

  const loadCodes = async () => {
    const q = collection(db, "discountCodes");
    const snapshot = await getDocs(q);
    setCodes(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const addCode = async () => {
    await addDoc(collection(db, "discountCodes"), {
      ...newCode,
      isActive: true,
      createdAt: serverTimestamp()
    });
    setNewCode({ code: '', type: 'percentage', value: 0, expiryDate: '' });
    loadCodes();
  };

  const deleteCode = async (id: string) => {
    await deleteDoc(doc(db, "discountCodes", id));
    loadCodes();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-black uppercase tracking-tighter text-brand-gold">Discount Code Management</h2>
      
      <div className="bg-white/[0.02] border border-white/5 p-4 rounded grid grid-cols-4 gap-4">
        <input placeholder="Code" className="bg-black text-white p-2 text-xs" value={newCode.code} onChange={e => setNewCode({...newCode, code: e.target.value})} />
        <select className="bg-black text-white p-2 text-xs" value={newCode.type} onChange={e => setNewCode({...newCode, type: e.target.value})}>
          <option value="percentage">Percentage</option>
          <option value="fixed">Fixed</option>
        </select>
        <input type="number" placeholder="Value" className="bg-black text-white p-2 text-xs" value={newCode.value} onChange={e => setNewCode({...newCode, value: parseFloat(e.target.value)})} />
        <button onClick={addCode} className="bg-brand-gold text-brand-black p-2 font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2">
          <Plus size={14} /> Add
        </button>
      </div>

      <div className="space-y-2">
        {codes.map(c => (
          <div key={c.id} className="flex justify-between items-center p-4 bg-white/[0.02] border border-white/5">
            <span className="text-white font-mono">{c.code} ({c.type}: {c.value})</span>
            <button onClick={() => deleteCode(c.id)} className="text-red-500"><Trash2 size={16} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
