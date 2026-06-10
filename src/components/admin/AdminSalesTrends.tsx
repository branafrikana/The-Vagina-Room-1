import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface Order {
  grandTotal: number;
  items: { category: string, price: number }[];
  createdAt: { toDate: () => Date };
}

export default function AdminSalesTrends({ orders }: { orders: Order[] }) {
  const data = useMemo(() => {
    const dailyRevenue: Record<string, number> = {};
    const categoryRevenue: Record<string, number> = {};

    orders.forEach(o => {
      const date = o.createdAt?.toDate().toLocaleDateString();
      if (date) {
        dailyRevenue[date] = (dailyRevenue[date] || 0) + (o.grandTotal || 0);
      }
      (o.items || []).forEach(item => {
        categoryRevenue[item.category || 'Uncategorized'] = (categoryRevenue[item.category || 'Uncategorized'] || 0) + (o.grandTotal / (o.items.length || 1));
      });
    });

    return {
      daily: Object.entries(dailyRevenue).map(([date, total]) => ({ date, total })),
      category: Object.entries(categoryRevenue).map(([name, value]) => ({ name, value }))
    };
  }, [orders]);

  const COLORS = ['#D4AF37', '#8884d8', '#82ca9d', '#ffc658'];

  return (
    <div className="space-y-6">
      <div className="h-64 bg-white/[0.02] p-4 border border-white/5">
        <h3 className="text-brand-gold text-xs font-black uppercase tracking-widest mb-4">Daily Revenue</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.daily}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="date" stroke="#666" fontSize={10} />
            <YAxis stroke="#666" fontSize={10} />
            <Tooltip contentStyle={{ backgroundColor: '#111', border: 'none' }} />
            <Bar dataKey="total" fill="#D4AF37" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="h-64 bg-white/[0.02] p-4 border border-white/5">
        <h3 className="text-brand-gold text-xs font-black uppercase tracking-widest mb-4">Revenue by Category</h3>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data.category} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
              {data.category.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
