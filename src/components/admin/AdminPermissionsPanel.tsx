import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Shield, Sparkles, User, Search, CheckCircle2, XCircle, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function AdminPermissionsPanel() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [updateLoading, setUpdateLoading] = useState<string | null>(null);

  const [confirmDeleteUserId, setConfirmDeleteUserId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const q = collection(db, "users");
      const snap = await getDocs(q);
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setUsers(list);
    } catch (e) {
      console.error("Error fetching users for permissions:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const togglePermission = async (userId: string, field: string, currentValue: any) => {
    setUpdateLoading(`${userId}-${field}`);
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { [field]: !currentValue });
      
      // Update local state
      setUsers(users.map(u => u.id === userId ? { ...u, [field]: !currentValue } : u));
    } catch (e) {
      console.error("Error updating permission:", e);
    } finally {
      setUpdateLoading(null);
    }
  };

  const toggleRole = async (user: any) => {
    setUpdateLoading(`${user.id}-role`);
    const isCurrentlyAdmin = user.role === 'admin' || user.isAdmin === true;
    const newRole = isCurrentlyAdmin ? 'member' : 'admin';
    try {
      const userRef = doc(db, "users", user.id);
      const updates: any = { role: newRole, isAdmin: newRole === 'admin' };
      if (newRole === 'admin') {
        updates.isFreeMemberForLife = true;
        // Optionally set a default admin commission if they didn't have one
        updates.customCommissionPercentage = 25;
      }
      await updateDoc(userRef, updates);
      
      // Update local state
      setUsers(users.map(u => u.id === user.id ? { ...u, ...updates } : u));
    } catch (e) {
      console.error("Error updating role:", e);
    } finally {
      setUpdateLoading(null);
    }
  };

  const deleteUser = async (userId: string) => {
    if (confirmDeleteUserId !== userId) {
      setConfirmDeleteUserId(userId);
      setTimeout(() => setConfirmDeleteUserId(null), 3000);
      return;
    }
    setUpdateLoading(`${userId}-delete`);
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { 
        role: 'member', 
        isAdmin: false,
        adminPermissions: [] 
      });
      // Optionally update local state
      setUsers(users.map(u => u.id === userId ? { ...u, role: 'member', isAdmin: false, adminPermissions: [] } : u));
      setConfirmDeleteUserId(null);
    } catch (e) {
      console.error("Error removing admin rights:", e);
    } finally {
      setUpdateLoading(null);
    }
  };

  const filteredUsers = users.filter(u => 
    (u.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.membershipId || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black uppercase text-white tracking-widest flex items-center gap-2">
            <Shield className="text-brand-gold" size={20} /> Authority Management
          </h2>
          <p className="text-[10px] text-white/40 uppercase font-mono mt-1">Configure Administrative Privileges & Lifetime Endowments</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={14} />
          <input 
            type="text"
            placeholder="Search credentials..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="bg-white/5 border border-white/10 pl-9 pr-4 py-2.5 text-xs text-white focus:border-brand-gold/50 outline-none w-full md:w-64 transition-all"
          />
        </div>
      </div>

      <div className="bg-white/[0.02] border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/[0.03] border-b border-white/5">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40">Identity</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40">Status</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40 text-center">Administrator</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40 text-center">Lifetime Access</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-xs text-white/20 font-mono italic">
                    Decrypting authority matrix...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-xs text-white/20 font-mono italic">
                    No matching identities found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-gold/10 flex items-center justify-center border border-brand-gold/20">
                          <User size={14} className="text-brand-gold" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white leading-none">{user.fullName || 'Anonymous'}</p>
                          <p className="text-[9px] text-white/40 font-mono mt-1">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${user.isMember ? 'bg-emerald-400/10 text-emerald-400' : 'bg-red-400/10 text-red-400'}`}>
                         {user.isMember ? 'Verified' : 'Pending'}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => toggleRole(user)}
                        disabled={updateLoading === `${user.id}-role`}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded text-[9px] font-black uppercase tracking-widest transition-all ${
                          (user.role === 'admin' || user.isAdmin === true)
                            ? 'bg-brand-red/10 text-brand-red border border-brand-red/20' 
                            : 'bg-white/5 text-white/30 border border-white/10 hover:border-white/20'
                        }`}
                      >
                        {updateLoading === `${user.id}-role` ? (
                          <div className="w-2 h-2 border border-current border-t-transparent rounded-full animate-spin" />
                        ) : (user.role === 'admin' || user.isAdmin === true) ? (
                          <CheckCircle2 size={10} />
                        ) : (
                          <XCircle size={10} />
                        )}
                        Admin
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => togglePermission(user.id, 'isFreeMemberForLife', user.isFreeMemberForLife)}
                        disabled={updateLoading === `${user.id}-isFreeMemberForLife`}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded text-[9px] font-black uppercase tracking-widest transition-all ${
                          user.isFreeMemberForLife 
                            ? 'bg-brand-gold/10 text-brand-gold border border-brand-gold/20' 
                            : 'bg-white/5 text-white/30 border border-white/10 hover:border-white/20'
                        }`}
                      >
                        {updateLoading === `${user.id}-isFreeMemberForLife` ? (
                          <div className="w-2 h-2 border border-current border-t-transparent rounded-full animate-spin" />
                        ) : user.isFreeMemberForLife ? (
                          <Sparkles size={10} />
                        ) : (
                          <XCircle size={10} />
                        )}
                        Lifetime
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => deleteUser(user.id)}
                        disabled={updateLoading === `${user.id}-delete`}
                        title={confirmDeleteUserId === user.id ? "Click again to confirm revoke" : "Revoke Admin Rights"}
                        className={`p-1.5 rounded transition-colors ${
                          confirmDeleteUserId === user.id 
                            ? "bg-brand-red text-white animate-pulse" 
                            : "text-white/20 hover:text-brand-red hover:bg-brand-red/10"
                        }`}
                      >
                        {updateLoading === `${user.id}-delete` ? (
                          <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 size={12} />
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-brand-gold/5 border border-brand-gold/10 p-4 rounded text-left">
        <p className="text-[9px] font-black uppercase text-brand-gold flex items-center gap-2 mb-1">
          <Shield size={12} /> Security Protocol
        </p>
        <p className="text-[10px] text-white/60 leading-relaxed font-light">
          Granting Administrative access provides complete override control over site content, order management, and member records. Lifetime access waives all membership subscription renewals and grants permanent Inner Circle access.
        </p>
      </div>
    </div>
  );
}
