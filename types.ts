
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
