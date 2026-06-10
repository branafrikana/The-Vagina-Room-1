import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Trophy, Medal, Sparkles, User, MessageCircle, Heart, Star } from 'lucide-react';
import { motion } from 'motion/react';

interface LeaderboardUser {
  id: string;
  name: string;
  points: number;
  badgesCount: number;
  role: string;
  isSelf?: boolean;
}

export default function CommunityLeaderboard() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'points' | 'badges'>('points');

  // Baseline/Moderator high-profile users to seed the leaderboard
  const seedModerators: LeaderboardUser[] = [
    { id: 'moderator_fid', name: 'Dr. FID', points: 345, badgesCount: 5, role: 'Holistic Sage / Founder' },
    { id: 'moderator_ade', name: 'Ade Priestess', points: 210, badgesCount: 4, role: 'High Circle Elder' },
    { id: 'moderator_olori', name: 'Somatic Olori', points: 165, badgesCount: 3, role: 'Botanical Advocate' },
    { id: 'moderator_shala', name: 'Sister Shala', points: 110, badgesCount: 3, role: 'Womb Compass Guide' },
    { id: 'moderator_nneka', name: 'Nneka Rooted', points: 80, badgesCount: 2, role: 'Circle Sibling' }
  ];

  useEffect(() => {
    async function loadLeaderboard() {
      try {
        setLoading(true);
        // Load active users from Firestore
        const snapshot = await getDocs(query(collection(db, "users"), limit(50)));
        const fetchedUsers: LeaderboardUser[] = [];

        snapshot.forEach((doc) => {
          const data = doc.data();
          const uName = data.fullName || data.name || data.displayName;
          if (uName) {
            fetchedUsers.push({
              id: doc.id,
              name: uName,
              points: data.communityPoints || 0,
              badgesCount: Array.isArray(data.communityBadges) ? data.communityBadges.length : 0,
              role: data.membershipType || 'Circle Sibling'
            });
          }
        });

        // Filter and merge datasets (avoiding moderator profile duplication for real accounts)
        const combined = [...fetchedUsers];
        
        // Add seeds to combined if they do not duplicate name
        seedModerators.forEach(mod => {
          if (!combined.some(u => u.name.toLowerCase() === mod.name.toLowerCase())) {
            combined.push(mod);
          }
        });

        // Sort dynamically based on state
        const sorted = combined.sort((a, b) => {
          if (sortBy === 'points') {
            return b.points - a.points;
          } else {
            return b.badgesCount - a.badgesCount || b.points - a.points;
          }
        });

        setLeaderboardData(sorted.slice(0, 8));
      } catch (err) {
        console.error("Failed to load community leaderboard logs:", err);
        // Fallback to static seeds on failure
        const sortedSeeds = [...seedModerators].sort((a, b) => b.points - a.points);
        setLeaderboardData(sortedSeeds);
      } finally {
        setLoading(false);
      }
    }

    loadLeaderboard();
  }, [sortBy]);

  return (
    <div className="bg-zinc-950/90 border border-white/10 p-5 md:p-6 space-y-4">
      {/* Leaderboard Header Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <span className="text-[8px] font-mono text-brand-gold uppercase tracking-[0.2em] font-semibold block">Sovereign Rankings</span>
          <h4 className="text-sm font-serif font-black text-white uppercase flex items-center gap-2 tracking-wide">
            <Trophy size={14} className="text-brand-gold" /> Community Leaderboard
          </h4>
          <p className="text-[10px] text-white/40 leading-relaxed max-w-sm">
            Honoring siblings with active contribution nodes and certified sacred badges.
          </p>
        </div>

        {/* Sort Filter Selector */}
        <div className="flex bg-black/60 border border-white/10 p-0.5 select-none font-mono text-[9px] uppercase font-bold">
          <button
            onClick={() => setSortBy('points')}
            className={`px-3 py-1.5 transition-colors ${
              sortBy === 'points' 
                ? 'bg-brand-gold text-brand-black' 
                : 'text-white/60 hover:text-white'
            }`}
          >
            Points
          </button>
          <button
            onClick={() => setSortBy('badges')}
            className={`px-3 py-1.5 transition-colors ${
              sortBy === 'badges' 
                ? 'bg-brand-gold text-brand-black' 
                : 'text-white/60 hover:text-white'
            }`}
          >
            Badges
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-white/30 font-mono text-[10px] animate-pulse">
          Compiling community contribution matrix...
        </div>
      ) : (
        <div className="space-y-2 select-none">
          {leaderboardData.map((sibling, index) => {
            const displayRank = index + 1;
            const isTop3 = displayRank <= 3;
            
            return (
              <div
                key={sibling.id}
                className={`flex justify-between items-center p-3 transition-colors ${
                  isTop3 
                    ? 'bg-brand-gold/[0.03] border-l-2 border-brand-gold/40 border border-white/[0.03]' 
                    : 'bg-[#121010]/30 border border-white/[0.01]'
                }`}
              >
                {/* Left Profile Segment */}
                <div className="flex items-center gap-3">
                  {/* Rank Badge Indicator */}
                  <div className="w-6 h-6 flex items-center justify-center font-mono text-[10px] font-bold">
                    {displayRank === 1 ? (
                      <span className="text-[#D4AF37] text-sm" title="Gold Elder Rank">🥇</span>
                    ) : displayRank === 2 ? (
                      <span className="text-gray-300 text-sm" title="Silver Guardian Rank">🥈</span>
                    ) : displayRank === 3 ? (
                      <span className="text-amber-600 text-sm" title="Bronze Pioneer Rank">🥉</span>
                    ) : (
                      <span className="text-white/30">#{displayRank}</span>
                    )}
                  </div>

                  {/* Sibling Details */}
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black uppercase text-white tracking-wide">
                        {sibling.name}
                      </span>
                      {isTop3 && (
                        <Medal size={11} className="text-brand-gold" />
                      )}
                    </div>
                    <span className="text-[8px] font-mono text-white/30 uppercase tracking-widest block font-light">
                      {sibling.role}
                    </span>
                  </div>
                </div>

                {/* Right Scores Segment */}
                <div className="flex items-center gap-5 text-right font-mono">
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-bold text-white block">
                      {sibling.points}
                    </span>
                    <span className="text-[7.5px] text-white/35 uppercase tracking-wider block">
                      PTS
                    </span>
                  </div>

                  <div className="w-px h-6 bg-white/5" />

                  <div className="space-y-0.5">
                    <span className="text-[11px] font-bold text-brand-gold flex items-center justify-end gap-0.5">
                      <Star size={9} className="fill-brand-gold" /> {sibling.badgesCount}
                    </span>
                    <span className="text-[7.5px] text-white/35 uppercase tracking-wider block">
                      Badges
                    </span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Sibling Support footer tip */}
      <div className="text-[9px] font-mono text-white/30 flex items-center gap-1.5 select-none pt-1">
        <Sparkles size={11} className="text-[#D4AF37]" />
        <span>Glow hearts & reply actively to climb rankings. Matrix updates continuously.</span>
      </div>
    </div>
  );
}
