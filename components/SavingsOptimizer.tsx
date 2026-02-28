
import React, { useMemo, useState } from 'react';
import { 
  TrendingDown, 
  Calculator, 
  PieChart as PieChartIcon, 
  Zap, 
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle
} from 'lucide-react';
import { Transaction, TransactionType, Goal, Category, OptimizationSuggestion } from '../types';

interface SavingsOptimizerProps {
  transactions: Transaction[];
  goal: Goal | null;
}

const SavingsOptimizer: React.FC<SavingsOptimizerProps> = ({ transactions, goal }) => {
  const [cuts, setCuts] = useState<Record<string, number>>({});

  const stats = useMemo(() => {
    if (!goal || transactions.length === 0) return null;

    const targetDate = new Date(goal.targetDate);
    const now = new Date();
    const diffTime = Math.max(0, targetDate.getTime() - now.getTime());
    const monthsLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30.44)) || 1;
    
    const remainingToSave = goal.targetAmount - goal.currentSavings;
    const requiredMonthly = remainingToSave / monthsLeft;

    const expenseTx = transactions.filter(t => t.type === TransactionType.EXPENSE);
    const incomeTx = transactions.filter(t => t.type === TransactionType.INCOME);
    
    const uniqueMonths = new Set(transactions.map(t => {
      const d = new Date(t.date);
      return `${d.getMonth()}-${d.getFullYear()}`;
    })).size || 1;

    const avgIncome = incomeTx.reduce((sum, t) => sum + t.amount, 0) / uniqueMonths;
    const avgExpense = expenseTx.reduce((sum, t) => sum + t.amount, 0) / uniqueMonths;
    const currentSavingCapacity = Math.max(0, avgIncome - avgExpense);
    const savingsGap = requiredMonthly - currentSavingCapacity;

    const categoryAverages = expenseTx.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + (t.amount / uniqueMonths);
      return acc;
    }, {} as Record<string, number>);

    const totalAvgExpense = Object.values(categoryAverages).reduce((a, b) => a + b, 0);
    const suggestions: OptimizationSuggestion[] = Object.entries(categoryAverages).map(([cat, avg]) => {
      let cutPercent = 0;
      if (savingsGap > 0) {
        const shareOfExpense = avg / totalAvgExpense;
        cutPercent = Math.min(40, (savingsGap * shareOfExpense) / avg * 100);
      }
      
      const moneySaved = (avg * cutPercent) / 100;

      return {
        category: cat as Category,
        avgSpent: avg,
        suggestedCutPercent: Math.round(cutPercent),
        moneySaved: Math.round(moneySaved),
        newLimit: Math.round(avg - moneySaved)
      };
    }).sort((a, b) => b.moneySaved - a.moneySaved);

    let feasibility: 'achievable' | 'difficult' | 'unrealistic' = 'achievable';
    if (savingsGap > totalAvgExpense * 0.4) feasibility = 'unrealistic';
    else if (savingsGap > 0) feasibility = 'difficult';

    return {
      monthsLeft,
      requiredMonthly,
      currentSavingCapacity,
      savingsGap,
      suggestions,
      avgExpense,
      feasibility,
      totalAvgExpense,
      remainingToSave
    };
  }, [transactions, goal]);

  const simulatorResults = useMemo(() => {
    if (!stats) return null;
    
    let simulatedExtraSavings = 0;
    Object.entries(cuts).forEach(([cat, pct]) => {
      const avg = stats.suggestions.find(s => s.category === cat)?.avgSpent || 0;
      simulatedExtraSavings += (avg * pct) / 100;
    });

    const newMonthlySaving = stats.currentSavingCapacity + simulatedExtraSavings;
    const newMonthsToGoal = newMonthlySaving > 0 ? stats.remainingToSave / newMonthlySaving : Infinity;
    const successProbability = Math.min(100, (newMonthlySaving / stats.requiredMonthly) * 100);

    return {
      newMonthlySaving,
      newMonthsToGoal,
      successProbability
    };
  }, [stats, cuts]);

  if (!goal) {
    return (
      <div className="h-[60vh] apple-glass flex flex-col items-center justify-center text-center p-20 shadow-2xl">
        <div className="w-28 h-28 bg-white/5 rounded-[40px] flex items-center justify-center mb-10 border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
          <Calculator className="text-slate-600" size={56} />
        </div>
        <h3 className="text-3xl font-black text-white mb-4 tracking-tighter uppercase">Initialize Strategy Target</h3>
        <p className="text-slate-500 font-bold max-w-sm">The optimization engine requires specific target metrics to calculate reduction ratios.</p>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-12 pb-32 animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Premium Dark Summary Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <DarkSummaryWidget 
          label="Required Intensity" 
          value={`₹${Math.round(stats.requiredMonthly).toLocaleString()}`} 
          sub="Stable periodic target"
          icon={<Calculator size={20} />}
        />
        <DarkSummaryWidget 
          label="Current Velocity" 
          value={`₹${Math.round(stats.currentSavingCapacity).toLocaleString()}`} 
          sub="Natural flux capacity"
          icon={<Zap size={20} />}
        />
        <DarkSummaryWidget 
          label="Efficiency Deficit" 
          value={`₹${Math.max(0, Math.round(stats.savingsGap)).toLocaleString()}`} 
          sub="Additional lock required"
          icon={<TrendingDown size={20} />}
          highlight={stats.savingsGap > 0}
        />
        <div className={`p-10 rounded-[40px] border-none shadow-2xl flex flex-col justify-center transition-all duration-700 ${
          stats.feasibility === 'achievable' ? 'glass-tint-green text-emerald-100' :
          stats.feasibility === 'difficult' ? 'glass-tint-yellow text-amber-100' :
          'glass-tint-red text-rose-100'
        }`}>
          <div className="flex items-center gap-4 mb-3">
            {stats.feasibility === 'achievable' ? <CheckCircle2 size={24} /> : 
             stats.feasibility === 'difficult' ? <AlertTriangle size={24} /> : <XCircle size={24} />}
            <p className="text-[11px] font-black uppercase tracking-[0.3em]">Matrix State</p>
          </div>
          <p className="text-4xl font-black uppercase tracking-tighter leading-none">{stats.feasibility}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-10">
          <div className="apple-glass overflow-hidden shadow-2xl">
            <div className="p-12 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div>
                <h3 className="text-3xl font-black text-white tracking-tighter">Heuristic Roadmap</h3>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-1">Priority Categorical Reduction Clusters</p>
              </div>
              <div className="p-4 bg-indigo-500/10 rounded-[24px] border border-indigo-400/20 shadow-2xl">
                <PieChartIcon className="text-indigo-400" size={32} />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/[0.03] border-b border-white/5">
                    <th className="px-12 py-6 text-[11px] font-black text-slate-500 uppercase tracking-[0.25em]">Cluster</th>
                    <th className="px-12 py-6 text-[11px] font-black text-slate-500 uppercase tracking-[0.25em]">Avg Flux</th>
                    <th className="px-12 py-6 text-[11px] font-black text-slate-500 uppercase tracking-[0.25em] text-center">Suggested Cut</th>
                    <th className="px-12 py-6 text-[11px] font-black text-white uppercase tracking-[0.25em] text-right">Potential Gain</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  {stats.suggestions.map((s, i) => (
                    <tr key={i} className="table-row-hover group">
                      <td className="px-12 py-7">
                        <span className="font-black text-white text-xl tracking-tight">{s.category}</span>
                      </td>
                      <td className="px-12 py-7 text-slate-400 font-bold tabular-nums text-lg">₹{s.avgSpent.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                      <td className="px-12 py-7 text-center">
                        <span className={`px-5 py-2 rounded-2xl text-[10px] font-black border-none shadow-2xl ${
                          s.suggestedCutPercent > 20 ? 'glass-tint-red text-rose-300' : 'glass-tint-green text-emerald-300'
                        }`}>
                          {s.suggestedCutPercent}% REDUCTION
                        </span>
                      </td>
                      <td className="px-12 py-7 text-right font-black text-emerald-400 tabular-nums text-2xl">
                        +₹{s.moneySaved.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-950/40 text-white border-t border-white/10">
                    <td colSpan={3} className="px-12 py-10 font-black uppercase tracking-[0.3em] text-[11px] text-slate-500">Aggregated Periodic Recovery Potential</td>
                    <td className="px-12 py-10 text-right font-black text-5xl tabular-nums tracking-tighter text-emerald-400">
                      ₹{stats.suggestions.reduce((a, b) => a + b.moneySaved, 0).toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-indigo-900/20 p-12 rounded-[56px] border border-indigo-400/20 space-y-8 shadow-2xl">
            <h4 className="flex items-center gap-4 text-white font-black uppercase tracking-widest text-lg">
              <Zap size={28} className="text-indigo-400" />
              Strategic Protocols
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {stats.suggestions.slice(0, 4).map((s, i) => (
                s.suggestedCutPercent > 0 && (
                  <div key={i} className="flex items-start gap-5 apple-glass p-8 border-white/5 hover:bg-white/[0.08] transition-all duration-300 shadow-2xl group">
                    <div className="w-10 h-10 rounded-[18px] bg-indigo-500 text-white flex items-center justify-center shrink-0 text-xs font-black shadow-[0_0_30px_rgba(99,102,241,0.5)] group-hover:rotate-6 transition-transform">{i+1}</div>
                    <p className="text-lg font-bold text-slate-300 leading-tight">
                      Adjust <span className="text-indigo-400 font-black">{s.suggestedCutPercent}%</span> of <span className="font-black text-white">{s.category}</span> flux to recover <span className="font-black text-emerald-400">₹{s.moneySaved}</span> monthly.
                    </p>
                  </div>
                )
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-10">
          <div className="apple-glass p-12 shadow-[0_50px_100px_rgba(0,0,0,0.8)] relative overflow-hidden group">
            <div className="flex items-center justify-between border-b border-white/5 pb-8 mb-10">
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Heuristic Matrix</h3>
              <HelpCircle className="text-slate-500" size={28} />
            </div>
            
            <div className="space-y-10">
              {stats.suggestions.slice(0, 4).map((s) => (
                <div key={s.category} className="space-y-5">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.25em]">
                    <span className="text-slate-500">{s.category} Intensity</span>
                    <span className="text-indigo-400 bg-white/5 px-4 py-1.5 rounded-xl border border-white/5 font-black">{(cuts[s.category] || 0)}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" max="60" step="5"
                    className="w-full h-2 bg-black/40 rounded-full appearance-none cursor-pointer accent-indigo-500 border border-white/5 shadow-inner"
                    value={cuts[s.category] || 0}
                    onChange={(e) => setCuts({...cuts, [s.category]: parseInt(e.target.value)})}
                  />
                </div>
              ))}
            </div>

            {simulatorResults && (
              <div className="pt-12 mt-12 border-t border-white/5 space-y-8">
                <div className="bg-slate-900 p-10 rounded-[32px] text-white shadow-2xl relative overflow-hidden group">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3 relative z-10">Matrix Completion Offset</p>
                  <p className="text-5xl font-black relative z-10 tabular-nums tracking-tighter text-white">
                    {simulatorResults.newMonthsToGoal === Infinity ? 'Critical' : `${simulatorResults.newMonthsToGoal.toFixed(1)} Mo`}
                  </p>
                  <div className="absolute right-[-20%] bottom-[-20%] w-48 h-48 bg-indigo-500/10 rounded-full blur-[60px] group-hover:scale-110 transition-transform"></div>
                </div>
                <div>
                  <div className="flex justify-between items-center text-[10px] font-black uppercase mb-4 tracking-[0.3em]">
                    <span className="text-slate-500">Success Probability</span>
                    <span className="text-white bg-indigo-500/20 px-4 py-1.5 rounded-xl border border-indigo-400/20">{simulatorResults.successProbability.toFixed(0)}%</span>
                  </div>
                  <div className="h-5 bg-black/50 rounded-full p-1.5 border border-white/10 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-500 rounded-full transition-all duration-700 shadow-[0_0_20px_rgba(79,70,229,0.5)]"
                      style={{ width: `${simulatorResults.successProbability}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="apple-glass p-12 space-y-10 bg-white/[0.02]">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] border-b border-white/5 pb-6">Ledger Intelligence</h3>
            <div className="space-y-8">
              <InsightBlock label="Aggregated Cost Anchor" value={stats.suggestions[0].category} sub={`${Math.round((stats.suggestions[0].avgSpent / stats.avgExpense) * 100)}% of global outflow`} />
              <InsightBlock label="Periodic Threshold" value={`₹${Math.round(stats.requiredMonthly).toLocaleString()}`} sub="Optimal retention magnitude" />
              <InsightBlock label="Efficiency Coefficient" value={`${Math.round((stats.currentSavingCapacity / stats.totalAvgExpense) * 100)}%`} sub="Resource utilization ratio" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DarkSummaryWidget: React.FC<{ label: string; value: string; sub: string; icon: React.ReactNode; highlight?: boolean }> = ({ label, value, sub, icon, highlight }) => (
  <div className={`p-10 apple-glass group transition-all duration-500 ${highlight ? 'ring-2 ring-indigo-500/40 shadow-[0_0_40px_rgba(79,70,229,0.2)]' : ''} hover:scale-[1.03] shadow-2xl`}>
    <div className="flex items-center gap-4 text-slate-500 mb-6 group-hover:text-indigo-400 transition-colors">
      <div className="bg-white/5 p-2.5 rounded-xl border border-white/5 shadow-2xl">{icon}</div>
      <p className="text-[10px] font-black uppercase tracking-[0.25em]">{label}</p>
    </div>
    <p className="text-4xl font-black text-white tabular-nums tracking-tighter">{value}</p>
    <p className="text-[10px] font-black text-slate-500 uppercase mt-2.5 tracking-widest">{sub}</p>
  </div>
);

const InsightBlock: React.FC<{ label: string; value: string; sub: string }> = ({ label, value, sub }) => (
  <div className="space-y-2">
    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">{label}</p>
    <p className="text-2xl font-black text-white tracking-tighter leading-none">{value}</p>
    <p className="text-[11px] font-bold text-slate-500 opacity-60 mt-1">{sub}</p>
  </div>
);

export default SavingsOptimizer;
