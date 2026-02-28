import React from 'react';
import { TrendingUp, TrendingDown, Wallet, ArrowRight } from 'lucide-react';
import { Transaction, TransactionType } from '../types';

interface DashboardProps {
  totals: { income: number; expense: number };
  balance: number;
  recentTransactions: Transaction[];
  onViewAll: () => void;
  onAddTransaction: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ totals, balance, recentTransactions, onViewAll, onAddTransaction }) => {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Premium Apple Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <AppleWidget 
          label="Available Liquidity" 
          value={balance} 
          icon={<Wallet size={24} />}
          color="indigo"
          isCurrency
        />
        <AppleWidget 
          label="Total Inflow" 
          value={totals.income} 
          icon={<TrendingUp size={24} />}
          color="emerald"
          isCurrency
        />
        <AppleWidget 
          label="Total Outflow" 
          value={totals.expense} 
          icon={<TrendingDown size={24} />}
          color="rose"
          isCurrency
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Activity Widget */}
        <div className="apple-glass p-10 flex flex-col h-[520px]">
          <div className="flex items-center justify-between mb-10 border-b border-black/5 pb-6">
            <h3 className="text-xl font-black text-primary uppercase tracking-tighter">Activity Stream</h3>
            <button 
              onClick={onViewAll}
              className="text-[10px] font-black text-indigo-500 hover:text-indigo-600 flex items-center gap-2 transition-all bg-indigo-500/10 px-5 py-2.5 rounded-2xl border border-indigo-400/10"
            >
              Ledger <ArrowRight size={14} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between p-5 rounded-[24px] bg-subtle hover:bg-white/[0.1] border border-transparent hover:border-black/5 transition-all group cursor-default">
                  <div className="flex items-center gap-5">
                    <div className={`w-14 h-14 rounded-[20px] flex items-center justify-center transition-all duration-500 group-hover:scale-105 group-hover:rotate-3 shadow-md ${
                      t.type === TransactionType.INCOME ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                    }`}>
                      {t.type === TransactionType.INCOME ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                    </div>
                    <div>
                      <p className="text-lg font-bold text-primary tracking-tight">{t.category}</p>
                      <p className="text-[10px] font-black text-muted uppercase tracking-widest mt-0.5">{new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                  </div>
                  <p className={`text-xl font-black tabular-nums ${
                    t.type === TransactionType.INCOME ? 'text-emerald-500' : 'text-primary'
                  }`}>
                    {t.type === TransactionType.INCOME ? '+' : '-'}₹{t.amount.toLocaleString()}
                  </p>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted space-y-5">
                <div className="w-20 h-20 bg-black/5 rounded-3xl flex items-center justify-center border-2 border-dashed border-black/10">
                   <Wallet size={32} className="opacity-30" />
                </div>
                <p className="font-bold text-sm tracking-tight">No historical data available.</p>
              </div>
            )}
          </div>
        </div>

        {/* Insight Widget */}
        <div className="apple-glass p-12 bg-gradient-to-br from-indigo-500/10 to-blue-500/10 border-indigo-500/20 relative overflow-hidden flex flex-col justify-center h-[520px] group">
          <div className="relative z-10 space-y-10">
            <div className="inline-block px-5 py-2 bg-indigo-500/10 rounded-full text-[10px] font-black uppercase tracking-[0.25em] text-indigo-500 border border-indigo-500/20">
              Heuristic Engine
            </div>
            <h3 className="text-5xl font-black leading-[1.05] tracking-tighter text-primary">
              Smarter <br/><span className="text-indigo-500">Wealth Logic.</span>
            </h3>
            <p className="text-secondary text-lg leading-relaxed max-w-sm">
              Our proprietary consultant uses neural models to optimize your liquidity ratios based on historical flux.
            </p>
            <div className="space-y-5 pt-4">
              <PromoLine text="Structural goal targeting" />
              <PromoLine text="Probability success simulation" />
              <PromoLine text="Deep spending audit" />
            </div>
          </div>
          <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] group-hover:scale-110 transition-all duration-700"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-80 h-80 bg-blue-600/10 rounded-full blur-[80px]"></div>
        </div>
      </div>
    </div>
  );
};

const PromoLine: React.FC<{ text: string }> = ({ text }) => (
  <div className="flex items-center gap-4">
    <div className="w-6 h-6 bg-indigo-500/20 rounded-xl flex items-center justify-center border border-indigo-400/20">
      <div className="w-2 h-2 bg-indigo-500 rounded-full shadow-lg"></div>
    </div>
    <p className="text-[15px] font-bold text-secondary">{text}</p>
  </div>
);

const AppleWidget: React.FC<{ 
  label: string; 
  value: number; 
  icon: React.ReactNode; 
  color: 'indigo' | 'emerald' | 'rose';
  isCurrency?: boolean;
}> = ({ label, value, icon, color, isCurrency }) => {
  const colors = {
    indigo: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
    emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    rose: "text-rose-500 bg-rose-500/10 border-rose-500/20"
  };

  return (
    <div className="apple-glass p-10 flex flex-col gap-8 group hover:scale-[1.05] transition-all duration-500 cursor-default">
      <div className={`w-16 h-16 ${colors[color]} rounded-[24px] flex items-center justify-center shadow-md transition-all duration-700 group-hover:rotate-12`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-muted uppercase tracking-[0.25em] mb-2">{label}</p>
        <p className={`text-4xl font-black tabular-nums tracking-tighter text-primary group-hover:text-indigo-500 transition-colors`}>
          {isCurrency ? `₹${value.toLocaleString()}` : value}
        </p>
      </div>
    </div>
  );
};

export default Dashboard;