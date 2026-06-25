import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import Header from '../components/Header';
import SupportCard from '../components/SupportCard';
import StatusBadge from '../components/StatusBadge';
import { useLoanStore } from '../store/loanStore';
import { ChevronRight, HelpCircle } from 'lucide-react-native';

export default function SupportScreen() {
  const router = useRouter();
  const { complaints } = useLoanStore();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: 'Does matching affect my CIBIL credit score?',
      a: 'Applying or checking eligibility on Udofin utilizes a soft pull mechanism which has zero impact on your CIBIL score. Hard inquiries are only executed when finalizing the accepted partner offer.'
    },
    {
      q: 'What is Udofin\'s "No Fund Pooling" policy?',
      a: 'Udofin strictly conforms to RBI Digital Lending guidelines. The matching loans flow directly from the partner bank\'s treasury to your bank account, and repayments go straight back. Udofin never touches the funds.'
    },
    {
      q: 'How long does loan disbursement take?',
      a: 'Disbursements are usually processed within 10 to 15 minutes of executing the digital agreement. Bank delays may occasionally stretch this to a few hours.'
    }
  ];

  const handleLiveChat = () => {
    Alert.alert('Live Chat', 'Fin AI Advisor chat system is loading...');
  };

  const handleCall = () => {
    Alert.alert('Call Support', 'Dialing helpline: +91 1800 102 3004');
  };

  const handleEmail = () => {
    Alert.alert('Write Email', 'Opening mail app to write to support@udofin.com');
  };

  const handleRaiseComplaint = () => {
    router.push('/raise-complaint' as any);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Customer Support" />
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
            <Text style={styles.sectionTitle}>MY GRIEVANCE TICKETS</Text>
            {complaints.map((ticket) => (
              <TouchableOpacity
                key={ticket.id}
                style={styles.ticketItem}
                onPress={() => router.push(`/complaint-details/${ticket.id}` as any)}
                activeOpacity={0.8}
              >
                <View style={styles.ticketRow}>
                  <View>
                    <Text style={styles.ticketTitle}>{ticket.category}</Text>
                    <Text style={styles.ticketId}>{ticket.id} • {ticket.date}</Text>
                  </View>
                  <StatusBadge status={ticket.status} />
                </View>
                <View style={styles.ticketFooter}>
                  <Text style={styles.ticketFooterText}>Track ticket status</Text>
                  <ChevronRight color="#E47656" size={14} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* FAQs */}
        <Text style={styles.sectionTitle}>FREQUENTLY ASKED QUESTIONS</Text>
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
                    color="#6B7280" 
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FEF8F4',
  },
  scrollContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 1.5,
    marginBottom: 12,
    marginTop: 8,
  },
  complaintsContainer: {
    marginBottom: 20,
  },
  ticketItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    marginBottom: 12,
  },
  ticketRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 10,
    marginBottom: 10,
  },
  ticketTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1F2937',
  },
  ticketId: {
    fontSize: 11,
    color: '#9CA3AF',
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
    color: '#E47656',
    fontWeight: '700',
  },
  faqList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 20,
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
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
    color: '#374151',
    lineHeight: 18,
  },
  faqBody: {
    marginTop: 10,
    backgroundColor: '#FAFAFA',
    padding: 12,
    borderRadius: 10,
  },
  faqAnswer: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
    fontWeight: '500',
  },
});
