import React, { useState, useEffect } from 'react';
import { 
  BrainCircuit, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ArrowDownCircle, 
  Loader2,
  RefreshCw,
  // Fix: Added missing AlertCircle import
  AlertCircle
} from 'lucide-react';
import { Transaction, Goal, AdvisorResponse } from '../types';
import { getSmartFinancialAdvice } from '../services/geminiService';

interface AdvisorProps {
  transactions: Transaction[];
  goal: Goal | null;
}

const Advisor: React.FC<AdvisorProps> = ({ transactions, goal }) => {
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState<AdvisorResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchAdvice = async () => {
    if (!goal || transactions.length < 3) return;
    
    setLoading(true);
    setError(null);
    try {
      const result = await getSmartFinancialAdvice(transactions, goal);
      setAdvice(result);
    } catch (err) {
      setError("Heuristic stream interrupted. Verify cloud connectivity.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (goal && transactions.length >= 3 && !advice) {
      fetchAdvice();
    }
  }, [goal, transactions, advice]);

  const getFeasibilityIcon = (f: string) => {
    switch(f) {
      case 'achievable': return <CheckCircle2 className="text-emerald-400" size={36} />;
      case 'difficult': return <AlertTriangle className="text-amber-400" size={36} />;
      case 'unrealistic': return <XCircle className="text-rose-400" size={36} />;
      default: return <BrainCircuit size={36} className="text-indigo-400" />;
    }
  };

  const getFeasibilityGlass = (f: string) => {
    switch(f) {
      case 'achievable': return 'glass-tint-green text-emerald-100';
      case 'difficult': return 'glass-tint-yellow text-amber-100';
      case 'unrealistic': return 'glass-tint-red text-rose-100';
      default: return 'apple-glass text-slate-100';
    }
  };

  if (!goal) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center p-16 apple-glass shadow-2xl">
        <div className="w-24 h-24 bg-indigo-500/10 text-indigo-400 rounded-[32px] flex items-center justify-center mb-10 shadow-[0_0_50px_rgba(99,102,241,0.2)] border border-indigo-400/20">
          <BrainCircuit size={48} />
        </div>
        <h3 className="text-3xl font-black text-white mb-4 tracking-tighter uppercase">Target Required</h3>
        <p className="text-slate-400 font-bold max-w-sm mb-12 leading-relaxed text-lg">
          Initialize a savings target object to allow the Neural Consultant to map your current flux.
        </p>
      </div>
    );
  }

  if (transactions.length < 3) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center p-16 apple-glass shadow-2xl">
        <div className="w-24 h-24 bg-white/5 text-slate-500 rounded-[32px] flex items-center justify-center mb-10 shadow-2xl border border-white/10">
          <Sparkles size={48} />
        </div>
        <h3 className="text-3xl font-black text-white mb-4 tracking-tighter uppercase">Ledger Underflow</h3>
        <p className="text-slate-400 font-bold max-w-sm mb-12 leading-relaxed text-lg">
          Add a minimum of 3 transaction nodes to enable structural pattern detection algorithms.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-32">
      <div className="flex items-center justify-between apple-glass p-10 shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-indigo-600 text-white rounded-[32px] flex items-center justify-center shadow-[0_0_60px_rgba(79,70,229,0.4)] border-t border-white/20">
            <BrainCircuit size={36} />
          </div>
          <div>
            <h3 className="text-4xl font-black text-white uppercase tracking-tighter leading-none mb-3">AI Strategy Agent</h3>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.35em]">Gemini 3 Neural Logic</p>
          </div>
        </div>
        
        <button 
          onClick={fetchAdvice}
          disabled={loading}
          className="p-5 rounded-2xl bg-white/5 hover:bg-white/10 transition-all text-slate-200 border border-white/10 disabled:opacity-40 shadow-2xl flex items-center gap-4 font-black text-xs uppercase tracking-widest"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <><RefreshCw size={20} /> Re-Compute</>}
        </button>
      </div>

      {loading ? (
        <div className="h-[450px] flex flex-col items-center justify-center apple-glass p-16 text-center shadow-2xl">
          <div className="relative mb-12">
            <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-[60px] animate-pulse"></div>
            <Loader2 className="animate-spin text-white relative" size={80} />
          </div>
          <p className="text-3xl font-black text-white uppercase tracking-tight">Synthesizing Logic</p>
          <p className="text-slate-500 font-bold mt-3">Compiling optimal reduction strategies...</p>
        </div>
      ) : error ? (
        <div className="glass-tint-red p-16 rounded-[40px] text-center shadow-2xl border-none">
          <p className="text-rose-200 font-black text-3xl mb-10 tracking-tighter">{error}</p>
          <button onClick={fetchAdvice} className="bg-rose-600 text-white px-12 py-5 rounded-[24px] font-black text-sm uppercase tracking-widest shadow-2xl transition-transform hover:scale-105">Retry Stream</button>
        </div>
      ) : advice ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            {/* Liquid Tint Feasibility Card */}
            <div className={`p-12 rounded-[48px] border-none shadow-[0_30px_100px_rgba(0,0,0,0.5)] transition-all duration-700 ${getFeasibilityGlass(advice.feasibility)}`}>
              <div className="flex items-center gap-10 mb-10">
                <div className="bg-white/10 p-6 rounded-[32px] shadow-2xl border border-white/10 backdrop-blur-3xl">
                  {getFeasibilityIcon(advice.feasibility)}
                </div>
                <div>
                  <h4 className="text-5xl font-black uppercase tracking-tighter leading-none mb-3">
                    {advice.feasibility}
                  </h4>
                  <div className="inline-block px-5 py-2 bg-black/20 rounded-2xl font-black text-[10px] tracking-[0.3em] uppercase text-white/60">
                    Matrix Index
                  </div>
                </div>
              </div>
              <p className="text-3xl leading-[1.2] font-black tracking-tight mb-4">
                {advice.summary}
              </p>
            </div>

            <div className="space-y-8">
               <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] pl-6">Strategic Imperatives</h5>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {advice.recommendations.map((rec, i) => (
                  <div key={i} className="apple-glass p-10 flex flex-col hover:scale-[1.03] hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)] transition-all duration-500 group">
                    <div className="flex items-center justify-between mb-8">
                      <span className="bg-white/10 text-white text-[9px] font-black px-4 py-2 rounded-xl uppercase tracking-widest border border-white/5">
                        {rec.category}
                      </span>
                      <div className="flex items-center gap-2 text-emerald-400 font-black text-2xl tabular-nums">
                        <ArrowDownCircle size={26} />
                        ₹{rec.impactAmount}
                      </div>
                    </div>
                    <h5 className="text-2xl font-black text-white mb-5 leading-tight group-hover:text-indigo-300 transition-colors">{rec.suggestion}</h5>
                    <p className="text-[16px] text-slate-400 font-bold leading-relaxed flex-1">
                      {rec.reasoning}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-10">
            {/* Immersive Dark Projection Card */}
            <div className="bg-slate-900/60 apple-glass p-12 rounded-[48px] shadow-[0_40px_100px_rgba(0,0,0,0.6)] relative overflow-hidden group">
              <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-12 border-b border-white/5 pb-6">Ledger Flux Projections</h5>
              <div className="space-y-12 relative z-10">
                <div className="transition-transform duration-500 group-hover:translate-x-1">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Flux Velocity (Avg)</p>
                  <p className="text-6xl font-black tabular-nums tracking-tighter text-white">₹{advice.currentSavingCapacity.toLocaleString()}</p>
                </div>
                
                <div className="transition-transform duration-500 group-hover:translate-x-1">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Required Intensity</p>
                  <p className="text-6xl font-black text-indigo-400 tabular-nums tracking-tighter">₹{advice.requiredMonthlySavings.toLocaleString()}</p>
                </div>
                
                {advice.requiredMonthlySavings > advice.currentSavingCapacity && (
                  <div className="pt-12 mt-8 border-t border-white/5">
                    <div className="flex items-center gap-4 text-rose-500 font-black text-[11px] uppercase tracking-widest mb-4">
                      {/* Fix: AlertCircle is now defined */}
                      <AlertCircle size={18} /> Flux Deficit
                    </div>
                    <p className="text-3xl font-black text-rose-500 tabular-nums tracking-tight">
                      Gap: ₹{(advice.requiredMonthlySavings - advice.currentSavingCapacity).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
              <div className="absolute top-[-20%] right-[-20%] w-80 h-80 bg-indigo-500/10 rounded-full blur-[80px]"></div>
            </div>

            <div className="apple-glass p-12 relative overflow-hidden group hover:shadow-indigo-900/20 transition-all duration-700">
              <div className="relative z-10">
                <div className="flex items-center gap-5 mb-8">
                  <div className="p-4 bg-indigo-500/10 rounded-[24px] border border-indigo-400/20 shadow-xl group-hover:rotate-12 transition-transform duration-500">
                    <Sparkles className="text-indigo-400" size={28} />
                  </div>
                  <h6 className="font-black text-xl uppercase tracking-tight text-white">Neural Tip</h6>
                </div>
                <p className="text-xl font-bold text-slate-400 italic leading-relaxed">
                  "Recursive adjustments in variable cost clusters yield the highest long-term liquidity retention without structural life impact."
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="h-[550px] apple-glass p-20 text-center flex flex-col items-center justify-center shadow-2xl">
          <div className="w-28 h-28 bg-indigo-500/10 text-indigo-400 border border-indigo-400/20 rounded-[40px] flex items-center justify-center mb-12 shadow-[0_0_80px_rgba(99,102,241,0.3)] animate-float">
            <BrainCircuit size={56} />
          </div>
          <h4 className="text-4xl font-black text-white mb-8 uppercase tracking-tighter">Engage Analysis</h4>
          <p className="text-slate-400 font-bold max-w-sm mb-16 text-xl leading-relaxed">
            Execute a full categorical audit across your recorded financial flux.
          </p>
          <button 
            onClick={fetchAdvice}
            className="bg-indigo-600/90 hover:bg-indigo-600 hover:scale-105 active:scale-95 text-white px-16 py-6 rounded-[28px] font-black text-lg uppercase tracking-widest shadow-[0_20px_80px_rgba(79,70,229,0.4)] transition-all flex items-center gap-5 border-t border-white/20"
          >
            <Sparkles size={28} />
            Compute Metrics
          </button>
        </div>
      )}
    </div>
  );
};

export default Advisor;