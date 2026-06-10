import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import { handleFirestoreError, OperationType } from '../../lib/firestore-errors';
import { CheckCircle2, User, Loader2, AlertCircle } from 'lucide-react';
import { useContent } from "../../context/ContentContext";

export default function AdminApprovalsPanel() {
  const { content } = useContent();
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [approvingIds, setApprovingIds] = useState<Set<string>>(new Set());

  const fetchPendingUsers = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'users'), where('paymentStatus', 'in', ['pending', 'awaiting_approval']));
      const snapshot = await getDocs(q);
      setPendingUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, 'users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const approveUser = async (uid: string) => {
    setApprovingIds(prev => new Set(prev).add(uid));
    try {
      await updateDoc(doc(db, 'users', uid), {
        paymentStatus: 'approved',
        isMember: true,
        activatedAt: new Date().toISOString()
      });

      await fetchPendingUsers();
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${uid}`);
    } finally {
      setApprovingIds(prev => {
        const next = new Set(prev);
        next.delete(uid);
        return next;
      });
    }
  };

  return (
    <div className="bg-white/[0.02] p-8 border border-white/10 space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-black uppercase text-brand-gold tracking-widest flex items-center gap-2">
          <AlertCircle size={14} /> Registration Approvals ({pendingUsers.length})
        </h3>
        <button onClick={fetchPendingUsers} className="text-[10px] uppercase font-mono text-white/40 hover:text-white">Refresh List</button>
      </div>
      
      {loading ? (
        <div className="flex justify-center p-8"><Loader2 className="animate-spin text-brand-gold" /></div>
      ) : pendingUsers.length === 0 ? (
        <div className="py-12 border border-dashed border-white/5 text-center">
          <p className="text-white/30 text-[10px] uppercase tracking-widest italic font-mono">No pending registrations found in secure ledger.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingUsers.map(user => (
            <div key={user.id} className="bg-brand-black p-5 border border-white/5 hover:border-white/10 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${user.paymentStatus === 'awaiting_approval' ? 'bg-brand-gold animate-pulse' : 'bg-brand-red'}`} />
                  <p className="text-sm font-bold text-white uppercase tracking-tight">{user.firstName} {user.lastName}</p>
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-1">
                  <p className="text-[9px] font-mono text-white/40 uppercase tracking-widest">{user.email}</p>
                  <p className="text-[9px] font-mono text-brand-gold uppercase tracking-widest">Plan: {user.membershipType || 'Gold'}</p>
                  {user.paymentProof && (
                    <a 
                      href={user.paymentProof.startsWith('http') ? user.paymentProof : '#'} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[9px] font-mono text-cyan-400 underline uppercase tracking-widest hover:text-white"
                    >
                      View Proof: {user.paymentProof.length > 20 ? 'Attachment' : user.paymentProof}
                    </a>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  disabled={approvingIds.has(user.id)}
                  onClick={() => approveUser(user.id)}
                  className="bg-brand-gold text-brand-black px-6 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all hover:bg-white disabled:opacity-50 flex items-center gap-2"
                >
                  {approvingIds.has(user.id) ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                  {approvingIds.has(user.id) ? 'Processing...' : 'Approve Access'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
