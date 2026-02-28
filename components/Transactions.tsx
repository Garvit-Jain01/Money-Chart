import React, { useState } from 'react';
import { Plus, Trash2, Search, X } from 'lucide-react';
import { Transaction, TransactionType, Category } from '../types';

interface TransactionsProps {
  transactions: Transaction[];
  onAdd: (t: Omit<Transaction, 'id'>) => void;
  onDelete: (id: string) => void;
}

const INCOME_CATEGORIES: Category[] = ['Salary', 'Freelance', 'Scholarship', 'Others'];
const EXPENSE_CATEGORIES: Category[] = ['Food', 'Travel', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Others'];

const Transactions: React.FC<TransactionsProps> = ({ transactions, onAdd, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    type: TransactionType.EXPENSE,
    amount: '',
    category: EXPENSE_CATEGORIES[0],
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const filteredTransactions = transactions.filter(t => 
    t.category.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.notes?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || parseFloat(formData.amount) <= 0) return;
    
    onAdd({
      type: formData.type,
      amount: parseFloat(formData.amount),
      category: formData.category,
      date: formData.date,
      notes: formData.notes
    });
    
    setFormData({
      type: TransactionType.EXPENSE,
      amount: '',
      category: EXPENSE_CATEGORIES[0],
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setIsModalOpen(false);
  };

  const handleTypeChange = (type: TransactionType) => {
    setFormData({
      ...formData,
      type,
      category: type === TransactionType.INCOME ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]
    });
  };

  const activeCategories = formData.type === TransactionType.INCOME ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="relative flex-1 max-w-xl group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted transition-colors group-focus-within:text-indigo-500" size={20} />
          <input 
            type="text" 
            placeholder="Search records..."
            className="w-full pl-14 pr-8 py-5 apple-input rounded-[24px] font-medium shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.03] active:scale-95 text-white px-10 py-5 rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl transition-all border-t border-white/20"
        >
          New Transaction
        </button>
      </div>

      <div className="apple-glass overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-subtle border-b border-black/5">
                <th className="px-10 py-6 text-[10px] font-black text-muted uppercase tracking-[0.25em]">Date</th>
                <th className="px-10 py-6 text-[10px] font-black text-muted uppercase tracking-[0.25em]">Category</th>
                <th className="px-10 py-6 text-[10px] font-black text-muted uppercase tracking-[0.25em]">Notes</th>
                <th className="px-10 py-6 text-[10px] font-black text-muted uppercase tracking-[0.25em]">Type</th>
                <th className="px-10 py-6 text-[10px] font-black text-muted uppercase tracking-[0.25em] text-right">Amount</th>
                <th className="px-10 py-6 text-[10px] font-black text-muted uppercase tracking-[0.25em] text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-black/[0.02] transition-colors group">
                    <td className="px-10 py-6 text-sm font-bold text-secondary">{new Date(t.date).toLocaleDateString()}</td>
                    <td className="px-10 py-6">
                      <span className="px-5 py-2 rounded-2xl text-[10px] font-black bg-subtle border border-black/5 shadow-sm text-secondary uppercase tracking-widest">
                        {t.category}
                      </span>
                    </td>
                    <td className="px-10 py-6 text-sm text-muted max-w-xs truncate group-hover:text-secondary transition-colors">{t.notes || <span className="opacity-20">—</span>}</td>
                    <td className="px-10 py-6">
                      <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${
                        t.type === TransactionType.INCOME ? 'text-emerald-500' : 'text-rose-500'
                      }`}>
                        {t.type}
                      </span>
                    </td>
                    <td className={`px-10 py-6 text-lg font-black text-right tabular-nums ${
                      t.type === TransactionType.INCOME ? 'text-emerald-500' : 'text-primary'
                    }`}>
                      {t.type === TransactionType.INCOME ? '+' : '-'}₹{t.amount.toLocaleString()}
                    </td>
                    <td className="px-10 py-6 text-right">
                      <button 
                        onClick={() => onDelete(t.id)}
                        className="text-muted hover:text-rose-500 transition-all p-3 rounded-2xl hover:bg-rose-500/10"
                      >
                        <Trash2 size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-10 py-24 text-center text-muted font-bold uppercase text-[10px] tracking-[0.3em]">
                    No records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-black/40 backdrop-blur-2xl animate-in fade-in duration-500">
          <div className="apple-glass w-full max-w-2xl shadow-2xl overflow-hidden border-black/5 animate-in zoom-in-95 duration-500">
            <div className="px-12 py-10 border-b border-black/5 flex items-center justify-between bg-subtle">
              <div>
                <h3 className="text-3xl font-black text-primary tracking-tighter">New Entry</h3>
                <p className="text-[10px] font-black text-muted uppercase tracking-[0.3em] mt-1">Resource allocation protocol</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-muted hover:text-primary p-3 rounded-2xl hover:bg-black/5 transition-all">
                <X size={28} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-12 space-y-10">
              <div className="space-y-4">
                <label className="block text-[10px] font-black text-muted uppercase tracking-[0.25em] ml-2">Type</label>
                <div className="flex bg-black/5 p-1.5 rounded-[24px] border border-black/5">
                  <button
                    type="button"
                    onClick={() => handleTypeChange(TransactionType.INCOME)}
                    className={`flex-1 py-5 text-[11px] font-black uppercase tracking-widest rounded-[20px] transition-all duration-300 ${
                      formData.type === TransactionType.INCOME ? 'bg-emerald-500/10 text-emerald-600 shadow-md ring-1 ring-emerald-500/20' : 'text-muted hover:text-primary'
                    }`}
                  >
                    Income
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTypeChange(TransactionType.EXPENSE)}
                    className={`flex-1 py-5 text-[11px] font-black uppercase tracking-widest rounded-[20px] transition-all duration-300 ${
                      formData.type === TransactionType.EXPENSE ? 'bg-rose-500/10 text-rose-600 shadow-md ring-1 ring-rose-500/20' : 'text-muted hover:text-primary'
                    }`}
                  >
                    Expense
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="block text-[10px] font-black text-muted uppercase tracking-[0.25em] ml-2">Amount (₹)</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full px-8 py-5 apple-input rounded-[24px] text-2xl font-black shadow-inner"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  />
                </div>
                <div className="space-y-4">
                  <label className="block text-[10px] font-black text-muted uppercase tracking-[0.25em] ml-2">Category</label>
                  <select
                    className="w-full px-8 py-5 apple-input rounded-[24px] font-bold appearance-none cursor-pointer"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value as Category})}
                  >
                    {activeCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="block text-[10px] font-black text-muted uppercase tracking-[0.25em] ml-2">Date</label>
                  <input
                    required
                    type="date"
                    className="w-full px-8 py-5 apple-input rounded-[24px] font-bold"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                  />
                </div>
                <div className="space-y-4">
                  <label className="block text-[10px] font-black text-muted uppercase tracking-[0.25em] ml-2">Notes</label>
                  <input
                    type="text"
                    placeholder="Details..."
                    className="w-full px-8 py-5 apple-input rounded-[24px] font-medium"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.01] active:scale-95 text-white font-black text-xs uppercase tracking-[0.3em] py-6 rounded-[24px] shadow-lg transition-all border-t border-white/20 mt-6"
              >
                Log Transaction
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;