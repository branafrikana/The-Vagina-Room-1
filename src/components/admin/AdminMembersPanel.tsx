import React, { useState, useEffect } from "react";
import { collection, getDocs, updateDoc, doc, deleteDoc, addDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../../lib/firebase";
import { handleFirestoreError, OperationType } from "../../lib/firestore-errors";
import { Users, Save, CheckCircle2, Clock, Check, Trash2, Plus, X, Search, ExternalLink, ShieldAlert } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useContent } from "../../context/ContentContext";
import { useNavigate } from "react-router-dom";

export default function AdminMembersPanel() {
  const navigate = useNavigate();
  const { startImpersonation } = useAuth();
  const { content } = useContent();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmDeleteUserId, setConfirmDeleteUserId] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    continent: '',
    country: '',
    region: '',
    city: ''
  });
  const [activeFilters, setActiveFilters] = useState({
    continent: true,
    country: true,
    region: true,
    city: true
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMember, setNewMember] = useState({
    email: '',
    fullName: '',
    phoneNumber: '',
    role: 'member',
    membershipType: 'quarterly',
    isMember: false,
    paymentStatus: 'pending',
    isFreeMemberForLife: false,
    adminPermissions: [] as string[]
  });
  
  // Inline edit state tracking for customizations
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    customCommissionPercentage: 20,
    isFreeMemberForLife: false,
    role: 'member',
    adminPermissions: [] as string[]
  });

  const [seeding, setSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState<string | null>(null);

  const seedDemoAccounts = async () => {
    setSeeding(true);
    setSeedSuccess(null);
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const demoEmails = [
        "member.yearly@thevaginaroom.com",
        "member.pending@thevaginaroom.com",
        "affiliate.demo@thevaginaroom.com",
        "investor.demo@thevaginaroom.com"
      ];
      
      const deletePromises = querySnapshot.docs
        .filter(document => demoEmails.includes(document.data().email))
        .map(d => deleteDoc(doc(db, "users", d.id)));
      
      await Promise.all(deletePromises);

      const demoUsers = [
        {
          email: "member.yearly@thevaginaroom.com",
          fullName: "Sarah Connor (Demo Premium)",
          phoneNumber: "+1 (555) 732-9011",
          role: "member",
          membershipType: "yearly",
          isMember: true,
          paymentStatus: "paid",
          city: "New York",
          stateProvince: "New York State",
          region: "New York State",
          country: "United States",
          continent: "North America",
          customCommissionPercentage: 20,
          totalReferrals: 0,
          referralEarningsUSD: 0,
          referralEarningsNGN: 0,
          activeReferredMembers: 0,
          createdAt: new Date().toISOString(),
          isDemo: true
        },
        {
          email: "member.pending@thevaginaroom.com",
          fullName: "Oluchi Ngozi (Demo Pending)",
          phoneNumber: "+234 803 123 4567",
          role: "member",
          membershipType: "quarterly",
          isMember: false,
          paymentStatus: "awaiting_approval",
          proofOfPaymentUrl: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&q=80",
          city: "Lagos",
          stateProvince: "Lagos State",
          region: "Lagos State",
          country: "Nigeria",
          continent: "Africa",
          customCommissionPercentage: 20,
          totalReferrals: 0,
          referralEarningsUSD: 0,
          referralEarningsNGN: 0,
          activeReferredMembers: 0,
          createdAt: new Date().toISOString(),
          isDemo: true
        },
        {
          email: "affiliate.demo@thevaginaroom.com",
          fullName: "Emma Watson (Demo Affiliate)",
          phoneNumber: "+44 7911 123456",
          role: "affiliate",
          membershipType: "quarterly",
          isMember: true,
          paymentStatus: "paid",
          city: "London",
          stateProvince: "Greater London",
          region: "Greater London",
          country: "United Kingdom",
          continent: "Europe",
          customCommissionPercentage: 25,
          totalReferrals: 12,
          referralEarningsUSD: 420,
          referralEarningsNGN: 320000,
          activeReferredMembers: 5,
          createdAt: new Date().toISOString(),
          isDemo: true
        },
        {
          email: "investor.demo@thevaginaroom.com",
          fullName: "Marcus Aurelius (Demo Investor)",
          phoneNumber: "+39 06 6982",
          role: "investor",
          membershipType: "none",
          isMember: false,
          paymentStatus: "paid",
          city: "Rome",
          stateProvince: "Lazio",
          region: "Lazio",
          country: "Italy",
          continent: "Europe",
          investmentAmount: 50000,
          percentageShare: 15,
          payoutFrequency: "monthly",
          investorType: "Venture Philanthropic",
          createdAt: new Date().toISOString(),
          isDemo: true
        }
      ];

      const addPromises = demoUsers.map(u => addDoc(collection(db, "users"), u));
      await Promise.all(addPromises);
      
      setSeedSuccess("Successfully seeded 4 custom Demo profiles into the live environment! Use 'Access Account' below to test immediately.");
      await fetchUsers();
    } catch (err: any) {
      console.error("Error seeding demo accounts:", err);
      setSeedSuccess("Failed to seed demo accounts. Try again.");
    } finally {
      setSeeding(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { getDocs: clientGetDocs } = await import('firebase/firestore');
      const querySnapshot = await clientGetDocs(collection(db, "users"));
      const usersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersList);
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, 'users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "users"), {
        ...newMember,
        createdAt: new Date().toISOString(),
        customCommissionPercentage: 20,
        totalReferrals: 0,
        referralEarningsUSD: 0,
        referralEarningsNGN: 0,
        activeReferredMembers: 0
      });
      setShowAddForm(false);
      setNewMember({
        email: '',
        fullName: '',
        phoneNumber: '',
        role: 'member',
        membershipType: 'quarterly',
        isMember: false,
        paymentStatus: 'pending',
        isFreeMemberForLife: false,
        adminPermissions: [] as string[]
      });
      fetchUsers();
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'users');
    }
  };

  const approveMembership = async (user: any) => {
    try {
      await updateDoc(doc(db, "users", user.id), {
        isMember: true,
        paymentStatus: 'paid'
      });
      
      // Removed /api/send-welcome-email since maintaining NO BACKEND strategy.
      fetchUsers();
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${user.id}`);
    }
  };

  const rejectMembership = async (userId: string) => {
    if (!window.confirm("Are you sure you want to reject this proof of payment? This will clear the proof and set the status back to pending.")) return;
    try {
      await updateDoc(doc(db, "users", userId), {
        paymentStatus: 'pending',
        proofOfPaymentUrl: null
      });
      fetchUsers();
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${userId}`);
    }
  };

  const updateRole = async (userId: string, newRole: string) => {
    try {
      await updateDoc(doc(db, "users", userId), {
        role: newRole
      });
      fetchUsers();
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${userId}`);
    }
  };

  const handleStartEdit = (user: any) => {
    setEditingId(user.id);
    setEditForm({
      customCommissionPercentage: user.customCommissionPercentage || 20,
      isFreeMemberForLife: user.isFreeMemberForLife || false,
      role: user.role || 'member',
      adminPermissions: user.adminPermissions || []
    });
  };

  const togglePermission = (perm: string) => {
    const current = [...editForm.adminPermissions];
    if (current.includes(perm)) {
      setEditForm({ ...editForm, adminPermissions: current.filter(p => p !== perm) });
    } else {
      setEditForm({ ...editForm, adminPermissions: [...current, perm] });
    }
  };

  const handleSaveCustomConfigs = async (userId: string) => {
    try {
      await updateDoc(doc(db, "users", userId), {
        customCommissionPercentage: Number(editForm.customCommissionPercentage),
        isFreeMemberForLife: editForm.isFreeMemberForLife,
        role: editForm.role,
        adminPermissions: editForm.adminPermissions
      });
      setEditingId(null);
      fetchUsers();
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${userId}`);
    }
  };

  const deleteUser = async (userId: string) => {
    if (confirmDeleteUserId !== userId) {
      setConfirmDeleteUserId(userId);
      setTimeout(() => setConfirmDeleteUserId(null), 3000);
      return;
    }

    try {
      await deleteDoc(doc(db, "users", userId));
      setConfirmDeleteUserId(null);
      fetchUsers();
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `users/${userId}`);
    }
  };

  const handleInitializeAdmin = async () => {
    if (!auth.currentUser) return;
    try {
      await setDoc(doc(db, 'admins', auth.currentUser.uid), {
        email: auth.currentUser.email,
        addedAt: serverTimestamp()
      });
      alert('Security Node Initialized: You are now a permanent system administrator.');
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `admins/${auth.currentUser.uid}`);
    }
  };

  const uniqueContinents = Array.from(new Set(users.map(u => u.continent).filter(Boolean))) as string[];
  const uniqueCountries = Array.from(new Set(users.map(u => u.country).filter(Boolean))) as string[];
  const uniqueRegions = Array.from(new Set(users.map(u => u.stateProvince || u.region).filter(Boolean))) as string[];
  const uniqueCities = Array.from(new Set(users.map(u => u.city).filter(Boolean))) as string[];

  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchQuery || 
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.fullName || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesContinent = !activeFilters.continent || filters.continent === '' || user.continent === filters.continent;
    const matchesCountry = !activeFilters.country || filters.country === '' || user.country === filters.country;
    
    const userRegion = user.stateProvince || user.region || '';
    const matchesRegion = !activeFilters.region || filters.region === '' || userRegion === filters.region;
    
    const matchesCity = !activeFilters.city || filters.city === '' || user.city === filters.city;

    return matchesSearch && matchesContinent && matchesCountry && matchesRegion && matchesCity;
  });

  if (loading) return <div className="text-white p-6 font-mono text-xs">Loading members...</div>;

  return (
    <div className="p-6 bg-black/40 border border-white/5 rounded">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-black text-brand-gold flex items-center gap-2">
          <Users size={20} /> Community Members Manager
        </h2>
        <div className="flex gap-4">
          <button 
            onClick={handleInitializeAdmin}
            className="border border-brand-gold/30 text-brand-gold px-4 py-2 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-brand-gold/10 transition-all"
            title="Register your UID in the permanent admin collection"
          >
            <ShieldAlert size={14} /> Initialize Admin Node
          </button>
          <button 
            onClick={() => setShowAddForm(true)}
            className="bg-brand-gold text-brand-black px-4 py-2 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-white transition-all"
          >
            <Plus size={14} /> Add Member
          </button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={12} />
            <input
              type="text"
              placeholder="Search by email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-black/60 border border-white/10 pl-9 pr-4 py-2 text-white text-xs font-mono rounded focus:border-brand-gold outline-none w-64"
            />
          </div>
        </div>
      </div>

      {/* Demo Sandbox Control Panel */}
      <div className="mb-6 p-5 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border-2 border-brand-gold/20 rounded shadow-lg">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-black text-brand-gold uppercase tracking-wider flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-brand-gold animate-pulse" />
              Demo Testing Accounts & Sandbox Control Center
            </h3>
            <p className="text-[10px] text-white/50 max-w-2xl mt-1 leading-relaxed">
              Generate pre-loaded test profiles to thoroughly inspect the entire interactive workspace. 
              The suite generates 4 distinct roles with simulated metrics (premium member lounge access, custom multi-level referral balances, and payout tracking).
            </p>
          </div>
          <button
            onClick={seedDemoAccounts}
            disabled={seeding}
            type="button"
            className="shrink-0 bg-brand-gold text-brand-black px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-white disabled:opacity-50 disabled:cursor-wait transition-all flex items-center gap-2"
          >
            {seeding ? "Generating..." : "Reseed All Demo Accounts"}
          </button>
        </div>

        {seedSuccess && (
          <div className="mt-3 p-2.5 bg-brand-gold/10 border border-brand-gold/30 text-brand-gold text-[10px] uppercase font-bold tracking-wider">
            {seedSuccess}
          </div>
        )}

        {/* Quick Access Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4 border-t border-white/5 pt-4">
          <div className="bg-black/40 border border-white/5 p-3 rounded flex flex-col justify-between">
            <div>
              <span className="px-1.5 py-0.5 rounded-[2px] text-[8px] bg-brand-gold/20 text-brand-gold uppercase font-black tracking-wider block w-fit mb-1.5">
                Premium Member
              </span>
              <p className="text-xs text-white font-black truncate">Sarah Connor</p>
              <p className="text-[9px] text-white/40 font-mono mt-0.5">member.yearly@thevaginaroom.com</p>
            </div>
            <button
              onClick={() => {
                startImpersonation({
                  id: "demo_sarah_connor",
                  email: "member.yearly@thevaginaroom.com",
                  fullName: "Sarah Connor (Demo Premium)",
                  role: "member",
                  membershipType: "yearly",
                  isMember: true,
                  paymentStatus: "paid"
                });
                navigate("/member-dashboard");
              }}
              type="button"
              className="mt-3 w-full bg-white/5 hover:bg-brand-gold hover:text-brand-black text-white py-1.5 text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1 transition-all"
            >
              <ExternalLink size={10} /> Access Account
            </button>
          </div>

          <div className="bg-black/40 border border-white/5 p-3 rounded flex flex-col justify-between">
            <div>
              <span className="px-1.5 py-0.5 rounded-[2px] text-[8px] bg-white/10 text-white/50 uppercase font-black tracking-wider block w-fit mb-1.5">
                Pending Approval
              </span>
              <p className="text-xs text-white font-black truncate">Oluchi Ngozi</p>
              <p className="text-[9px] text-white/40 font-mono mt-0.5">member.pending@thevaginaroom.com</p>
            </div>
            <button
              onClick={() => {
                startImpersonation({
                  id: "demo_oluchi_ngozi",
                  email: "member.pending@thevaginaroom.com",
                  fullName: "Oluchi Ngozi (Demo Pending)",
                  role: "member",
                  membershipType: "quarterly",
                  isMember: false,
                  paymentStatus: "awaiting_approval",
                  proofOfPaymentUrl: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&q=80"
                });
                navigate("/member-dashboard");
              }}
              type="button"
              className="mt-3 w-full bg-white/5 hover:bg-brand-gold hover:text-brand-black text-white py-1.5 text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1 transition-all"
            >
              <ExternalLink size={10} /> Access Account
            </button>
          </div>

          <div className="bg-black/40 border border-white/5 p-3 rounded flex flex-col justify-between">
            <div>
              <span className="px-1.5 py-0.5 rounded-[2px] text-[8px] bg-emerald-500/20 text-emerald-400 uppercase font-black tracking-wider block w-fit mb-1.5">
                Affiliate / Advocate
              </span>
              <p className="text-xs text-white font-black truncate">Emma Watson</p>
              <p className="text-[9px] text-white/40 font-mono mt-0.5">affiliate.demo@thevaginaroom.com</p>
            </div>
            <button
              onClick={() => {
                startImpersonation({
                  id: "demo_emma_watson",
                  email: "affiliate.demo@thevaginaroom.com",
                  fullName: "Emma Watson (Demo Affiliate)",
                  role: "affiliate",
                  membershipType: "quarterly",
                  isMember: true,
                  paymentStatus: "paid",
                  customCommissionPercentage: 25,
                  totalReferrals: 12,
                  referralEarningsUSD: 420,
                  referralEarningsNGN: 320000,
                  activeReferredMembers: 5
                });
                navigate("/member-dashboard");
              }}
              type="button"
              className="mt-3 w-full bg-white/5 hover:bg-brand-gold hover:text-brand-black text-white py-1.5 text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1 transition-all"
            >
              <ExternalLink size={10} /> Access Account
            </button>
          </div>

          <div className="bg-black/40 border border-white/5 p-3 rounded flex flex-col justify-between">
            <div>
              <span className="px-1.5 py-0.5 rounded-[2px] text-[8px] bg-sky-500/20 text-sky-400 uppercase font-black tracking-wider block w-fit mb-1.5">
                Venture Investor
              </span>
              <p className="text-xs text-white font-black truncate">Marcus Aurelius</p>
              <p className="text-[9px] text-white/40 font-mono mt-0.5">investor.demo@thevaginaroom.com</p>
            </div>
            <button
              onClick={() => {
                startImpersonation({
                  id: "demo_marcus_aurelius",
                  email: "investor.demo@thevaginaroom.com",
                  fullName: "Marcus Aurelius (Demo Investor)",
                  role: "investor",
                  membershipType: "none",
                  isMember: false,
                  paymentStatus: "paid",
                  investmentAmount: 50000,
                  percentageShare: 15,
                  payoutFrequency: "monthly",
                  investorType: "Venture Philanthropic"
                });
                navigate("/member-dashboard");
              }}
              type="button"
              className="mt-3 w-full bg-white/5 hover:bg-brand-gold hover:text-brand-black text-white py-1.5 text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1 transition-all"
            >
              <ExternalLink size={10} /> Access Account
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-950/80 p-4 border border-white/10 rounded">
          <div className="flex flex-wrap gap-3 items-center">
            <span className="text-[10px] text-brand-gold font-black uppercase tracking-wider block mr-1">Filter Dimensions:</span>
            <button 
              type="button"
              onClick={() => setActiveFilters({ ...activeFilters, continent: !activeFilters.continent })}
              className={`px-3 py-1.5 text-[9px] font-black uppercase border tracking-wider transition-all duration-200 ${activeFilters.continent ? 'bg-brand-gold border-brand-gold text-brand-black' : 'bg-transparent border-white/10 text-white/40'}`}
            >
              Continent {activeFilters.continent ? 'ENABLED' : 'DISABLED'}
            </button>
            <button 
              type="button"
              onClick={() => setActiveFilters({ ...activeFilters, country: !activeFilters.country })}
              className={`px-3 py-1.5 text-[9px] font-black uppercase border tracking-wider transition-all duration-200 ${activeFilters.country ? 'bg-brand-gold border-brand-gold text-brand-black' : 'bg-transparent border-white/10 text-white/40'}`}
            >
              Country {activeFilters.country ? 'ENABLED' : 'DISABLED'}
            </button>
            <button 
              type="button"
              onClick={() => setActiveFilters({ ...activeFilters, region: !activeFilters.region })}
              className={`px-3 py-1.5 text-[9px] font-black uppercase border tracking-wider transition-all duration-200 ${activeFilters.region ? 'bg-brand-gold border-brand-gold text-brand-black' : 'bg-transparent border-white/10 text-white/40'}`}
            >
              Region {activeFilters.region ? 'ENABLED' : 'DISABLED'}
            </button>
            <button 
              type="button"
              onClick={() => setActiveFilters({ ...activeFilters, city: !activeFilters.city })}
              className={`px-3 py-1.5 text-[9px] font-black uppercase border tracking-wider transition-all duration-200 ${activeFilters.city ? 'bg-brand-gold border-brand-gold text-brand-black' : 'bg-transparent border-white/10 text-white/40'}`}
            >
              City {activeFilters.city ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>
          
          <button
            type="button"
            onClick={() => {
              setFilters({ continent: '', country: '', region: '', city: '' });
              setSearchQuery('');
            }}
            className="px-3 py-1.5 text-[9px] font-black uppercase border border-white/20 text-white hover:bg-white/5 tracking-wider transition-all duration-200"
          >
            Clear Filters
          </button>
        </div>

        <div className="bg-zinc-950/60 border border-white/10 p-5 rounded grid grid-cols-1 md:grid-cols-4 gap-5">
          {/* Continent Filter Block */}
          <div className="space-y-2">
            <span className="text-[9px] uppercase tracking-wider text-brand-gold font-bold block">Continent</span>
            <div className="space-y-1.5">
              <select 
                disabled={!activeFilters.continent}
                value={filters.continent} 
                onChange={e => setFilters({...filters, continent: e.target.value})} 
                className="w-full bg-zinc-900 border border-white/20 focus:border-brand-gold text-white text-xs font-mono p-2.5 outline-none rounded transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <option value="" className="bg-zinc-950 text-white">Select Continent ({uniqueContinents.length})</option>
                {uniqueContinents.map(c => <option key={c} value={c} className="bg-zinc-950 text-white">{c}</option>)}
              </select>
              <input 
                type="text"
                disabled={!activeFilters.continent}
                placeholder="Or type Continent name..."
                value={filters.continent}
                onChange={e => setFilters({...filters, continent: e.target.value})}
                className="w-full bg-zinc-900/50 border border-white/10 focus:border-brand-gold text-white text-[11px] font-mono p-2 outline-none rounded placeholder:text-white/20 disabled:opacity-30"
              />
            </div>
          </div>

          {/* Country Filter Block */}
          <div className="space-y-2">
            <span className="text-[9px] uppercase tracking-wider text-brand-gold font-bold block">Country</span>
            <div className="space-y-1.5">
              <select 
                disabled={!activeFilters.country}
                value={filters.country} 
                onChange={e => setFilters({...filters, country: e.target.value})} 
                className="w-full bg-zinc-900 border border-white/20 focus:border-brand-gold text-white text-xs font-mono p-2.5 outline-none rounded transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <option value="" className="bg-zinc-950 text-white">Select Country ({uniqueCountries.length})</option>
                {uniqueCountries.map(c => <option key={c} value={c} className="bg-zinc-950 text-white">{c}</option>)}
              </select>
              <input 
                type="text"
                disabled={!activeFilters.country}
                placeholder="Or type Country name..."
                value={filters.country}
                onChange={e => setFilters({...filters, country: e.target.value})}
                className="w-full bg-zinc-900/50 border border-white/10 focus:border-brand-gold text-white text-[11px] font-mono p-2 outline-none rounded placeholder:text-white/20 disabled:opacity-30"
              />
            </div>
          </div>

          {/* Region/Province Filter Block */}
          <div className="space-y-2">
            <span className="text-[9px] uppercase tracking-wider text-brand-gold font-bold block">Region / Province</span>
            <div className="space-y-1.5">
              <select 
                disabled={!activeFilters.region}
                value={filters.region} 
                onChange={e => setFilters({...filters, region: e.target.value})} 
                className="w-full bg-zinc-900 border border-white/20 focus:border-brand-gold text-white text-xs font-mono p-2.5 outline-none rounded transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <option value="" className="bg-zinc-950 text-white">Select Region ({uniqueRegions.length})</option>
                {uniqueRegions.map(r => <option key={r} value={r} className="bg-zinc-950 text-white">{r}</option>)}
              </select>
              <input 
                type="text"
                disabled={!activeFilters.region}
                placeholder="Or type Region name..."
                value={filters.region}
                onChange={e => setFilters({...filters, region: e.target.value})}
                className="w-full bg-zinc-900/50 border border-white/10 focus:border-brand-gold text-white text-[11px] font-mono p-2 outline-none rounded placeholder:text-white/20 disabled:opacity-30"
              />
            </div>
          </div>

          {/* City Filter Block */}
          <div className="space-y-2">
            <span className="text-[9px] uppercase tracking-wider text-brand-gold font-bold block">City</span>
            <div className="space-y-1.5">
              <select 
                disabled={!activeFilters.city}
                value={filters.city} 
                onChange={e => setFilters({...filters, city: e.target.value})} 
                className="w-full bg-zinc-900 border border-white/20 focus:border-brand-gold text-white text-xs font-mono p-2.5 outline-none rounded transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <option value="" className="bg-zinc-950 text-white">Select City ({uniqueCities.length})</option>
                {uniqueCities.map(c => <option key={c} value={c} className="bg-zinc-950 text-white">{c}</option>)}
              </select>
              <input 
                type="text"
                disabled={!activeFilters.city}
                placeholder="Or type City name..."
                value={filters.city}
                onChange={e => setFilters({...filters, city: e.target.value})}
                className="w-full bg-zinc-900/50 border border-white/10 focus:border-brand-gold text-white text-[11px] font-mono p-2 outline-none rounded placeholder:text-white/20 disabled:opacity-30"
              />
            </div>
          </div>
        </div>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-zinc-950 border border-white/10 p-8 max-w-md w-full relative max-h-[90vh] overflow-y-auto scrollbar-thin">
            <button onClick={() => setShowAddForm(false)} className="absolute top-4 right-4 text-white/40 hover:text-white">
              <X size={20} />
            </button>
            <h3 className="text-lg font-black text-white uppercase tracking-widest mb-6">Create New Member</h3>
            <form onSubmit={handleCreateMember} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-black text-white/40 block mb-1">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={newMember.email}
                  onChange={e => setNewMember({...newMember, email: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 p-3 text-sm text-white focus:border-brand-gold outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-black text-white/40 block mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={newMember.fullName}
                  onChange={e => setNewMember({...newMember, fullName: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 p-3 text-sm text-white focus:border-brand-gold outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-black text-white/40 block mb-1">Phone Number</label>
                <input 
                  type="tel" 
                  value={newMember.phoneNumber}
                  onChange={e => setNewMember({...newMember, phoneNumber: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 p-3 text-sm text-white focus:border-brand-gold outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-black text-white/40 block mb-1">Plan</label>
                  <select 
                    value={newMember.membershipType}
                    onChange={e => setNewMember({...newMember, membershipType: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 p-3 text-sm text-white focus:bg-zinc-900 outline-none"
                  >
                    <option value="quarterly" className="bg-white text-black">Quarterly</option>
                    <option value="yearly" className="bg-white text-black">Yearly</option>
                    <option value="none" className="bg-white text-black">None</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-black text-white/40 block mb-1">Auto-Activate</label>
                  <select 
                    value={newMember.isMember ? 'yes' : 'no'}
                    onChange={e => setNewMember({...newMember, isMember: e.target.value === 'yes', paymentStatus: e.target.value === 'yes' ? 'paid' : 'pending'})}
                    className="w-full bg-white/5 border border-white/10 p-3 text-sm text-white focus:bg-zinc-900 outline-none"
                  >
                    <option value="no" className="bg-white text-black">No (Pending)</option>
                    <option value="yes" className="bg-white text-black">Yes (Immediate)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-black text-white/40 block mb-1">System Role</label>
                  <select 
                    value={newMember.role}
                    onChange={e => setNewMember({...newMember, role: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 p-3 text-sm text-white focus:bg-zinc-900 outline-none"
                  >
                    <option value="member" className="bg-white text-black">Member</option>
                    <option value="admin" className="bg-white text-black">Admin</option>
                    <option value="partner" className="bg-white text-black">Partner</option>
                    <option value="affiliate" className="bg-white text-black">Affiliate</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-black text-white/40 block mb-1">Privileges</label>
                  <div className="flex items-center gap-2 mt-2">
                    <input 
                      type="checkbox"
                      id="new-free-life"
                      checked={newMember.isFreeMemberForLife}
                      onChange={e => setNewMember({...newMember, isFreeMemberForLife: e.target.checked})}
                      className="accent-brand-gold"
                    />
                    <label htmlFor="new-free-life" className="text-[10px] uppercase font-bold text-white/60">Free For Life</label>
                  </div>
                </div>
              </div>

              {newMember.role === 'admin' && (
                <div className="bg-brand-gold/5 border border-brand-gold/20 p-4 space-y-3">
                  <p className="text-[9px] uppercase font-black text-brand-gold tracking-widest border-b border-brand-gold/20 pb-2">Admin Permissions</p>
                  <div className="grid grid-cols-2 gap-2">
                    {['dashboard', 'members', 'content', 'orders', 'products', 'moderation', 'settings'].map(perm => (
                      <label key={perm} className="flex items-center gap-2 cursor-pointer group">
                        <input 
                          type="checkbox"
                          checked={newMember.adminPermissions.includes(perm)}
                          onChange={() => {
                            const current = [...newMember.adminPermissions];
                            const updated = current.includes(perm) ? current.filter(p => p !== perm) : [...current, perm];
                            setNewMember({...newMember, adminPermissions: updated});
                          }}
                          className="accent-brand-gold"
                        />
                        <span className="text-[9px] uppercase font-bold text-white/50 group-hover:text-white transition-colors">{perm}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              <button type="submit" className="w-full bg-brand-gold text-brand-black p-4 font-black uppercase text-xs tracking-widest hover:bg-white transition-all">
                Add To Community
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="px-4 py-3 border-b border-white/10 text-xs font-black uppercase tracking-wider text-white">Member Identity</th>
              <th className="px-4 py-3 border-b border-white/10 text-xs font-black uppercase tracking-wider text-white">Tier / Role</th>
              <th className="px-4 py-3 border-b border-white/10 text-xs font-black uppercase tracking-wider text-white">Status Flags</th>
              <th className="px-4 py-3 border-b border-white/10 text-xs font-black uppercase tracking-wider text-white">Activation Status</th>
              <th className="px-4 py-3 border-b border-white/10 text-xs font-black uppercase tracking-wider text-white">Params</th>
              <th className="px-4 py-3 border-b border-white/10 text-xs font-black uppercase tracking-wider text-white">Actions</th>
            </tr>
          </thead>
          <tbody className="text-[11px] font-mono text-white/70">
            {filteredUsers.map(user => {
              const worksReferral = true;
              const isEditing = editingId === user.id;
              const isAwaiting = user.paymentStatus === 'awaiting_approval';

              return (
                <tr key={user.id} className={`hover:bg-white/5 border-b border-white/5 ${isAwaiting ? 'bg-brand-gold/5' : ''}`}>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="block font-bold text-white">{user.email}</span>
                      {user.isDemo && (
                        <span className="bg-brand-gold/10 text-brand-gold text-[8px] font-black uppercase px-1 rounded-[2px] border border-brand-gold/30">DEMO</span>
                      )}
                    </div>
                    <span className="text-[9px] text-white/30 truncate block max-w-[120px]">{user.id}</span>
                  </td>
                  <td className="px-4 py-3 text-white/50 uppercase whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <span className={`px-2 py-0.5 rounded-[2px] text-[9px] font-black w-fit ${user.membershipType === 'yearly' ? 'bg-brand-gold text-brand-black' : 'bg-white/10 text-white/60'}`}>
                        {user.membershipType || 'None'}
                      </span>
                      <span className={`px-2 py-0.5 rounded-[2px] text-[8px] font-black w-fit uppercase ${user.role === 'admin' ? 'bg-red-500 text-white' : 'bg-blue-500/20 text-blue-400'}`}>
                        {user.role}
                      </span>
                    </div>
                  </td>
                  
                  <td className="px-4 py-3">
                    <div className="flex gap-2 items-center">
                      {user.proofOfPaymentUrl && (
                        <a 
                          href={user.proofOfPaymentUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="group relative block w-8 h-8 bg-white/5 border border-white/10 overflow-hidden"
                        >
                          <img 
                            src={user.proofOfPaymentUrl} 
                            alt="Proof" 
                            className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                          />
                        </a>
                      )}
                      {user.isFreeMemberForLife && (
                        <span className="bg-emerald-500/10 text-emerald-400 text-[8px] font-black uppercase px-2 py-1 border border-emerald-500/30 rounded">Free For Life</span>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      <span className="block font-sans font-bold text-xs">
                        {user.isMember ? (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 size={10} /> Active
                          </span>
                        ) : isAwaiting ? (
                          <span className="text-brand-gold flex items-center gap-1 animate-pulse">
                            <Clock size={10} /> Awaiting Approval
                          </span>
                        ) : (
                          <span className="text-white/40 flex items-center gap-1">
                            <Clock size={10} /> Pending
                          </span>
                        )}
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    {isEditing ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-1">
                          <label className="text-[8px] uppercase text-white/40 block">Commission %:</label>
                          <input 
                            type="number" 
                            value={editForm.customCommissionPercentage}
                            onChange={(e) => setEditForm({...editForm, customCommissionPercentage: Number(e.target.value)})}
                            className="w-12 bg-black text-brand-gold border border-white/20 p-1 text-center font-bold outline-none"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                           <input 
                            type="checkbox" 
                            checked={editForm.isFreeMemberForLife}
                            onChange={(e) => setEditForm({...editForm, isFreeMemberForLife: e.target.checked})}
                            id={`free-life-${user.id}`}
                          />
                          <label htmlFor={`free-life-${user.id}`} className="text-[8px] uppercase text-white font-bold cursor-pointer">Free For Life</label>
                        </div>
                        <div>
                          <label className="text-[8px] uppercase text-white/40 block mb-1">Role:</label>
                          <select 
                            value={editForm.role}
                            onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                            className="bg-black text-[10px] text-white border border-white/20 p-1 w-full outline-none"
                          >
                            <option value="member">Member</option>
                            <option value="affiliate">Affiliate</option>
                            <option value="partner">Partner</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>
                        {editForm.role === 'admin' && (
                          <div>
                            <label className="text-[8px] uppercase text-white/40 block mb-1">Permissions:</label>
                            <div className="grid grid-cols-2 gap-1 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                              {['all_access', 'orders', 'products', 'members', 'content', 'payouts', 'settings', 'moderation'].map(p => (
                                <button
                                  key={p}
                                  type="button"
                                  onClick={() => togglePermission(p)}
                                  className={`text-[7px] uppercase font-bold py-1 px-1 border transition-all ${editForm.adminPermissions.includes(p) ? 'bg-brand-gold text-brand-black border-brand-gold' : 'border-white/10 text-white/40'}`}
                                >
                                  {p.replace('_', ' ')}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <span className="text-brand-gold/80 block font-bold">
                          Commission: {user.customCommissionPercentage || 20}%
                        </span>
                        {user.role === 'admin' && user.adminPermissions && user.adminPermissions.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                             {user.adminPermissions.map((p: string) => (
                               <span key={p} className="text-[7px] bg-white/5 text-white/60 px-1 border border-white/10 rounded uppercase">{p.replace('_', ' ')}</span>
                             ))}
                          </div>
                        )}
                      </div>
                    )}
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <button
                          onClick={() => handleSaveCustomConfigs(user.id)}
                          className="bg-brand-gold text-brand-black px-2 py-1 font-black uppercase text-[9px] flex items-center gap-1 hover:bg-white transition-colors"
                        >
                          <Save size={10} /> Save
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleStartEdit(user)}
                            className="bg-white/10 text-white hover:bg-brand-gold hover:text-brand-black px-2 py-1 font-black uppercase text-[9px] transition-colors"
                          >
                            Edit Params
                          </button>
                          <button 
                            onClick={() => {
                              startImpersonation(user);
                              navigate("/member-dashboard");
                            }}
                            className="bg-brand-gold text-brand-black hover:bg-white px-2 py-1 font-black uppercase text-[9px] flex items-center gap-1 transition-colors font-bold"
                            title="Access this member's dashboard and account"
                          >
                            <ExternalLink size={10} /> Access Account
                          </button>
                        </div>
                      )}

                      {!user.isMember && (
                        <div className="flex gap-1">
                          <button 
                            onClick={() => approveMembership(user)}
                            className="bg-emerald-600 text-white px-2 py-1 font-black uppercase text-[9px] hover:bg-emerald-500 transition-all flex items-center gap-1"
                          >
                            <Check size={10} /> {isAwaiting ? 'Approve' : 'Activate'}
                          </button>
                          {isAwaiting && (
                            <button 
                              onClick={() => rejectMembership(user.id)}
                              className="bg-brand-red text-white px-2 py-1 font-black uppercase text-[9px] hover:bg-white hover:text-brand-red transition-all flex items-center gap-1"
                            >
                              <Trash2 size={10} /> Reject
                            </button>
                          )}
                        </div>
                      )}

                      <button 
                        onClick={() => deleteUser(user.id)}
                        className={`px-2 py-1 font-black uppercase text-[9px] transition-colors ${
                          confirmDeleteUserId === user.id 
                          ? "bg-brand-red text-white animate-pulse" 
                          : "bg-red-950/40 text-red-300 hover:text-red-200"
                        }`}
                      >
                        {confirmDeleteUserId === user.id ? "Confirm?" : "Delete"}
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
