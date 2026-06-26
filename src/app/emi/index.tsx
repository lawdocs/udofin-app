import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';;
import Header from '../../components/Header';
import Button from '../../components/Button';
import { useLoanStore } from '../../store/loanStore';
import StatusBadge from '../../components/StatusBadge';
import { Calculator } from 'lucide-react-native';
import { useTheme } from '../../lib/theme';
import { useTranslation } from '../../lib/i18n';

export default function EMIScreen() {
  const { activeLoan } = useLoanStore();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { t } = useTranslation();
  
  // Calculator state
  const [calcAmount, setCalcAmount] = useState('100000');
  const [calcInterest, setCalcInterest] = useState('11.5');
  const [calcTenure, setCalcTenure] = useState('24');
  const [calculatedEmi, setCalculatedEmi] = useState<number | null>(null);

  const calculateEMI = () => {
    const P = Number(calcAmount);
    const annualR = Number(calcInterest);
    const N = Number(calcTenure);

    if (isNaN(P) || isNaN(annualR) || isNaN(N) || P <= 0 || annualR <= 0 || N <= 0) {
      setCalculatedEmi(null);
      return;
    }

    const r = annualR / 12 / 100;
    const emiVal = (P * r * Math.pow(1 + r, N)) / (Math.pow(1 + r, N) - 1);
    setCalculatedEmi(Math.round(emiVal));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title={t("EMI Calculator & Status")} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Active EMI alert if loan active */}
        {activeLoan && (
          <View style={styles.activeEmiCard}>
            <Text style={styles.sectionTitle}>{t("ACTIVE EMI SUMMARY")}</Text>
            <View style={styles.row}>
              <View>
                <Text style={styles.label}>{t("NEXT EMI AMOUNT")}</Text>
                <Text style={styles.value}>₹{activeLoan.nextEmiAmount.toLocaleString('en-IN')}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.label}>{t("DUE DATE")}</Text>
                <Text style={[styles.value, { color: colors.primary }]}>{activeLoan.nextEmiDate}</Text>
              </View>
            </View>
            <View style={styles.row}>
              <Text style={styles.statusLabel}>{t("Lender Partner")}</Text>
              <Text style={styles.statusValue}>{activeLoan.lenderName}</Text>
            </View>
            <View style={[styles.row, { borderBottomWidth: 0, paddingBottom: 0 }]}>
              <Text style={styles.statusLabel}>{t("Payment Mode")}</Text>
              <Text style={styles.statusValue}>{t("Auto-debit (eNACH) Active")}</Text>
            </View>
          </View>
        )}

        {/* EMI Calculator */}
        <View style={styles.calculatorCard}>
          <View style={styles.calcHeader}>
            <Calculator color={colors.primary} size={24} />
            <Text style={styles.calcTitle}>{t("Loan EMI Calculator")}</Text>
          </View>
          <Text style={styles.calcDesc}>{t("Estimate monthly repayment parameters dynamically.")}</Text>

          <View style={styles.formGroup}>
            <Text style={styles.inputLabel}>{t("LOAN AMOUNT (₹)")}</Text>
            <TextInput
              style={styles.textInput}
              keyboardType="numeric"
              value={calcAmount}
              onChangeText={setCalcAmount}
              placeholderTextColor={colors.textMuted}
            />
          </View>

          <View style={styles.addressGrid}>
            <View style={[styles.formGroup, { width: '48%' }]}>
              <Text style={styles.inputLabel}>{t("INTEREST RATE (% p.a.)")}</Text>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                value={calcInterest}
                onChangeText={setCalcInterest}
                placeholderTextColor={colors.textMuted}
              />
            </View>
            <View style={[styles.formGroup, { width: '48%' }]}>
              <Text style={styles.inputLabel}>{t("TENURE (MONTHS)")}</Text>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                value={calcTenure}
                onChangeText={setCalcTenure}
                placeholderTextColor={colors.textMuted}
              />
            </View>
          </View>

          <Button title={t("Calculate EMI")} onPress={calculateEMI} style={{ marginTop: 8 }} />

          {calculatedEmi !== null && (
            <View style={styles.resultBox}>
              <Text style={styles.resultLabel}>{t("ESTIMATED MONTHLY EMI")}</Text>
              <Text style={styles.resultVal}>₹{calculatedEmi.toLocaleString('en-IN')}</Text>
              <Text style={styles.resultText}>
                {t("Total Interest Payable: ₹{{amount}}").replace('{{amount}}', Math.round((calculatedEmi * Number(calcTenure)) - Number(calcAmount)).toLocaleString('en-IN'))}
              </Text>
            </View>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 20,
  },
  activeEmiCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 1,
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    marginBottom: 12,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  statusLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  statusValue: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '700',
  },

  // Calculator
  calculatorCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  calcHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  calcTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  calcDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 20,
    fontWeight: '500',
  },
  formGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1.5,
    borderColor: colors.surfaceBorder,
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  addressGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  resultBox: {
    backgroundColor: colors.primaryLight,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.primaryLight, // Keeping light, or can be primary transparent depending on preference
    marginTop: 20,
    alignItems: 'center',
  },
  resultLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  resultVal: {
    fontSize: 26,
    fontWeight: '900',
    color: colors.primary,
    marginBottom: 4,
  },
  resultText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
});
