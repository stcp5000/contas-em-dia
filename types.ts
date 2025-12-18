
export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense'
}

export enum Category {
  FOOD = 'Alimentação',
  TRANSPORT = 'Transporte',
  HOUSING = 'Moradia',
  UTILITIES = 'Contas (Luz/Água)',
  ENTERTAINMENT = 'Lazer',
  HEALTH = 'Saúde',
  SALARY = 'Salário',
  INVESTMENT = 'Investimento',
  OTHER = 'Outros'
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: Category | string;
  date: string;
  dueDate?: string;
  isPaid: boolean;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export interface UserProfile {
  name: string;
  avatar: string;
}

export enum Frequency {
  DAILY = 'Diário',
  WEEKLY = 'Semanal',
  MONTHLY = 'Mensal'
}

export interface Reminder {
  id: string;
  title: string;
  amount?: number;
  frequency: Frequency;
  dayOfWeek?: number; // 0-6
  dayOfMonth?: number; // 1-31
  time: string; // HH:mm
  isActive: boolean;
}
