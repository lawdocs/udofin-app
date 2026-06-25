import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { Bell, Wallet, Sparkles, ClipboardList, Info, HelpCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useLoanStore } from '../../store/loanStore';
import { useOnboardingStore } from '../../store/onboardingStore';
import LoanCard from '../../components/LoanCard';
import StatusBadge from '../../components/StatusBadge';

export default function HomeScreen() {
  const router = useRouter();
  const { activeLoan, applications, notifications } = useLoanStore();
  const { email } = useOnboardingStore();
  
  // Find ongoing (incomplete) applications
  const activeApp = applications.find(
    (app) => app.status !== 'completed' && app.status !== 'disbursed'
  );
  
  // Unread notification count
  const unreadCount = notifications.filter((n) => !n.read).length;

  const displayName = email ? email.split('@')[0] : 'Borrower';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FEF8F4" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header Row */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>WELCOME BACK</Text>
            <View style={styles.nameRow}>
              <Text style={styles.nameText}>{displayName}</Text>
              <View style={styles.onlineDot} />
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.notificationBtn} 
            onPress={() => router.push('/(tabs)/notifications')}
            activeOpacity={0.7}
          >
            <Bell color="#E47656" size={22} />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Loan Card (Active Loan) */}
        {activeLoan ? (
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
        ) : (
          /* Eligibility Card if no active loan */
          <View style={styles.eligibilityCard}>
            <View style={styles.eligibilityHeader}>
              <Sparkles color="#E47656" size={24} />
              <Text style={styles.eligibilityLabel}>CREDIT OFFER FOR YOU</Text>
            </View>
            <Text style={styles.eligibilityTitle}>Check Your Loan Eligibility</Text>
            <Text style={styles.eligibilityDesc}>
              Get matched with 10+ RBI-regulated lenders in under 10 seconds. Zero credit score impact.
            </Text>
            <TouchableOpacity 
              style={styles.applyBtn} 
              onPress={() => router.push('/loan-application' as any)}
              activeOpacity={0.9}
            >
              <Text style={styles.applyBtnText}>Apply Now</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Active Application Status Tracker */}
        {activeApp && (
          <TouchableOpacity 
            style={styles.statusCard}
            onPress={() => router.push(`/application/${activeApp.id}` as any)}
            activeOpacity={0.9}
          >
            <View style={styles.statusHeader}>
              <View style={styles.statusHeaderLeft}>
                <ClipboardList color="#E47656" size={20} />
                <Text style={styles.statusTitle}>Active Application</Text>
              </View>
              <StatusBadge status={activeApp.status} />
            </View>
            
            <View style={styles.statusBody}>
              <View style={styles.statusItemRow}>
                <Text style={styles.statusLabel}>ID:</Text>
                <Text style={styles.statusValue}>{activeApp.id}</Text>
              </View>
              <View style={styles.statusItemRow}>
                <Text style={styles.statusLabel}>Amount Requested:</Text>
                <Text style={styles.statusValue}>₹{activeApp.amount.toLocaleString('en-IN')}</Text>
              </View>
            </View>

            <View style={styles.statusFooter}>
              <Info color="#E47656" size={14} />
              <Text style={styles.statusFooterText}>Click to track progress and complete setup.</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Quick Actions Grid */}
        <Text style={styles.sectionTitle}>QUICK ACTIONS</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity 
            style={styles.actionItem} 
            activeOpacity={0.7}
            onPress={() => router.push('/emi' as any)}
          >
            <View style={[styles.actionCircle, { backgroundColor: '#FFF5F2' }]}>
              <Wallet color="#E47656" size={24} />
            </View>
            <Text style={styles.actionLabel}>Pay EMI</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionItem} 
            activeOpacity={0.7}
            onPress={() => router.push('/documents' as any)}
          >
            <View style={[styles.actionCircle, { backgroundColor: '#E0F2FE' }]}>
              <ClipboardList color="#0284C7" size={24} />
            </View>
            <Text style={styles.actionLabel}>My Docs</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionItem} 
            activeOpacity={0.7}
            onPress={() => router.push('/support')}
          >
            <View style={[styles.actionCircle, { backgroundColor: '#F5F3FF' }]}>
              <HelpCircle color="#7C3AED" size={24} />
            </View>
            <Text style={styles.actionLabel}>Help & FAQs</Text>
          </TouchableOpacity>
        </View>

        {/* Support Callout Box */}
        <View style={styles.supportCallout}>
          <Text style={styles.supportTitle}>Need financial advice?</Text>
          <Text style={styles.supportText}>
            Our AI Loan Advisor "Fin" can match you with appropriate bank offers. Check out the Support section or chat live.
          </Text>
          <TouchableOpacity 
            style={styles.supportBtn}
            onPress={() => router.push('/support')}
          >
            <Text style={styles.supportBtnText}>Connect Now</Text>
          </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 10,
  },
  welcomeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1F2937',
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E47656',
    marginLeft: 8,
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FFF0E8',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#E47656',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  
  // Eligibility Card
  eligibilityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#FFF0E8',
    marginBottom: 24,
    shadowColor: '#E47656',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  eligibilityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  eligibilityLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#E47656',
    letterSpacing: 1,
  },
  eligibilityTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 8,
  },
  eligibilityDesc: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 20,
    fontWeight: '500',
  },
  applyBtn: {
    backgroundColor: '#E47656',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  // Active Application
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    marginBottom: 24,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 14,
    marginBottom: 14,
  },
  statusHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1F2937',
  },
  statusBody: {
    gap: 8,
    marginBottom: 14,
  },
  statusItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
  statusValue: {
    fontSize: 13,
    color: '#1F2937',
    fontWeight: '700',
  },
  statusFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF8F6',
    padding: 10,
    borderRadius: 8,
  },
  statusFooterText: {
    fontSize: 11,
    color: '#E47656',
    fontWeight: '700',
  },

  // Section title
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  
  // Actions
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionItem: {
    alignItems: 'center',
    width: '30%',
  },
  actionCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
  },

  // Support callout
  supportCallout: {
    backgroundColor: '#FAF5F0',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F0E5DA',
  },
  supportTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#8B4513',
    marginBottom: 4,
  },
  supportText: {
    fontSize: 12,
    color: '#8A7060',
    lineHeight: 18,
    fontWeight: '500',
    marginBottom: 14,
  },
  supportBtn: {
    backgroundColor: '#8B4513',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  supportBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
