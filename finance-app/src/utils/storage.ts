import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction, SavingsGoal, Budget } from '../types';

const KEYS = {
  TRANSACTIONS: 'transactions',
  SAVINGS_GOALS: 'savings_goals',
  BUDGETS: 'budgets',
};

export async function getTransactions(): Promise<Transaction[]> {
  const raw = await AsyncStorage.getItem(KEYS.TRANSACTIONS);
  return raw ? JSON.parse(raw) : [];
}

export async function saveTransactions(transactions: Transaction[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(transactions));
}

export async function addTransaction(tx: Transaction): Promise<void> {
  const all = await getTransactions();
  all.unshift(tx);
  await saveTransactions(all);
}

export async function deleteTransaction(id: string): Promise<void> {
  const all = await getTransactions();
  await saveTransactions(all.filter(t => t.id !== id));
}

export async function getSavingsGoals(): Promise<SavingsGoal[]> {
  const raw = await AsyncStorage.getItem(KEYS.SAVINGS_GOALS);
  return raw ? JSON.parse(raw) : [];
}

export async function saveSavingsGoals(goals: SavingsGoal[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.SAVINGS_GOALS, JSON.stringify(goals));
}

export async function getBudgets(): Promise<Budget[]> {
  const raw = await AsyncStorage.getItem(KEYS.BUDGETS);
  return raw ? JSON.parse(raw) : [];
}

export async function saveBudgets(budgets: Budget[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.BUDGETS, JSON.stringify(budgets));
}
