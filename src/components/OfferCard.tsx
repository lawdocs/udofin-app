import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ShieldCheck } from 'lucide-react-native';

interface OfferCardProps {
  bankName: string;
  bankLogo: string;
  amount: number;
  interestRate: number;
  apr: number;
  emi: number;
  tenure: number;
  processingFee: number;
  onViewDetails: () => void;
  onAccept: () => void;
}

export default function OfferCard({
  bankName,
  bankLogo,
  amount,
  interestRate,
  apr,
  emi,
  tenure,
  processingFee,
  onViewDetails,
  onAccept,
}: OfferCardProps) {
  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.bankInfo}>
          <Text style={styles.logo}>{bankLogo}</Text>
          <View>
            <Text style={styles.bankName}>{bankName}</Text>
            <View style={styles.badgeRow}>
              <ShieldCheck color="#059669" size={14} />
              <Text style={styles.badgeText}>RBI Regulated Lender</Text>
            </View>
          </View>
        </View>
        <Text style={styles.interest}>{interestRate}% p.a.</Text>
      </View>

      {/* Grid of Key Info */}
      <View style={styles.grid}>
        <View style={styles.gridCol}>
          <Text style={styles.label}>LOAN AMOUNT</Text>
          <Text style={styles.val}>₹{amount.toLocaleString('en-IN')}</Text>
        </View>
        <View style={styles.gridCol}>
          <Text style={styles.label}>MONTHLY EMI</Text>
          <Text style={styles.val}>₹{emi.toLocaleString('en-IN')}</Text>
        </View>
      </View>

      <View style={styles.grid}>
        <View style={styles.gridCol}>
          <Text style={styles.label}>TENURE</Text>
          <Text style={styles.val}>{tenure} Months</Text>
        </View>
        <View style={styles.gridCol}>
          <Text style={styles.label}>APR</Text>
          <Text style={styles.val}>{apr}%</Text>
        </View>
      </View>

      <View style={styles.feeRow}>
        <Text style={styles.feeLabel}>One-time Processing Fee</Text>
        <Text style={styles.feeVal}>₹{processingFee.toLocaleString('en-IN')}</Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.secondaryBtn} onPress={onViewDetails} activeOpacity={0.7}>
          <Text style={styles.secondaryBtnText}>View Details</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.primaryBtn} onPress={onAccept} activeOpacity={0.8}>
          <Text style={styles.primaryBtnText}>Accept Offer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.04)',
    elevation: 2,
    marginBottom: 16,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
    paddingBottom: 16,
    marginBottom: 16,
  },
  bankInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    fontSize: 28,
  },
  bankName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#059669',
  },
  interest: {
    fontSize: 16,
    fontWeight: '800',
    color: '#E47656',
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  gridCol: {
    width: '48%',
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  val: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1F2937',
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FAFAFA',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  feeLabel: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '600',
  },
  feeVal: {
    fontSize: 12,
    color: '#1F2937',
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E47656',
  },
  secondaryBtnText: {
    color: '#E47656',
    fontWeight: '700',
    fontSize: 13,
  },
  primaryBtn: {
    flex: 1.2,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E47656',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
