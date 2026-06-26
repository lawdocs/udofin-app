import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';;
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useLoanStore } from '../../store/loanStore';
import Header from '../../components/Header';
import StatusBadge from '../../components/StatusBadge';
import Timeline from '../../components/Timeline';
import { EmptyState } from '../../components/FeedbackStates';
import { Sparkles, FileSignature, Landmark, Share2, ClipboardList } from 'lucide-react-native';
import { useTheme } from '../../lib/theme';
import { useTranslation } from '../../lib/i18n';

export default function ApplicationDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { applications } = useLoanStore();
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors);
  const { t } = useTranslation();

  const application = applications.find((app) => app.id === id);

  if (!application) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title={t("Application Status")} />
        <EmptyState
          title={t("Application Not Found")}
          description={t("We could not locate any application with identifier: {{id}}").replace('{{id}}', String(id))}
        />
      </SafeAreaView>
    );
  }

  const handleShare = async () => {
    try {
      await Share.share({
        message: t('Udofin Loan Application {{id}} Status: {{status}}')
          .replace('{{id}}', application.id)
          .replace('{{status}}', application.status.toUpperCase()),
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title={t("Application Status")}
        rightElement={
          <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
            <Share2 color={colors.primary} size={20} />
          </TouchableOpacity>
        }
      />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Info Card Header */}
        <View style={styles.summaryCard}>
          <View style={styles.row}>
            <View>
              <Text style={styles.loanType}>{t(application.loanType)}</Text>
              <Text style={styles.appId}>{application.id}</Text>
            </View>
            <StatusBadge status={application.status} />
          </View>
          
          <View style={styles.divider} />

          <View style={styles.statsRow}>
            <View>
              <Text style={styles.label}>{t("AMOUNT REQUESTED")}</Text>
              <Text style={styles.val}>₹{application.amount.toLocaleString('en-IN')}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.label}>{t("SUBMITTED ON")}</Text>
              <Text style={styles.val}>{application.date}</Text>
            </View>
          </View>
        </View>

        {/* Dynamic Action Calls (Alert cards based on current status) */}
        {application.status === 'offers' && (
          <TouchableOpacity
            style={[styles.alertCard, { borderColor: '#8B5CF6', backgroundColor: isDark ? 'rgba(139, 92, 246, 0.1)' : '#FBFBFF' }]}
            onPress={() => router.push(`/compare-offers/${application.id}` as any)}
            activeOpacity={0.9}
          >
            <View style={[styles.alertIconBg, { backgroundColor: isDark ? 'rgba(139, 92, 246, 0.2)' : '#F3E8FF' }]}>
              <Sparkles color="#7C3AED" size={22} />
            </View>
            <View style={styles.alertContent}>
              <Text style={[styles.alertTitle, { color: '#7C3AED' }]}>{t("Offers Received!")}</Text>
              <Text style={styles.alertDesc}>
                {t("We matched you with 3 registered banks. Tap to compare interest rates and EMIs.")}
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {application.status === 'selected' && (
          <TouchableOpacity
            style={[styles.alertCard, { borderColor: colors.primary, backgroundColor: colors.primaryLight }]}
            onPress={() => router.push(`/kfs/${application.id}` as any)}
            activeOpacity={0.9}
          >
            <View style={[styles.alertIconBg, { backgroundColor: colors.primaryLight }]}>
              <Landmark color={colors.primary} size={22} />
            </View>
            <View style={styles.alertContent}>
              <Text style={[styles.alertTitle, { color: colors.primary }]}>{t("Selected Lender Terms")}</Text>
              <Text style={styles.alertDesc}>
                {t("{{lender}} selected. Please review the Key Fact Statement (KFS) to continue.").replace('{{lender}}', application.lender || '')}
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {application.status === 'agreement' && (
          <TouchableOpacity
            style={[styles.alertCard, { borderColor: colors.danger, backgroundColor: colors.dangerLight }]}
            onPress={() => router.push(`/agreement/${application.id}` as any)}
            activeOpacity={0.9}
          >
            <View style={[styles.alertIconBg, { backgroundColor: colors.dangerLight }]}>
              <FileSignature color={colors.danger} size={22} />
            </View>
            <View style={styles.alertContent}>
              <Text style={[styles.alertTitle, { color: colors.danger }]}>{t("Sign Loan Agreement")}</Text>
              <Text style={styles.alertDesc}>
                {t("Terms are accepted. Please provide your digital signature to authorize disbursement.")}
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Timeline Checklist */}
        <Text style={styles.sectionTitle}>{t("APPLICATION TIMELINE")}</Text>
        <View style={styles.timelineWrapper}>
          <Timeline currentStatus={application.status} />
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
  shareBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.primaryLight,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  loanType: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  appId: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  val: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },

  // Alerts
  alertCard: {
    flexDirection: 'row',
    borderWidth: 1.5,
    borderRadius: 18,
    padding: 16,
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  alertIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 2,
  },
  alertDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
    fontWeight: '500',
  },

  // Timeline
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  timelineWrapper: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: 20,
  },
});
