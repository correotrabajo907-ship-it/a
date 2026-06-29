import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { Transaction, EXPENSE_CATEGORIES, INCOME_CATEGORIES, TransactionType } from '../types';
import { FinanceStore } from '../store/useFinanceStore';
import { generateId } from '../utils/helpers';

interface Props {
  store: FinanceStore;
  navigation: any;
  route: any;
}

export default function AddTransactionScreen({ store, navigation, route }: Props) {
  const month: string = route.params?.month ?? format(new Date(), 'yyyy-MM');

  const [type, setType] = useState<TransactionType>('expense');
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('Falta el nombre'); return; }
    const num = parseFloat(amount.replace(',', '.'));
    if (isNaN(num) || num <= 0) { Alert.alert('Monto inválido'); return; }
    if (!category) { Alert.alert('Selecciona una categoría'); return; }

    const tx: Transaction = {
      id: generateId(),
      type,
      name: name.trim(),
      amount: num,
      category,
      note: note.trim() || undefined,
      date: new Date().toISOString(),
      month,
    };

    await store.addTransaction(tx);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="close" size={24} color="#1E293B" />
          </TouchableOpacity>
          <Text style={styles.title}>Nuevo movimiento</Text>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>Guardar</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Type toggle */}
          <View style={styles.typeRow}>
            <TouchableOpacity
              style={[styles.typeBtn, type === 'expense' && styles.typeBtnActive, type === 'expense' && { backgroundColor: '#FEE2E2' }]}
              onPress={() => { setType('expense'); setCategory(''); }}
            >
              <Text style={[styles.typeBtnText, type === 'expense' && { color: '#EF4444' }]}>💸 Gasto</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeBtn, type === 'income' && styles.typeBtnActive, type === 'income' && { backgroundColor: '#DCFCE7' }]}
              onPress={() => { setType('income'); setCategory(''); }}
            >
              <Text style={[styles.typeBtnText, type === 'income' && { color: '#10B981' }]}>💵 Ingreso</Text>
            </TouchableOpacity>
          </View>

          {/* Amount */}
          <View style={styles.amountBox}>
            <Text style={styles.currency}>$</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder="0.00"
              placeholderTextColor="#CBD5E1"
              autoFocus
            />
          </View>

          {/* Name */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Nombre o descripción</Text>
            <TextInput
              style={styles.textInput}
              value={name}
              onChangeText={setName}
              placeholder={type === 'income' ? 'Ej. Pago de nómina' : 'Ej. Supermercado Walmart'}
              placeholderTextColor="#CBD5E1"
              returnKeyType="next"
            />
          </View>

          {/* Category */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Categoría</Text>
            <View style={styles.categoriesGrid}>
              {categories.map(cat => (
                <TouchableOpacity
                  key={cat.label}
                  style={[
                    styles.catChip,
                    { borderColor: cat.color },
                    category === cat.label && { backgroundColor: cat.color },
                  ]}
                  onPress={() => setCategory(cat.label)}
                >
                  <Text style={styles.catIcon}>{cat.icon}</Text>
                  <Text style={[styles.catLabel, category === cat.label && { color: '#fff' }]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Note */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Nota (opcional)</Text>
            <TextInput
              style={styles.textInput}
              value={note}
              onChangeText={setNote}
              placeholder="Agrega un comentario..."
              placeholderTextColor="#CBD5E1"
              returnKeyType="done"
            />
          </View>

          <View style={{ height: 32 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'space-between',
  },
  backBtn: { padding: 4 },
  title: { fontSize: 17, fontWeight: '700', color: '#1E293B' },
  saveBtn: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  typeRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 4,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  typeBtnActive: {},
  typeBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#94A3B8',
  },
  amountBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  currency: {
    fontSize: 36,
    fontWeight: '700',
    color: '#94A3B8',
    marginRight: 4,
  },
  amountInput: {
    fontSize: 48,
    fontWeight: '800',
    color: '#1E293B',
    minWidth: 120,
    textAlign: 'center',
  },
  field: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  textInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#1E293B',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    backgroundColor: '#fff',
  },
  catIcon: { fontSize: 14, marginRight: 4 },
  catLabel: { fontSize: 13, fontWeight: '600', color: '#1E293B' },
});
