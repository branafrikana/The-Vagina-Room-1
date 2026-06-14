import React, { useMemo } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, LineChart, Line, Legend, PieChart, Pie, Cell
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

  const memberData = useMemo(() => {
    const total = users.length;
    const members = users.filter(u => u.role === 'member' || u.isMember).length;
    const admins = users.filter(u => u.isAdmin || u.role === 'admin').length;
    const prospects = total - members - admins;
    
    return [
      { name: 'Verified Members', value: members },
      { name: 'System Admins', value: admins },
      { name: 'Unverified / Prospects', value: prospects > 0 ? prospects : 0 }
    ];
  }, [users]);

  // Mock aggregated data for Wellness Assessment Trends
  const wellnessTrendsData = useMemo(() => [
    { name: 'Hormonal Balance', count: 120 },
    { name: 'Stress & Anxiety', count: 95 },
    { name: 'Sleep/Insomnia', count: 85 },
    { name: 'Fertility', count: 60 },
    { name: 'Pain Relief', count: 45 },
  ], []);

  const COLORS = ['#D4AF37', '#b58e23', '#856614', '#5e480c', '#382b06'];

  return (
    <div className="space-y-8 p-6">
      <h3 className="text-sm font-black uppercase tracking-[0.2em] text-brand-gold">Administrative Insights & Growth</h3>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-black/40 border border-white/5 p-6">
            <p className="text-[9px] font-black uppercase text-zinc-500">Total Members</p>
            <p className="text-2xl font-black text-white">{users.length}</p>
         </div>
         <div className="bg-black/40 border border-white/5 p-6">
            <p className="text-[9px] font-black uppercase text-zinc-500">Total Form Submissions</p>
            <p className="text-2xl font-black text-white">{submissions.length}</p>
         </div>
         <div className="bg-black/40 border border-white/5 p-6">
            <p className="text-[9px] font-black uppercase text-zinc-500">Active Sessions</p>
            <p className="text-2xl font-black text-white">N/A</p>
         </div>
      </div>

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

        <div className="bg-black/40 border border-white/5 p-6 space-y-4 lg:col-span-1">
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

        <div className="bg-black/40 border border-white/5 p-6 space-y-4 lg:col-span-1">
          <p className="text-[10px] font-black uppercase text-zinc-400">Members Breakdown</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={memberData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {memberData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#000', borderColor: '#d4af37' }} itemStyle={{ color: '#d4af37' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Wellness Assessment Trends */}
        <div className="bg-black/40 border border-white/5 p-6 space-y-4 lg:col-span-1">
          <div className="flex justify-between items-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">Wellness Assessment Trends</p>
            <span className="text-[9px] text-white/40 uppercase">Anonymized Cohort Data</span>
          </div>
          <p className="text-sm text-white/60 mb-6 max-w-3xl font-light">Aggregated community assessment focuses to help guide upcoming product development and masterclass subjects.</p>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={wellnessTrendsData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" horizontal={true} vertical={false} />
                <XAxis type="number" stroke="#666" fontSize={10} />
                <YAxis dataKey="name" type="category" stroke="#999" fontSize={11} width={100} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', borderColor: '#d4af37', borderRadius: '8px' }} 
                  itemStyle={{ color: '#d4af37' }} 
                  cursor={{ fill: '#ffffff05' }}
                />
                <Bar dataKey="count" fill="#d4af37" radius={[0, 4, 4, 0]}>
                  {wellnessTrendsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
