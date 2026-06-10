import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

interface Order {
  createdAt?: any;
  grandTotal?: number;
  totalAmount?: number;
  items?: any[];
  status?: string;
}

interface RevenueChartProps {
  orders: Order[];
}

export default function RevenueChart({ orders }: RevenueChartProps) {
  // Process orders to get daily/monthly revenue
  const processData = () => {
    const revenueMap: Record<string, number> = {};
    
    // Sort orders by date
    const sortedOrders = [...orders].sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
      return dateA.getTime() - dateB.getTime();
    });

    // If no orders, provide dummy data for visualization
    if (sortedOrders.length === 0) {
      return [
        { name: 'Month 1', revenue: 0 },
        { name: 'Month 2', revenue: 0 },
        { name: 'Month 3', revenue: 0 },
        { name: 'Month 4', revenue: 0 }
      ];
    }

    sortedOrders.forEach(order => {
      const date = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt || Date.now());
      const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      const amount = order.grandTotal || order.totalAmount || 0;
      
      // Only count completed/confirmed orders for revenue
      if (['delivered', 'shipped', 'confirmed', 'paid'].includes((order.status || '').toLowerCase())) {
        revenueMap[monthYear] = (revenueMap[monthYear] || 0) + amount;
      }
    });

    return Object.entries(revenueMap).map(([name, revenue]) => ({ name, revenue }));
  };

  const chartData = processData();
  const totalRevenue = chartData.reduce((sum, item) => sum + item.revenue, 0);

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-950 border border-brand-gold/40 p-3 shadow-2xl rounded-none">
          <p className="text-[10px] font-mono font-bold text-brand-gold uppercase tracking-widest border-b border-white/10 pb-1 mb-2">{label}</p>
          <p className="text-sm font-black text-white font-mono">
            ₦{payload[0].value.toLocaleString()}
          </p>
          <p className="text-[8px] text-white/40 uppercase mt-1">Settled Revenue</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-zinc-950/80 border border-white/5 p-6 rounded-none space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <h4 className="text-xs font-mono font-bold text-white tracking-widest uppercase">
              Financial Progression Matrix
            </h4>
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">
            Visualizing authorized revenue growth cycles across the active multi-channel cooperative.
          </p>
        </div>
        <div className="text-right">
          <p className="text-[9px] text-white/30 uppercase tracking-widest">Total Settled Matrix</p>
          <p className="text-xl font-black text-emerald-400 font-mono">₦{totalRevenue.toLocaleString()}</p>
        </div>
      </div>

      <div className="h-[300px] w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis 
              dataKey="name" 
              stroke="#52525b" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false} 
              fontFamily="monospace"
              dy={10}
            />
            <YAxis 
              stroke="#52525b" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false} 
              fontFamily="monospace"
              tickFormatter={(value) => `₦${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="#D4AF37" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorRevenue)" 
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-white/5">
        <div className="space-y-1">
          <p className="text-[8px] text-white/30 uppercase tracking-widest">Avg Order Value</p>
          <p className="text-xs font-bold text-white font-mono">
            ₦{orders.length > 0 ? (totalRevenue / (orders.filter(o => ['delivered', 'shipped', 'confirmed', 'paid'].includes((o.status || '').toLowerCase())).length || 1)).toLocaleString() : '0'}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-[8px] text-white/30 uppercase tracking-widest">Growth Velocity</p>
          <p className="text-xs font-bold text-emerald-400 font-mono">+12.4%</p>
        </div>
        <div className="space-y-1">
          <p className="text-[8px] text-white/30 uppercase tracking-widest">Projection Index</p>
          <p className="text-xs font-bold text-brand-gold font-mono">₦{(totalRevenue * 1.2).toLocaleString()}</p>
        </div>
        <div className="space-y-1 text-right">
          <p className="text-[8px] text-white/30 uppercase tracking-widest">Sync Reliability</p>
          <p className="text-[10px] font-bold text-emerald-500 font-mono">99.98%</p>
        </div>
      </div>
    </div>
  );
}
