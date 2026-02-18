export interface User {
  id: string;
  email: string;
  full_name?: string;
  created_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  category: 'personal' | 'work' | 'health' | 'finance' | 'other';
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  due_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  account: 'personal' | 'business';
  date: string;
  created_at: string;
}

export type ViewType = 'dashboard' | 'tasks' | 'finances' | 'crm' | 'calendar' | 'notes' | 'goals' | 'analytics' | 'more';
