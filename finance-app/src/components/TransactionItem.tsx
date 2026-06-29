import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Transaction } from '../types';
import { formatCurrency, formatDate, getCategoryInfo } from '../utils/helpers';

interface Props {
  transaction: Transaction;
  onDelete: (id: string) => void;
}

export default function TransactionItem({ transaction, onDelete }: Props) {
  const info = getCategoryInfo(transaction.category, transaction.type);
  const isIncome = transaction.type === 'income';

  const handleDelete = () => {
    Alert.alert('Eliminar', `¿Eliminar "${transaction.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => onDelete(transaction.id) },
    ]);
  };

  return (
    <TouchableOpacity style={styles.container} onLongPress={handleDelete} activeOpacity={0.7}>
      <View style={[styles.icon, { backgroundColor: info.color + '22' }]}>
        <Text style={styles.iconText}>{info.icon}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{transaction.name}</Text>
        <Text style={styles.meta}>{info.label} • {formatDate(transaction.date)}</Text>
        {transaction.note ? <Text style={styles.note} numberOfLines={1}>{transaction.note}</Text> : null}
      </View>
      <Text style={[styles.amount, { color: isIncome ? '#10B981' : '#EF4444' }]}>
        {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 20,
  },
  info: {
    flex: 1,
    marginRight: 8,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
  meta: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  note: {
    fontSize: 12,
    color: '#94A3B8',
    fontStyle: 'italic',
    marginTop: 1,
  },
  amount: {
    fontSize: 15,
    fontWeight: '700',
  },
});
