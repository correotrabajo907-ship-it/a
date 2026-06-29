import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Modal, TextInput, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { FinanceStore } from '../store/useFinanceStore';
import { SavingsGoal } from '../types';
import { formatCurrency, generateId } from '../utils/helpers';

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899'];

interface Props { store: FinanceStore }

export default function SavingsScreen({ store }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState<SavingsGoal | null>(null);
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [colorIdx, setColorIdx] = useState(0);
  const [addAmount, setAddAmount] = useState('');

  const openNew = () => {
    setName(''); setTarget(''); setColorIdx(0);
    setShowModal(true);
  };

  const handleCreate = async () => {
    if (!name.trim()) { Alert.alert('Agrega un nombre'); return; }
    const t = parseFloat(target.replace(',', '.'));
    if (isNaN(t) || t <= 0) { Alert.alert('Meta inválida'); return; }
    await store.addSavingsGoal({
      id: generateId(),
      name: name.trim(),
      targetAmount: t,
      savedAmount: 0,
      color: COLORS[colorIdx],
    });
    setShowModal(false);
  };

  const handleAddSavings = async () => {
    if (!showAddModal) return;
    const amt = parseFloat(addAmount.replace(',', '.'));
    if (isNaN(amt) || amt <= 0) { Alert.alert('Monto inválido'); return; }
    await store.updateSavingsGoal({
      ...showAddModal,
      savedAmount: Math.min(showAddModal.savedAmount + amt, showAddModal.targetAmount),
    });
    setShowAddModal(null);
    setAddAmount('');
  };

  const handleDelete = (goal: SavingsGoal) => {
    Alert.alert('Eliminar meta', `¿Eliminar "${goal.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => store.deleteSavingsGoal(goal.id) },
    ]);
  };

  const totalSaved = store.savingsGoals.reduce((s, g) => s + g.savedAmount, 0);
  const totalTarget = store.savingsGoals.reduce((s, g) => s + g.targetAmount, 0);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Ahorros 🏦</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openNew}>
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {store.savingsGoals.length > 0 && (
          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>Total ahorrado</Text>
            <Text style={styles.totalAmount}>{formatCurrency(totalSaved)}</Text>
            <Text style={styles.totalOf}>de {formatCurrency(totalTarget)} en metas</Text>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, {
                width: `${totalTarget > 0 ? Math.min((totalSaved / totalTarget) * 100, 100) : 0}%` as any
              }]} />
            </View>
          </View>
        )}

        {store.savingsGoals.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🎯</Text>
            <Text style={styles.emptyText}>Sin metas de ahorro</Text>
            <Text style={styles.emptySubtext}>Crea tu primera meta y empieza a ahorrar</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={openNew}>
              <Text style={styles.emptyBtnText}>Crear meta</Text>
            </TouchableOpacity>
          </View>
        ) : (
          store.savingsGoals.map(goal => {
            const pct = goal.targetAmount > 0 ? (goal.savedAmount / goal.targetAmount) * 100 : 0;
            const done = pct >= 100;
            return (
              <TouchableOpacity
                key={goal.id}
                style={styles.goalCard}
                onLongPress={() => handleDelete(goal)}
                activeOpacity={0.8}
              >
                <View style={styles.goalHeader}>
                  <View style={[styles.goalDot, { backgroundColor: goal.color }]} />
                  <Text style={styles.goalName}>{goal.name}</Text>
                  {done && <Text style={styles.doneTag}>✅ Meta lograda</Text>}
                </View>
                <View style={styles.goalAmounts}>
                  <Text style={[styles.goalSaved, { color: goal.color }]}>
                    {formatCurrency(goal.savedAmount)}
                  </Text>
                  <Text style={styles.goalTarget}>/ {formatCurrency(goal.targetAmount)}</Text>
                </View>
                <View style={styles.goalBarBg}>
                  <View style={[styles.goalBarFill, {
                    width: `${Math.min(pct, 100)}%` as any,
                    backgroundColor: goal.color,
                  }]} />
                </View>
                <View style={styles.goalFooter}>
                  <Text style={styles.goalPct}>{pct.toFixed(0)}% completado</Text>
                  {!done && (
                    <TouchableOpacity
                      style={[styles.depositBtn, { backgroundColor: goal.color }]}
                      onPress={() => { setShowAddModal(goal); setAddAmount(''); }}
                    >
                      <Text style={styles.depositText}>+ Abonar</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            );
          })
        )}

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Create goal modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Nueva meta de ahorro</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Nombre de la meta (ej. Vacaciones)"
              placeholderTextColor="#CBD5E1"
            />
            <TextInput
              style={styles.input}
              value={target}
              onChangeText={setTarget}
              placeholder="Monto objetivo ($)"
              placeholderTextColor="#CBD5E1"
              keyboardType="numeric"
            />
            <Text style={styles.colorLabel}>Color</Text>
            <View style={styles.colorRow}>
              {COLORS.map((c, i) => (
                <TouchableOpacity
                  key={c}
                  style={[styles.colorDot, { backgroundColor: c }, colorIdx === i && styles.colorDotSelected]}
                  onPress={() => setColorIdx(i)}
                />
              ))}
            </View>
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowModal(false)}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleCreate}>
                <Text style={styles.confirmText}>Crear</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add savings modal */}
      <Modal visible={!!showAddModal} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Abonar a "{showAddModal?.name}"</Text>
            <TextInput
              style={styles.input}
              value={addAmount}
              onChangeText={setAddAmount}
              placeholder="Cuánto quieres abonar ($)"
              placeholderTextColor="#CBD5E1"
              keyboardType="numeric"
              autoFocus
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAddModal(null)}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.confirmBtn, { backgroundColor: showAddModal?.color }]} onPress={handleAddSavings}>
                <Text style={styles.confirmText}>Abonar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  title: { fontSize: 24, fontWeight: '800', color: '#1E293B' },
  addBtn: {
    backgroundColor: '#4F46E5', width: 38, height: 38, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  totalCard: {
    backgroundColor: '#4F46E5', borderRadius: 20, margin: 16, padding: 20,
  },
  totalLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '600', marginBottom: 4 },
  totalAmount: { color: '#fff', fontSize: 30, fontWeight: '800' },
  totalOf: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 2, marginBottom: 12 },
  progressBg: { height: 8, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#fff', borderRadius: 4 },
  goalCard: {
    backgroundColor: '#fff', borderRadius: 16, marginHorizontal: 16, marginBottom: 12, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  goalHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  goalDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  goalName: { fontSize: 16, fontWeight: '700', color: '#1E293B', flex: 1 },
  doneTag: { fontSize: 12, fontWeight: '600', color: '#10B981' },
  goalAmounts: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 8 },
  goalSaved: { fontSize: 22, fontWeight: '800' },
  goalTarget: { fontSize: 14, color: '#94A3B8', marginLeft: 4 },
  goalBarBg: { height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden', marginBottom: 10 },
  goalBarFill: { height: '100%', borderRadius: 4 },
  goalFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  goalPct: { fontSize: 13, color: '#64748B', fontWeight: '600' },
  depositBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  depositText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  empty: { alignItems: 'center', marginTop: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyText: { fontSize: 18, fontWeight: '700', color: '#64748B', marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: '#94A3B8', marginBottom: 24 },
  emptyBtn: { backgroundColor: '#4F46E5', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  emptyBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modal: {
    backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 40,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B', marginBottom: 16 },
  input: {
    backgroundColor: '#F8FAFC', borderRadius: 12, padding: 14, fontSize: 15, color: '#1E293B',
    borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 12,
  },
  colorLabel: { fontSize: 13, fontWeight: '600', color: '#64748B', marginBottom: 8 },
  colorRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  colorDot: { width: 30, height: 30, borderRadius: 15 },
  colorDotSelected: { borderWidth: 3, borderColor: '#1E293B' },
  modalBtns: { flexDirection: 'row', gap: 12 },
  cancelBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center',
    backgroundColor: '#F1F5F9',
  },
  cancelText: { fontWeight: '700', color: '#64748B', fontSize: 15 },
  confirmBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center',
    backgroundColor: '#4F46E5',
  },
  confirmText: { fontWeight: '700', color: '#fff', fontSize: 15 },
});
