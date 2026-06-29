import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Clock, ExternalLink, Paperclip, Shield } from 'lucide-react-native';
import { EmptyState } from '../../components/FeedbackStates';
import Header from '../../components/Header';
import ProfileCard from '../../components/ProfileCard';
import StatusBadge from '../../components/StatusBadge';
import { useTranslation } from '../../lib/i18n';
import { useTheme } from '../../lib/theme';
import { useLoanStore } from '../../store/loanStore';
;

export default function ComplaintDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { complaints } = useLoanStore();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { t } = useTranslation();

  const ticket = complaints.find((t) => t.id === id);

  if (!ticket) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title={t("Ticket Details")} />
        <EmptyState
          title={t("Ticket Not Found")}
          description={t("We could not locate support ticket matching identifier: {{id}}").replace('{{id}}', String(id))}
        />
      </SafeAreaView>
    );
  }

  let daysRemaining = 30;
  try {
    const createdDate = new Date(ticket.date);
    const currentDate = new Date();
    createdDate.setHours(0,0,0,0);
    currentDate.setHours(0,0,0,0);
    const diffTime = currentDate.getTime() - createdDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    daysRemaining = Math.max(0, 30 - diffDays);
  } catch (e) {
    daysRemaining = 30;
  }

  const getLenderNodalOfficer = (lender?: string) => {
    switch (lender) {
      case 'State Bank of India':
        return {
          name: 'SBI Nodal Redressal',
          email: 'customercare.gro@sbi.co.in',
          phone: '1800-425-3800',
        };
      case 'HDFC Bank':
        return {
          name: 'HDFC Grievance Desk',
          email: 'grievance.officer@hdfcbank.com',
          phone: '1800-266-4060',
        };
      case 'ICICI Bank':
        return {
          name: 'ICICI Nodal Officer',
          email: 'head.servicequality@icicibank.com',
          phone: '1800-200-3344',
        };
      default:
        return lender ? {
          name: `${lender} Support`,
          email: `grievance@${lender.toLowerCase().replace(/[^a-z]/g, '')}.com`,
          phone: '1800-120-XXXX',
        } : null;
    }
  };

  const lenderNodal = getLenderNodalOfficer(ticket.lenderName);

  const details = [
    { label: t('Ticket Reference ID'), value: ticket.id },
    { label: t('Category'), value: t(ticket.category) },
    { label: t('Created On'), value: ticket.date },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title={t("Ticket Progress")} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* SLA Countdown & Status Box */}
        <View style={styles.statusBox}>
          <View style={styles.row}>
            <Text style={styles.statusLabel}>{t("Current Status")}</Text>
            <StatusBadge status={ticket.status} />
          </View>
          
          <View style={styles.divider} />
          
          {ticket.status !== 'resolved' ? (
            <View style={styles.slaContainer}>
              <Clock color={daysRemaining < 5 ? '#DC2626' : '#E47656'} size={18} />
              <View style={{ flex: 1 }}>
                <Text style={styles.slaTitle}>
                  {daysRemaining > 0 ? `${daysRemaining} Days Left for Resolution` : 'SLA Resolution Window Expired'}
                </Text>
                <Text style={styles.slaText}>
                  {daysRemaining > 0 
                    ? `Our system tracks this ticket under a strict RBI-mandated 30-day TAT from creation date (${ticket.date}).` 
                    : 'The standard 30-day window for resolution has passed. You may now escalate to the RBI Ombudsman below.'}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.slaContainer}>
              <Clock color="#10B981" size={18} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.slaTitle, { color: '#10B981' }]}>Grievance Resolved</Text>
                <Text style={styles.slaText}>
                  This ticket has been successfully investigated and resolved. If you are not satisfied with the response, you possess the right to appeal to the RBI.
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Nodal Officer Contact Desk */}
        <View style={styles.contentCard}>
          <Text style={styles.cardTitle}>DESIGNATED REDRESSAL OFFICERS</Text>
          <View style={styles.groContactContainer}>
            {/* Udofin GRO */}
            <View style={styles.groItem}>
              <Text style={styles.groLabel}>Udofin Officer (LSP)</Text>
              <Text style={styles.groValue}>Mr. Ritesh Kumar</Text>
              <Text style={styles.groSub}>📧 grievance@udofin.com</Text>
              <Text style={styles.groSub}>📞 +91 1800-120-3344</Text>
            </View>

            {/* Lender GRO */}
            {lenderNodal && (
              <>
                <View style={styles.groDivider} />
                <View style={styles.groItem}>
                  <Text style={styles.groLabel}>Lender Desk ({ticket.lenderName})</Text>
                  <Text style={styles.groValue}>{lenderNodal.name}</Text>
                  <Text style={styles.groSub}>📧 {lenderNodal.email}</Text>
                  <Text style={styles.groSub}>📞 {lenderNodal.phone}</Text>
                </View>
              </>
            )}
          </View>
        </View>

        <ProfileCard title={t("TICKET METADATA")} items={details} />

        {/* User Description */}
        <View style={styles.contentCard}>
          <Text style={styles.cardTitle}>{t("USER COMPLAINT BRIEF")}</Text>
          <Text style={styles.descriptionText}>{ticket.description}</Text>
          
          {ticket.attachmentName && (
            <View style={styles.attachmentDetailsContainer}>
              <Text style={styles.attachmentSubTitle}>ATTACHED EVIDENCE</Text>
              <TouchableOpacity 
                style={styles.attachmentFileRow}
                onPress={() => ticket.attachmentUri && Linking.openURL(ticket.attachmentUri)}
                activeOpacity={0.7}
              >
                <Paperclip size={16} color="#E47656" />
                <Text style={styles.attachmentFileNameText} numberOfLines={1}>
                  {ticket.attachmentName}
                </Text>
                <ExternalLink size={12} color="#E47656" style={{ marginLeft: 'auto' }} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Redressal Response notes */}
        <View style={styles.contentCard}>
          <Text style={styles.cardTitle}>{t("OFFICIAL RESOLUTION RESPONSE")}</Text>
          <Text style={styles.notesText}>
            {ticket.notes || t('Our customer support officer is reviewing your complaint details. Response is typically posted within 24 hours.')}
          </Text>
        </View>

        {/* RBI Escalation Portal Section */}
        <View style={styles.rbiEscalationCard}>
          <Shield color="#92400E" size={24} />
          <View style={{ flex: 1 }}>
            <Text style={styles.rbiTitle}>RBI OMBUDSMAN ESCALATION (RB-IOS)</Text>
            <Text style={styles.rbiText}>
              If your grievance remains unresolved after 30 days, or if you are dissatisfied with the final resolution, you can directly approach the RBI Integrated Ombudsman or file a complaint through Sachet.
            </Text>
            
            <View style={styles.rbiActions}>
              <TouchableOpacity 
                style={styles.rbiButton} 
                onPress={() => Linking.openURL('https://cms.rbi.org.in/')}
              >
                <Text style={styles.rbiButtonText}>RBI Complaint Portal (CMS)</Text>
                <ExternalLink size={12} color="#FFFFFF" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.rbiButton, styles.rbiButtonAlt]} 
                onPress={() => Linking.openURL('https://sachet.rbi.org.in/')}
              >
                <Text style={[styles.rbiButtonText, styles.rbiButtonTextAlt]}>RBI Sachet Portal</Text>
                <ExternalLink size={12} color="#92400E" />
              </TouchableOpacity>
            </View>
          </View>
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
  statusBox: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  contentCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: 20,
    width: '100%',
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    fontWeight: '600',
  },
  notesText: {
    fontSize: 13,
    color: colors.primary,
    lineHeight: 18,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 14,
  },
  slaContainer: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  slaTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#E47656',
    marginBottom: 2,
  },
  slaText: {
    fontSize: 11,
    color: '#6B7280',
    lineHeight: 15,
    fontWeight: '600',
  },
  groContactContainer: {
    gap: 12,
  },
  groItem: {
    gap: 4,
  },
  groLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 0.5,
  },
  groValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
  },
  groSub: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '600',
  },
  groDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 4,
  },
  rbiEscalationCard: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    marginBottom: 30,
    gap: 12,
  },
  rbiTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#92400E',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  rbiText: {
    fontSize: 11,
    color: '#B45309',
    lineHeight: 15,
    fontWeight: '600',
    marginBottom: 16,
  },
  rbiActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  rbiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#92400E',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    gap: 6,
  },
  rbiButtonAlt: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#92400E',
  },
  rbiButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  rbiButtonTextAlt: {
    color: '#92400E',
  },
  attachmentDetailsContainer: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  attachmentSubTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 1,
    marginBottom: 8,
  },
  attachmentFileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9F7',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFF0E8',
    padding: 12,
    gap: 8,
  },
  attachmentFileNameText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E47656',
    flex: 1,
  },
});
