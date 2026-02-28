
export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

export type Category = 
  | 'Food' 
  | 'Travel' 
  | 'Shopping' 
  | 'Bills' 
  | 'Entertainment' 
  | 'Health' 
  | 'Salary'
  | 'Freelance'
  | 'Scholarship'
  | 'Others';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: Category;
  date: string;
  notes?: string;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  targetDate: string;
  currentSavings: number;
}

export interface Budget {
  monthlyLimit: number;
}

export interface Recommendation {
  category: string;
  suggestion: string;
  impactAmount: number;
  reasoning: string;
}

export interface AdvisorResponse {
  feasibility: 'achievable' | 'difficult' | 'unrealistic';
  summary: string;
  recommendations: Recommendation[];
  requiredMonthlySavings: number;
  currentSavingCapacity: number;
}

export interface OptimizationSuggestion {
  category: Category;
  avgSpent: number;
  suggestedCutPercent: number;
  moneySaved: number;
  newLimit: number;
}
