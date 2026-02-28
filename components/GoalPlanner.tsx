
import React, { useState, useMemo } from 'react';
import { Target, AlertCircle } from 'lucide-react';
import { Goal } from '../types';

interface GoalPlannerProps {
  currentGoal: Goal | null;
  onSave: (g: Goal) => void;
  balance: number;
}

const GoalPlanner: React.FC<GoalPlannerProps> = ({ currentGoal, onSave, balance }) => {
  const [formData, setFormData] = useState({
    name: currentGoal?.name || '',
    targetAmount: currentGoal?.targetAmount || '',
    targetDate: currentGoal?.targetDate || '',
    currentSavings: currentGoal?.currentSavings || ''
  });

  const calculations = useMemo(() => {
    if (!currentGoal) return null;
    
    const targetDate = new Date(currentGoal.targetDate);
    const now = new Date();
    const diffTime = Math.max(0, targetDate.getTime() - now.getTime());
    const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30.44));
    
    const remaining = currentGoal.targetAmount - currentGoal.currentSavings;
    const requiredMonthly = diffMonths > 0 ? remaining / diffMonths : remaining;
    
    const progress = (currentGoal.currentSavings / currentGoal.targetAmount) * 100;

    return { diffMonths, remaining, requiredMonthly, progress };
  }, [currentGoal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.targetAmount || !formData.targetDate) return;

    onSave({
      id: currentGoal?.id || Math.random().toString(36).substring(7),
      name: formData.name,
      targetAmount: parseFloat(formData.targetAmount.toString()),
      targetDate: formData.targetDate,
      currentSavings: parseFloat(formData.currentSavings.toString() || '0')
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="apple-glass p-12 shadow-2xl">
        <div className="flex items-center gap-6 mb-16">
          <div className="w-20 h-20 bg-white/5 text-indigo-400 border border-white/10 rounded-[32px] flex items-center justify-center shadow-[0_15px_60px_rgba(0,0,0,0.5)]">
            <Target size={36} />
          </div>
          <div>
            <h3 className="text-4xl font-black text-white tracking-tighter">Target Node</h3>
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] mt-1">Asset Allocation Matrix</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="space-y-8">
            <div className="space-y-4">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] ml-2">Objective Identifier</label>
              <input
                required
                type="text"
                placeholder="e.g. Next-Gen Workstation"
                className="w-full px-8 py-6 apple-input rounded-[28px] text-white font-black text-xl placeholder:text-slate-600 outline-none shadow-inner"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] ml-2">Total Capital (₹)</label>
                <input
                  required
                  type="number"
                  placeholder="50000"
                  className="w-full px-8 py-6 apple-input rounded-[28px] text-white font-black text-xl shadow-inner"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData({...formData, targetAmount: e.target.value})}
                />
              </div>
              <div className="space-y-4">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] ml-2">Deadline Offset</label>
                <input
                  required
                  type="date"
                  className="w-full px-8 py-6 apple-input rounded-[28px] text-white font-black text-lg shadow-inner"
                  value={formData.targetDate}
                  onChange={(e) => setFormData({...formData, targetDate: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] ml-2">Initial Liquidity Lock (₹)</label>
              <input
                type="number"
                placeholder="0"
                className="w-full px-8 py-6 apple-input rounded-[28px] text-white font-black text-xl shadow-inner"
                value={formData.currentSavings}
                onChange={(e) => setFormData({...formData, currentSavings: e.target.value})}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-slate-900 hover:bg-black hover:scale-[1.01] active:scale-95 text-white font-black text-sm uppercase tracking-[0.3em] py-7 rounded-[28px] shadow-[0_20px_80px_rgba(0,0,0,0.6)] transition-all border-t border-white/10 mt-6"
          >
            {currentGoal ? 'Synchronize Matrix' : 'Initialize Strategy'}
          </button>
        </form>
      </div>

      <div className="space-y-10">
        {currentGoal && calculations ? (
          <>
            <div className="apple-glass p-12 shadow-2xl">
              <div className="flex justify-between items-center mb-12">
                <h4 className="text-3xl font-black text-white tracking-tighter">
                  Target: <span className="text-indigo-400">"{currentGoal.name}"</span>
                </h4>
                <div className="px-5 py-2 bg-white/5 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest border border-white/5">
                  Live Stream
                </div>
              </div>
              
              <div className="space-y-12">
                <div className="group">
                  <div className="flex justify-between items-end mb-5">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] group-hover:text-indigo-400 transition-colors">Completion Density</span>
                    <span className="text-4xl font-black text-indigo-400 tabular-nums tracking-tighter">{Math.min(100, calculations.progress).toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-6 bg-black/40 rounded-full p-1.5 border border-white/10 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-500 rounded-full transition-all duration-1000 shadow-[0_0_20px_rgba(79,70,229,0.5)]"
                      style={{ width: `${Math.min(100, calculations.progress)}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="p-10 bg-white/[0.03] rounded-[32px] border border-white/10 shadow-2xl group hover:bg-white/[0.05] transition-all">
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-4 group-hover:text-slate-300 transition-colors">Intensity Ratio</p>
                    <p className="text-4xl font-black text-white tabular-nums tracking-tighter">₹{calculations.requiredMonthly.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                    <p className="text-[9px] font-bold text-slate-500 mt-2 uppercase tracking-widest">Per period</p>
                  </div>
                  <div className="p-10 bg-white/[0.03] rounded-[32px] border border-white/10 shadow-2xl group hover:bg-white/[0.05] transition-all">
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-4 group-hover:text-slate-300 transition-colors">Temporal Offset</p>
                    <p className="text-4xl font-black text-white tabular-nums tracking-tighter">{calculations.diffMonths}</p>
                    <p className="text-[9px] font-bold text-slate-500 mt-2 uppercase tracking-widest">Months remaining</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-tint-yellow p-12 rounded-[48px] border-none shadow-[0_30px_100px_rgba(0,0,0,0.4)]">
              <div className="flex items-start gap-8">
                <div className="w-16 h-16 bg-white/10 text-amber-400 border border-white/20 rounded-[28px] flex items-center justify-center shrink-0 shadow-2xl">
                  <AlertCircle size={32} />
                </div>
                <div className="space-y-4">
                  <h5 className="font-black text-amber-200 text-2xl uppercase tracking-tighter leading-none">Heuristic Simulation Results</h5>
                  <p className="text-xl text-amber-100/70 leading-relaxed font-bold">
                    Required liquidity retention: <span className="underline decoration-amber-400 decoration-8 underline-offset-[-4px] font-black text-white">₹{calculations.requiredMonthly.toFixed(0)}</span> monthly. 
                    Audit your flux in the <span className="font-black text-white italic">Consultant</span> view.
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="apple-glass border-dashed border-2 border-white/10 h-full min-h-[500px] flex flex-col items-center justify-center p-20 text-center opacity-40">
            <div className="w-28 h-28 bg-white/5 border border-white/10 rounded-[40px] flex items-center justify-center mb-10 shadow-2xl">
              <Target size={56} className="text-slate-700" />
            </div>
            <h4 className="text-3xl font-black text-slate-600 uppercase tracking-tighter mb-4">Await Node Init</h4>
            <p className="text-slate-500 font-bold max-w-xs mx-auto leading-relaxed">Map your financial objectives to visualize the completion flux.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoalPlanner;
