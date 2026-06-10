import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../lib/firebase';
import { collection, getDocs, addDoc, updateDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { 
  MessageSquare, 
  Send, 
  Heart, 
  Sparkle, 
  Users, 
  AlertTriangle, 
  Radio, 
  Bell, 
  Award, 
  Share2, 
  ShieldAlert, 
  UserPlus, 
  Plus, 
  X, 
  Check, 
  BookOpen, 
  ChevronRight, 
  Calendar, 
  Clock, 
  HeartHandshake,
  Search,
  Flag,
  Copy,
  Lock,
  Trophy
} from 'lucide-react';
import MemberDirectory from './dashboard/MemberDirectory';
import CommunityLeaderboard from './dashboard/CommunityLeaderboard';
import { useAuth } from '../context/AuthContext';
import { useContent, FALLBACK_DEFAULTS } from '../context/ContentContext';

// Types
interface FeedPost {
  id: string;
  category: 'Wellness Tip' | 'Member Experience' | 'Dr. FID Update' | 'Highlight' | 'Reflections';
  author: string;
  authorRank?: string;
  title: string;
  content: string;
  date: string;
  likes: number;
  likedByUser: boolean;
  comments: { author: string; content: string; date: string }[];
}

interface DiscussionGroup {
  id: string;
  name: string;
  slug: string;
  description: string;
  membersCount: number;
  highlightText: string;
  conversations: { author: string; role: string; content: string; time: string }[];
}

export default function CommunityHub() {
  const { user, userData } = useAuth();
  const { content } = useContent();
  const [unlockedBadgeToast, setUnlockedBadgeToast] = useState<{ title: string; desc: string } | null>(null);

  const badgesConfig = React.useMemo(() => {
    try {
      return JSON.parse(content.badgesConfigJson || FALLBACK_DEFAULTS.badgesConfigJson);
    } catch (e) {
      return [
        { "id": "womb_listener", "title": "🌸 Womb Listener", "desc": "Active Thread Starter", "criteria": "Draft 1+ post onto the global Community Timeline." },
        { "id": "somatic_helper", "title": "💬 Somatic Helper", "desc": "Sisterhood Guidance", "criteria": "Write 1+ helpful reply or thread comment inside discussion circles." },
        { "id": "luminous_beacon", "title": "🌟 Luminous Beacon", "desc": "Atmospheric Support", "criteria": "Glow 3+ support hearts to sisters across timeline feeds." },
        { "id": "circle_guardian", "title": "👥 Circle Guardian", "desc": "Circle Pioneer", "criteria": "Be an active sibling inside 2+ specialized discussion groups." },
        { "id": "community_pillar", "title": "👑 Community Pillar", "desc": "Steward-Mentor Rank", "criteria": "Accumulate a total of 50+ holistic contribution points." }
      ];
    }
  }, [content.badgesConfigJson]);
  
  // States
  const [activeTab, setActiveTab] = useState<'feed' | 'groups' | 'achievements' | 'announcements' | 'values' | 'directory'>('feed');
  const [successToast, setSuccessToast] = useState('');
  const [postSearch, setPostSearch] = useState('');
  
  // Gamification States
  const [points, setPoints] = useState(0);
  const [postCount, setPostCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [circleCount, setCircleCount] = useState(1); // Pre-seed 1 joined group circle
  const [likesCount, setLikesCount] = useState(0);
  const [badges, setBadges] = useState<string[]>([]);
  
  // Comment draft values map with expanded keys
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  
  // Interactive Modals
  const [showPostModal, setShowPostModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showFlagModal, setShowFlagModal] = useState(false);
  
  // Custom Post Form State
  const [newPostCategory, setNewPostCategory] = useState<FeedPost['category']>('Member Experience');
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  
  // Flags Modal Support
  const [targetFlagItem, setTargetFlagItem] = useState('');
  const [flagReason, setFlagReason] = useState('Off-topic or inappropriate language');
  
  // Invitation Support
  const [inviteEmail, setInviteEmail] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Pre-seed 📰 Community Feed state
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  const fetchPosts = async () => {
    try {
      const q = query(collection(db, 'community_threads'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const fetchedPosts = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FeedPost[];
      setPosts(fetchedPosts);
    } catch (err) {
      console.error("Failed to load community threads", err);
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Gamification sync effect (Firestore or LocalStorage backup)
  useEffect(() => {
    if (user && userData) {
      setPoints(userData.communityPoints || 0);
      setPostCount(userData.communityPostCount || 0);
      setCommentCount(userData.communityCommentCount || 0);
      setCircleCount(userData.communityCircleCount || 1);
      setLikesCount(userData.communityLikesCount || 0);
      setBadges(userData.communityBadges || []);
    } else {
      const saved = localStorage.getItem('tvr_gamification');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setPoints(parsed.points || 0);
          setPostCount(parsed.postCount || 0);
          setCommentCount(parsed.commentCount || 0);
          setCircleCount(parsed.circleCount !== undefined ? parsed.circleCount : 1);
          setLikesCount(parsed.likesCount || 0);
          setBadges(parsed.badges || []);
        } catch (e) {
          console.warn("Parsing local gamification stats failed", e);
        }
      }
    }
  }, [user, userData]);

  const awardPointsAndCheckBadges = async (
    action: 'create_post' | 'create_comment' | 'join_circle' | 'like_post',
    payloadModifier?: { isJoin: boolean }
  ) => {
    let ptsGained = 0;
    let newPostCount = postCount;
    let newCommentCount = commentCount;
    let newCircleCount = circleCount;
    let newLikesCount = likesCount;

    if (action === 'create_post') {
      ptsGained = 15;
      newPostCount = postCount + 1;
    } else if (action === 'create_comment') {
      ptsGained = 10;
      newCommentCount = commentCount + 1;
    } else if (action === 'join_circle') {
      ptsGained = 5;
      if (payloadModifier?.isJoin) {
        newCircleCount = circleCount + 1;
      } else {
        newCircleCount = Math.max(0, circleCount - 1);
      }
    } else if (action === 'like_post') {
      ptsGained = 2;
      newLikesCount = likesCount + 1;
    }

    const newPoints = points + ptsGained;
    
    // Check badge eligibility
    const newBadges = [...badges];
    const unlockedNow: string[] = [];

    if (newPostCount >= 1 && !newBadges.includes('womb_listener')) {
      newBadges.push('womb_listener');
      unlockedNow.push('womb_listener');
    }
    if (newCommentCount >= 1 && !newBadges.includes('somatic_helper')) {
      newBadges.push('somatic_helper');
      unlockedNow.push('somatic_helper');
    }
    if (newLikesCount >= 3 && !newBadges.includes('luminous_beacon')) {
      newBadges.push('luminous_beacon');
      unlockedNow.push('luminous_beacon');
    }
    if (newCircleCount >= 2 && !newBadges.includes('circle_guardian')) {
      newBadges.push('circle_guardian');
      unlockedNow.push('circle_guardian');
    }
    if (newPoints >= 50 && !newBadges.includes('community_pillar')) {
      newBadges.push('community_pillar');
      unlockedNow.push('community_pillar');
    }

    // Trigger state changes
    setPoints(newPoints);
    setPostCount(newPostCount);
    setCommentCount(newCommentCount);
    setCircleCount(newCircleCount);
    setLikesCount(newLikesCount);
    setBadges(newBadges);

    // Trigger toast notification for newly unlocked badges
    if (unlockedNow.length > 0) {
      unlockedNow.forEach((badgeId) => {
        const badgeDef = badgesConfig.find((b: any) => b.id === badgeId);
        if (badgeDef) {
          setUnlockedBadgeToast({
            title: badgeDef.title,
            desc: badgeDef.desc
          });
          // Clear after 6 seconds
          setTimeout(() => {
            setUnlockedBadgeToast(null);
          }, 6000);
        }
      });
    }

    // Save
    if (user) {
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          communityPoints: newPoints,
          communityPostCount: newPostCount,
          communityCommentCount: newCommentCount,
          communityCircleCount: newCircleCount,
          communityLikesCount: newLikesCount,
          communityBadges: newBadges
        });
      } catch (err) {
        console.error("Failed to sync stats to Firestore", err);
      }
    } else {
      localStorage.setItem('tvr_gamification', JSON.stringify({
        points: newPoints,
        postCount: newPostCount,
        commentCount: newCommentCount,
        circleCount: newCircleCount,
        likesCount: newLikesCount,
        badges: newBadges
      }));
    }

    if (unlockedNow.length > 0) {
      const badgeNamesMap: Record<string, string> = {
        womb_listener: '🌸 Womb Listener',
        somatic_helper: '💬 Somatic Helper',
        luminous_beacon: '🌟 Luminous Beacon',
        circle_guardian: '👥 Circle Guardian',
        community_pillar: '👑 Community Pillar'
      };
      
      unlockedNow.forEach(id => {
        triggerToast(`🏆 ACHIEVEMENT UNLOCKED: Earned the "${badgeNamesMap[id]}" profile badge!`);
      });
    }
  };

  const getAuthorBadges = (authorName: string) => {
    const currentUserName = user?.displayName || user?.email?.split('@')[0] || '';
    if (authorName === currentUserName || authorName === 'Sister Support') {
      return badges;
    }
    if (authorName === 'Precious H.') return ['somatic_helper', 'circle_guardian'];
    if (authorName === 'Chidi-Chiege') return ['womb_listener', 'somatic_helper', 'community_pillar'];
    if (authorName === 'Sonia E.') return ['luminous_beacon'];
    return [];
  };

  const renderBadgeIcon = (badgeId: string) => {
    switch (badgeId) {
      case 'womb_listener':
        return <span key={badgeId} className="inline-flex items-center gap-1 text-[8px] px-1.5 py-0.5 bg-purple-950 text-purple-300 border border-purple-800 uppercase rounded font-mono font-bold" title="Womb Listener: Active Thread Starter">🌸 Listener</span>;
      case 'somatic_helper':
        return <span key={badgeId} className="inline-flex items-center gap-1 text-[8px] px-1.5 py-0.5 bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 uppercase rounded font-mono font-bold" title="Somatic Helper: Offers helpful sister replies">💬 Helper</span>;
      case 'luminous_beacon':
        return <span key={badgeId} className="inline-flex items-center gap-1 text-[8px] px-1.5 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 uppercase rounded font-mono font-bold" title="Luminous Beacon: Fosters positive heart-space energy">🌟 Beacon</span>;
      case 'circle_guardian':
        return <span key={badgeId} className="inline-flex items-center gap-1 text-[8px] px-1.5 py-0.5 bg-blue-950 text-blue-300 border border-blue-800 uppercase rounded font-mono font-bold" title="Circle Guardian: Core Discussion Circle Member">👥 Guardian</span>;
      case 'community_pillar':
        return <span key={badgeId} className="inline-flex items-center gap-1 text-[8px] px-1.5 py-0.5 bg-red-950 text-red-300 border border-red-800 uppercase rounded font-mono font-bold" title="Community Pillar: High holistic contribution score">👑 Pillar</span>;
      default:
        return null;
    }
  };

  // Pre-seed 👥 Discussion Groups state
  const [joinedGroups, setJoinedGroups] = useState<string[]>(['fertility', 'menstrual']);
  const [activeGroupSlugs, setActiveGroupSlugs] = useState<string | null>('fertility');
  const [groupMessage, setGroupMessage] = useState('');
  
  const [discussionGroups, setDiscussionGroups] = useState<DiscussionGroup[]>([
    {
      id: 'g-1',
      name: 'Fertility & TTC Support Circle',
      slug: 'fertility',
      description: 'A delicate holding space for tracking cycles, estimating sovereign ovulation periods, and botanical seed sharing.',
      membersCount: 148,
      highlightText: 'Discussing: Basal metabolic index patterns with Dr. FID manual',
      conversations: [
        { author: 'Precious H.', role: 'Expert Practitioner', content: 'Make sure not to drink ice-water before mapping waking thermal baseline.', time: '10 mins ago' },
        { author: 'Sonia E.', role: 'Member', content: 'Yes, I noticed a 0.2-degree shift when I avoided cold fluids!', time: '5 mins ago' }
      ]
    },
    {
      id: 'g-2',
      name: 'Menstrual Health Discussions',
      slug: 'menstrual',
      description: 'Navigating congestion, easing cramps naturally, cyclic sync templates, and discussing steam preparation formulations.',
      membersCount: 230,
      highlightText: 'Discussing: Chamomile and marigold infusion ratios',
      conversations: [
        { author: 'Chidi-Chiege', role: 'Ambassador', content: 'Three tablespoons of botanical infusion into hot mist works incredibly.', time: '1 hour ago' }
      ]
    },
    {
      id: 'g-3',
      name: 'Hormonal Balance & Wellness',
      slug: 'hormonal',
      description: 'Navigating estrogen-progesterone balancing scales, coping with stress-induced cycles, and glandular support.',
      membersCount: 182,
      highlightText: 'Discussing: Evening rose oils for cortisol dampening',
      conversations: []
    },
    {
      id: 'g-4',
      name: 'Pregnancy & Postpartum Care',
      slug: 'pregnancy',
      description: 'Sacred pre-natal exercise matrices, postpartum recovery, sister-doula checklists, and womb tone recovery.',
      membersCount: 94,
      highlightText: 'Discussing: Pelvic floor pelvic-resting parameters',
      conversations: []
    },
    {
      id: 'g-5',
      name: 'Emotional Healing & Wellness',
      slug: 'emotional',
      description: 'An safe space dedicated to processing cyclic grief, ancestral somatic therapy, clearing blockages, and meditation rules.',
      membersCount: 111,
      highlightText: 'Discussing: Breath retention times for pelvic vagus node resonance',
      conversations: []
    },
    {
      id: 'g-6',
      name: 'General Women’s Health Talks',
      slug: 'general_health',
      description: 'Everyday holistic wellness, questions on anatomical diagrams, check-up standards, and Dr. FID bulletin comments.',
      membersCount: 312,
      highlightText: 'Discussing: General annual somatic scans expectation timeline',
      conversations: []
    }
  ]);

  // Pre-seed 📢 Announcements list
  const announcements = [
    {
      id: 'ann-1',
      title: '🔴 Live Q&A Stream: Hormonal Balance Protocols',
      category: 'Webinar & Streaming',
      date: 'Next Friday, 19:00 UTC',
      content: 'Join Dr. FID and holistic sister educators live inside our community stream. We will break down herbal tincture ratios, cycle lengths, and take interactive wellness questions. Priority register passes are auto-applied for active members.'
    },
    {
      id: 'ann-2',
      title: '📦 Summer Botanical Release & Cart Discounts',
      category: 'Program Updates',
      date: 'Just Released',
      content: 'Our co-operative organic farmers have updated physical inventory stocks. View dry botanical compresses, pelvic-herbal mist packages, and womb massage oils. Tap your active 15% discount coupon on the shop layout!'
    },
    {
      id: 'ann-3',
      title: '📜 Safe Community Guidelines Notice',
      category: 'Community Guidelines',
      date: 'Permanent Ledger',
      content: 'All communication inside our forums is strictly confidential. Screenshots or sharing of sibling personal reflections is forbidden. Keep comments evidence-informed, positive, and deeply respectful.'
    }
  ];

  // Helper actions
  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(''), 4000);
  };

  const handleLikePost = async (postId: string) => {
    try {
      const targetPost = posts.find(p => p.id === postId);
      if (!targetPost) return;

      const newLikes = targetPost.likedByUser ? targetPost.likes - 1 : targetPost.likes + 1;
      await updateDoc(doc(db, 'community_threads', postId), {
        likes: newLikes
      });
      
      // If liking a post (not unliking), award points
      if (!targetPost.likedByUser) {
        await awardPointsAndCheckBadges('like_post');
      }

      setPosts(prev => prev.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            likes: newLikes,
            likedByUser: !p.likedByUser
          };
        }
        return p;
      }));
    } catch (err) {
      console.error("Like post failed", err);
    }
  };

  const handleNewPostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      alert('Please fill out both the title and text content of your post.');
      return;
    }
    
    try {
      const newPostObj = {
        category: newPostCategory,
        author: user?.displayName || user?.email?.split('@')[0] || 'Sister Support',
        authorRank: 'Verified Member',
        title: newPostTitle,
        content: newPostContent,
        date: new Date().toLocaleDateString(),
        createdAt: serverTimestamp(),
        likes: 0,
        likedByUser: false,
        comments: []
      };

      await addDoc(collection(db, 'community_threads'), newPostObj);

      setNewPostTitle('');
      setNewPostContent('');
      setShowPostModal(false);
      triggerToast('📰 Your post was successfully compiled to the Community Feed!');
      
      // Award active participation points for posting!
      await awardPointsAndCheckBadges('create_post');

      fetchPosts();
    } catch (err) {
      console.error("Failed to compile post", err);
      triggerToast('Network error while posting.');
    }
  };

  const handleToggleGroupJoin = async (slug: string) => {
    const isJoined = joinedGroups.includes(slug);
    if (isJoined) {
      setJoinedGroups(prev => prev.filter(s => s !== slug));
      triggerToast('👥 Left discussion group circle.');
      await awardPointsAndCheckBadges('join_circle', { isJoin: false });
    } else {
      setJoinedGroups(prev => [...prev, slug]);
      triggerToast('🤝 Successfully joined discussion group circle!');
      await awardPointsAndCheckBadges('join_circle', { isJoin: true });
    }
  };

  const handlePostGroupMessage = async (e: React.FormEvent, slug: string) => {
    e.preventDefault();
    if (!groupMessage.trim()) return;

    setDiscussionGroups(prev => prev.map(group => {
      if (group.slug === slug) {
        return {
          ...group,
          conversations: [
            ...group.conversations,
            {
              author: user?.displayName || user?.email?.split('@')[0] || 'Sister Support',
              role: 'Member',
              content: groupMessage,
              time: 'Just now'
            }
          ]
        };
      }
      return group;
    }));

    setGroupMessage('');
    
    // Award helping others in discussions message points!
    await awardPointsAndCheckBadges('create_comment');
  };

  const handleAddComment = async (postId: string) => {
    const draft = commentDrafts[postId];
    if (!draft || !draft.trim()) return;

    try {
      const postRef = doc(db, 'community_threads', postId);
      const targetPost = posts.find(p => p.id === postId);
      if (!targetPost) return;

      const commenterName = user?.displayName || user?.email?.split('@')[0] || 'Sister Support';
      const newComment = {
        author: commenterName,
        content: draft,
        date: new Date().toLocaleDateString()
      };

      const updatedComments = [...targetPost.comments, newComment];
      await updateDoc(postRef, {
        comments: updatedComments
      });

      // Update state
      setPosts(prev => prev.map(p => {
        if (p.id === postId) {
          return { ...p, comments: updatedComments };
        }
        return p;
      }));

      // Flush draft
      setCommentDrafts(prev => ({ ...prev, [postId]: '' }));

      // Reward points!
      await awardPointsAndCheckBadges('create_comment');
      triggerToast('💬 Your reply was safely sent to this thread!');
    } catch (err) {
      console.error("Failed to add comment", err);
      triggerToast('Could not register your replies onto database.');
    }
  };

  const handleCopyInviteLink = () => {
    const inviteLink = `${window.location.origin}/register?ref=COMMUNITY-JOIN`;
    navigator.clipboard.writeText(inviteLink);
    setCopiedLink(true);
    triggerToast('🔗 Unique invitation code link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSendInviteEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    triggerToast(`✉️ Invitation request dispatch logged for ${inviteEmail}!`);
    setInviteEmail('');
    setShowInviteModal(false);
  };

  const handleTriggerFlag = (itemTitle: string) => {
    setTargetFlagItem(itemTitle);
    setShowFlagModal(true);
  };

  const submitFlagContent = (e: React.FormEvent) => {
    e.preventDefault();
    triggerToast(`🛡️ Ledger notice: Report submitted for review under "${targetFlagItem}".`);
    setShowFlagModal(false);
  };

  // Filter posts based on search field
  const filteredPosts = posts.filter(p => 
    p.title.toLowerCase().includes(postSearch.toLowerCase()) || 
    p.content.toLowerCase().includes(postSearch.toLowerCase()) ||
    p.category.toLowerCase().includes(postSearch.toLowerCase())
  );

  return (
    <div id="community-hub-root" className="space-y-8 selection:bg-brand-gold selection:text-brand-black text-white">

      {/* Embedded High-Fidelity Alert Dispatcher */}
      <AnimatePresence>
        {successToast && (
          <motion.div
            initial={{ opacity: 0, y: -25, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -25, scale: 0.95 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-auto md:right-8 z-[9999] p-3 bg-zinc-950 border border-brand-gold/40 text-brand-gold font-mono text-[9.5px] uppercase tracking-wider font-extrabold flex items-center gap-2.5 shadow-[0_15px_40px_rgba(0,0,0,0.8)] rounded-sm"
          >
            <Sparkle size={12} className="animate-spin text-brand-gold shrink-0" />
            <span>{successToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Real-time Achievement Badge Unlock Toast */}
      <AnimatePresence>
        {unlockedBadgeToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-[10000] max-w-sm p-5 bg-zinc-950 border border-brand-gold bg-gradient-to-br from-black via-zinc-950 to-brand-gold/10 text-left shadow-[0_15px_40px_rgba(212,175,55,0.15)] rounded-none space-y-2 select-none"
          >
            <div className="flex items-center gap-2 text-brand-gold font-mono text-[9px] uppercase tracking-[0.2em] font-black border-b border-brand-gold/25 pb-2">
              <Trophy size={13} className="animate-bounce" />
              <span>Somatic Badge Unlocked!</span>
            </div>
            <div>
              <h4 className="text-xs font-serif font-extrabold text-white uppercase tracking-wide">
                {unlockedBadgeToast.title}
              </h4>
              <p className="text-[10.5px] text-white/50 font-mono uppercase tracking-widest pt-0.5">
                {unlockedBadgeToast.desc}
              </p>
              <p className="text-[11px] text-[#D4AF37] font-sans font-light leading-relaxed pt-1.5 flex items-center gap-1">
                <Sparkle size={10} className="text-brand-gold shrink-0 animate-pulse" />
                Ready to pin on your profile canvas!
              </p>
            </div>
            <button
              onClick={() => setUnlockedBadgeToast(null)}
              className="absolute top-1.5 right-2 font-mono text-[8px] text-white/30 hover:text-white uppercase"
              type="button"
            >
              Close
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Spotlight Welcome Header containing elegant Cosmic theme styling */}
      <div className="p-8 md:p-12 bg-gradient-to-br from-zinc-950/95 via-[#110f0f] to-zinc-950 border border-white/5 relative overflow-hidden text-left rounded-none">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-gold/[0.03] blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-12 w-64 h-64 bg-[#6e1e1e]/[0.03] blur-[90px] rounded-full pointer-events-none" />
        
        <div className="max-w-3xl space-y-4">
          <div className="flex items-center gap-2 text-brand-gold font-mono text-[9px] uppercase tracking-[0.3em] font-semibold">
            <Radio size={11} className="animate-pulse" /> Sacred Sister Community Loop
          </div>
          <h1 className="text-3xl md:text-5xl font-serif tracking-tight font-light text-gradient-gold">
            🌸 Community Hub
          </h1>
          <p className="text-xs md:text-sm text-white/60 font-light leading-relaxed max-w-2xl font-sans">
            Connect, learn, and grow with other women. A secure somatic network for sharing cycle basals, pelvic wellness, experiences, and direct updates under Dr. FID guidance.
          </p>

          <div className="pt-2 flex flex-wrap gap-2.5 text-[8.5px] font-mono tracking-widest text-[#D4AF37] uppercase">
            <span className="px-2.5 py-1 bg-white/5 border border-white/10 text-white/50">Level Lock: Approved Active</span>
            <span className="px-2.5 py-1 bg-white/5 border border-brand-gold/20 text-brand-gold font-bold">100% Confidential Forums</span>
          </div>
        </div>
      </div>

      {/* Unified Tab Selector Navigation Panel */}
      <div className="flex flex-wrap border-b border-white/5 font-mono text-[9.5px] uppercase tracking-widest gap-2 sm:gap-4 justify-start">
        {[
          { id: 'feed', name: '📰 Feed & Activity' },
          { id: 'groups', name: '👥 Discussion Circles' },
          { id: 'achievements', name: '🏆 Sisterhood Badges' },
          { id: 'announcements', name: '📢 Bulletin Boards' },
          { id: 'values', name: '🌸 Sacred Values' },
          { id: 'directory', name: '🗺️ sister registry' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 border-b-2 px-2.5 font-bold transition-all ${
              activeTab === tab.id 
                ? 'border-brand-gold text-brand-gold' 
                : 'border-transparent text-white/45 hover:text-white'
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* Main Tab Render Container with motion transitions */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.2 }}
          className="space-y-8"
        >

          {/* TAB 1: 📰 FEED & ACTIVE FEED */}
          {activeTab === 'feed' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Feed items list (cols-8) */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* Search / Sort Field & Feed Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-zinc-950 p-4 border border-white/5 rounded-none text-left">
                  <div>
                    <h3 className="text-xs uppercase tracking-widest text-[#D4AF37] font-mono font-bold">Latest Timeline Feed</h3>
                    <p className="text-[9px] text-white/40 font-mono">Daily stream of insights, wellness tips, and sibling reviews.</p>
                  </div>
                  
                  {/* Search utility */}
                  <div className="relative w-full sm:w-60">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30" size={12} />
                    <input 
                      type="text" 
                      placeholder="Filter feeds by keyphrase..."
                      value={postSearch}
                      onChange={(e) => setPostSearch(e.target.value)}
                      className="w-full bg-[#121010] border border-white/10 pl-8 pr-3 py-1.5 font-mono text-[10px] text-white rounded-none focus:border-brand-gold outline-none placeholder:text-white/20"
                    />
                  </div>
                </div>

                {/* Feed posts loops */}
                {filteredPosts.length === 0 ? (
                  <div className="p-12 border border-white/5 bg-zinc-950 text-center text-xs italic text-white/30">
                    No feeds match your current filter sequence. Try searching for other wellness tags.
                  </div>
                ) : (
                  <div className="space-y-5">
                    {filteredPosts.map((post) => {
                      const isExpanded = !!expandedComments[post.id];
                      return (
                        <div 
                          key={post.id} 
                          className="bg-[#121010]/80 p-5 md:p-6 border border-white/10 text-left space-y-4 hover:border-brand-gold/30 transition-all rounded-none relative"
                        >
                          {/* Upper category handle tag */}
                          <div className="flex flex-wrap justify-between items-center gap-2 text-[10px] font-mono">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="px-2 py-0.5 bg-brand-gold/10 text-brand-gold border border-brand-gold/20 text-[8px] tracking-widest font-bold uppercase rounded-[1px]">
                                {post.category}
                              </span>
                              <span className="text-white/40">•</span>
                              <span className="text-white/60 font-semibold">{post.author}</span>
                              {post.authorRank && (
                                <span className="text-[8px] text-[#D4AF37]/50">({post.authorRank})</span>
                              )}
                              <div className="flex gap-1">
                                {getAuthorBadges(post.author).map(badgeId => renderBadgeIcon(badgeId))}
                              </div>
                            </div>
                            <span className="text-white/30 text-[9px]">{post.date}</span>
                          </div>

                          {/* Womb post Content */}
                          <div className="space-y-2">
                            <h4 className="text-md font-serif font-bold text-white tracking-tight">{post.title}</h4>
                            <p className="text-xs text-white/70 leading-relaxed font-sans font-light whitespace-pre-wrap">{post.content}</p>
                          </div>

                          {/* Interactive footer likes/comments counters */}
                          <div className="pt-3 border-t border-white/5 flex justify-between items-center text-[9.5px] font-mono">
                            
                            <div className="flex items-center gap-4">
                              {/* Like toggle layout button */}
                              <button
                                onClick={() => handleLikePost(post.id)}
                                className={`flex items-center gap-1 px-2.5 py-1 border transition-colors ${
                                  post.likedByUser 
                                    ? 'bg-brand-gold/10 border-brand-gold text-brand-gold font-bold' 
                                    : 'border-white/5 bg-white/5 text-white/50 hover:text-white'
                                }`}
                              >
                                <Heart size={11} className={post.likedByUser ? 'fill-current' : ''} />
                                <span>{post.likes}</span>
                              </button>

                              {/* Comment display counter */}
                              <button
                                onClick={() => {
                                  setExpandedComments(prev => ({
                                    ...prev,
                                    [post.id]: !prev[post.id]
                                  }));
                                }}
                                className={`flex items-center gap-1.5 px-2.5 py-1 border transition-colors ${
                                  isExpanded ? 'bg-white/10 border-white/20 text-white font-bold' : 'border-white/5 bg-white/5 text-white/50 hover:text-white'
                                }`}
                                title="Reply to thread"
                              >
                                <MessageSquare size={11} /> 
                                <span>{post.comments.length} Comments</span>
                              </button>
                            </div>

                            {/* Quick Report Flagging */}
                            <button
                              onClick={() => handleTriggerFlag(post.title)}
                              className="text-white/30 hover:text-brand-red flex items-center gap-1 text-[8.5px]"
                              title="Report user content"
                            >
                              <Flag size={9} /> Report Item
                            </button>

                          </div>

                          {/* Expanded Comments section including write composer */}
                          {isExpanded && (
                            <div className="mt-3 p-4 bg-zinc-950 border border-white/5 space-y-3 text-[9.5px] font-sans">
                              <p className="text-[8px] font-mono uppercase text-brand-gold/50 tracking-wider">Sisterhood Replies</p>
                              
                              {post.comments.length > 0 ? (
                                <div className="space-y-3 mb-3 max-h-60 overflow-y-auto pr-1">
                                  {post.comments.map((comment, index) => (
                                    <div key={index} className="space-y-1 text-left pb-2 border-b border-white/5 last:border-0 last:pb-0">
                                      <div className="flex flex-wrap items-center justify-between gap-1.5 text-[8px] font-mono">
                                        <span className="font-bold text-white/80 flex items-center gap-1.5">
                                          {comment.author}
                                          <span className="inline-flex gap-1 shrink-0">
                                            {getAuthorBadges(comment.author).map(bId => renderBadgeIcon(bId))}
                                          </span>
                                        </span>
                                        <span className="text-white/30">{comment.date}</span>
                                      </div>
                                      <p className="text-white/60 font-light leading-relaxed">{comment.content}</p>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-white/30 italic text-[8.5px] py-1 text-left">No replies yet. Be the first sister to offer guidance or heart support!</p>
                              )}

                              {/* Comment Submission form block */}
                              <div className="pt-2 border-t border-white/5 flex gap-2">
                                <input
                                  type="text"
                                  placeholder="Offer helpful guidance or support..."
                                  value={commentDrafts[post.id] || ''}
                                  onChange={(e) => setCommentDrafts(prev => ({ ...prev, [post.id]: e.target.value }))}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      handleAddComment(post.id);
                                    }
                                  }}
                                  className="flex-1 bg-[#121010] border border-white/10 px-3 py-1.5 text-xs text-white rounded-none outline-none focus:border-brand-gold/60 placeholder:text-white/20"
                                />
                                <button
                                  onClick={() => handleAddComment(post.id)}
                                  className="px-4 py-1.5 bg-brand-gold text-brand-black hover:bg-brand-gold/90 transition-all font-mono text-[9px] uppercase tracking-wider font-bold"
                                >
                                  Reply
                                </button>
                              </div>
                            </div>
                          )}

                        </div>
                      );
                    })}
                  </div>
                )}

              </div>

              {/* Right Column: Feed Widgets / Actions & Toggles (cols-4) */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* ⚡ COMMUNITY QUICK ACTIONS COMPONENT */}
                <div className="p-5 bg-zinc-950 border border-white/5 rounded-none text-left space-y-4">
                  <div className="border-b border-white/5 pb-2">
                    <h3 className="text-xs uppercase tracking-widest text-brand-gold font-mono font-bold flex items-center gap-1.5">
                      <Sparkle size={10} className="text-brand-gold" /> ⚡ Quick Actions
                    </h3>
                    <p className="text-[8px] text-white/40 font-mono">Instant community action points.</p>
                  </div>

                  <div className="grid grid-cols-1 gap-2 text-[9px] font-mono tracking-widest font-black uppercase">
                    
                    <button
                      onClick={() => setShowPostModal(true)}
                      id="qa-post-feed"
                      className="p-3 bg-white/5 hover:bg-white/10 text-white border border-white/5 hover:border-brand-gold/40 transition-all flex items-center gap-2"
                    >
                      <Plus size={12} className="text-brand-gold shrink-0" />
                      Post in Community Feed
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('groups');
                        triggerToast('👥 Navigated to Focused Discussion Circles!');
                      }}
                      id="qa-join-group"
                      className="p-3 bg-white/5 hover:bg-white/10 text-white border border-white/5 hover:border-brand-gold/40 transition-all flex items-center gap-2"
                    >
                      <Users size={12} className="text-brand-gold shrink-0" />
                      Join a Discussion Group
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('announcements');
                        triggerToast('📢 Welcome to the official Announcements Archive.');
                      }}
                      id="qa-view-announcements"
                      className="p-3 bg-white/5 hover:bg-white/10 text-white border border-white/5 hover:border-brand-gold/40 transition-all flex items-center gap-2"
                    >
                      <Bell size={12} className="text-brand-gold shrink-0" />
                      View Announcements
                    </button>

                    <button
                      onClick={() => {
                        handleTriggerFlag('Inappropriate general chat pattern');
                      }}
                      id="qa-report-content"
                      className="p-3 bg-white/5 hover:bg-white/10 text-white border border-white/5 hover:border-brand-gold/40 transition-all flex items-center gap-2"
                    >
                      <ShieldAlert size={12} className="text-brand-gold shrink-0" />
                      Report or Flag Content
                    </button>

                    <button
                      onClick={() => setShowInviteModal(true)}
                      id="qa-invite-friend"
                      className="p-3 bg-brand-gold/15 hover:bg-brand-gold hover:text-brand-black text-brand-gold border border-brand-gold/30 hover:border-brand-gold transition-all flex items-center gap-2 font-extrabold cursor-pointer"
                    >
                      <UserPlus size={12} className="shrink-0" />
                      Invite a Sibling Friend
                    </button>

                  </div>
                </div>

                {/* Micro Community Bulletin snapshot Widget */}
                <div className="p-5 bg-[#121010] border border-white/10 rounded-none text-left space-y-3.5">
                  <div className="space-y-0.5">
                    <span className="text-[7.5px] font-mono text-white/40 uppercase tracking-[0.2em] block">Upcoming Live Forum</span>
                    <h4 className="text-xs font-serif font-black text-white uppercase">Womb Circles with Dr. FID</h4>
                  </div>
                  <p className="text-[10px] text-white/50 leading-relaxed font-sans font-light">
                    Every first Tuesday, active members compile their cycle journals to discuss glandular indicators and somatic diagnostics parameters live. Ensure your profile records are current.
                  </p>
                  <button 
                    onClick={() => setActiveTab('announcements')}
                    className="text-[8px] font-mono uppercase tracking-widest text-[#D4AF37] font-bold flex items-center gap-1 hover:text-white transition-colors"
                  >
                    Details in Bulletins <ChevronRight size={10} />
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: 👥 DISCUSSION GROUPS */}
          {activeTab === 'groups' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-1.5 text-left mb-2">
                <div>
                  <h3 className="text-md uppercase tracking-wider font-serif text-brand-gold flex items-center gap-2">
                    <Users size={16} /> 👥 Focused Discussion Circles
                  </h3>
                  <p className="text-[10px] text-white/40 font-mono mt-0.5">Secure focused conversations corresponding to your unique somatic wellness path.</p>
                </div>
                <div className="text-[8px] text-brand-gold/60 font-mono uppercase tracking-widest bg-zinc-950 p-2 border border-white/5">
                  Joined: {joinedGroups.length} / {discussionGroups.length} Circles
                </div>
              </div>

              {/* Grid map of groups */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {discussionGroups.map((group) => {
                  const isJoined = joinedGroups.includes(group.slug);
                  const isCurrentlyActiveThread = activeGroupSlugs === group.slug;
                  
                  return (
                    <div 
                      key={group.id} 
                      className={`p-5 flex flex-col justify-between border text-left transition-all rounded-none relative overflow-hidden h-64 ${
                        isCurrentlyActiveThread 
                          ? 'border-brand-gold bg-zinc-950/70 shadow-lg' 
                          : isJoined 
                          ? 'border-white/20 bg-white/[0.01]' 
                          : 'border-white/5 bg-black/40'
                      }`}
                    >
                      <div className="space-y-3.5">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h4 className="text-xs font-serif font-black text-white hover:text-brand-gold transition-colors uppercase">
                              {group.name}
                            </h4>
                            <span className="text-[8.5px] font-mono text-white/35 mt-0.5 block">{group.membersCount} active siblings</span>
                          </div>

                          <button 
                            type="button"
                            onClick={() => handleToggleGroupJoin(group.slug)}
                            className={`text-[8px] font-mono uppercase tracking-wider px-2 py-0.5 border ${
                              isJoined 
                                ? 'bg-white/5 border-white/20 text-white/40 hover:bg-brand-red/10 hover:text-brand-red hover:border-brand-red/30' 
                                : 'bg-brand-gold/10 border-brand-gold/40 text-brand-gold hover:bg-brand-gold hover:text-brand-black'
                            }`}
                          >
                            {isJoined ? 'Leave Circle' : 'Join Circle'}
                          </button>
                        </div>

                        <p className="text-[10px] text-white/50 leading-relaxed font-sans font-light line-clamp-3">
                          {group.description}
                        </p>
                      </div>

                      {/* Highlighted conversational thread snippet */}
                      <div className="pt-3 border-t border-white/5 mt-4 space-y-2">
                        <span className="text-[7.5px] font-mono text-brand-gold/50 uppercase block tracking-wider">
                          Snippet: {group.highlightText}
                        </span>

                        {isJoined ? (
                          <div className="flex justify-between items-center text-[9px] font-mono">
                            <span className="text-emerald-400 font-bold block">✓ Circle Joined</span>
                            
                            <button
                              onClick={() => {
                                setActiveGroupSlugs(isCurrentlyActiveThread ? null : group.slug);
                                if (!isCurrentlyActiveThread) {
                                  triggerToast(`💬 Loaded private sister thread for ${group.name}.`);
                                }
                              }}
                              className="px-2 py-1 bg-white/5 hover:bg-white/10 uppercase tracking-widest text-[#D4AF37] border border-white/10 hover:border-brand-gold text-[8px] font-black"
                            >
                              {isCurrentlyActiveThread ? 'Unfocus Channel' : 'Open Circle Threads 💬'}
                            </button>
                          </div>
                        ) : (
                          <div className="text-[8px] font-mono italic text-white/30 text-left">
                            * Join circle to interact and reply directly.
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* RENDER CURRENTLY OPEN INTEGRATED GROUP REPLIES CHANNELS */}
              <AnimatePresence>
                {activeGroupSlugs && joinedGroups.includes(activeGroupSlugs) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="p-5 md:p-6 bg-zinc-950 border border-brand-gold/30 rounded-none text-left space-y-4"
                  >
                    {/* Active circle title header */}
                    {(() => {
                      const activeGroup = discussionGroups.find(g => g.slug === activeGroupSlugs);
                      if (!activeGroup) return null;

                      return (
                        <>
                          <div className="flex justify-between items-center border-b border-white/5 pb-2">
                            <div>
                              <h4 className="text-xs uppercase font-mono tracking-widest text-brand-gold font-bold flex items-center gap-1.5">
                                <MessageSquare size={13} /> Active Thread Node: {activeGroup.name}
                              </h4>
                              <p className="text-[8.5px] text-white/40 font-mono mt-0.5">Confidential sister communications, safe and unlogged externally.</p>
                            </div>
                            <button
                              onClick={() => setActiveGroupSlugs(null)}
                              className="text-white/40 hover:text-white"
                              type="button"
                              title="Close Thread"
                            >
                              <X size={14} />
                            </button>
                          </div>

                          {/* Message feed stream */}
                          <div className="space-y-3 min-h-[100px] max-h-[250px] overflow-y-auto pr-1">
                            {activeGroup.conversations.length === 0 ? (
                              <div className="text-center py-8 text-white/30 text-[10px] italic">
                                This circle conversation record is vacant. Post a sister notification below to inaugurate the thread loop!
                              </div>
                            ) : (
                              activeGroup.conversations.map((msg, index) => (
                                <div key={index} className="p-3 bg-white/[0.01] border border-white/5 relative">
                                  <div className="flex justify-between items-center text-[8.5px] font-mono">
                                    <div className="flex flex-wrap items-center gap-1.5">
                                      <span className="font-bold text-white/80">{msg.author}</span>
                                      <span className="px-1.5 py-0.2 bg-white/5 text-[7px] text-[#D4AF37] rounded-[1px]">
                                        {msg.role}
                                      </span>
                                      <span className="inline-flex gap-1 shrink-0">
                                        {getAuthorBadges(msg.author).map(bId => renderBadgeIcon(bId))}
                                      </span>
                                    </div>
                                    <span className="text-white/35">{msg.time}</span>
                                  </div>
                                  <p className="text-xs text-white/70 font-light font-sans leading-relaxed mt-1">{msg.content}</p>
                                </div>
                              ))
                            )}
                          </div>

                          {/* Submit Message form */}
                          <form onSubmit={(e) => handlePostGroupMessage(e, activeGroup.slug)} className="flex items-stretch gap-2 pt-2 border-t border-white/5">
                            <input 
                              type="text" 
                              value={groupMessage}
                              onChange={(e) => setGroupMessage(e.target.value)}
                              placeholder={`Speak safely inside ${activeGroup.name}...`}
                              className="flex-grow bg-[#121010] p-2.5 font-sans border border-white/10 text-xs text-white rounded-none focus:border-brand-gold outline-none"
                            />
                            <button 
                              type="submit"
                              className="px-5 bg-brand-gold text-brand-black hover:bg-white text-[10px] font-mono uppercase tracking-widest font-black transition-all flex items-center justify-center gap-1.5"
                            >
                              <Send size={11} /> Speak
                            </button>
                          </form>
                        </>
                      );
                    })()}
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          )}

          {/* TAB: 🏆 SYSTEM achievements & BADGES */}
          {activeTab === 'achievements' && (
            <div className="space-y-6 text-left">
              {/* Header */}
              <div>
                <h3 className="text-md uppercase tracking-wider font-serif text-brand-gold flex items-center gap-2">
                  <Trophy size={16} /> 🏆 Sisterhood Achievements & Somatic Badges
                </h3>
                <p className="text-[10px] text-white/40 font-mono mt-0.5">
                  Your participation footprint within the sovereign room compiles points, elevates sibling levels, and unlocks real certified credentials.
                </p>
              </div>

              {/* Bento dashboard matrix */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Level Showcase Card - cols 4 */}
                <div className="md:col-span-4 bg-zinc-950/80 border border-white/10 p-6 flex flex-col justify-between relative overflow-hidden group">
                  <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-[0.02] text-brand-gold group-hover:opacity-[0.05] transition-opacity">
                    <Trophy size={160} />
                  </div>
                  
                  <div className="space-y-2 select-none">
                    <span className="text-[8px] font-mono uppercase text-[#D4AF37]/50 tracking-widest block">Sovereign Rank</span>
                    <h4 className="text-lg font-serif font-bold text-white leading-none uppercase">
                      {points >= 40 ? 'Somatic Elder' : points >= 15 ? 'Garden Sibling' : 'Seed Advocate'}
                    </h4>
                    <p className="text-[10px] text-white/40 font-mono">
                      {points >= 40 ? 'Sage Tier Rank Unlocked' : points >= 15 ? 'Active Sibling Tier' : 'Novice Companion Tier'}
                    </p>
                  </div>

                  <div className="py-6 flex justify-center">
                    <div className="relative w-32 h-32 rounded-full border border-white/5 flex items-center justify-center bg-black/60 shadow-[inset_0_0_12px_rgba(212,175,55,0.05)]">
                      <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#D4AF37]/20 animate-[spin_40s_linear_infinite]" />
                      <div className="text-center">
                        <span className="text-3xl font-black font-mono text-brand-gold leading-none">{points}</span>
                        <p className="text-[8px] font-mono text-white/30 uppercase tracking-widest mt-0.5">points</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[8px] font-mono text-white/40">
                      <span>lvl progression</span>
                      <span>{points} / 50 PTS</span>
                    </div>
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-brand-gold transition-all duration-500"
                        style={{ width: `${Math.min(100, (points / 50) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Score Breakdown Metrics - cols 8 */}
                <div className="md:col-span-8 bg-zinc-950/80 border border-white/10 p-6 flex flex-col justify-between gap-6">
                  <div>
                    <span className="text-[8px] font-mono uppercase text-[#D4AF37]/50 tracking-widest block mb-1">Your Activity Footprint</span>
                    <h4 className="text-sm font-sans font-black uppercase text-white tracking-wide">Somatic Engagement Index</h4>
                    <p className="text-[10px] text-white/30 font-mono mt-0.5">Contribution metric aggregates compiled dynamically.</p>
                  </div>

                  {/* Stat Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-2 select-none">
                    <div className="bg-white/[0.01] border border-white/5 p-4 text-center">
                      <span className="text-lg font-mono font-black text-white block">{postCount}</span>
                      <span className="text-[8px] font-mono uppercase text-white/40 tracking-wider">Posts Sown</span>
                    </div>
                    <div className="bg-white/[0.01] border border-white/5 p-4 text-center">
                      <span className="text-lg font-mono font-black text-white block">{commentCount}</span>
                      <span className="text-[8px] font-mono uppercase text-white/40 tracking-wider font-sans">Replies Comp</span>
                    </div>
                    <div className="bg-white/[0.01] border border-white/5 p-4 text-center">
                      <span className="text-lg font-mono font-black text-white block">{circleCount}</span>
                      <span className="text-[8px] font-mono uppercase text-white/40 tracking-wider">Circles Joined</span>
                    </div>
                    <div className="bg-white/[0.01] border border-white/5 p-4 text-center">
                      <span className="text-lg font-mono font-black text-white block">{likesCount}</span>
                      <span className="text-[8px] font-mono uppercase text-white/40 tracking-wider">Hearts Sent</span>
                    </div>
                  </div>

                  {/* Points Ledger Guide */}
                  <div className="border-t border-white/5 pt-4 text-[9px] font-mono text-white/40 flex flex-wrap justify-between items-center gap-2">
                    <span>💡 Points Engine:</span>
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      <span>Timeline post (+15)</span>
                      <span>Helpful Reply (+10)</span>
                      <span>Circle Network (+5)</span>
                      <span>Spread heart (+2)</span>
                    </div>
                  </div>

                </div>

              </div>

              {/* Community Leaderboard */}
              <div className="pt-2">
                <CommunityLeaderboard />
              </div>

              {/* Badge collector's cards grids */}
              <div>
                <h4 className="text-xs font-mono uppercase tracking-widest text-brand-gold mb-4 select-none">🏆 Certified Badges Locker ({badges.length} / 5 unlocked)</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {[
                    {
                      id: 'womb_listener',
                      name: '🌸 Womb Listener',
                      desc: 'Active Thread Starter',
                      criteria: 'Draft 1+ post onto the global Community Timeline.',
                      slogan: 'Successfully voiced somatic thoughts to the global sister feed.',
                      progress: postCount,
                      target: 1,
                      color: 'border-purple-800/30 text-purple-300'
                    },
                    {
                      id: 'somatic_helper',
                      name: '💬 Somatic Helper',
                      desc: 'Sisterhood Guidance',
                      criteria: 'Write 1+ helpful reply or thread comment inside discussion circles.',
                      slogan: 'Helped others by offering supportive sisterhood replies/guidance.',
                      progress: commentCount,
                      target: 1,
                      color: 'border-amber-600/30 text-[#D4AF37]'
                    },
                    {
                      id: 'luminous_beacon',
                      name: '🌟 Luminous Beacon',
                      desc: 'Atmospheric Support',
                      criteria: 'Glow 3+ support hearts to sisters across timeline feeds.',
                      slogan: 'Spread support and maternal heart-space energy across discussions.',
                      progress: likesCount,
                      target: 3,
                      color: 'border-emerald-800/30 text-emerald-300'
                    },
                    {
                      id: 'circle_guardian',
                      name: '👥 Circle Guardian',
                      desc: 'Circle Pioneer',
                      criteria: 'Be an active sibling inside 2+ specialized discussion groups.',
                      slogan: 'Entered specialized networks and circles showing collective trust.',
                      progress: circleCount,
                      target: 2,
                      color: 'border-blue-800/30 text-blue-300'
                    },
                    {
                      id: 'community_pillar',
                      name: '👑 Community Pillar',
                      desc: 'Steward-Mentor Rank',
                      criteria: 'Accumulate a total of 50+ holistic contribution points.',
                      slogan: 'Acknowledged as an active guiding elder of the sacred room.',
                      progress: points,
                      target: 50,
                      color: 'border-red-850/30 text-red-300'
                    }
                  ].map((bgItem) => {
                    const isUnlocked = badges.includes(bgItem.id);
                    return (
                      <div 
                        key={bgItem.id} 
                        className={`bg-[#121010] border p-5 flex flex-col justify-between space-y-4 select-none relative group transition-all duration-300 ${
                          isUnlocked 
                            ? 'border-[#D4AF37]/50 shadow-[0_0_15px_rgba(212,175,55,0.03)] hover:border-brand-gold' 
                            : 'border-white/5 opacity-50 hover:opacity-75'
                        }`}
                      >
                        {/* Lock / Unlock Icon top absolute right */}
                        <div className="absolute top-4 right-4">
                          {isUnlocked ? (
                            <div className="w-5 h-5 rounded-full bg-brand-gold/10 flex items-center justify-center text-brand-gold border border-brand-gold/20" title="Badge Unlocked!">
                              <Check size={10} />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center text-white/30 border border-white/5" title="Badge Locked">
                              <Lock size={10} />
                            </div>
                          )}
                        </div>

                        {/* Badge Name and Title */}
                        <div className="space-y-1 pr-4 text-left">
                          <h5 className="text-xs font-black uppercase text-white font-mono tracking-wider group-hover:text-brand-gold transition-colors">{bgItem.name}</h5>
                          <span className="text-[8px] font-mono text-white/40 block tracking-widest uppercase">{bgItem.desc}</span>
                        </div>

                        {/* Slogan or locked text */}
                        <div className="text-left">
                          <p className="text-[10px] text-white/70 italic leading-relaxed">
                            {isUnlocked ? `"${bgItem.slogan}"` : bgItem.criteria}
                          </p>
                        </div>

                        {/* Progress */}
                        <div className="space-y-1.5 pt-2 border-t border-white/5 text-left">
                          <div className="flex justify-between items-center text-[8px] font-mono text-white/40">
                            <span>progression</span>
                            <span>{bgItem.progress} / {bgItem.target}</span>
                          </div>
                          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-500 ${isUnlocked ? 'bg-brand-gold' : 'bg-white/20'}`}
                              style={{ width: `${Math.min(100, (bgItem.progress / bgItem.target) * 100)}%` }}
                            />
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}
          {activeTab === 'announcements' && (
            <div className="space-y-6">
              <div className="text-left">
                <h3 className="text-md uppercase tracking-wider font-serif text-brand-gold flex items-center gap-2">
                  <Bell size={16} /> 📢 Official Announcements & Bulletins
                </h3>
                <p className="text-[10px] text-white/40 font-mono mt-0.5">Stay updated with verified community releases and webinars coordinated by Dr. FID and founders.</p>
              </div>

              <div className="grid grid-cols-1 gap-4 text-left">
                {announcements.map((ann) => (
                  <div 
                    key={ann.id} 
                    className="p-6 bg-[#121010] border border-white/10 flex flex-col sm:flex-row justify-between gap-6 relative group overflow-hidden hover:border-brand-gold/30 transition-all rounded-none"
                  >
                    <div className="space-y-2 max-w-3xl">
                      <div className="flex items-center gap-2.5 text-[9px] font-mono text-brand-gold uppercase">
                        <span className="px-2 py-0.5 bg-brand-gold/15 border border-brand-gold/20 text-[7.5px] font-extrabold tracking-wider">{ann.category}</span>
                        <span>•</span>
                        <span className="text-white/40">{ann.date}</span>
                      </div>
                      <h4 className="text-sm font-serif font-black text-white uppercase group-hover:text-brand-gold transition-colors">{ann.title}</h4>
                      <p className="text-[11px] text-white/60 font-sans leading-relaxed font-light">{ann.content}</p>
                    </div>

                    <div className="shrink-0 flex items-end sm:items-start select-none">
                      <div className="w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center rounded">
                        <Award size={18} className="text-[#D4AF37]" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: 🌸 COMMUNITY VALUES */}
          {activeTab === 'values' && (
            <div className="space-y-6 text-left">
              <div>
                <h3 className="text-sm font-black uppercase text-brand-gold tracking-wider flex items-center gap-2 font-serif">
                  <Award size={16} /> 🌸 Community Values & Code of Conduct
                </h3>
                <p className="text-[10px] text-white/40 italic font-mono mt-0.5">The pillars of trust, privacy, and evidence-informed support holding our community safe.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Value 1 */}
                <div className="p-5 bg-zinc-950 border border-brand-gold/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-brand-gold/[0.01] transition-all">
                  <div className="space-y-1">
                    <span className="px-2 py-0.5 bg-brand-gold/15 text-brand-gold border border-brand-gold/20 text-[7px] font-mono rounded tracking-widest uppercase">
                      PILLAR 01
                    </span>
                    <h4 className="text-xs font-serif font-bold text-white uppercase mt-1">Respect & Absolute Confidentiality</h4>
                    <p className="text-[9.5px] text-white/55 leading-relaxed font-sans font-light">
                      Screenshots, reproduction, or citations of other members cycles, names, or reflections outside our network is absolutely forbidden. We operate as a safe digital locker.
                    </p>
                  </div>
                </div>

                {/* Value 2 */}
                <div className="p-5 bg-zinc-950 border border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-brand-gold/20 transition-all">
                  <div className="space-y-1">
                    <span className="px-2 py-0.5 bg-white/5 text-white/60 border border-white/10 text-[7px] font-mono rounded tracking-widest uppercase">
                      PILLAR 02
                    </span>
                    <h4 className="text-xs font-serif font-bold text-white uppercase mt-1">No Judgment or Shame</h4>
                    <p className="text-[9.5px] text-white/55 leading-relaxed font-sans font-light">
                      Female somatic complications, questions on reproductive anatomy, miscarriage logs, and menstrual blockages are spoken of with reverence, zero taboo, and active supportive warmth.
                    </p>
                  </div>
                </div>

                {/* Value 3 */}
                <div className="p-5 bg-zinc-950 border border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-brand-gold/20 transition-all">
                  <div className="space-y-1">
                    <span className="px-2 py-0.5 bg-white/5 text-white/60 border border-white/10 text-[7px] font-mono rounded tracking-widest uppercase">
                      PILLAR 03
                    </span>
                    <h4 className="text-xs font-serif font-bold text-white uppercase mt-1">Safe, Supportive Sisterhood</h4>
                    <p className="text-[9.5px] text-white/55 leading-relaxed font-sans font-light">
                      Always speak with empathy. We hold spaces to elevate and heal each other. Sarcastic replies or arguments are moderated out of active timeline records immediately.
                    </p>
                  </div>
                </div>

                {/* Value 4 */}
                <div className="p-5 bg-zinc-950 border border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-brand-gold/20 transition-all">
                  <div className="space-y-1">
                    <span className="px-2 py-0.5 bg-white/5 text-white/60 border border-white/10 text-[7px] font-mono rounded tracking-widest uppercase">
                      PILLAR 04
                    </span>
                    <h4 className="text-xs font-serif font-bold text-white uppercase mt-1">Evidence-Informed Discussions</h4>
                    <p className="text-[9.5px] text-white/55 leading-relaxed font-sans font-light">
                      We pair ancient holistic botanical wisdom with certified reproductive medicine guidelines spearheaded by Dr. FID. Refrain from promoting unverified extreme diagnostics or cure-alls.
                    </p>
                  </div>
                </div>

                {/* Value 5 */}
                <div className="p-5 bg-zinc-950 border border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-brand-gold/20 transition-all md:col-span-2">
                  <div className="space-y-1">
                    <span className="px-2 py-0.5 bg-brand-gold/10 text-brand-gold border border-brand-gold/20 text-[7px] font-mono rounded tracking-widest uppercase">
                      CORE MISSION
                    </span>
                    <h4 className="text-xs font-serif font-bold text-white uppercase mt-1">Empowerment Through Sovereign Education</h4>
                    <p className="text-[9.5px] text-white/55 leading-relaxed font-sans font-light">
                      True system ownership comes when women map and master their own bodies. Every tracking tool, handbook, discount coupon, and local physical circle check-in exists to hand independence back to you.
                    </p>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 5: 🗺️ sister registry (MEMBER DIRECTORY) */}
          {activeTab === 'directory' && (
            <div className="border border-white/5 bg-black/20 p-6">
              <MemberDirectory />
            </div>
          )}

        </motion.div>
      </AnimatePresence>

      {/* Footer support citation */}
      <div className="text-center py-6 border-t border-white/5">
        <p className="text-xs font-serif italic text-white/40 tracking-wider">
          You are never walking alone — this is your safe digital somatic loop. 🌸✨
        </p>
      </div>

      {/* MODAL 1: POST IN FEED COMPOSER */}
      <AnimatePresence>
        {showPostModal && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-lg bg-zinc-950 border border-[#D4AF37]/50 p-6 space-y-4 text-left relative"
            >
              <button
                onClick={() => setShowPostModal(false)}
                className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
                type="button"
              >
                <X size={15} />
              </button>

              <div className="space-y-1">
                <h4 className="text-lg font-serif font-bold text-brand-gold flex items-center gap-1.5">
                  <Plus size={18} /> Compose Community Post
                </h4>
                <p className="text-[9px] text-white/40 font-mono uppercase">Write to the daily interactive sibling stream matrix.</p>
              </div>

              <form onSubmit={handleNewPostSubmit} className="space-y-4 font-mono text-[10px]">
                
                {/* Category selectors */}
                <div className="space-y-1">
                  <label className="text-[8px] text-white/50 uppercase tracking-widest block font-bold">Post Stream Category</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['Wellness Tip', 'Member Experience', 'Reflections'] as const).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setNewPostCategory(cat)}
                        className={`py-1.5 text-center text-[8.5px] border ${
                          newPostCategory === cat 
                            ? 'bg-brand-gold text-brand-black border-brand-gold font-bold' 
                            : 'bg-transparent border-white/10 text-white/55 hover:border-white/25'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[8px] text-white/50 uppercase tracking-widest block font-bold">Subject Heading</label>
                  <input 
                    type="text" 
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                    placeholder="e.g., Basal tracking success or Botanical infusion observations"
                    className="w-full bg-[#121010] border border-white/10 p-2.5 text-xs text-white rounded-none focus:border-brand-gold outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[8px] text-white/50 uppercase tracking-widest block font-bold">Post Content (Safe, unlogged text)</label>
                  <textarea 
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder="Write your reflections, cycle logs, or inquiries here..."
                    className="w-full bg-[#121010] border border-white/10 p-2.5 text-xs text-white rounded-none focus:border-brand-gold outline-none h-28 resize-none"
                    required
                  />
                  <span className="text-[7.5px] text-white/30 italic block">
                    * Make sure your text aligns with the community values of support and confidentiality.
                  </span>
                </div>

                <div className="pt-2 flex gap-3 text-[10px] font-sans">
                  <button
                    type="button"
                    onClick={() => setShowPostModal(false)}
                    className="flex-grow py-2 bg-white/5 hover:bg-white/10 text-white transition-colors border border-white/10 font-mono text-[9px] uppercase tracking-widest"
                  >
                    Discard
                  </button>
                  <button
                    type="submit"
                    className="flex-grow py-2 bg-brand-gold hover:bg-white text-brand-black transition-colors font-mono text-[9px] uppercase tracking-widest font-black"
                  >
                    Dispatch Post ✅
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: INVITE A FRIEND */}
      <AnimatePresence>
        {showInviteModal && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-md bg-zinc-950 border border-brand-gold/40 p-6 space-y-4 text-left relative"
            >
              <button
                onClick={() => setShowInviteModal(false)}
                className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
                type="button"
              >
                <X size={15} />
              </button>

              <div className="space-y-1">
                <h4 className="text-lg font-serif font-bold text-brand-gold flex items-center gap-1.5 font-semibold">
                  <UserPlus size={16} /> Invite a Sibling Friend
                </h4>
                <p className="text-[9px] text-white/40 font-mono uppercase">Provide support networks and invite women into our community.</p>
              </div>

              <div className="p-3 bg-white/[0.01] border border-white/5 space-y-3 font-mono text-[10px]">
                <div>
                  <span className="text-[8px] text-white/30 uppercase block mb-1">Invitation Token URL</span>
                  <div className="flex bg-[#121010] border border-white/10 p-2 text-xs truncate justify-between items-center select-all cursor-pointer" onClick={handleCopyInviteLink}>
                    <span className="text-white/80 truncate text-[10px]">{window.location.origin}/register?ref=SISTER-INVITE</span>
                    <button 
                      type="button"
                      onClick={handleCopyInviteLink}
                      className="ml-2 bg-brand-gold/15 text-brand-gold px-2 py-0.5 text-[8px] uppercase tracking-widest font-bold border border-brand-gold/20"
                    >
                      {copiedLink ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSendInviteEmail} className="space-y-3 pt-2">
                  <label className="text-[8px] text-white/50 uppercase tracking-widest block font-bold">Send Direct Email Invite Card</label>
                  <div className="flex gap-1.5">
                    <input 
                      type="email" 
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="Enter sibling's email address..."
                      className="flex-grow bg-[#121010] p-2 border border-white/10 text-xs text-white rounded-none focus:border-brand-gold outline-none"
                      required
                    />
                    <button 
                      type="submit"
                      className="bg-brand-gold text-brand-black px-4 text-[9px] uppercase tracking-widest font-black"
                    >
                      Dispatch
                    </button>
                  </div>
                </form>
              </div>

              <p className="text-[8px] font-mono text-white/30 italic text-center">
                * Note: Standard commission vouchers are auto-credited if your guests register and proceed with subscription activator fees.
              </p>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: REPORT / FLAG CONTENT */}
      <AnimatePresence>
        {showFlagModal && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-sm bg-zinc-950 border border-brand-gold/40 p-5 space-y-4 text-left relative"
            >
              <button
                onClick={() => setShowFlagModal(false)}
                className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
                type="button"
              >
                <X size={15} />
              </button>

              <div className="space-y-1">
                <h4 className="text-sm font-mono font-bold uppercase tracking-wider text-brand-gold flex items-center gap-1.5">
                  <AlertTriangle size={15} className="text-brand-gold animate-bounce" /> Report Content Ledger
                </h4>
                <p className="text-[8.5px] text-white/40 font-mono uppercase">Submit anonymous notice for verification.</p>
              </div>

              <div className="p-3 bg-red-950/20 border border-brand-red/20 text-white/70 font-sans text-[10px] leading-relaxed">
                Reported content: <strong className="text-white">"{targetFlagItem}"</strong>
              </div>

              <form onSubmit={submitFlagContent} className="space-y-3 font-mono text-[9px] tracking-wide">
                <div>
                  <label className="text-[8px] text-white/30 uppercase tracking-widest block mb-1">Reason for Flagging</label>
                  <select 
                    value={flagReason} 
                    onChange={(e) => setFlagReason(e.target.value)}
                    className="w-full bg-[#121010] border border-white/10 p-2.5 text-xs text-white rounded-none focus:border-brand-gold"
                  >
                    <option>Off-topic or inappropriate language</option>
                    <option>Breach of Respect & Confidentiality rules</option>
                    <option>Taboo or judgmental stance</option>
                    <option>Promoting unverified clinical medications</option>
                    <option>Spam pattern</option>
                  </select>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowFlagModal(false)}
                    className="flex-1 py-2 bg-[#121010] border border-white/10 text-white uppercase tracking-widest text-[8px]"
                  >
                    Abort
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-brand-gold text-brand-black uppercase tracking-widest font-bold text-[8px]"
                  >
                    Submit Report
                  </button>
                </div>
              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
