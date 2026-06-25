import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useLoanStore } from '../../store/loanStore';
import Header from '../../components/Header';
import StatusBadge from '../../components/StatusBadge';
import { EmptyState } from '../../components/FeedbackStates';
import { Wallet, Calendar, Download, Eye, FileText } from 'lucide-react-native';

export default function LoanScreen() {
  const router = useRouter();
  const { activeLoan, payEmi } = useLoanStore();

  const handlePayEmi = (emiId: string, amount: number) => {
    Alert.alert(
      'Pay EMI',
      `Process payment of ₹${amount.toLocaleString('en-IN')}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Pay Now', onPress: () => payEmi(emiId) }
      ]
    );
  };

  const simulateDownload = (fileName: string) => {
    Alert.alert('Download Started', `Downloading ${fileName}...`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="My Loan Account" showBack={false} />
      
      {!activeLoan ? (
        <EmptyState
          title="No Active Loan"
          description="You do not have any active loans. Apply for a loan to get matched."
          icon={<Wallet color="#9CA3AF" size={48} />}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Main Info Box */}
          <View style={styles.outstandingCard}>
            <Text style={styles.outstandingLabel}>TOTAL OUTSTANDING DEBT</Text>
            <Text style={styles.outstandingAmount}>₹{activeLoan.outstandingAmount.toLocaleString('en-IN')}</Text>
            
            <View style={styles.amountMetaRow}>
              <View>
                <Text style={styles.metaLabel}>Lender</Text>
                <Text style={styles.metaValue}>{activeLoan.lenderName}</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={styles.metaLabel}>Interest Rate</Text>
                <Text style={styles.metaValue}>{activeLoan.interestRate}% p.a.</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.metaLabel}>Repaid EMIs</Text>
                <Text style={styles.metaValue}>{activeLoan.paidTenure}/{activeLoan.totalTenure}</Text>
              </View>
            </View>
          </View>

          {/* Repayment Schedule */}
          <Text style={styles.sectionTitle}>REPAYMENT SCHEDULE</Text>
          <View style={styles.scheduleList}>
            {activeLoan.repaymentSchedule.map((emi) => (
              <View key={emi.id} style={styles.emiRow}>
                <View style={styles.emiLeft}>
                  <View style={[styles.calIcon, emi.status === 'paid' ? styles.calPaid : styles.calPending]}>
                    <Calendar color={emi.status === 'paid' ? '#059669' : '#D97706'} size={18} />
                  </View>
                  <View>
                    <Text style={styles.emiDue}>Due: {emi.dueDate}</Text>
                    <Text style={styles.emiAmount}>₹{emi.amount.toLocaleString('en-IN')}</Text>
                  </View>
                </View>

                {emi.status === 'pending' ? (
                  <TouchableOpacity 
                    style={styles.payBtn}
                    onPress={() => handlePayEmi(emi.id, emi.amount)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.payBtnText}>Pay Now</Text>
                  </TouchableOpacity>
                ) : (
                  <StatusBadge status={emi.status} />
                )}
              </View>
            ))}
          </View>

          {/* Statements */}
          <Text style={styles.sectionTitle}>LOAN DOCUMENTS & STATEMENTS</Text>
          <View style={styles.statementsList}>
            {activeLoan.statements.map((statement) => (
              <View key={statement.id} style={styles.statementRow}>
                <View style={styles.statementLeft}>
                  <FileText color="#E47656" size={20} />
                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text style={styles.statementName} numberOfLines={1}>{statement.name}</Text>
                    <Text style={styles.statementSize}>{statement.size} • {statement.date}</Text>
                  </View>
                </View>

                <View style={styles.statementActions}>
                  <TouchableOpacity style={styles.iconBtn} onPress={() => simulateDownload(statement.name)}>
                    <Eye color="#6B7280" size={16} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.iconBtn} onPress={() => simulateDownload(statement.name)}>
                    <Download color="#E47656" size={16} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

        </ScrollView>
      )}
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
  outstandingCard: {
    backgroundColor: '#2A2522',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
  },
  outstandingLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.4)',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  outstandingAmount: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  amountMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 16,
  },
  metaLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.4)',
    fontWeight: '600',
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 1.5,
    marginBottom: 16,
    marginTop: 8,
  },
  scheduleList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    marginBottom: 24,
  },
  emiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  emiLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  calPaid: {
    backgroundColor: '#E6FDF4',
  },
  calPending: {
    backgroundColor: '#FEF8E6',
  },
  emiDue: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 2,
  },
  emiAmount: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '800',
  },
  payBtn: {
    backgroundColor: '#E47656',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  payBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  statementsList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    marginBottom: 20,
  },
  statementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  statementLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  statementName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
  },
  statementSize: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
    marginTop: 2,
  },
  statementActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
