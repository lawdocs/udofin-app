import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calculator, TrendingDown } from 'lucide-react-native';
import Header from '../../components/Header';
import { useTheme } from '../../lib/theme';
import { useTranslation } from '../../lib/i18n';

// EMI formula: P × r × (1+r)^n / ((1+r)^n - 1)
function calculateEMI(principal: number, annualRate: number, tenureMonths: number) {
  if (!principal || !annualRate || !tenureMonths) return { emi: 0, totalInterest: 0, totalPayable: 0 };
  const r = annualRate / 12 / 100;
  const n = tenureMonths;
  const emi = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const totalPayable = emi * n;
  const totalInterest = totalPayable - principal;
  return { emi, totalInterest, totalPayable };
}

function formatCurrency(val: number) {
  return '₹' + Math.round(val).toLocaleString('en-IN');
}

export default function EMICalculatorScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { t } = useTranslation();

  const [amount, setAmount] = useState('500000');
  const [rate, setRate] = useState('12');
  const [tenure, setTenure] = useState('24');

  const adjustAmount = useCallback((delta: number) => {
    const cur = Number(amount) || 0;
    setAmount(String(Math.max(10000, Math.min(5000000, cur + delta))));
  }, [amount]);

  const adjustTenure = useCallback((delta: number) => {
    const cur = Number(tenure) || 0;
    setTenure(String(Math.max(1, Math.min(84, cur + delta))));
  }, [tenure]);

  const { emi, totalInterest, totalPayable } = calculateEMI(
    Number(amount), Number(rate), Number(tenure)
  );

  const principalRatio = totalPayable > 0 ? Math.round((Number(amount) / totalPayable) * 100) : 0;
  const interestRatio = 100 - principalRatio;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title={t('EMI Calculator')} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Result Card */}
        <View style={styles.resultCard}>
          <View style={styles.resultHeader}>
            <Calculator color={colors.primary} size={20} />
            <Text style={styles.resultLabel}>{t('MONTHLY EMI')}</Text>
          </View>
          <Text style={styles.emiAmount}>{formatCurrency(emi)}</Text>

          {/* Breakdown bar */}
          <View style={styles.barContainer}>
            <View style={[styles.barFill, { width: `${principalRatio}%` as any, backgroundColor: colors.primary }]} />
            <View style={[styles.barFill, { width: `${interestRatio}%` as any, backgroundColor: colors.textMuted }]} />
          </View>

          <View style={styles.breakdownRow}>
            <View style={styles.breakdownItem}>
              <View style={[styles.dot, { backgroundColor: colors.primary }]} />
              <View>
                <Text style={styles.breakdownLabel}>{t('Principal')}</Text>
                <Text style={styles.breakdownValue}>{formatCurrency(Number(amount))}</Text>
              </View>
            </View>
            <View style={styles.breakdownItem}>
              <View style={[styles.dot, { backgroundColor: colors.textMuted }]} />
              <View>
                <Text style={styles.breakdownLabel}>{t('Total Interest')}</Text>
                <Text style={styles.breakdownValue}>{formatCurrency(totalInterest)}</Text>
              </View>
            </View>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>{t('Total Payable')}</Text>
            <Text style={styles.totalValue}>{formatCurrency(totalPayable)}</Text>
          </View>
        </View>

        {/* Loan Amount */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>{t('LOAN AMOUNT (₹)')}</Text>
          <View style={styles.stepperRow}>
            <TouchableOpacity style={styles.stepBtn} onPress={() => adjustAmount(-10000)} activeOpacity={0.7}>
              <Text style={styles.stepBtnText}>−</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.stepInput}
              keyboardType="numeric"
              value={amount}
              onChangeText={v => setAmount(v.replace(/[^0-9]/g, ''))}
              placeholderTextColor={colors.textMuted}
            />
            <TouchableOpacity style={styles.stepBtn} onPress={() => adjustAmount(10000)} activeOpacity={0.7}>
              <Text style={styles.stepBtnText}>+</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.rangeLabelRow}>
            <Text style={styles.rangeLabel}>₹10,000</Text>
            <Text style={styles.rangeLabel}>₹50,00,000</Text>
          </View>
        </View>

        {/* Interest Rate */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>{t('INTEREST RATE (% P.A.)')}</Text>
          <TextInput
            style={styles.fullInput}
            keyboardType="numeric"
            value={rate}
            onChangeText={v => setRate(v.replace(/[^0-9.]/g, ''))}
            placeholderTextColor={colors.textMuted}
            placeholder="e.g. 12"
          />
          <View style={styles.pillRow}>
            {['10', '12', '14', '16', '18'].map(r => (
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
          <View style={styles.stepperRow}>
            <TouchableOpacity style={styles.stepBtn} onPress={() => adjustTenure(-6)} activeOpacity={0.7}>
              <Text style={styles.stepBtnText}>−</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.stepInput}
              keyboardType="numeric"
              value={tenure}
              onChangeText={v => setTenure(v.replace(/[^0-9]/g, ''))}
              placeholderTextColor={colors.textMuted}
            />
            <TouchableOpacity style={styles.stepBtn} onPress={() => adjustTenure(6)} activeOpacity={0.7}>
              <Text style={styles.stepBtnText}>+</Text>
            </TouchableOpacity>
          </View>
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

        {/* Info */}
        <View style={styles.infoBox}>
          <TrendingDown color={colors.primary} size={16} />
          <Text style={styles.infoText}>
            {t('Lower tenure = higher EMI but less total interest. Balance comfort with cost.')}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 20, paddingBottom: 40 },
  resultCard: {
    backgroundColor: colors.surface, borderRadius: 24, padding: 24,
    borderWidth: 1, borderColor: colors.surfaceBorder, marginBottom: 20,
  },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  resultLabel: { fontSize: 11, fontWeight: '800', color: colors.primary, letterSpacing: 1.5 },
  emiAmount: { fontSize: 40, fontWeight: '900', color: colors.text, marginBottom: 20 },
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
  stepperRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepBtn: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: colors.primaryLight, borderWidth: 1.5, borderColor: colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  stepBtnText: { fontSize: 22, fontWeight: 'bold', color: colors.primary },
  stepInput: {
    flex: 1, height: 48, borderRadius: 14, borderWidth: 1.5,
    borderColor: colors.surfaceBorder, backgroundColor: colors.surface,
    textAlign: 'center', fontSize: 16, fontWeight: '700', color: colors.text,
  },
  fullInput: {
    height: 48, borderRadius: 14, borderWidth: 1.5,
    borderColor: colors.surfaceBorder, backgroundColor: colors.surface,
    paddingHorizontal: 16, fontSize: 16, fontWeight: '700', color: colors.text,
  },
  rangeLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  rangeLabel: { fontSize: 11, color: colors.textMuted, fontWeight: '600' },
  pillRow: { flexDirection: 'row', gap: 8, marginTop: 10, flexWrap: 'wrap' },
  pill: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
    borderWidth: 1.5, borderColor: colors.surfaceBorder, backgroundColor: colors.surface,
  },
  pillActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  pillText: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
  pillTextActive: { color: colors.primary },
  infoBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: colors.primaryLight, padding: 14, borderRadius: 14,
  },
  infoText: { flex: 1, fontSize: 12, color: colors.primary, fontWeight: '600', lineHeight: 18 },
});
