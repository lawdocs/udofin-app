import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, Wallet, Sparkles, ClipboardList, HelpCircle, Calculator, BookOpen, CheckCircle, ArrowRight, Activity } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useLoanStore } from '../../store/loanStore';
import { useOnboardingStore } from '../../store/onboardingStore';
import LoanCard from '../../components/LoanCard';
import StatusBadge from '../../components/StatusBadge';
import { useTheme } from '../../lib/theme';
import { useTranslation } from '../../lib/i18n';

export default function HomeScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const { activeLoan, applications, notifications } = useLoanStore();
  const { email } = useOnboardingStore();
  
  const activeApp = applications.find(
    (app) => app.status !== 'completed' && app.status !== 'disbursed'
  );
  
  const unreadCount = notifications.filter((n) => !n.read).length;
  const displayName = email ? email.split('@')[0] : t('Borrower');

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={isDark ? colors.surface : '#FFFFFF'} />
      
      {/* SaaS Dashboard Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greetingText}>{t("Good morning")},</Text>
          <Text style={styles.nameText}>{displayName}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/(tabs)/notifications')} activeOpacity={0.7}>
            <Bell color={colors.text} size={20} />
            {unreadCount > 0 && <View style={styles.badge} />}
          </TouchableOpacity>
          <TouchableOpacity style={styles.avatarBtn} onPress={() => router.push('/(tabs)/profile')} activeOpacity={0.9}>
            <Text style={styles.avatarInitial}>{displayName.charAt(0).toUpperCase()}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Main Dashboard Widget */}
        {activeLoan ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("Active Portfolio")}</Text>
            <LoanCard
              lenderName={activeLoan.lenderName}
              outstandingAmount={activeLoan.outstandingAmount}
              totalAmount={activeLoan.totalAmount}
              nextEmiDate={activeLoan.nextEmiDate}
              nextEmiAmount={activeLoan.nextEmiAmount}
              paidTenure={activeLoan.paidTenure}
              totalTenure={activeLoan.totalTenure}
              onPress={() => router.push('/(tabs)/loan')}
            />
          </View>
        ) : (
          <View style={styles.heroCard}>
            <View style={styles.heroContent}>
              <View style={styles.heroBadge}>
                <Sparkles color="#FFFFFF" size={14} />
                <Text style={styles.heroBadgeText}>{t("PRE-APPROVED")}</Text>
              </View>
              <Text style={styles.heroTitle}>{t("Unlock Your Credit Limit")}</Text>
              <Text style={styles.heroDesc}>
                {t("Access up to ₹50 Lakhs from premium lenders with zero impact on your CIBIL score.")}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.heroBtn} 
              onPress={() => router.push('/loan-application' as any)}
              activeOpacity={0.9}
            >
              <Text style={styles.heroBtnText}>{t("Check Eligibility")}</Text>
              <ArrowRight color={colors.primary} size={18} />
            </TouchableOpacity>
          </View>
        )}

        {/* Application Tracker */}
        {activeApp && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("Recent Activity")}</Text>
            <TouchableOpacity 
              style={styles.trackerCard}
              onPress={() => router.push(`/application/${activeApp.id}` as any)}
              activeOpacity={0.7}
            >
              <View style={styles.trackerHeader}>
                <View style={styles.trackerIconBox}>
                  <Activity color={colors.primary} size={18} />
                </View>
                <View style={styles.trackerInfo}>
                  <Text style={styles.trackerTitle}>{t("Loan Application")}</Text>
                  <Text style={styles.trackerSub}>₹{activeApp.amount.toLocaleString('en-IN')} • ID: {activeApp.id}</Text>
                </View>
                <StatusBadge status={activeApp.status} />
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Workspace / Quick Actions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t("Workspace Tools")}</Text>
            <TouchableOpacity onPress={() => router.push('/calculators' as any)}>
              <Text style={styles.seeAllText}>{t("See all")}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.gridContainer}>
            {[
              { id: 'emi', icon: Wallet, label: 'Pay EMI', desc: 'Make payment', route: '/emi', color: '#3B82F6' },
              { id: 'docs', icon: ClipboardList, label: 'Documents', desc: 'KYC & Income', route: '/documents', color: '#8B5CF6' },
              { id: 'calc_emi', icon: Calculator, label: 'EMI Calc', desc: 'Plan your loan', route: '/calculators/emi', color: '#10B981' },
              { id: 'calc_elig', icon: CheckCircle, label: 'Eligibility', desc: 'Check limit', route: '/calculators/eligibility', color: '#F59E0B' },
              { id: 'learn', icon: BookOpen, label: 'Learn', desc: 'Guides & tips', route: '/learn', color: '#06B6D4' },
              { id: 'support', icon: HelpCircle, label: 'Support', desc: 'Get help', route: '/support', color: '#EC4899' },
            ].map((item) => (
              <TouchableOpacity 
                key={item.id} 
                style={styles.gridItem} 
                onPress={() => router.push(item.route as any)}
                activeOpacity={0.7}
              >
                <View style={[styles.gridIconBox, { backgroundColor: item.color + '15' }]}>
                  <item.icon color={item.color} size={20} />
                </View>
                <Text style={styles.gridLabel}>{t(item.label)}</Text>
                <Text style={styles.gridDesc}>{t(item.desc)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Support Banner */}
        <View style={styles.supportBanner}>
          <View style={styles.supportBannerLeft}>
            <Text style={styles.supportBannerTitle}>{t("Need help with a loan?")}</Text>
            <Text style={styles.supportBannerDesc}>{t("Talk to our financial advisors.")}</Text>
          </View>
          <TouchableOpacity style={styles.supportBannerBtn} onPress={() => router.push('/support')}>
            <Text style={styles.supportBannerBtnText}>{t("Chat")}</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: isDark ? colors.background : '#F9FAFB', // SaaS light gray canvas
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: isDark ? colors.surface : '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: isDark ? colors.surfaceBorder : '#F3F4F6',
  },
  headerLeft: {
    justifyContent: 'center',
  },
  greetingText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: 2,
  },
  nameText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: isDark ? colors.surfaceBorder : '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.danger,
    borderWidth: 2,
    borderColor: isDark ? colors.surfaceBorder : '#F3F4F6',
  },
  avatarBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  
  // Hero Card
  heroCard: {
    backgroundColor: colors.primary,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 28,
    padding: 24,
    boxShadow: `0px 10px 24px ${colors.primary}40`,
    elevation: 8,
  },
  heroContent: {
    marginBottom: 24,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 16,
  },
  heroBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 8,
    lineHeight: 32,
  },
  heroDesc: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  heroBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroBtnText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '800',
  },

  // Tracker Card
  trackerCard: {
    backgroundColor: isDark ? colors.surface : '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: isDark ? colors.surfaceBorder : '#E5E7EB',
    boxShadow: '0px 2px 8px rgba(0,0,0,0.04)',
    elevation: 2,
  },
  trackerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackerIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  trackerInfo: {
    flex: 1,
  },
  trackerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  trackerSub: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },

  // Grid
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridItem: {
    width: '48%', // Approx half width minus gap
    backgroundColor: isDark ? colors.surface : '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: isDark ? colors.surfaceBorder : '#E5E7EB',
    boxShadow: '0px 2px 8px rgba(0,0,0,0.04)',
    elevation: 2,
  },
  gridIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  gridLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  gridDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },

  // Support Banner
  supportBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: isDark ? '#334155' : '#E2E8F0',
  },
  supportBannerLeft: {
    flex: 1,
  },
  supportBannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  supportBannerDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  supportBannerBtn: {
    backgroundColor: colors.text,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  supportBannerBtnText: {
    color: colors.background,
    fontSize: 13,
    fontWeight: '800',
  },
});
