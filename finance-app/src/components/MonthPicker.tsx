import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format, addMonths, subMonths, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface Props {
  month: string;
  onChange: (month: string) => void;
}

export default function MonthPicker({ month, onChange }: Props) {
  const date = parseISO(month + '-01');

  const prev = () => onChange(format(subMonths(date, 1), 'yyyy-MM'));
  const next = () => onChange(format(addMonths(date, 1), 'yyyy-MM'));

  const label = format(date, 'MMMM yyyy', { locale: es });
  const isCurrentMonth = month === format(new Date(), 'yyyy-MM');

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={prev} style={styles.btn}>
        <Ionicons name="chevron-back" size={22} color="#4F46E5" />
      </TouchableOpacity>
      <Text style={styles.label}>{label.charAt(0).toUpperCase() + label.slice(1)}</Text>
      <TouchableOpacity onPress={next} style={styles.btn} disabled={isCurrentMonth}>
        <Ionicons name="chevron-forward" size={22} color={isCurrentMonth ? '#CBD5E1' : '#4F46E5'} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  btn: {
    padding: 8,
  },
  label: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    minWidth: 180,
    textAlign: 'center',
  },
});
