import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { FinanceStore } from '../store/useFinanceStore';
import MonthPicker from '../components/MonthPicker';
import SummaryCard from '../components/SummaryCard';
import TransactionItem from '../components/TransactionItem';

interface Props {
  store: FinanceStore;
  navigation: any;
}

export default function HomeScreen({ store, navigation }: Props) {
  const [month, setMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [refreshing, setRefreshing] = useState(false);

  const summary = store.getMonthSummary(month);
  const recentTransactions = summary.transactions.slice(0, 10);

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  };

  const savingsRate = summary.totalIncome > 0
    ? Math.max(0, ((summary.totalIncome - summary.totalExpenses) / summary.totalIncome) * 100)
    : 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Mis Finanzas 💰</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('AddTransaction', { month })}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <MonthPicker month={month} onChange={setMonth} />
        <SummaryCard
          totalIncome={summary.totalIncome}
          totalExpenses={summary.totalExpenses}
          balance={summary.balance}
        />

        {summary.totalIncome > 0 && (
          <View style={styles.savingsCard}>
            <View style={styles.savingsRow}>
              <Text style={styles.savingsLabel}>Tasa de ahorro</Text>
              <Text style={styles.savingsPercent}>{savingsRate.toFixed(1)}%</Text>
            </View>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: `${Math.min(savingsRate, 100)}%` as any }]} />
            </View>
            <Text style={styles.savingsHint}>
              {savingsRate >= 20 ? '¡Excelente! Estás ahorrando bien 🎉' :
               savingsRate >= 10 ? 'Buen progreso, intenta llegar al 20%' :
               'Intenta ahorrar al menos el 10% de tus ingresos'}
            </Text>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Movimientos recientes</Text>
            {summary.transactions.length > 10 && (
              <TouchableOpacity onPress={() => navigation.navigate('Transactions', { month })}>
                <Text style={styles.seeAll}>Ver todos</Text>
              </TouchableOpacity>
            )}
          </View>
          {recentTransactions.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyText}>Sin movimientos este mes</Text>
              <Text style={styles.emptySubtext}>Toca + para agregar tu primer ingreso o gasto</Text>
            </View>
          ) : (
            recentTransactions.map(tx => (
              <TransactionItem
                key={tx.id}
                transaction={tx}
                onDelete={store.deleteTransaction}
              />
            ))
          )}
        </View>
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E293B',
  },
  addBtn: {
    backgroundColor: '#4F46E5',
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  savingsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  savingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  savingsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  savingsPercent: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4F46E5',
  },
  progressBg: {
    height: 8,
    backgroundColor: '#EDE9FE',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: 4,
  },
  savingsHint: {
    fontSize: 12,
    color: '#64748B',
  },
  section: { marginTop: 4 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1E293B',
  },
  seeAll: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '600',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 6,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
  },
});
