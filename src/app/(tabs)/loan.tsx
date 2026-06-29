import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLoanStore } from '../../store/loanStore';
import Header from '../../components/Header';
import StatusBadge from '../../components/StatusBadge';
import { EmptyState } from '../../components/FeedbackStates';
import { Wallet, Calendar, Download, Eye, FileText } from 'lucide-react-native';
import { useTheme } from '../../lib/theme';
import { useTranslation } from '../../lib/i18n';

export default function LoanScreen() {
  const router = useRouter();
  const { activeLoan, payEmi } = useLoanStore();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const handlePayEmi = (emiId: string, amount: number) => {
    Alert.alert(
      t('Pay EMI'),
      `${t('Process payment of')} ₹${amount.toLocaleString('en-IN')}?`,
      [
        { text: t('Cancel'), style: 'cancel' },
        { text: t('Pay Now'), onPress: () => payEmi(emiId) }
      ]
    );
  };

  const simulateDownload = (fileName: string) => {
    Alert.alert(t('Download Started'), `${t('Downloading')} ${fileName}...`);
  };

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top }]}>
      <Header title={t("My Loan Account")} showBack={false} />
      
      {!activeLoan ? (
        <EmptyState
          title={t("No Active Loan")}
          description={t("You do not have any active loans. Apply for a loan to get matched.")}
          icon={<Wallet color={colors.textMuted} size={48} />}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Main Info Box */}
          <View style={styles.outstandingCard}>
            <Text style={styles.outstandingLabel}>{t("TOTAL OUTSTANDING DEBT")}</Text>
            <Text style={styles.outstandingAmount}>₹{activeLoan.outstandingAmount.toLocaleString('en-IN')}</Text>
            
            <View style={styles.amountMetaRow}>
              <View>
                <Text style={styles.metaLabel}>{t("Lender")}</Text>
                <Text style={styles.metaValue}>{activeLoan.lenderName}</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={styles.metaLabel}>{t("Interest Rate")}</Text>
                <Text style={styles.metaValue}>{activeLoan.interestRate}% {t("p.a.")}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.metaLabel}>{t("Repaid EMIs")}</Text>
                <Text style={styles.metaValue}>{activeLoan.paidTenure}/{activeLoan.totalTenure}</Text>
              </View>
            </View>
          </View>

          {/* Repayment Schedule */}
          <Text style={styles.sectionTitle}>{t("REPAYMENT SCHEDULE")}</Text>
          <View style={styles.scheduleList}>
            {activeLoan.repaymentSchedule.map((emi) => (
              <View key={emi.id} style={styles.emiRow}>
                <View style={styles.emiLeft}>
                  <View style={[styles.calIcon, emi.status === 'paid' ? styles.calPaid : styles.calPending]}>
                    <Calendar color={emi.status === 'paid' ? '#059669' : '#D97706'} size={18} />
                  </View>
                  <View>
                    <Text style={styles.emiDue}>{t("Due:")} {emi.dueDate}</Text>
                    <Text style={styles.emiAmount}>₹{emi.amount.toLocaleString('en-IN')}</Text>
                  </View>
                </View>

                {emi.status === 'pending' ? (
                  <TouchableOpacity 
                    style={styles.payBtn}
                    onPress={() => handlePayEmi(emi.id, emi.amount)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.payBtnText}>{t("Pay Now")}</Text>
                  </TouchableOpacity>
                ) : (
                  <StatusBadge status={emi.status} />
                )}
              </View>
            ))}
          </View>

          {/* Statements */}
          <Text style={styles.sectionTitle}>{t("LOAN DOCUMENTS & STATEMENTS")}</Text>
          <View style={styles.statementsList}>
            {activeLoan.statements.map((statement) => (
              <View key={statement.id} style={styles.statementRow}>
                <View style={styles.statementLeft}>
                  <FileText color={colors.primary} size={20} />
                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text style={styles.statementName} numberOfLines={1}>{statement.name}</Text>
                    <Text style={styles.statementSize}>{statement.size} • {statement.date}</Text>
                  </View>
                </View>

                <View style={styles.statementActions}>
                  <TouchableOpacity style={styles.iconBtn} onPress={() => simulateDownload(statement.name)}>
                    <Eye color={colors.textSecondary} size={16} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.iconBtn} onPress={() => simulateDownload(statement.name)}>
                    <Download color={colors.primary} size={16} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

        </ScrollView>
      )}
    </View>
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
  outstandingCard: {
    backgroundColor: colors.surfaceDark,
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
    color: colors.textMuted,
    letterSpacing: 1.5,
    marginBottom: 16,
    marginTop: 8,
  },
  scheduleList: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: 24,
  },
  emiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
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
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 2,
  },
  emiAmount: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '800',
  },
  payBtn: {
    backgroundColor: colors.primary,
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
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: 20,
  },
  statementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
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
    color: colors.text,
  },
  statementSize: {
    fontSize: 11,
    color: colors.textMuted,
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
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
