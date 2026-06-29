import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BarChart3 } from 'lucide-react-native';
import Header from '../../components/Header';
import { useTheme } from '../../lib/theme';
import { useTranslation } from '../../lib/i18n';

function formatCurrency(val: number) {
  return '₹' + Math.round(val).toLocaleString('en-IN');
}

export default function InterestCalculatorScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { t } = useTranslation();

  const [principal, setPrincipal] = useState('100000');
  const [rate, setRate] = useState('12');
  const [tenure, setTenure] = useState('24');
  // Type: 'simple' | 'compound'
  const [type, setType] = useState<'simple' | 'compound'>('compound');

  const P = Number(principal) || 0;
  const R = Number(rate) || 0;
  const N = Number(tenure) || 0; // months
  const Nyears = N / 12;

  let totalInterest = 0;
  let totalAmount = 0;

  if (type === 'simple') {
    totalInterest = (P * R * Nyears) / 100;
    totalAmount = P + totalInterest;
  } else {
    // Compound monthly
    totalAmount = P * Math.pow(1 + R / 12 / 100, N);
    totalInterest = totalAmount - P;
  }

  const interestRatio = totalAmount > 0 ? Math.round((totalInterest / totalAmount) * 100) : 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title={t('Interest Calculator')} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Type Toggle */}
        <View style={styles.toggleRow}>
          {(['simple', 'compound'] as const).map(t2 => (
            <TouchableOpacity
              key={t2}
              style={[styles.toggleBtn, type === t2 && styles.toggleBtnActive]}
              onPress={() => setType(t2)}
              activeOpacity={0.8}
            >
              <Text style={[styles.toggleText, type === t2 && styles.toggleTextActive]}>
                {t2 === 'simple' ? t('Simple Interest') : t('Compound Interest')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Result Card */}
        <View style={styles.resultCard}>
          <View style={styles.resultHeader}>
            <BarChart3 color={colors.primary} size={20} />
            <Text style={styles.resultLabel}>{t('TOTAL INTEREST')}</Text>
          </View>
          <Text style={styles.interestAmount}>{formatCurrency(totalInterest)}</Text>

          {/* Bar */}
          <View style={styles.barContainer}>
            <View style={[styles.barFill, { width: `${100 - interestRatio}%` as any, backgroundColor: colors.primary }]} />
            <View style={[styles.barFill, { width: `${interestRatio}%` as any, backgroundColor: '#F59E0B' }]} />
          </View>

          <View style={styles.breakdownRow}>
            <View style={styles.breakdownItem}>
              <View style={[styles.dot, { backgroundColor: colors.primary }]} />
              <View>
                <Text style={styles.breakdownLabel}>{t('Principal')}</Text>
                <Text style={styles.breakdownValue}>{formatCurrency(P)}</Text>
              </View>
            </View>
            <View style={styles.breakdownItem}>
              <View style={[styles.dot, { backgroundColor: '#F59E0B' }]} />
              <View>
                <Text style={styles.breakdownLabel}>{t('Interest')}</Text>
                <Text style={styles.breakdownValue}>{formatCurrency(totalInterest)}</Text>
              </View>
            </View>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>{t('Total Amount')}</Text>
            <Text style={styles.totalValue}>{formatCurrency(totalAmount)}</Text>
          </View>
        </View>

        {/* Principal */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>{t('PRINCIPAL AMOUNT (₹)')}</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={principal}
            onChangeText={v => setPrincipal(v.replace(/[^0-9]/g, ''))}
            placeholderTextColor={colors.textMuted}
            placeholder="e.g. 100000"
          />
        </View>

        {/* Rate */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>{t('ANNUAL INTEREST RATE (%)')}</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={rate}
            onChangeText={v => setRate(v.replace(/[^0-9.]/g, ''))}
            placeholderTextColor={colors.textMuted}
            placeholder="e.g. 12"
          />
          <View style={styles.pillRow}>
            {['8', '10', '12', '15', '18'].map(r => (
              <TouchableOpacity
                key={r} style={[styles.pill, rate === r && styles.pillActive]}
                onPress={() => setRate(r)} activeOpacity={0.7}
              >
                <Text style={[styles.pillText, rate === r && styles.pillTextActive]}>{r}%</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Tenure */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>{t('TENURE (MONTHS)')}</Text>
          <View style={styles.pillRow}>
            {['6', '12', '24', '36', '60'].map(m => (
              <TouchableOpacity
                key={m} style={[styles.pill, tenure === m && styles.pillActive]}
                onPress={() => setTenure(m)} activeOpacity={0.7}
              >
                <Text style={[styles.pillText, tenure === m && styles.pillTextActive]}>{m}M</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 20, paddingBottom: 40 },
  toggleRow: {
    flexDirection: 'row', gap: 10, marginBottom: 20,
  },
  toggleBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 14,
    borderWidth: 1.5, borderColor: colors.surfaceBorder,
    backgroundColor: colors.surface, alignItems: 'center',
  },
  toggleBtnActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  toggleText: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
  toggleTextActive: { color: colors.primary },
  resultCard: {
    backgroundColor: colors.surface, borderRadius: 24, padding: 24,
    borderWidth: 1, borderColor: colors.surfaceBorder, marginBottom: 20,
  },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  resultLabel: { fontSize: 11, fontWeight: '800', color: colors.primary, letterSpacing: 1.5 },
  interestAmount: { fontSize: 40, fontWeight: '900', color: '#F59E0B', marginBottom: 20 },
  barContainer: {
    flexDirection: 'row', height: 8, borderRadius: 4, overflow: 'hidden',
    marginBottom: 16, backgroundColor: colors.background,
  },
  barFill: { height: 8 },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  breakdownItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 5, marginTop: 3 },
  breakdownLabel: { fontSize: 11, color: colors.textMuted, fontWeight: '600', marginBottom: 2 },
  breakdownValue: { fontSize: 13, fontWeight: '800', color: colors.text },
  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingTop: 14, borderTopWidth: 1, borderTopColor: colors.divider,
  },
  totalLabel: { fontSize: 14, fontWeight: '700', color: colors.textSecondary },
  totalValue: { fontSize: 16, fontWeight: '900', color: colors.primary },
  inputGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 11, fontWeight: '800', color: colors.textMuted, letterSpacing: 1, marginBottom: 10 },
  input: {
    height: 48, borderRadius: 14, borderWidth: 1.5,
    borderColor: colors.surfaceBorder, backgroundColor: colors.surface,
    paddingHorizontal: 16, fontSize: 16, fontWeight: '700', color: colors.text,
    marginBottom: 10,
  },
  pillRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  pill: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
    borderWidth: 1.5, borderColor: colors.surfaceBorder, backgroundColor: colors.surface,
  },
  pillActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  pillText: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
  pillTextActive: { color: colors.primary },
});
