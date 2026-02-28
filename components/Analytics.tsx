
import React, { useMemo } from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend 
} from 'recharts';
import { Transaction, TransactionType } from '../types';

interface AnalyticsProps {
  transactions: Transaction[];
}

const COLORS = [
  '#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6', 
  '#ec4899', '#06b6d4', '#84cc16', '#475569', '#78350f'
];

const Analytics: React.FC<AnalyticsProps> = ({ transactions }) => {
  const categoryData = useMemo(() => {
    const expenses = transactions.filter(t => t.type === TransactionType.EXPENSE);
    const groups = expenses.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(groups).map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const monthlyTrendData = useMemo(() => {
    const groups = transactions.reduce((acc, t) => {
      const date = new Date(t.date);
      const key = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
      
      if (!acc[key]) acc[key] = { name: key, income: 0, expense: 0 };
      if (t.type === TransactionType.INCOME) acc[key].income += t.amount;
      else acc[key].expense += t.amount;
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(groups).reverse().slice(-6);
  }, [transactions]);

  const stats = useMemo(() => {
    const expenses = transactions.filter(t => t.type === TransactionType.EXPENSE);
    if (expenses.length === 0) return null;
    
    const total = expenses.reduce((sum, t) => sum + t.amount, 0);
    const highest = categoryData[0];
    const average = total / (new Set(transactions.map(t => new Date(t.date).getMonth())).size || 1);
    const income = transactions.filter(t => t.type === TransactionType.INCOME).reduce((sum, t) => sum + t.amount, 0);
    const savingsRate = income > 0 ? ((income - total) / income) * 100 : 0;

    return { total, highest, average, savingsRate };
  }, [transactions, categoryData]);

  if (transactions.length === 0) {
    return (
      <div className="h-[65vh] flex flex-col items-center justify-center text-center p-20 apple-glass shadow-2xl border-dashed">
        <p className="font-black text-slate-600 uppercase tracking-[0.4em] text-xs">Zero dataset records.</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-32">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <DarkMiniMetric label="Flux Velocity" value={`₹${stats?.average.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} />
        <DarkMiniMetric label="Capital Yield" value={`${stats?.savingsRate.toFixed(1)}%`} accent={stats?.savingsRate && stats.savingsRate > 20 ? 'text-emerald-400' : 'text-white'} />
        <DarkMiniMetric label="Anchor Load" value={stats?.highest?.name || 'N/A'} />
        <DarkMiniMetric label="Global Outflow" value={`₹${stats?.total.toLocaleString()}`} accent="text-rose-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="apple-glass p-12 h-[550px] flex flex-col shadow-2xl relative overflow-hidden group">
          <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-12 border-b border-white/5 pb-6">Cluster Dispersion</h3>
          <div className="flex-1 relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  innerRadius={100}
                  outerRadius={150}
                  paddingAngle={10}
                  dataKey="value"
                  stroke="none"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => `₹${value.toLocaleString()}`}
                  contentStyle={{ 
                    borderRadius: '24px', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    boxShadow: '0 20px 80px rgba(0,0,0,0.8)',
                    background: 'rgba(15, 23, 42, 0.9)',
                    backdropFilter: 'blur(20px)',
                    color: '#fff',
                    fontWeight: '900',
                    fontSize: '14px'
                  }}
                />
                <Legend verticalAlign="bottom" height={50} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-white/5 rounded-full blur-[60px] group-hover:bg-white/10 transition-all"></div>
        </div>

        <div className="apple-glass p-12 h-[550px] flex flex-col shadow-2xl relative overflow-hidden group">
          <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-12 border-b border-white/5 pb-6">Temporal Flux Velocity</h3>
          <div className="flex-1 relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrendData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 900, fill: '#64748b' }} />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ 
                    borderRadius: '24px', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    boxShadow: '0 20px 80px rgba(0,0,0,0.8)',
                    background: 'rgba(15, 23, 42, 0.9)',
                    backdropFilter: 'blur(20px)',
                    color: '#fff',
                    fontWeight: '900',
                    fontSize: '14px'
                  }}
                  formatter={(value: number) => `₹${value.toLocaleString()}`}
                />
                <Bar dataKey="income" fill="#10b981" radius={[10, 10, 10, 10]} barSize={20} />
                <Bar dataKey="expense" fill="#f43f5e" radius={[10, 10, 10, 10]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="absolute bottom-[-10%] left-[-10%] w-80 h-80 bg-indigo-500/10 rounded-full blur-[80px] group-hover:bg-indigo-500/15 transition-all"></div>
        </div>
      </div>
    </div>
  );
};

const DarkMiniMetric: React.FC<{ label: string; value: string; accent?: string }> = ({ label, value, accent }) => (
  <div className="apple-glass p-10 flex flex-col justify-center shadow-2xl group hover:scale-[1.05] transition-all duration-500">
    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3 group-hover:text-indigo-400 transition-colors">{label}</p>
    <p className={`text-3xl font-black tabular-nums tracking-tighter truncate ${accent || 'text-white'}`}>{value}</p>
  </div>
);

export default Analytics;
