import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLoanStore } from '../../store/loanStore';
import Header from '../../components/Header';
import StatusBadge from '../../components/StatusBadge';
import { EmptyState } from '../../components/FeedbackStates';
import { ClipboardList, ChevronRight } from 'lucide-react-native';
import { useTheme } from '../../lib/theme';
import { useTranslation } from '../../lib/i18n';

export default function ApplicationsScreen() {
  const router = useRouter();
  const { applications } = useLoanStore();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top }]}>
      <Header title={t("My Applications")} showBack={false} />
      
      {applications.length === 0 ? (
        <EmptyState
          title={t("No Applications Found")}
          description={t("Apply for a new loan to match with RBI-registered lenders.")}
          icon={<ClipboardList color={colors.textMuted} size={48} />}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {applications.map((app) => (
            <TouchableOpacity
              key={app.id}
              style={styles.card}
              onPress={() => router.push(`/application/${app.id}` as any)}
              activeOpacity={0.9}
            >
              <View style={styles.cardRow}>
                <View>
                  <Text style={styles.loanType}>{t(app.loanType)}</Text>
                  <Text style={styles.appId}>{app.id}</Text>
                </View>
                <StatusBadge status={app.status} />
              </View>

              <View style={styles.detailsGrid}>
                <View>
                  <Text style={styles.label}>{t("Amount")}</Text>
                  <Text style={styles.value}>₹{app.amount.toLocaleString('en-IN')}</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={styles.label}>{t("Tenure")}</Text>
                  <Text style={styles.value}>{app.tenure} {t("Months")}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.label}>{t("Submitted On")}</Text>
                  <Text style={styles.value}>{app.date}</Text>
                </View>
              </View>

              {app.lender && (
                <View style={styles.lenderBox}>
                  <Text style={styles.lenderLabel}>{t("Selected Lender:")}</Text>
                  <Text style={styles.lenderValue}>{app.lender}</Text>
                </View>
              )}

              <View style={styles.footer}>
                <Text style={styles.footerText}>{t("View details & progress")}</Text>
                <ChevronRight color={colors.primary} size={16} />
              </View>
            </TouchableOpacity>
          ))}
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
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    paddingBottom: 14,
    marginBottom: 14,
  },
  loanType: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  appId: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  value: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  lenderBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  lenderLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  lenderValue: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: 12,
  },
  footerText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '700',
  },
});
