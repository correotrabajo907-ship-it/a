import { useState, useEffect, useCallback } from 'react';
import { Transaction, SavingsGoal, Budget } from '../types';
import * as storage from '../utils/storage';
import { currentMonth } from '../utils/helpers';

export function useFinanceStore() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [txs, goals, buds] = await Promise.all([
        storage.getTransactions(),
        storage.getSavingsGoals(),
        storage.getBudgets(),
      ]);
      setTransactions(txs);
      setSavingsGoals(goals);
      setBudgets(buds);
      setLoading(false);
    })();
  }, []);

  const addTransaction = useCallback(async (tx: Transaction) => {
    await storage.addTransaction(tx);
    setTransactions(prev => [tx, ...prev]);
  }, []);

  const deleteTransaction = useCallback(async (id: string) => {
    await storage.deleteTransaction(id);
    setTransactions(prev => prev.filter(t => t.id !== id));
  }, []);

  const addSavingsGoal = useCallback(async (goal: SavingsGoal) => {
    const updated = [...savingsGoals, goal];
    await storage.saveSavingsGoals(updated);
    setSavingsGoals(updated);
  }, [savingsGoals]);

  const updateSavingsGoal = useCallback(async (goal: SavingsGoal) => {
    const updated = savingsGoals.map(g => g.id === goal.id ? goal : g);
    await storage.saveSavingsGoals(updated);
    setSavingsGoals(updated);
  }, [savingsGoals]);

  const deleteSavingsGoal = useCallback(async (id: string) => {
    const updated = savingsGoals.filter(g => g.id !== id);
    await storage.saveSavingsGoals(updated);
    setSavingsGoals(updated);
  }, [savingsGoals]);

  const setBudgetForMonth = useCallback(async (month: string, categoryLimits: Record<string, number>) => {
    const existing = budgets.find(b => b.month === month);
    let updated: Budget[];
    if (existing) {
      updated = budgets.map(b => b.month === month ? { ...b, categoryLimits } : b);
    } else {
      updated = [...budgets, { month, categoryLimits }];
    }
    await storage.saveBudgets(updated);
    setBudgets(updated);
  }, [budgets]);

  const getMonthTransactions = useCallback((month: string) => {
    return transactions.filter(t => t.month === month);
  }, [transactions]);

  const getMonthSummary = useCallback((month: string) => {
    const txs = getMonthTransactions(month);
    const totalIncome = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpenses = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return { totalIncome, totalExpenses, balance: totalIncome - totalExpenses, transactions: txs };
  }, [getMonthTransactions]);

  const getBudgetForMonth = useCallback((month: string) => {
    return budgets.find(b => b.month === month);
  }, [budgets]);

  return {
    loading,
    transactions,
    savingsGoals,
    budgets,
    addTransaction,
    deleteTransaction,
    addSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    setBudgetForMonth,
    getMonthTransactions,
    getMonthSummary,
    getBudgetForMonth,
  };
}

export type FinanceStore = ReturnType<typeof useFinanceStore>;
