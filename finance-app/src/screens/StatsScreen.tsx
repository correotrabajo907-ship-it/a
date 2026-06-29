import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PieChart } from 'react-native-chart-kit';
import { format } from 'date-fns';
import { FinanceStore } from '../store/useFinanceStore';
import MonthPicker from '../components/MonthPicker';
import { getCategoryInfo, groupByCategory, formatCurrency } from '../utils/helpers';

const W = Dimensions.get('window').width;

interface Props { store: FinanceStore }

export default function StatsScreen({ store }: Props) {
  const [month, setMonth] = useState(format(new Date(), 'yyyy-MM'));

  const summary = store.getMonthSummary(month);
  const expenses = summary.transactions.filter(t => t.type === 'expense');
  const byCategory = useMemo(() => groupByCategory(expenses), [expenses]);

  const pieData = Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, amount]) => {
      const info = getCategoryInfo(cat, 'expense');
      return {
        name: cat,
        amount,
        color: info.color,
        legendFontColor: '#64748B',
        legendFontSize: 12,
      };
    });

  const top5 = pieData.slice(0, 5);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Estadísticas 📊</Text>
        </View>

        <MonthPicker month={month} onChange={setMonth} />

        {/* Overview cards */}
        <View style={styles.cardsRow}>
          <View style={[styles.miniCard, { backgroundColor: '#DCFCE7' }]}>
            <Text style={styles.miniLabel}>Ingresos</Text>
            <Text style={[styles.miniAmount, { color: '#16A34A' }]}>
              {formatCurrency(summary.totalIncome)}
            </Text>
          </View>
          <View style={[styles.miniCard, { backgroundColor: '#FEE2E2' }]}>
            <Text style={styles.miniLabel}>Gastos</Text>
            <Text style={[styles.miniAmount, { color: '#DC2626' }]}>
              {formatCurrency(summary.totalExpenses)}
            </Text>
          </View>
        </View>

        {pieData.length > 0 ? (
          <>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Gastos por categoría</Text>
              <PieChart
                data={pieData}
                width={W - 32}
                height={200}
                chartConfig={{
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                }}
                accessor="amount"
                backgroundColor="transparent"
                paddingLeft="10"
                hasLegend={false}
                absolute
              />
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Desglose</Text>
              {top5.map(item => {
                const pct = summary.totalExpenses > 0
                  ? (item.amount / summary.totalExpenses) * 100 : 0;
                const info = getCategoryInfo(item.name, 'expense');
                return (
                  <View key={item.name} style={styles.catRow}>
                    <View style={styles.catLeft}>
                      <Text style={styles.catIcon}>{info.icon}</Text>
                      <Text style={styles.catName}>{item.name}</Text>
                    </View>
                    <View style={styles.catRight}>
                      <Text style={styles.catAmount}>{formatCurrency(item.amount)}</Text>
                      <View style={styles.barBg}>
                        <View style={[styles.barFill, { width: `${pct}%` as any, backgroundColor: info.color }]} />
                      </View>
                      <Text style={styles.catPct}>{pct.toFixed(0)}%</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyText}>Sin datos para este mes</Text>
            <Text style={styles.emptySubtext}>Agrega gastos para ver estadísticas</Text>
          </View>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { paddingHorizontal: 16, paddingVertical: 12 },
  title: { fontSize: 24, fontWeight: '800', color: '#1E293B' },
  cardsRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  miniCard: {
    flex: 1,
    borderRadius: 14,
    padding: 14,
  },
  miniLabel: { fontSize: 12, fontWeight: '600', color: '#64748B', marginBottom: 4 },
  miniAmount: { fontSize: 16, fontWeight: '800' },
  card: {
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
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 14,
  },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  catLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 130,
  },
  catIcon: { fontSize: 18, marginRight: 8 },
  catName: { fontSize: 13, fontWeight: '600', color: '#1E293B', flexShrink: 1 },
  catRight: { flex: 1, alignItems: 'flex-end' },
  catAmount: { fontSize: 13, fontWeight: '700', color: '#1E293B', marginBottom: 4 },
  barBg: {
    width: '100%',
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 2,
  },
  barFill: { height: '100%', borderRadius: 3 },
  catPct: { fontSize: 11, color: '#94A3B8' },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#64748B', marginBottom: 6 },
  emptySubtext: { fontSize: 13, color: '#94A3B8' },
});
