import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';;
import { useRouter } from 'expo-router';
import Header from '../components/Header';
import SupportCard from '../components/SupportCard';
import StatusBadge from '../components/StatusBadge';
import { useLoanStore } from '../store/loanStore';
import { ChevronRight, HelpCircle } from 'lucide-react-native';
import { useTheme } from '../lib/theme';
import { useTranslation } from '../lib/i18n';

export default function SupportScreen() {
  const router = useRouter();
  const { complaints } = useLoanStore();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { t } = useTranslation();

  const faqs = [
    {
      q: t('Does matching affect my CIBIL credit score?'),
      a: t('Applying or checking eligibility on Udofin utilizes a soft pull mechanism which has zero impact on your CIBIL score. Hard inquiries are only executed when finalizing the accepted partner offer.')
    },
    {
      q: t('What is Udofin\'s "No Fund Pooling" policy?'),
      a: t('Udofin strictly conforms to RBI Digital Lending guidelines. The matching loans flow directly from the partner bank\'s treasury to your bank account, and repayments go straight back. Udofin never touches the funds.')
    },
    {
      q: t('How long does loan disbursement take?'),
      a: t('Disbursements are usually processed within 10 to 15 minutes of executing the digital agreement. Bank delays may occasionally stretch this to a few hours.')
    }
  ];

  const handleLiveChat = () => {
    Alert.alert(t('Live Chat'), t('Fin AI Advisor chat system is loading...'));
  };

  const handleCall = () => {
    Alert.alert(t('Call Support'), t('Dialing helpline: +91 1800 102 3004'));
  };

  const handleEmail = () => {
    Alert.alert(t('Write Email'), t('Opening mail app to write to support@udofin.com'));
  };

  const handleRaiseComplaint = () => {
    router.push('/raise-complaint' as any);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title={t("Customer Support")} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Support Grid */}
        <SupportCard
          onLiveChat={handleLiveChat}
          onCall={handleCall}
          onEmail={handleEmail}
          onRaiseComplaint={handleRaiseComplaint}
        />

        {/* Filed Complaints status tracker */}
        {complaints.length > 0 && (
          <View style={styles.complaintsContainer}>
            <Text style={styles.sectionTitle}>{t("MY GRIEVANCE TICKETS")}</Text>
            {complaints.map((ticket) => (
              <TouchableOpacity
                key={ticket.id}
                style={styles.ticketItem}
                onPress={() => router.push(`/complaint-details/${ticket.id}` as any)}
                activeOpacity={0.8}
              >
                <View style={styles.ticketRow}>
                  <View>
                    <Text style={styles.ticketTitle}>{t(ticket.category)}</Text>
                    <Text style={styles.ticketId}>{ticket.id} • {ticket.date}</Text>
                  </View>
                  <StatusBadge status={ticket.status} />
                </View>
                <View style={styles.ticketFooter}>
                  <Text style={styles.ticketFooterText}>{t("Track ticket status")}</Text>
                  <ChevronRight color={colors.primary} size={14} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* FAQs */}
        <Text style={styles.sectionTitle}>{t("FREQUENTLY ASKED QUESTIONS")}</Text>
        <View style={styles.faqList}>
          {faqs.map((faq, idx) => {
            const isExpanded = expandedFaq === idx;
            return (
              <TouchableOpacity
                key={idx}
                style={styles.faqItem}
                onPress={() => setExpandedFaq(isExpanded ? null : idx)}
                activeOpacity={0.8}
              >
                <View style={styles.faqHeader}>
                  <Text style={styles.faqQuestion}>{faq.q}</Text>
                  <ChevronRight 
                    color={colors.textSecondary} 
                    size={16} 
                    style={{ transform: [{ rotate: isExpanded ? '90deg' : '0deg' }] }}
                  />
                </View>
                {isExpanded && (
                  <View style={styles.faqBody}>
                    <Text style={styles.faqAnswer}>{faq.a}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
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
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 1.5,
    marginBottom: 12,
    marginTop: 8,
  },
  complaintsContainer: {
    marginBottom: 20,
  },
  ticketItem: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: 12,
  },
  ticketRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    paddingBottom: 10,
    marginBottom: 10,
  },
  ticketTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  ticketId: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
    marginTop: 2,
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ticketFooterText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '700',
  },
  faqList: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 20,
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    paddingVertical: 14,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 18,
  },
  faqBody: {
    marginTop: 10,
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 10,
  },
  faqAnswer: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
    fontWeight: '500',
  },
});
