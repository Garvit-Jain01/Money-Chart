
import React, { useState } from 'react';
import { Wallet, ShieldAlert, CheckCircle, Percent } from 'lucide-react';
import { Budget } from '../types';

interface BudgetManagerProps {
  budget: Budget;
  onSave: (b: Budget) => void;
  currentMonthExpense: number;
}

const BudgetManager: React.FC<BudgetManagerProps> = ({ budget, onSave, currentMonthExpense }) => {
  const [limit, setLimit] = useState(budget.monthlyLimit.toString());
  const percent = budget.monthlyLimit > 0 ? (currentMonthExpense / budget.monthlyLimit) * 100 : 0;
  
  const getStatus = () => {
    if (percent >= 100) return { label: 'CRITICAL LIMIT', color: 'text-rose-400', glass: 'glass-tint-red', icon: <ShieldAlert size={36} /> };
    if (percent >= 75) return { label: 'WARNING REACHED', color: 'text-amber-400', glass: 'glass-tint-yellow', icon: <ShieldAlert size={36} /> };
    return { label: 'OPTIMAL RANGE', color: 'text-emerald-400', glass: 'glass-tint-green', icon: <CheckCircle size={36} /> };
  };

  const status = getStatus();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-32">
      <div className="apple-glass p-12 shadow-2xl">
        <div className="flex items-center gap-8 mb-16">
          <div className="w-20 h-20 bg-white/5 border border-white/10 text-white rounded-[32px] flex items-center justify-center shadow-2xl">
            <Wallet size={40} />
          </div>
          <div>
            <h3 className="text-4xl font-black text-white tracking-tighter leading-none mb-2">Liquidity Cap</h3>
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em]">Global Resource Ceiling</p>
          </div>
        </div>

        <div className="space-y-12">
          <div className="space-y-5">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Define Limit (₹)</label>
            <div className="flex gap-6">
              <input
                type="number"
                placeholder="0"
                className="flex-1 px-8 py-6 apple-input rounded-[28px] text-white text-3xl font-black outline-none shadow-inner"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
              />
              <button 
                onClick={() => onSave({ monthlyLimit: parseFloat(limit) || 0 })}
                className="bg-indigo-600/90 hover:bg-indigo-600 hover:scale-[1.05] active:scale-95 text-white px-12 py-6 rounded-[28px] font-black uppercase tracking-[0.3em] text-[11px] transition-all shadow-[0_15px_50px_rgba(79,70,229,0.3)] border-t border-white/20"
              >
                Set
              </button>
            </div>
          </div>

          <div className="p-12 bg-black/40 rounded-[48px] border border-white/5 shadow-2xl space-y-12 relative overflow-hidden group">
            <div className="flex justify-between items-end relative z-10">
              <div>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mb-5">Consumed Capital</p>
                <p className="text-7xl font-black text-white tabular-nums leading-none tracking-tighter group-hover:text-indigo-300 transition-colors">₹{currentMonthExpense.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mb-3">Target Ceiling</p>
                <p className="text-2xl font-black text-slate-500 tabular-nums opacity-40">/ ₹{budget.monthlyLimit.toLocaleString()}</p>
              </div>
            </div>

            <div className="space-y-6 relative z-10">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.3em]">
                <span className="text-slate-500">Resource Depletion</span>
                <span className={`${status.color} bg-white/5 backdrop-blur-3xl px-6 py-2 rounded-2xl border border-white/10 shadow-2xl font-black`}>{percent.toFixed(1)}%</span>
              </div>
              <div className="w-full h-7 bg-black/60 rounded-full border border-white/10 shadow-[inset_0_2px_15px_rgba(0,0,0,0.8)] p-1.5 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 rounded-full shadow-[0_0_25px_rgba(0,0,0,0.5)] ${
                    percent >= 100 ? 'bg-rose-600 shadow-rose-900/50' : percent >= 75 ? 'bg-amber-500 shadow-amber-900/50' : 'bg-indigo-600 shadow-indigo-900/50'
                  }`}
                  style={{ width: `${Math.min(100, percent)}%` }}
                />
              </div>
            </div>
            <div className="absolute top-[-20%] right-[-20%] w-64 h-64 bg-white/5 rounded-full blur-[60px] group-hover:scale-110 transition-transform"></div>
          </div>
        </div>
      </div>

      <div className="space-y-10">
        <div className={`p-12 rounded-[56px] shadow-[0_40px_100px_rgba(0,0,0,0.6)] flex flex-col justify-center min-h-[400px] border-none transition-all duration-700 relative overflow-hidden group ${status.glass}`}>
          <div className="flex items-center gap-8 mb-12 relative z-10">
            <div className="p-6 rounded-[32px] bg-white/5 shadow-2xl border border-white/10 backdrop-blur-3xl group-hover:scale-110 transition-transform">
              {status.icon}
            </div>
            <div>
              <h4 className={`text-4xl font-black uppercase tracking-tighter leading-none ${status.color}`}>Status: {status.label}</h4>
              <p className="text-[10px] font-black opacity-40 mt-3 uppercase tracking-[0.4em] text-white">Neural Monitoring Active</p>
            </div>
          </div>
          <p className={`text-2xl leading-tight font-black relative z-10 ${status.color} tracking-tight`}>
            {percent >= 100 
              ? "LIQUIDITY ALERT: Total resource depletion detected. Initiate immediate cessation of all non-structural flux clusters."
              : percent >= 75 
                ? "THRESHOLD WARNING: Operating at critical budgetary density. Minimize supplementary variable outflows."
                : "OPTIMAL PARAMETERS: Ledger flux is normalized within established ceiling. Maintain current asset preservation strategy."}
          </p>
          <div className="absolute bottom-[-20%] left-[-10%] w-64 h-64 bg-white/5 rounded-full blur-[60px]"></div>
        </div>

        <div className="bg-slate-900/80 apple-glass p-12 rounded-[56px] shadow-[0_50px_120px_rgba(0,0,0,0.7)] flex items-center justify-between relative overflow-hidden group">
          <div className="relative z-10">
            <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-5">Remaining Liquidity</h5>
            <p className="text-6xl font-black tabular-nums tracking-tighter text-white group-hover:text-indigo-400 transition-colors">
              ₹{Math.max(0, budget.monthlyLimit - currentMonthExpense).toLocaleString()}
            </p>
          </div>
          <div className="w-24 h-24 rounded-[32px] border border-white/10 flex items-center justify-center bg-white/5 shadow-inner group relative z-10 hover:rotate-12 transition-transform">
            <Percent size={40} className="text-indigo-400" />
          </div>
          <div className="absolute top-[-20%] right-[-10%] w-80 h-80 bg-indigo-500/10 rounded-full blur-[80px]"></div>
        </div>
      </div>
    </div>
  );
};

export default BudgetManager;
