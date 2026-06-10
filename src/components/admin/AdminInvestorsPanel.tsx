import React, { useState, useEffect } from "react";
import { collection, getDocs, updateDoc, doc, deleteDoc, addDoc } from "firebase/firestore";
import { db, auth } from "../../lib/firebase";
import { Handshake, Percent, DollarSign, Award, Save, RefreshCw, MessageSquare, Plus, Trash2, X, ExternalLink } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function AdminInvestorsPanel() {
  const navigate = useNavigate();
  const { startImpersonation } = useAuth();
  const [investors, setInvestors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newInvestor, setNewInvestor] = useState({
    email: '',
    fullName: '',
    phoneNumber: '',
    role: 'investor',
    investmentAmount: 0,
    percentageShare: 0,
    payoutFrequency: 'monthly',
    investorType: 'Professional/Healthcare'
  });
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    investmentAmount: 0,
    percentageShare: 0,
    payoutFrequency: 'monthly',
    investorType: 'Professional/Healthcare'
  });

  const fetchInvestors = async () => {
    try {
      let retries = 0;
      while (!auth.currentUser && retries < 15) {
        await new Promise(resolve => setTimeout(resolve, 300));
        retries++;
      }
      const querySnapshot = await getDocs(collection(db, "users"));
      const usersList = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter((u: any) => u.role === 'investor');
      setInvestors(usersList);
    } catch (e) {
      console.error("Error fetching investors:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestors();
  }, []);

  const handleCreateInvestor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "users"), {
        ...newInvestor,
        createdAt: new Date().toISOString(),
        isMember: false
      });
      setShowAddForm(false);
      setNewInvestor({
        email: '',
        fullName: '',
        phoneNumber: '',
        role: 'investor',
        investmentAmount: 0,
        percentageShare: 0,
        payoutFrequency: 'monthly',
        investorType: 'Professional/Healthcare'
      });
      fetchInvestors();
    } catch (e) {
      console.error("Error creating investor:", e);
    }
  };

  const updateRole = async (userId: string, newRole: string) => {
    try {
      await updateDoc(doc(db, "users", userId), { role: newRole });
      fetchInvestors();
    } catch (e) {
      console.error("Error updating role:", e);
    }
  };

  const handleStartEdit = (investor: any) => {
    setEditingId(investor.id);
    setEditForm({
      investmentAmount: investor.investmentAmount || 0,
      percentageShare: investor.percentageShare || 0,
      payoutFrequency: investor.payoutFrequency || 'monthly',
      investorType: investor.investorType || 'Professional/Healthcare'
    });
  };

  const handleSaveCustomConfigs = async (userId: string) => {
    try {
      await updateDoc(doc(db, "users", userId), {
        investmentAmount: Number(editForm.investmentAmount),
        percentageShare: Number(editForm.percentageShare),
        payoutFrequency: editForm.payoutFrequency,
        investorType: editForm.investorType
      });
      setEditingId(null);
      fetchInvestors();
    } catch (e) {
      console.error("Error updating customizations:", e);
    }
  };

  const deleteInvestor = async (userId: string) => {
    if (confirm("Are you sure you want to delete this investor profile?")) {
      try {
        await deleteDoc(doc(db, "users", userId));
        fetchInvestors();
      } catch (e) {
        console.error("Error deleting investor:", e);
      }
    }
  };

  const filteredInvestors = investors.filter(i => 
    i.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="text-white p-6 font-mono text-xs">Loading investors...</div>;

  return (
    <div className="p-6 bg-black/40 border border-white/5 rounded">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-black text-brand-gold flex items-center gap-2">
          <Handshake size={20} /> Investors & Collaborators Manager
        </h2>
        <div className="flex gap-4">
          <button 
            onClick={() => setShowAddForm(true)}
            className="bg-brand-gold text-brand-black px-4 py-2 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-white transition-all"
          >
            <Plus size={14} /> Add Investor
          </button>
          <input
            type="text"
            placeholder="Search investors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-black/60 border border-white/10 px-4 py-2 text-white text-xs font-mono rounded focus:border-brand-gold outline-none"
          />
        </div>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-zinc-950 border border-white/10 p-8 max-w-md w-full relative max-h-[90vh] overflow-y-auto scrollbar-thin">
            <button onClick={() => setShowAddForm(false)} className="absolute top-4 right-4 text-white/40 hover:text-white">
              <X size={20} />
            </button>
            <h3 className="text-lg font-black text-white uppercase tracking-widest mb-6">New Investor Profile</h3>
            <form onSubmit={handleCreateInvestor} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-black text-white/40 block mb-1">Email</label>
                <input 
                  type="email" 
                  required
                  value={newInvestor.email}
                  onChange={e => setNewInvestor({...newInvestor, email: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 p-3 text-sm text-white"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-black text-white/40 block mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={newInvestor.fullName}
                  onChange={e => setNewInvestor({...newInvestor, fullName: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 p-3 text-sm text-white"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-black text-white/40 block mb-1">Phone Number</label>
                <input 
                  type="tel" 
                  value={newInvestor.phoneNumber}
                  onChange={e => setNewInvestor({...newInvestor, phoneNumber: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 p-3 text-sm text-white"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-black text-white/40 block mb-1">Investor Category</label>
                <select 
                  value={newInvestor.investorType}
                  onChange={e => setNewInvestor({...newInvestor, investorType: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 p-3 text-sm text-white"
                >
                  <option value="Professional/Healthcare" className="bg-white text-black">Professional/Healthcare</option>
                  <option value="Corporate Sponsorship" className="bg-white text-black">Corporate Sponsorship</option>
                  <option value="Community/NGO" className="bg-white text-black">Community/NGO</option>
                  <option value="Media Partnership" className="bg-white text-black">Media Partnership</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-black text-white/40 block mb-1">Initial Capital ($)</label>
                  <input 
                    type="number"
                    value={newInvestor.investmentAmount}
                    onChange={e => setNewInvestor({...newInvestor, investmentAmount: Number(e.target.value)})}
                    className="w-full bg-white/5 border border-white/10 p-3 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-black text-white/40 block mb-1">Equity %</label>
                  <input 
                    type="number"
                    step="0.1"
                    value={newInvestor.percentageShare}
                    onChange={e => setNewInvestor({...newInvestor, percentageShare: Number(e.target.value)})}
                    className="w-full bg-white/5 border border-white/10 p-3 text-sm text-white"
                  />
                </div>
              </div>
              <button type="submit" className="w-full bg-brand-gold text-brand-black p-4 font-black uppercase text-xs tracking-widest hover:bg-white transition-all">
                Onboard Investor
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="px-4 py-3 border-b border-white/10 text-xs font-black uppercase tracking-wider text-white">Investor Email</th>
              <th className="px-4 py-3 border-b border-white/10 text-xs font-black uppercase tracking-wider text-white">Category</th>
              <th className="px-4 py-3 border-b border-white/10 text-xs font-black uppercase tracking-wider text-white">Capital Contribution</th>
              <th className="px-4 py-3 border-b border-white/10 text-xs font-black uppercase tracking-wider text-white">Equity Ratio</th>
              <th className="px-4 py-3 border-b border-white/10 text-xs font-black uppercase tracking-wider text-white">Payout Cycle</th>
              <th className="px-4 py-3 border-b border-white/10 text-xs font-black uppercase tracking-wider text-white">Actions</th>
            </tr>
          </thead>
          <tbody className="text-[11px] font-mono text-white/70">
            {filteredInvestors.map(i => {
              const isEditing = editingId === i.id;

              return (
                <tr key={i.id} className="hover:bg-white/5 border-b border-white/5">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="block font-bold text-white">{i.email}</span>
                      {i.isDemo && (
                        <span className="bg-brand-gold/10 text-brand-gold text-[8px] font-black uppercase px-1 rounded-[2px] border border-brand-gold/30 font-sans">DEMO</span>
                      )}
                    </div>
                    <span className="text-[9px] text-white/30">{i.id}</span>
                  </td>
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <select 
                        value={editForm.investorType}
                        onChange={e => setEditForm({...editForm, investorType: e.target.value})}
                        className="bg-black border border-white/10 p-1 text-[10px] text-white"
                      >
                        <option value="Professional/Healthcare" className="bg-white text-black">Healthcare</option>
                        <option value="Corporate Sponsorship" className="bg-white text-black">Corporate</option>
                        <option value="Community/NGO" className="bg-white text-black">NGO</option>
                        <option value="Media Partnership" className="bg-white text-black">Media</option>
                      </select>
                    ) : (
                      <span className="bg-brand-gold/10 text-brand-gold px-2 py-0.5 rounded text-[9px] font-black uppercase">
                        {i.investorType || 'General'}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <input 
                        type="number"
                        value={editForm.investmentAmount}
                        onChange={e => setEditForm({...editForm, investmentAmount: Number(e.target.value)})}
                        className="w-24 bg-black border border-white/10 p-1 text-white"
                      />
                    ) : (
                      <span className="text-white font-bold">${(i.investmentAmount || 0).toLocaleString()}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <input 
                        type="number"
                        step="0.1"
                        value={editForm.percentageShare}
                        onChange={e => setEditForm({...editForm, percentageShare: Number(e.target.value)})}
                        className="w-16 bg-black border border-white/10 p-1 text-white"
                      />
                    ) : (
                      <span className="text-emerald-400 font-bold">{i.percentageShare || 0}%</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <select 
                        value={editForm.payoutFrequency}
                        onChange={e => setEditForm({...editForm, payoutFrequency: e.target.value})}
                        className="bg-black border border-white/10 p-1 text-white"
                      >
                        <option value="monthly" className="bg-white text-black">Monthly</option>
                        <option value="quarterly" className="bg-white text-black">Quarterly</option>
                        <option value="annually" className="bg-white text-black">Annually</option>
                      </select>
                    ) : (
                      <span className="uppercase tracking-widest opacity-60">{i.payoutFrequency || 'monthly'}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 items-center">
                       {isEditing ? (
                        <button
                          onClick={() => handleSaveCustomConfigs(i.id)}
                          className="bg-brand-gold text-brand-black px-2 py-1 font-black uppercase text-[9px] flex items-center gap-1"
                        >
                          <Save size={10} /> Save
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => handleStartEdit(i)}
                            className="bg-white/10 text-white hover:bg-brand-gold hover:text-brand-black px-2 py-1 font-black uppercase text-[9px]"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => {
                              startImpersonation(i);
                              navigate("/member-dashboard");
                            }}
                            className="bg-brand-gold text-brand-black hover:bg-white px-2 py-1 font-black uppercase text-[9px] flex items-center gap-1 transition-colors font-bold"
                            title="Access this member's dashboard & account"
                          >
                            <ExternalLink size={10} /> Access Account
                          </button>
                        </>
                      )}
                      <button 
                        onClick={() => deleteInvestor(i.id)}
                        className="bg-red-950/40 text-red-300 hover:text-red-100 px-2 py-1 font-black uppercase text-[9px]"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
