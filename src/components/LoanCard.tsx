import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronRight } from 'lucide-react-native';

interface LoanCardProps {
  lenderName: string;
  outstandingAmount: number;
  totalAmount: number;
  nextEmiDate: string;
  nextEmiAmount: number;
  paidTenure: number;
  totalTenure: number;
  onPress?: () => void;
}

export default function LoanCard({
  lenderName,
  outstandingAmount,
  totalAmount,
  nextEmiDate,
  nextEmiAmount,
  paidTenure,
  totalTenure,
  onPress,
}: LoanCardProps) {
  const percentPaid = Math.round((paidTenure / totalTenure) * 100);

  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.9 : 1}
      onPress={onPress}
      style={styles.card}
      disabled={!onPress}
    >
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.cardTitle}>ACTIVE LOAN</Text>
          <Text style={styles.lender}>{lenderName}</Text>
        </View>
        {onPress && <ChevronRight color="#FFF" size={20} />}
      </View>

      <View style={styles.amountSection}>
        <Text style={styles.label}>Outstanding Balance</Text>
        <Text style={styles.amount}>₹{outstandingAmount.toLocaleString('en-IN')}</Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressTextRow}>
          <Text style={styles.progressLabel}>Repaid progress</Text>
          <Text style={styles.progressValue}>
            {paidTenure}/{totalTenure} EMIs ({percentPaid}%)
          </Text>
        </View>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${percentPaid}%` }]} />
        </View>
      </View>

      <View style={styles.footerRow}>
        <View>
          <Text style={styles.footerLabel}>Next EMI Amount</Text>
          <Text style={styles.footerValue}>₹{nextEmiAmount.toLocaleString('en-IN')}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.footerLabel}>Due Date</Text>
          <Text style={styles.footerValue}>{nextEmiDate}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#2A2522', // Sleek dark/bronze theme card
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
    width: '100%',
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  lender: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    marginTop: 2,
  },
  amountSection: {
    marginBottom: 20,
  },
  label: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  amount: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 11,
    fontWeight: '600',
  },
  progressValue: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#E47656', // Accent orange highlight
    borderRadius: 3,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 16,
  },
  footerLabel: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  footerValue: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
