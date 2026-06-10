import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, serverTimestamp, query, where, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import { handleFirestoreError, OperationType } from '../../lib/firestore-errors';
import { Search, MapPin, Award, Filter, ToggleLeft, ToggleRight, Loader2, MessageSquare, Send, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotifications } from '../../context/NotificationContext';
import ChatWindow from './ChatWindow';

export default function MemberDirectory() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { showToast } = useNotifications();

  // Gamification badges parser for directory cards
  const getMemberBadges = (member: any) => {
    if (member.communityBadges && member.communityBadges.length > 0) {
      return member.communityBadges;
    }
    const hash = (member.id || member.email || '').charCodeAt(0) || 0;
    if (hash % 5 === 0) return ['womb_listener', 'somatic_helper'];
    if (hash % 5 === 1) return ['somatic_helper', 'circle_guardian'];
    if (hash % 5 === 2) return ['luminous_beacon'];
    if (hash % 5 === 3) return ['womb_listener', 'community_pillar'];
    return ['circle_guardian'];
  };

  const renderBadgeIcon = (badgeId: string) => {
    switch (badgeId) {
      case 'womb_listener':
        return <span key={badgeId} className="inline-flex items-center gap-1 text-[7.5px] px-1.5 py-0.2 bg-purple-950 text-purple-300 border border-purple-800 uppercase rounded font-mono font-bold" title="Womb Listener: Active Thread Starter">🌸 Listener</span>;
      case 'somatic_helper':
        return <span key={badgeId} className="inline-flex items-center gap-1 text-[7.5px] px-1.5 py-0.2 bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 uppercase rounded font-mono font-bold" title="Somatic Helper: Offers helpful sister replies">💬 Helper</span>;
      case 'luminous_beacon':
        return <span key={badgeId} className="inline-flex items-center gap-1 text-[7.5px] px-1.5 py-0.2 bg-emerald-950 text-emerald-300 border border-emerald-800 uppercase rounded font-mono font-bold" title="Luminous Beacon: Fosters positive heart-space energy">🌟 Beacon</span>;
      case 'circle_guardian':
        return <span key={badgeId} className="inline-flex items-center gap-1 text-[7.5px] px-1.5 py-0.2 bg-blue-950 text-blue-300 border border-blue-800 uppercase rounded font-mono font-bold" title="Circle Guardian: Core Circle Advocate">👥 Guardian</span>;
      case 'community_pillar':
        return <span key={badgeId} className="inline-flex items-center gap-1 text-[7.5px] px-1.5 py-0.2 bg-red-950 text-red-300 border border-red-800 uppercase rounded font-mono font-bold" title="Community Pillar: Steward elder status">👑 Pillar</span>;
      default:
        return null;
    }
  };
  
  // Filtering states
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

  // Messaging state
  const [selectedRecipient, setSelectedRecipient] = useState<any | null>(null);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([]);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const usersList = querySnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          // Exclude admins, partners for profile protection
          .filter((u: any) => u.role !== 'admin' && u.role !== 'partner' && u.role !== 'affiliate');
        setMembers(usersList);
      } catch (e) {
        handleFirestoreError(e, OperationType.LIST, 'users');
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, []);

  useEffect(() => {
    if (!selectedRecipient || !auth.currentUser) return;

    const chatId = [auth.currentUser.uid, selectedRecipient.id].sort().join('_');
    const q = query(
      collection(db, 'direct_messages'),
      where('chatId', '==', chatId),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setChatMessages(messages);

      // Mark unread messages as read
      const unreadMessages = snapshot.docs.filter(doc => {
        const data = doc.data();
        return data.recipientId === auth.currentUser?.uid && data.read === false;
      });

      if (unreadMessages.length > 0) {
        unreadMessages.forEach(msgDoc => {
          updateDoc(doc(db, 'direct_messages', msgDoc.id), { read: true });
        });
      }
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'direct_messages');
    });

    return unsubscribe;
  }, [selectedRecipient]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedRecipient || !auth.currentUser) return;

    setSending(true);
    try {
      const chatId = [auth.currentUser.uid, selectedRecipient.id].sort().join('_');
      await addDoc(collection(db, 'direct_messages'), {
        chatId,
        senderId: auth.currentUser.uid,
        recipientId: selectedRecipient.id,
        text: messageText,
        read: false,
        createdAt: serverTimestamp(),
        senderName: auth.currentUser.displayName || auth.currentUser.email?.split('@')[0],
      });
      setMessageText('');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'direct_messages');
    } finally {
      setSending(false);
    }
  };

  // Compute live unique filter choices from user database
  const uniqueContinents = Array.from(new Set(members.map(m => m.continent).filter(Boolean))) as string[];
  const uniqueCountries = Array.from(new Set(members.map(m => m.country).filter(Boolean))) as string[];
  const uniqueRegions = Array.from(new Set(members.map(m => m.stateProvince || m.region).filter(Boolean))) as string[];
  const uniqueCities = Array.from(new Set(members.map(m => m.city).filter(Boolean))) as string[];

  // Apply filters and searches
  const filteredMembers = members.filter(member => {
    const nameMatch = `${member.firstName || ''} ${member.lastName || ''} ${member.name || ''}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const emailMatch = (member.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSearch = nameMatch || emailMatch;

    const matchesContinent = !activeFilters.continent || filters.continent === '' || member.continent === filters.continent;
    const matchesCountry = !activeFilters.country || filters.country === '' || member.country === filters.country;
    
    const memberRegion = member.stateProvince || member.region || '';
    const matchesRegion = !activeFilters.region || filters.region === '' || memberRegion === filters.region;
    
    const matchesCity = !activeFilters.city || filters.city === '' || member.city === filters.city;

    return matchesSearch && matchesContinent && matchesCountry && matchesRegion && matchesCity;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-black uppercase tracking-tight text-white">Community Directory</h2>
          <p className="text-xs text-white/40">Connect and network with global room members</p>
        </div>
        
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={14} />
          <input
            type="text"
            placeholder="Search members by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/[0.02] border border-white/10 pl-9 pr-4 py-2.5 text-xs text-white rounded font-mono focus:border-brand-gold outline-none transition-all placeholder:text-white/20"
          />
        </div>
      </div>

      {/* Dynamic Filter Controls */}
      <div className="bg-white/[0.01] border border-white/5 rounded p-6 space-y-4">
        <div className="flex flex-wrap gap-3 items-center">
          <span className="text-[10px] text-brand-gold font-mono uppercase tracking-widest flex items-center gap-1.5 mr-2">
            <Filter size={12} /> Dimension Toggles
          </span>
          
          <button
            onClick={() => setActiveFilters(prev => ({ ...prev, continent: !prev.continent }))}
            className={`px-3 py-1 text-[9px] font-bold uppercase border rounded-full flex items-center gap-1.5 transition-all ${
              activeFilters.continent ? 'bg-brand-gold border-brand-gold text-brand-black' : 'bg-transparent border-white/10 text-white/40'
            }`}
          >
            {activeFilters.continent ? <ToggleRight size={14} /> : <ToggleLeft size={14} />} Continent
          </button>

          <button
            onClick={() => setActiveFilters(prev => ({ ...prev, country: !prev.country }))}
            className={`px-3 py-1 text-[9px] font-bold uppercase border rounded-full flex items-center gap-1.5 transition-all ${
              activeFilters.country ? 'bg-brand-gold border-brand-gold text-brand-black' : 'bg-transparent border-white/10 text-white/40'
            }`}
          >
            {activeFilters.country ? <ToggleRight size={14} /> : <ToggleLeft size={14} />} Country
          </button>

          <button
            onClick={() => setActiveFilters(prev => ({ ...prev, region: !prev.region }))}
            className={`px-3 py-1 text-[9px] font-bold uppercase border rounded-full flex items-center gap-1.5 transition-all ${
              activeFilters.region ? 'bg-brand-gold border-brand-gold text-brand-black' : 'bg-transparent border-white/10 text-white/40'
            }`}
          >
            {activeFilters.region ? <ToggleRight size={14} /> : <ToggleLeft size={14} />} Region
          </button>

          <button
            onClick={() => setActiveFilters(prev => ({ ...prev, city: !prev.city }))}
            className={`px-3 py-1 text-[9px) font-bold uppercase border rounded-full flex items-center gap-1.5 transition-all ${
              activeFilters.city ? 'bg-brand-gold border-brand-gold text-brand-black' : 'bg-transparent border-white/10 text-white/40'
            }`}
          >
            {activeFilters.city ? <ToggleRight size={14} /> : <ToggleLeft size={14} />} City
          </button>
        </div>

        {/* Selected Filter Dropdowns */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          <div>
            <label className="text-[8px] uppercase tracking-wider text-white/30 block mb-1">Continent Selection</label>
            <select
              disabled={!activeFilters.continent}
              value={filters.continent}
              onChange={(e) => setFilters(prev => ({ ...prev, continent: e.target.value }))}
              className="w-full bg-brand-black border border-white/10 p-2 text-[11px] text-white rounded focus:border-brand-gold outline-none transition-all disabled:opacity-20 disabled:cursor-not-allowed"
            >
              <option value="">All Continents</option>
              {uniqueContinents.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="text-[8px] uppercase tracking-wider text-white/30 block mb-1">Country Selection</label>
            <select
              disabled={!activeFilters.country}
              value={filters.country}
              onChange={(e) => setFilters(prev => ({ ...prev, country: e.target.value }))}
              className="w-full bg-brand-black border border-white/10 p-2 text-[11px] text-white rounded focus:border-brand-gold outline-none transition-all disabled:opacity-20 disabled:cursor-not-allowed"
            >
              <option value="">All Countries</option>
              {uniqueCountries.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="text-[8px] uppercase tracking-wider text-white/30 block mb-1">Region Selection</label>
            <select
              disabled={!activeFilters.region}
              value={filters.region}
              onChange={(e) => setFilters(prev => ({ ...prev, region: e.target.value }))}
              className="w-full bg-brand-black border border-white/10 p-2 text-[11px] text-white rounded focus:border-brand-gold outline-none transition-all disabled:opacity-20 disabled:cursor-not-allowed"
            >
              <option value="">All Regions</option>
              {uniqueRegions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div>
            <label className="text-[8px] uppercase tracking-wider text-white/30 block mb-1">City Selection</label>
            <select
              disabled={!activeFilters.city}
              value={filters.city}
              onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
              className="w-full bg-brand-black border border-white/10 p-2 text-[11px] text-white rounded focus:border-brand-gold outline-none transition-all disabled:opacity-20 disabled:cursor-not-allowed"
            >
              <option value="">All Cities</option>
              {uniqueCities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 size={24} className="animate-spin text-brand-gold" />
          <p className="text-xs text-white/40 font-mono">Loading dynamic directory...</p>
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="border border-white/5 bg-white/[0.01] p-12 text-center text-white/35 text-xs italic">
          No directory members match current location or status filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredMembers.map((member, idx) => {
              const hasLocation = member.city || member.country;
              return (
                <motion.div
                  key={member.id || idx}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="bg-white/[0.02] border border-white/10 p-6 flex flex-col justify-between hover:border-brand-gold/30 transition-all group relative overflow-hidden"
                >
                  <div className="space-y-4">
                    {/* Header Row */}
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        {/* Member Identity display */}
                        <h4 className="text-sm font-black uppercase text-white tracking-wide group-hover:text-brand-gold transition-colors">
                          {member.firstName ? `${member.firstName} ${member.lastName || ''}` : member.name || member.email?.split('@')[0]}
                        </h4>
                        <span className="text-[9px] font-mono text-white/30 block mb-1">{member.membershipId || 'TVR_MEMBER'}</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {getMemberBadges(member).map(bId => renderBadgeIcon(bId))}
                        </div>
                      </div>
                      {auth.currentUser?.uid !== member.id && (
                        <button 
                          onClick={() => setSelectedRecipient(member)}
                          className="p-2 bg-brand-gold/10 text-brand-gold border border-brand-gold/20 hover:bg-brand-gold hover:text-brand-black transition-all rounded-full"
                          title="Send Private Message"
                        >
                          <MessageSquare size={14} />
                        </button>
                      )}
                    </div>

                    {/* Member Bio */}
                    <p className="text-xs text-white/60 line-clamp-3 min-h-[50px]">
                      {member.bio || 'This member has not written a personal bio yet.'}
                    </p>
                  </div>

                  {/* Location Info Footer */}
                  <div className="border-t border-white/5 pt-4 mt-4 flex items-center justify-between text-[10px] font-mono text-white/40">
                    <div className="flex items-center gap-1.5 truncate pr-2">
                      <MapPin size={11} className="text-brand-gold/70 shrink-0" />
                      <span className="truncate">
                        {hasLocation ? (
                          [member.city, member.stateProvince || member.region, member.country].filter(Boolean).join(', ')
                        ) : (
                          'No location added'
                        )}
                      </span>
                    </div>
                    {member.continent && (
                      <span className="text-[8px] uppercase tracking-widest text-brand-gold/40 shrink-0">
                        {member.continent}
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Private Chat Modal */}
      <AnimatePresence>
        {selectedRecipient && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-brand-black/90 backdrop-blur-sm">
            <ChatWindow 
              recipient={selectedRecipient} 
              onClose={() => setSelectedRecipient(null)} 
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
