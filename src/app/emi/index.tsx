import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import Header from '../../components/Header';
import Button from '../../components/Button';
import { useLoanStore } from '../../store/loanStore';
import StatusBadge from '../../components/StatusBadge';
import { Calculator } from 'lucide-react-native';

export default function EMIScreen() {
  const { activeLoan } = useLoanStore();
  
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
      <Header title="EMI Calculator & Status" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Active EMI alert if loan active */}
        {activeLoan && (
          <View style={styles.activeEmiCard}>
            <Text style={styles.sectionTitle}>ACTIVE EMI SUMMARY</Text>
            <View style={styles.row}>
              <View>
                <Text style={styles.label}>NEXT EMI AMOUNT</Text>
                <Text style={styles.value}>₹{activeLoan.nextEmiAmount.toLocaleString('en-IN')}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.label}>DUE DATE</Text>
                <Text style={[styles.value, { color: '#E47656' }]}>{activeLoan.nextEmiDate}</Text>
              </View>
            </View>
            <View style={styles.row}>
              <Text style={styles.statusLabel}>Lender Partner</Text>
              <Text style={styles.statusValue}>{activeLoan.lenderName}</Text>
            </View>
            <View style={[styles.row, { borderBottomWidth: 0, paddingBottom: 0 }]}>
              <Text style={styles.statusLabel}>Payment Mode</Text>
              <Text style={styles.statusValue}>Auto-debit (eNACH) Active</Text>
            </View>
          </View>
        )}

        {/* EMI Calculator */}
        <View style={styles.calculatorCard}>
          <View style={styles.calcHeader}>
            <Calculator color="#E47656" size={24} />
            <Text style={styles.calcTitle}>Loan EMI Calculator</Text>
          </View>
          <Text style={styles.calcDesc}>Estimate monthly repayment parameters dynamically.</Text>

          <View style={styles.formGroup}>
            <Text style={styles.inputLabel}>LOAN AMOUNT (₹)</Text>
            <TextInput
              style={styles.textInput}
              keyboardType="numeric"
              value={calcAmount}
              onChangeText={setCalcAmount}
            />
          </View>

          <View style={styles.addressGrid}>
            <View style={[styles.formGroup, { width: '48%' }]}>
              <Text style={styles.inputLabel}>INTEREST RATE (% p.a.)</Text>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                value={calcInterest}
                onChangeText={setCalcInterest}
              />
            </View>
            <View style={[styles.formGroup, { width: '48%' }]}>
              <Text style={styles.inputLabel}>TENURE (MONTHS)</Text>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                value={calcTenure}
                onChangeText={setCalcTenure}
              />
            </View>
          </View>

          <Button title="Calculate EMI" onPress={calculateEMI} style={{ marginTop: 8 }} />

          {calculatedEmi !== null && (
            <View style={styles.resultBox}>
              <Text style={styles.resultLabel}>ESTIMATED MONTHLY EMI</Text>
              <Text style={styles.resultVal}>₹{calculatedEmi.toLocaleString('en-IN')}</Text>
              <Text style={styles.resultText}>
                Total Interest Payable: ₹{Math.round((calculatedEmi * Number(calcTenure)) - Number(calcAmount)).toLocaleString('en-IN')}
              </Text>
            </View>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FEF8F4',
  },
  scrollContent: {
    padding: 20,
  },
  activeEmiCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 1,
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    marginBottom: 12,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
  },
  statusLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  statusValue: {
    fontSize: 12,
    color: '#1F2937',
    fontWeight: '700',
  },

  // Calculator
  calculatorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#EAEAEA',
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
    color: '#1F2937',
  },
  calcDesc: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 20,
    fontWeight: '500',
  },
  formGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1.5,
    borderColor: '#EAEAEA',
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
  },
  addressGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  resultBox: {
    backgroundColor: '#FFF5F2',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FBECE8',
    marginTop: 20,
    alignItems: 'center',
  },
  resultLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#E47656',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  resultVal: {
    fontSize: 26,
    fontWeight: '900',
    color: '#E47656',
    marginBottom: 4,
  },
  resultText: {
    fontSize: 11,
    color: '#8A7060',
    fontWeight: '600',
  },
});
