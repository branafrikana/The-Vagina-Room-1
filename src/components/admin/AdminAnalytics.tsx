import React, { useMemo } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, LineChart, Line, Legend
} from 'recharts';

export default function AdminAnalytics({ users = [], submissions = [] }: { users: any[], submissions: any[] }) {
  
  const growthData = useMemo(() => {
    // Sort by registration date if it exists, otherwise bucket by index
    return users.slice(0, 30).map((u, i) => ({
      name: `User ${i + 1}`,
      investment: u.investmentAmount || 0,
      rewards: (u.totalEarnings || 0)
    }));
  }, [users]);

  const participationData = useMemo(() => {
    const counts: Record<string, number> = {};
    submissions.forEach(s => {
      const type = s.formType || "other";
      counts[type] = (counts[type] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [submissions]);

  return (
    <div className="space-y-8 p-6">
      <h3 className="text-sm font-black uppercase tracking-[0.2em] text-brand-gold">Administrative Insights & Growth</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-black/40 border border-white/5 p-6 space-y-4">
          <p className="text-[10px] font-black uppercase text-zinc-400">Ambassador Capital Growth (Recent 30)</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#666" fontSize={10} hide />
                <YAxis stroke="#666" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#000', borderColor: '#d4af37' }} />
                <Area type="monotone" dataKey="investment" stroke="#d4af37" fill="#d4af37" fillOpacity={0.2} />
                <Area type="monotone" dataKey="rewards" stroke="#34d399" fill="#34d399" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-black/40 border border-white/5 p-6 space-y-4">
          <p className="text-[10px] font-black uppercase text-zinc-400">Form Submission Activity</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={participationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#666" fontSize={10} />
                <YAxis stroke="#666" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#000', borderColor: '#d4af37' }} />
                <Bar dataKey="count" fill="#d4af37" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
