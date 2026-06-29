import React, { useState, useMemo } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { FinanceStore } from '../store/useFinanceStore';
import TransactionItem from '../components/TransactionItem';
import MonthPicker from '../components/MonthPicker';

interface Props {
  store: FinanceStore;
  navigation: any;
  route?: any;
}

type FilterType = 'all' | 'income' | 'expense';

export default function TransactionsScreen({ store, navigation, route }: Props) {
  const [month, setMonth] = useState(route?.params?.month ?? format(new Date(), 'yyyy-MM'));
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');

  const txs = store.getMonthTransactions(month);

  const filtered = useMemo(() => {
    return txs.filter(t => {
      if (filter !== 'all' && t.type !== filter) return false;
      if (search && !t.name.toLowerCase().includes(search.toLowerCase()) &&
          !t.category.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [txs, filter, search]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Movimientos</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('AddTransaction', { month })}
        >
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <MonthPicker month={month} onChange={setMonth} />

      <View style={styles.searchBox}>
        <Ionicons name="search" size={16} color="#94A3B8" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar movimiento..."
          placeholderTextColor="#CBD5E1"
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={16} color="#94A3B8" />
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.filterRow}>
        {(['all', 'income', 'expense'] as FilterType[]).map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === 'all' ? 'Todos' : f === 'income' ? 'Ingresos' : 'Gastos'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TransactionItem transaction={item} onDelete={store.deleteTransaction} />
        )}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyText}>Sin resultados</Text>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 24, paddingTop: 8 }}
        showsVerticalScrollIndicator={false}
      />
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
  title: { fontSize: 24, fontWeight: '800', color: '#1E293B' },
  addBtn: {
    backgroundColor: '#4F46E5',
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: { flex: 1, fontSize: 14, color: '#1E293B' },
  filterRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 3,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 9,
    alignItems: 'center',
  },
  filterBtnActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 4, elevation: 2 },
  filterText: { fontSize: 13, fontWeight: '600', color: '#94A3B8' },
  filterTextActive: { color: '#1E293B' },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyIcon: { fontSize: 36, marginBottom: 12 },
  emptyText: { fontSize: 16, color: '#94A3B8', fontWeight: '600' },
});
