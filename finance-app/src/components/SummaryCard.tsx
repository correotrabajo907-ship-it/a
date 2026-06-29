import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatCurrency } from '../utils/helpers';

interface Props {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
}

export default function SummaryCard({ totalIncome, totalExpenses, balance }: Props) {
  const isPositive = balance >= 0;

  return (
    <View style={styles.card}>
      <View style={[styles.balanceBox, { backgroundColor: isPositive ? '#4F46E5' : '#EF4444' }]}>
        <Text style={styles.balanceLabel}>Balance del mes</Text>
        <Text style={styles.balanceAmount}>{formatCurrency(balance)}</Text>
      </View>
      <View style={styles.row}>
        <View style={styles.col}>
          <View style={styles.dotRow}>
            <View style={[styles.dot, { backgroundColor: '#10B981' }]} />
            <Text style={styles.colLabel}>Ingresos</Text>
          </View>
          <Text style={styles.colAmount}>{formatCurrency(totalIncome)}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.col}>
          <View style={styles.dotRow}>
            <View style={[styles.dot, { backgroundColor: '#EF4444' }]} />
            <Text style={styles.colLabel}>Gastos</Text>
          </View>
          <Text style={[styles.colAmount, { color: '#EF4444' }]}>{formatCurrency(totalExpenses)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  balanceBox: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  balanceAmount: {
    color: '#fff',
    fontSize: 34,
    fontWeight: '800',
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 16,
  },
  col: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    backgroundColor: '#F1F5F9',
  },
  dotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  colLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  colAmount: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1E293B',
  },
});
