import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  ReceiptText, 
  BarChart3, 
  Target, 
  BrainCircuit, 
  PlusCircle, 
  Wallet,
  AlertCircle,
  Calculator,
  Moon,
  Sun
} from 'lucide-react';
import { Transaction, TransactionType, Goal, Budget } from './types';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Analytics from './components/Analytics';
import GoalPlanner from './components/GoalPlanner';
import Advisor from './components/Advisor';
import BudgetManager from './components/BudgetManager';
import SavingsOptimizer from './components/SavingsOptimizer';

const STORAGE_KEYS = {
  TRANSACTIONS: 'sf_transactions',
  GOAL: 'sf_goal',
  BUDGET: 'sf_budget',
  THEME: 'sf_theme'
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'analytics' | 'goal' | 'budget' | 'advisor' | 'optimizer'>('dashboard');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    return (saved as 'light' | 'dark') || 'dark';
  });
  
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return saved ? JSON.parse(saved) : [];
  });
  
  const [goal, setGoal] = useState<Goal | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.GOAL);
    return saved ? JSON.parse(saved) : null;
  });

  const [budget, setBudget] = useState<Budget>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BUDGET);
    return saved ? JSON.parse(saved) : { monthlyLimit: 50000 };
  });

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GOAL, JSON.stringify(goal));
  }, [goal]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BUDGET, JSON.stringify(budget));
  }, [budget]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const totals = useMemo(() => {
    return transactions.reduce((acc, curr) => {
      if (curr.type === TransactionType.INCOME) acc.income += curr.amount;
      else acc.expense += curr.amount;
      return acc;
    }, { income: 0, expense: 0 });
  }, [transactions]);

  const balance = totals.income - totals.expense;

  const currentMonthExpense = useMemo(() => {
    const now = new Date();
    return transactions
      .filter(t => t.type === TransactionType.EXPENSE && 
                   new Date(t.date).getMonth() === now.getMonth() && 
                   new Date(t.date).getFullYear() === now.getFullYear())
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const budgetUsagePercent = budget.monthlyLimit > 0 ? (currentMonthExpense / budget.monthlyLimit) * 100 : 0;

  const addTransaction = (t: Omit<Transaction, 'id'>) => {
    const newTransaction = { ...t, id: Math.random().toString(36).substring(7) };
    setTransactions([newTransaction, ...transactions]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const updateGoal = (g: Goal) => {
    setGoal(g);
  };

  const updateBudget = (b: Budget) => {
    setBudget(b);
  };

  const renderContent = () => {
    const content = (() => {
      switch(activeTab) {
        case 'dashboard':
          return <Dashboard totals={totals} balance={balance} recentTransactions={transactions.slice(0, 5)} onViewAll={() => setActiveTab('transactions')} onAddTransaction={() => setActiveTab('transactions')} />;
        case 'transactions':
          return <Transactions transactions={transactions} onAdd={addTransaction} onDelete={deleteTransaction} />;
        case 'analytics':
          return <Analytics transactions={transactions} />;
        case 'goal':
          return <GoalPlanner currentGoal={goal} onSave={updateGoal} balance={balance} />;
        case 'budget':
          return <BudgetManager budget={budget} onSave={updateBudget} currentMonthExpense={currentMonthExpense} />;
        case 'optimizer':
          return <SavingsOptimizer transactions={transactions} goal={goal} />;
        case 'advisor':
          return <Advisor transactions={transactions} goal={goal} />;
        default:
          return <Dashboard totals={totals} balance={balance} recentTransactions={transactions.slice(0, 5)} onViewAll={() => setActiveTab('transactions')} onAddTransaction={() => setActiveTab('transactions')} />;
      }
    })();
    return <div key={activeTab} className="tab-content">{content}</div>;
  };

  return (
    <div className="flex h-screen overflow-hidden text-primary">
      {/* Sidebar */}
      <aside className="w-72 apple-nav flex flex-col z-20">
        <div className="p-8">
          <div className="flex items-center gap-3 text-indigo-500 mb-2">
            <div className="bg-indigo-500/20 p-2.5 rounded-2xl text-indigo-500 shadow-lg border border-indigo-400/20">
              <BrainCircuit size={28} />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-primary">MoneyChart</h1>
          </div>
          <p className="text-[10px] text-muted font-black uppercase tracking-[0.25em] ml-1">Intelligence Advisor</p>
        </div>
        
        <nav className="flex-1 px-5 space-y-2 overflow-y-auto">
          <NavItem icon={<LayoutDashboard size={18} />} label="Overview" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} colorClass="glow-blue" />
          <NavItem icon={<ReceiptText size={18} />} label="Transactions" active={activeTab === 'transactions'} onClick={() => setActiveTab('transactions')} colorClass="glow-purple" />
          <NavItem icon={<BarChart3 size={18} />} label="Analytics" active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} colorClass="glow-cyan" />
          <NavItem icon={<Target size={18} />} label="Goals" active={activeTab === 'goal'} onClick={() => setActiveTab('goal')} colorClass="glow-green" />
          <NavItem icon={<Wallet size={18} />} label="Budget" active={activeTab === 'budget'} onClick={() => setActiveTab('budget')} colorClass="glow-orange" />
          
          <div className="pt-6 pb-2">
            <div className="h-px bg-slate-500/10 mx-2 mb-4" />
          </div>

          <NavItem icon={<Calculator size={18} />} label="Insights" active={activeTab === 'optimizer'} onClick={() => setActiveTab('optimizer')} colorClass="glow-pink" />
          <NavItem icon={<BrainCircuit size={18} />} label="Smart Advisor" active={activeTab === 'advisor'} onClick={() => setActiveTab('advisor')} colorClass="glow-indigo" />
        </nav>

        <div className="p-6 mt-auto">
          {budgetUsagePercent >= 75 && (
            <div className={`p-4 rounded-2xl glass-tint-${budgetUsagePercent >= 100 ? 'red' : 'yellow'} border-none shadow-xl flex items-start gap-3 transition-all duration-500`}>
              <AlertCircle size={20} className="shrink-0 mt-0.5 text-primary opacity-80" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Alert Protocol</p>
                <p className="text-[11px] font-medium opacity-80 leading-tight">Liquidity used: {budgetUsagePercent.toFixed(0)}%</p>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-24 flex items-center justify-between px-12 shrink-0 z-10">
          <div>
            <h2 className="text-[10px] font-black text-muted uppercase tracking-[0.3em] mb-1">
              Active Environment
            </h2>
            <h3 className="text-3xl font-black text-primary capitalize tracking-tighter">
              {(() => {
                switch(activeTab) {
                  case 'optimizer': return 'Financial Insights';
                  case 'advisor': return 'Smart Advisor';
                  case 'goal': return 'Goals';
                  case 'dashboard': return 'Overview';
                  default: return activeTab;
                }
              })()}
            </h3>
          </div>
          <div className="flex items-center gap-4">
            {/* Theme Toggle Button */}
            <button 
              onClick={toggleTheme}
              className="apple-glass p-3.5 hover:scale-110 active:scale-95 transition-all text-secondary"
              title="Switch Appearance"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button 
              onClick={() => setActiveTab('transactions')}
              className="bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.05] active:scale-95 text-white px-8 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-3 shadow-lg border-t border-white/20"
            >
              <PlusCircle size={18} />
              Add Entry
            </button>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto p-12 pt-4">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </section>
      </main>
    </div>
  );
};

const NavItem: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  active: boolean; 
  onClick: () => void;
  colorClass: string;
}> = ({ icon, label, active, onClick, colorClass }) => {
  return (
    <button
      onClick={onClick}
      className={`glass-menu-item w-full ${colorClass} ${active ? 'active' : ''}`}
    >
      <span className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
        {icon}
      </span>
      <span className={`text-[13px] font-medium tracking-tight transition-colors ${active ? 'text-primary' : 'text-muted'}`}>
        {label}
      </span>
    </button>
  );
};

export default App;
