import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckCircle, Info } from 'lucide-react-native';
import Header from '../../components/Header';
import { useTheme } from '../../lib/theme';
import { useTranslation } from '../../lib/i18n';

// Eligibility: income - obligations × FOIR × 12 × tenure / (1+rate*tenure/12)
// Simplified: max loan = (net_income * FOIR_factor - obligations) * 12 * tenure_yrs
function calculateEligibility(income: number, obligations: number, tenure: number, rate: number): number {
  if (!income || income <= 0) return 0;
  // Max EMI capacity = 50% of (net income - existing obligations)
  const maxEmi = (income - obligations) * 0.50;
  if (maxEmi <= 0) return 0;
  // Back-calculate principal from EMI
  const r = rate / 12 / 100;
  const n = tenure;
  if (r === 0) return maxEmi * n;
  const principal = maxEmi * (Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n));
  return Math.max(0, principal);
}

function formatCurrency(val: number) {
  return '₹' + Math.round(val).toLocaleString('en-IN');
}

export default function EligibilityCalculatorScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { t } = useTranslation();

  const [income, setIncome] = useState('75000');
  const [obligations, setObligations] = useState('10000');
  const [tenure, setTenure] = useState('36');
  const [rate, setRate] = useState('12');

  const eligible = calculateEligibility(
    Number(income), Number(obligations), Number(tenure), Number(rate)
  );

  const emiCapacity = Math.max(0, (Number(income) - Number(obligations)) * 0.50);
  const foirPercent = Number(income) > 0
    ? Math.round((Number(obligations) / Number(income)) * 100)
    : 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title={t('Eligibility Calculator')} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Result */}
        <View style={styles.resultCard}>
          <Text style={styles.resultLabel}>{t('MAXIMUM LOAN ELIGIBILITY')}</Text>
          <Text style={styles.eligibleAmount}>{formatCurrency(eligible)}</Text>

          <View style={styles.metricsRow}>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>{t('Max EMI Capacity')}</Text>
              <Text style={styles.metricValue}>{formatCurrency(emiCapacity)}</Text>
            </View>
            <View style={[styles.metric, styles.metricCenter]}>
              <Text style={styles.metricLabel}>{t('FOIR')}</Text>
              <Text style={[styles.metricValue, { color: foirPercent > 50 ? colors.danger : colors.primary }]}>
                {foirPercent}%
              </Text>
            </View>
            <View style={[styles.metric, { alignItems: 'flex-end' }]}>
              <Text style={styles.metricLabel}>{t('Tenure')}</Text>
              <Text style={styles.metricValue}>{tenure} {t('Months')}</Text>
            </View>
          </View>

          {/* FOIR indicator */}
          <View style={styles.foirBar}>
            <View style={[styles.foirFill, {
              width: `${Math.min(foirPercent, 100)}%` as any,
              backgroundColor: foirPercent > 50 ? colors.danger : colors.primary,
            }]} />
          </View>
          <Text style={styles.foirHint}>
            {foirPercent > 50
              ? t('⚠️ High FOIR — lenders prefer below 50%')
              : t('✓ Good FOIR — healthy debt-to-income ratio')}
          </Text>
        </View>

        {/* Net Monthly Income */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>{t('NET MONTHLY INCOME (₹)')}</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={income}
            onChangeText={v => setIncome(v.replace(/[^0-9]/g, ''))}
            placeholderTextColor={colors.textMuted}
            placeholder="e.g. 75000"
          />
          <View style={styles.pillRow}>
            {['30000', '50000', '75000', '100000', '150000'].map(i => (
              <TouchableOpacity
                key={i} style={[styles.pill, income === i && styles.pillActive]}
                onPress={() => setIncome(i)} activeOpacity={0.7}
              >
                <Text style={[styles.pillText, income === i && styles.pillTextActive]}>
                  ₹{Number(i).toLocaleString('en-IN')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Existing EMI obligations */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>{t('EXISTING EMI OBLIGATIONS (₹/MONTH)')}</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={obligations}
            onChangeText={v => setObligations(v.replace(/[^0-9]/g, ''))}
            placeholderTextColor={colors.textMuted}
            placeholder="e.g. 10000"
          />
        </View>

        {/* Loan Tenure */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>{t('DESIRED LOAN TENURE (MONTHS)')}</Text>
          <View style={styles.pillRow}>
            {['12', '24', '36', '48', '60'].map(m => (
              <TouchableOpacity
                key={m} style={[styles.pill, tenure === m && styles.pillActive]}
                onPress={() => setTenure(m)} activeOpacity={0.7}
              >
                <Text style={[styles.pillText, tenure === m && styles.pillTextActive]}>{m}M</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Interest Rate */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>{t('EXPECTED INTEREST RATE (% P.A.)')}</Text>
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

        {/* Info */}
        <View style={styles.infoBox}>
          <Info color={colors.primary} size={16} />
          <Text style={styles.infoText}>
            {t('FOIR (Fixed Obligation to Income Ratio) — RBI-regulated lenders use this to determine your repayment capacity. Ideal FOIR is below 50%.')}
          </Text>
        </View>

        {/* Improve tips */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>{t('TIPS TO IMPROVE ELIGIBILITY')}</Text>
          {[
            t('Clear existing loans to reduce obligations'),
            t('Add co-applicant income for higher eligibility'),
            t('Opt for longer tenure to reduce EMI burden'),
          ].map((tip, i) => (
            <View key={i} style={styles.tipRow}>
              <CheckCircle color={colors.primary} size={14} />
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
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
  resultLabel: { fontSize: 11, fontWeight: '800', color: colors.primary, letterSpacing: 1.5, marginBottom: 6 },
  eligibleAmount: { fontSize: 40, fontWeight: '900', color: colors.text, marginBottom: 20 },
  metricsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  metric: { flex: 1 },
  metricCenter: { alignItems: 'center' },
  metricLabel: { fontSize: 11, color: colors.textMuted, fontWeight: '600', marginBottom: 2 },
  metricValue: { fontSize: 14, fontWeight: '800', color: colors.text },
  foirBar: {
    height: 6, backgroundColor: colors.background, borderRadius: 3, marginBottom: 8, overflow: 'hidden',
  },
  foirFill: { height: 6, borderRadius: 3 },
  foirHint: { fontSize: 11, color: colors.textSecondary, fontWeight: '600' },
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
  pillText: { fontSize: 12, fontWeight: '700', color: colors.textSecondary },
  pillTextActive: { color: colors.primary },
  infoBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: colors.primaryLight, padding: 14, borderRadius: 14, marginBottom: 16,
  },
  infoText: { flex: 1, fontSize: 12, color: colors.primary, fontWeight: '600', lineHeight: 18 },
  tipsCard: {
    backgroundColor: colors.surface, borderRadius: 20, padding: 20,
    borderWidth: 1, borderColor: colors.surfaceBorder,
  },
  tipsTitle: { fontSize: 11, fontWeight: '800', color: colors.textMuted, letterSpacing: 1.5, marginBottom: 14 },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 10 },
  tipText: { flex: 1, fontSize: 13, color: colors.textSecondary, fontWeight: '600', lineHeight: 18 },
});
