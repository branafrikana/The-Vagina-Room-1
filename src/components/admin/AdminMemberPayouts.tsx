import React, { useState, useEffect } from "react";
import { collection, getDocs, updateDoc, doc, deleteDoc, addDoc, query, where, Timestamp } from "firebase/firestore";
import { db, auth } from "../../lib/firebase";
import { 
  Users, 
  Save, 
  CheckCircle2, 
  Clock, 
  Check, 
  Trash2, 
  Plus, 
  X, 
  Search, 
  Trophy, 
  DollarSign, 
  CreditCard,
  AlertCircle,
  ExternalLink
} from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function AdminMemberPayouts() {
  const navigate = useNavigate();
  const { startImpersonation } = useAuth();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMember, setNewMember] = useState({
    email: '',
    role: 'affiliate',
    membershipType: 'yearly',
    isMember: true,
    paymentStatus: 'paid',
    sponsorshipAmount: 100,
    sponsorshipPeriod: 'quarterly',
    payoutMethod: 'bank_transfer',
    payoutDetails: ''
  });

  const [activeTab, setActiveTab] = useState<"list" | "payouts">("list");

  const fetchMembers = async () => {
    try {
      let retries = 0;
      while (!auth.currentUser && retries < 15) {
        await new Promise(resolve => setTimeout(resolve, 300));
        retries++;
      }
      const q = query(collection(db, "users"));
      const querySnapshot = await getDocs(q);
      const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
      // Filter the list to show dedicated affiliates OR members with active referrals/earnings/pending payouts
      const payoutMembers = list.filter(m => 
        m.role === 'affiliate' || 
        (m.role === 'member' && (m.totalReferrals > 0 || m.pendingPayout > 0 || m.referralEarningsUSD > 0 || m.activeReferredMembers > 0))
      );
      setMembers(payoutMembers);
    } catch (e) {
      console.error("Error fetching payout-enabled members:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleCreateAffiliate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "users"), {
        ...newMember,
        createdAt: new Date().toISOString(),
        totalEarnings: 0,
        pendingPayout: 0,
        lastPayoutDate: null
      });
      setShowAddForm(false);
      setNewMember({
        email: '',
        role: 'affiliate',
        membershipType: 'yearly',
        isMember: true,
        paymentStatus: 'paid',
        sponsorshipAmount: 100,
        sponsorshipPeriod: 'quarterly',
        payoutMethod: 'bank_transfer',
        payoutDetails: ''
      });
      fetchMembers();
    } catch (e) {
      console.error("Error creating affiliate:", e);
    }
  };

  const updateMemberField = async (id: string, field: string, value: any) => {
    try {
      await updateDoc(doc(db, "users", id), { [field]: value });
      fetchMembers();
    } catch (e) {
      console.error("Error updating member payout config:", e);
    }
  };

  const handlePayout = async (member: any) => {
    const amount = member.pendingPayout || 0;
    if (amount <= 0) {
      alert("No pending payout for this member.");
      return;
    }

    if (!window.confirm(`Mark payout of $${amount} as completed for ${member.email}?`)) return;

    try {
      await updateDoc(doc(db, "users", member.id), {
        totalEarnings: (member.totalEarnings || 0) + amount,
        pendingPayout: 0,
        lastPayoutDate: new Date().toISOString()
      });
      
      await addDoc(collection(db, "payout_history"), {
        userId: member.id,
        userEmail: member.email,
        amount,
        type: 'member_sponsorship',
        timestamp: Timestamp.now(),
        status: 'completed'
      });

      fetchMembers();
      alert("Payout processed successfully.");
    } catch (e) {
      console.error("Error processing payout:", e);
    }
  };

  const deleteAffiliate = async (id: string) => {
    if (!window.confirm("Are you sure you want to remove this member from the payout system?")) return;
    try {
      await deleteDoc(doc(db, "users", id));
      fetchMembers();
    } catch (e) {
      console.error("Error deleting affiliate:", e);
    }
  };

  const filteredMembers = members.filter(m => 
    m.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="text-white p-6 font-mono text-xs">Loading payout system...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-2xl font-black text-brand-gold flex items-center gap-2 uppercase tracking-tighter">
            <DollarSign size={24} /> Member Payout Management
          </h2>
          <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Configure earnings, commission distributions and member profiles</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveTab("list")}
            className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'list' ? 'bg-brand-gold text-brand-black' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
          >
            Affiliate Roster
          </button>
          <button 
            onClick={() => setActiveTab("payouts")}
            className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'payouts' ? 'bg-brand-gold text-brand-black' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
          >
            Payout Queue
          </button>
        </div>
      </div>

      <div className="bg-black/40 border border-white/5 p-6 rounded">
        {activeTab === "list" ? (
          <>
            <div className="flex justify-between items-center mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={12} />
                <input
                  type="text"
                  placeholder="Search members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-black/60 border border-white/10 pl-9 pr-4 py-2 text-white text-xs font-mono rounded focus:border-brand-gold outline-none w-64"
                />
              </div>
              <button 
                onClick={() => setShowAddForm(true)}
                className="bg-brand-gold text-brand-black px-4 py-2 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-white transition-all shadow-lg shadow-brand-gold/10"
              >
                <Plus size={14} /> Add Affiliate
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-[10px] font-black uppercase tracking-widest text-white/40">
                    <th className="px-4 py-4">Member Identity</th>
                    <th className="px-4 py-4 text-center">Benefit Rate</th>
                    <th className="px-4 py-4">Payout Config</th>
                    <th className="px-4 py-4 text-right">Lifetime Earnings</th>
                    <th className="px-4 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-[11px] font-mono">
                  {filteredMembers.map(member => (
                    <tr key={member.id} className="hover:bg-white/5 border-b border-white/5 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span className="block font-bold text-white text-sm">{member.email}</span>
                          {member.isDemo && (
                            <span className="bg-brand-gold/10 text-brand-gold text-[8px] font-black uppercase px-1 rounded-[2px] border border-brand-gold/30 font-sans">DEMO</span>
                          )}
                        </div>
                        <span className="text-[9px] text-white/20 uppercase tracking-widest">UID: {member.id}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col items-center">
                           <div className="flex items-center gap-1">
                            <span className="text-brand-gold font-black">$</span>
                            <input 
                              type="number"
                              defaultValue={member.sponsorshipAmount || 0}
                              onBlur={(e) => updateMemberField(member.id, 'sponsorshipAmount', Number(e.target.value))}
                              className="w-16 bg-white/5 border border-white/10 text-center text-white py-1 focus:border-brand-gold outline-none"
                            />
                          </div>
                          <select 
                            value={member.sponsorshipPeriod || 'quarterly'}
                            onChange={(e) => updateMemberField(member.id, 'sponsorshipPeriod', e.target.value)}
                            className="bg-transparent text-[9px] text-white/40 uppercase font-black mt-1 outline-none text-center"
                          >
                            <option value="quarterly" className="bg-white text-black">/ Quarterly</option>
                            <option value="yearly" className="bg-white text-black">/ Yearly</option>
                            <option value="one_time" className="bg-white text-black">/ One-time</option>
                          </select>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-1">
                          <select 
                            value={member.payoutMethod || 'bank_transfer'}
                            onChange={(e) => updateMemberField(member.id, 'payoutMethod', e.target.value)}
                            className="bg-white/5 border border-white/10 text-[9px] text-white/60 p-1 uppercase font-black outline-none"
                          >
                            <option value="bank_transfer" className="bg-white text-black">Bank Transfer</option>
                            <option value="paypal" className="bg-white text-black">PayPal</option>
                            <option value="crypto" className="bg-white text-black">Crypto / USDT</option>
                          </select>
                          <input 
                            placeholder="Account Details..."
                            defaultValue={member.payoutDetails || ''}
                            onBlur={(e) => updateMemberField(member.id, 'payoutDetails', e.target.value)}
                            className="bg-white/5 border border-white/10 p-1 text-[9px] text-white/40 italic focus:text-white outline-none"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="text-emerald-400 font-black text-xs">${(member.totalEarnings || 0).toLocaleString()}</span>
                        <span className="block text-[8px] text-white/20">Last: {member.lastPayoutDate ? new Date(member.lastPayoutDate).toLocaleDateString() : 'Never'}</span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex justify-end gap-2 items-center">
                          <button 
                            onClick={() => {
                              startImpersonation(member);
                              navigate("/member-dashboard");
                            }}
                            className="bg-brand-gold text-brand-black hover:bg-white px-2.5 py-1.5 font-black uppercase text-[9px] flex items-center gap-1 transition-colors font-bold shadow-md shadow-brand-gold/10"
                            title="Access this member's dashboard & account"
                          >
                            <ExternalLink size={10} /> Access Account
                          </button>
                          <button 
                            onClick={() => deleteAffiliate(member.id)}
                            className="p-1.5 bg-red-950/20 text-brand-red hover:bg-brand-red hover:text-white transition-all border border-brand-red/10"
                            title="Delete Affiliate"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredMembers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-20 text-center text-white/20 uppercase tracking-[0.3em] text-[10px] italic">
                        No members found in the payout roster
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle size={14} className="text-brand-gold" />
              <p className="text-[10px] text-white/60 uppercase tracking-widest font-bold">Pending Disbursements</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {members.filter(m => (m.pendingPayout || 0) > 0).map(member => (
                <div key={member.id} className="bg-white/[0.02] border border-brand-gold/20 p-5 rounded relative group overflow-hidden">
                  <div className="absolute top-0 right-0 p-2 bg-brand-gold/10 text-brand-gold text-[8px] font-black uppercase tracking-widest">
                    PENDING
                  </div>
                  <div className="mb-4">
                    <p className="text-white font-bold text-sm truncate">{member.email}</p>
                    <p className="text-[8px] text-white/30 uppercase tracking-tighter">{member.payoutMethod || 'No Method Set'}</p>
                  </div>
                  <div className="flex justify-between items-end mb-6">
                    <div>
                      <p className="text-[9px] text-white/40 uppercase font-black tracking-widest">Amount Due</p>
                      <p className="text-2xl font-black text-brand-gold">${member.pendingPayout}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-[9px] text-white/40 uppercase font-black tracking-widest">Method</p>
                       <p className="text-[10px] text-white font-mono">{member.payoutMethod === 'bank_transfer' ? 'Wire' : member.payoutMethod}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handlePayout(member)}
                    className="w-full bg-brand-gold text-brand-black p-3 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white transition-all flex items-center justify-center gap-2"
                  >
                    <Check size={14} /> Confirm Disbursement
                  </button>
                </div>
              ))}
              {members.filter(m => (m.pendingPayout || 0) > 0).length === 0 && (
                <div className="col-span-full py-20 bg-white/[0.01] border border-dashed border-white/5 rounded text-center">
                  <p className="text-white/20 uppercase tracking-[0.3em] text-[10px] font-bold">Disbursement queue is clear</p>
                </div>
              )}
            </div>

            {/* Manual Accrual Section */}
            <div className="mt-12 bg-white/[0.02] border border-white/5 p-6 border-t-brand-gold/40 border-t-2">
              <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4">Manual Earnings Accrual</h4>
              <p className="text-[10px] text-white/40 mb-6 max-w-lg leading-relaxed italic">Use this section to manually add earnings to a member's account if they earned commissions or referral funds outside of the automatic cycles.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4">
                <select 
                  className="bg-black/60 border border-white/10 p-3 text-white text-xs outline-none focus:border-brand-gold"
                  onChange={(e) => {
                    if (e.target.value) {
                      const amount = prompt("Enter amount to add to pending payout ($):");
                      if (amount && !isNaN(Number(amount))) {
                        const member = members.find(m => m.id === e.target.value);
                        updateMemberField(member.id, 'pendingPayout', (member.pendingPayout || 0) + Number(amount));
                      }
                      e.target.value = "";
                    }
                  }}
                >
                  <option value="">Select Member...</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id} className="bg-white text-black">{m.email}</option>
                  ))}
                </select>
                <div className="flex items-center text-[10px] text-white/20 italic uppercase tracking-tighter">
                  Select a member to trigger a manual balance adjustment prompt
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-950 border border-white/10 p-8 max-w-md w-full relative shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-thin"
          >
            <button onClick={() => setShowAddForm(false)} className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors">
              <X size={24} />
            </button>
            
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-brand-gold/10 border border-brand-gold/30 flex items-center justify-center">
                <DollarSign className="text-brand-gold" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-widest">Setup Affiliate Payout</h3>
                <p className="text-[9px] text-white/40 uppercase tracking-tighter italic">Initializing member benefit distribution profile</p>
              </div>
            </div>

            <form onSubmit={handleCreateAffiliate} className="space-y-5">
              <div>
                <label className="text-[10px] uppercase font-black text-white/40 block mb-1.5 tracking-widest">Member Email</label>
                <input 
                  type="email" 
                  required
                  placeholder="name@example.com"
                  value={newMember.email}
                  onChange={e => setNewMember({...newMember, email: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 p-4 text-sm text-white focus:border-brand-gold outline-none transition-all placeholder:text-white/10"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-black text-white/40 block mb-1.5 tracking-widest">Rate ($)</label>
                  <input 
                    type="number"
                    value={newMember.sponsorshipAmount}
                    onChange={e => setNewMember({...newMember, sponsorshipAmount: Number(e.target.value)})}
                    className="w-full bg-white/5 border border-white/10 p-4 text-sm text-white focus:border-brand-gold outline-none"
                  />
                </div>
                <div>
                   <label className="text-[10px] uppercase font-black text-white/40 block mb-1.5 tracking-widest">Interval</label>
                   <select 
                    value={newMember.sponsorshipPeriod}
                    onChange={e => setNewMember({...newMember, sponsorshipPeriod: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 p-4 text-sm text-white focus:border-brand-gold outline-none"
                   >
                     <option value="quarterly" className="bg-white text-black">Quarterly</option>
                     <option value="yearly" className="bg-white text-black">Yearly</option>
                     <option value="one_time" className="bg-white text-black">One-time</option>
                   </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-black text-white/40 block mb-1.5 tracking-widest">Payout Logistics</label>
                <div className="flex flex-col gap-2">
                   <select 
                    value={newMember.payoutMethod}
                    onChange={e => setNewMember({...newMember, payoutMethod: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 p-3 text-xs text-white/70 outline-none"
                   >
                     <option value="bank_transfer" className="bg-white text-black">Bank Transfer / Wire</option>
                     <option value="paypal" className="bg-white text-black">PayPal Business</option>
                     <option value="crypto" className="bg-white text-black">Digital Assets (USDT)</option>
                   </select>
                   <textarea 
                    placeholder="Enter account numbers, wallet addresses, etc..."
                    value={newMember.payoutDetails}
                    onChange={e => setNewMember({...newMember, payoutDetails: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 p-4 text-xs text-white/70 min-h-[80px] outline-none focus:border-brand-gold transition-all"
                   />
                </div>
              </div>

              <div className="bg-brand-gold/5 border border-brand-gold/10 p-4 flex gap-3 text-[10px] text-brand-gold/80 italic leading-relaxed">
                <CheckCircle2 size={16} className="shrink-0" />
                <span>Creating a payout profile automatically initializes the member's financial ledger for benefit distribution.</span>
              </div>

              <button type="submit" className="w-full bg-brand-gold text-brand-black py-5 font-black uppercase text-xs tracking-[0.3em] hover:bg-white transition-all shadow-xl shadow-brand-gold/5">
                Onboard To System
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
