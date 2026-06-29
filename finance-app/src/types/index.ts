export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  name: string;
  note?: string;
  date: string; // ISO string
  month: string; // 'YYYY-MM'
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  deadline?: string; // ISO date
  color: string;
}

export interface Budget {
  month: string; // 'YYYY-MM'
  categoryLimits: Record<string, number>;
}

export interface MonthSummary {
  month: string;
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  transactions: Transaction[];
}

export const EXPENSE_CATEGORIES = [
  { label: 'Alimentación', icon: '🛒', color: '#FF6B6B' },
  { label: 'Transporte', icon: '🚗', color: '#4ECDC4' },
  { label: 'Vivienda', icon: '🏠', color: '#45B7D1' },
  { label: 'Salud', icon: '💊', color: '#96CEB4' },
  { label: 'Entretenimiento', icon: '🎬', color: '#FFEAA7' },
  { label: 'Ropa', icon: '👕', color: '#DDA0DD' },
  { label: 'Educación', icon: '📚', color: '#98D8C8' },
  { label: 'Restaurantes', icon: '🍽️', color: '#F7DC6F' },
  { label: 'Servicios', icon: '💡', color: '#AED6F1' },
  { label: 'Deudas', icon: '💳', color: '#F1948A' },
  { label: 'Mascotas', icon: '🐾', color: '#A9DFBF' },
  { label: 'Otros', icon: '📦', color: '#D5D8DC' },
];

export const INCOME_CATEGORIES = [
  { label: 'Salario', icon: '💼', color: '#2ECC71' },
  { label: 'Freelance', icon: '💻', color: '#27AE60' },
  { label: 'Inversiones', icon: '📈', color: '#1ABC9C' },
  { label: 'Negocio', icon: '🏪', color: '#16A085' },
  { label: 'Regalo', icon: '🎁', color: '#52BE80' },
  { label: 'Otros ingresos', icon: '💰', color: '#A9DFBF' },
];
