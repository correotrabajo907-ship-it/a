import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Modal, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { FinanceStore } from '../store/useFinanceStore';
import { EXPENSE_CATEGORIES } from '../types';
import { formatCurrency, getCategoryInfo, groupByCategory, currentMonth } from '../utils/helpers';
import MonthPicker from '../components/MonthPicker';

interface Props { store: FinanceStore }

export default function BudgetScreen({ store }: Props) {
  const [month, setMonth] = useState(currentMonth());
  const [showModal, setShowModal] = useState(false);
  const [editCat, setEditCat] = useState('');
  const [limitValue, setLimitValue] = useState('');

  const budget = store.getBudgetForMonth(month);
  const summary = store.getMonthSummary(month);
  const expenses = summary.transactions.filter(t => t.type === 'expense');
  const spentByCategory = groupByCategory(expenses);

  const openEdit = (cat: string) => {
    setEditCat(cat);
    setLimitValue(budget?.categoryLimits[cat]?.toString() ?? '');
    setShowModal(true);
  };

  const handleSave = async () => {
    const val = parseFloat(limitValue.replace(',', '.'));
    const current = budget?.categoryLimits ?? {};
    const updated = { ...current };
    if (!isNaN(val) && val > 0) {
      updated[editCat] = val;
    } else {
      delete updated[editCat];
    }
    await store.setBudgetForMonth(month, updated);
    setShowModal(false);
  };

  const categoriesWithActivity = EXPENSE_CATEGORIES.filter(cat =>
    (spentByCategory[cat.label] ?? 0) > 0 || (budget?.categoryLimits[cat.label] ?? 0) > 0
  );

  const allCategories = [
    ...categoriesWithActivity,
    ...EXPENSE_CATEGORIES.filter(c => !categoriesWithActivity.find(a => a.label === c.label)),
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Presupuesto 📋</Text>
      </View>

      <MonthPicker month={month} onChange={setMonth} />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.hint}>
          <Ionicons name="information-circle-outline" size={14} color="#64748B" />
          <Text style={styles.hintText}>Toca una categoría para establecer su límite mensual</Text>
        </View>

        {allCategories.map(cat => {
          const spent = spentByCategory[cat.label] ?? 0;
          const limit = budget?.categoryLimits[cat.label] ?? 0;
          const pct = limit > 0 ? (spent / limit) * 100 : 0;
          const over = limit > 0 && spent > limit;

          return (
            <TouchableOpacity
              key={cat.label}
              style={styles.catCard}
              onPress={() => openEdit(cat.label)}
              activeOpacity={0.7}
            >
              <View style={styles.catTop}>
                <View style={styles.catLeft}>
                  <View style={[styles.iconBox, { backgroundColor: cat.color + '22' }]}>
                    <Text style={styles.catIcon}>{cat.icon}</Text>
                  </View>
                  <Text style={styles.catName}>{cat.label}</Text>
                </View>
                <View style={styles.catAmounts}>
                  <Text style={[styles.catSpent, over && { color: '#EF4444' }]}>
                    {formatCurrency(spent)}
                  </Text>
                  {limit > 0 ? (
                    <Text style={styles.catLimit}>/ {formatCurrency(limit)}</Text>
                  ) : (
                    <Text style={styles.catNoLimit}>Sin límite</Text>
                  )}
                </View>
              </View>
              {limit > 0 && (
                <View style={styles.barBg}>
                  <View style={[
                    styles.barFill,
                    { width: `${Math.min(pct, 100)}%` as any },
                    { backgroundColor: over ? '#EF4444' : pct > 80 ? '#F59E0B' : cat.color },
                  ]} />
                </View>
              )}
              {over && (
                <Text style={styles.overText}>
                  ⚠️ Excedido por {formatCurrency(spent - limit)}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}

        <View style={{ height: 24 }} />
      </ScrollView>

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            {editCat ? (() => {
              const info = getCategoryInfo(editCat, 'expense');
              return (
                <>
                  <Text style={styles.modalTitle}>
                    {info.icon} Límite para {editCat}
                  </Text>
                  <TextInput
                    style={styles.input}
                    value={limitValue}
                    onChangeText={setLimitValue}
                    placeholder="Límite mensual ($) — vacío para sin límite"
                    placeholderTextColor="#CBD5E1"
                    keyboardType="numeric"
                    autoFocus
                  />
                  <View style={styles.modalBtns}>
                    <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowModal(false)}>
                      <Text style={styles.cancelText}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.confirmBtn} onPress={handleSave}>
                      <Text style={styles.confirmText}>Guardar</Text>
                    </TouchableOpacity>
                  </View>
                </>
              );
            })() : null}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { paddingHorizontal: 16, paddingVertical: 12 },
  title: { fontSize: 24, fontWeight: '800', color: '#1E293B' },
  hint: {
    flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 12,
    backgroundColor: '#EFF6FF', padding: 10, borderRadius: 10, gap: 6,
  },
  hintText: { fontSize: 12, color: '#64748B', flex: 1 },
  catCard: {
    backgroundColor: '#fff', borderRadius: 14, marginHorizontal: 16, marginBottom: 8,
    padding: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  catTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  catLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  catIcon: { fontSize: 18 },
  catName: { fontSize: 14, fontWeight: '600', color: '#1E293B' },
  catAmounts: { alignItems: 'flex-end' },
  catSpent: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
  catLimit: { fontSize: 12, color: '#94A3B8' },
  catNoLimit: { fontSize: 12, color: '#CBD5E1' },
  barBg: { height: 6, backgroundColor: '#F1F5F9', borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3 },
  overText: { fontSize: 12, color: '#EF4444', marginTop: 6, fontWeight: '600' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modal: {
    backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 40,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B', marginBottom: 16 },
  input: {
    backgroundColor: '#F8FAFC', borderRadius: 12, padding: 14, fontSize: 15,
    color: '#1E293B', borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 20,
  },
  modalBtns: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', backgroundColor: '#F1F5F9' },
  cancelText: { fontWeight: '700', color: '#64748B', fontSize: 15 },
  confirmBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', backgroundColor: '#4F46E5' },
  confirmText: { fontWeight: '700', color: '#fff', fontSize: 15 },
});
