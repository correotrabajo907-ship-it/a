import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Transaction, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../types';

export function currentMonth(): string {
  return format(new Date(), 'yyyy-MM');
}

export function formatMonth(month: string): string {
  const date = parseISO(month + '-01');
  return format(date, 'MMMM yyyy', { locale: es });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(isoString: string): string {
  return format(parseISO(isoString), "d 'de' MMMM", { locale: es });
}

export function getCategoryInfo(category: string, type: 'income' | 'expense') {
  const list = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  return list.find(c => c.label === category) ?? { label: category, icon: '📦', color: '#D5D8DC' };
}

export function groupByCategory(transactions: Transaction[]): Record<string, number> {
  return transactions.reduce<Record<string, number>>((acc, t) => {
    acc[t.category] = (acc[t.category] ?? 0) + t.amount;
    return acc;
  }, {});
}

export function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
