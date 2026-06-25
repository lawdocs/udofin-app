import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useLoanStore } from '../../store/loanStore';
import Header from '../../components/Header';
import StatusBadge from '../../components/StatusBadge';
import { EmptyState } from '../../components/FeedbackStates';
import { ClipboardList, ChevronRight } from 'lucide-react-native';

export default function ApplicationsScreen() {
  const router = useRouter();
  const { applications } = useLoanStore();

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="My Applications" showBack={false} />
      
      {applications.length === 0 ? (
        <EmptyState
          title="No Applications Found"
          description="Apply for a new loan to match with RBI-registered lenders."
          icon={<ClipboardList color="#9CA3AF" size={48} />}
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
                  <Text style={styles.loanType}>{app.loanType}</Text>
                  <Text style={styles.appId}>{app.id}</Text>
                </View>
                <StatusBadge status={app.status} />
              </View>

              <View style={styles.detailsGrid}>
                <View>
                  <Text style={styles.label}>Amount</Text>
                  <Text style={styles.value}>₹{app.amount.toLocaleString('en-IN')}</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={styles.label}>Tenure</Text>
                  <Text style={styles.value}>{app.tenure} Months</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.label}>Submitted On</Text>
                  <Text style={styles.value}>{app.date}</Text>
                </View>
              </View>

              {app.lender && (
                <View style={styles.lenderBox}>
                  <Text style={styles.lenderLabel}>Selected Lender:</Text>
                  <Text style={styles.lenderValue}>{app.lender}</Text>
                </View>
              )}

              <View style={styles.footer}>
                <Text style={styles.footerText}>View details & progress</Text>
                <ChevronRight color="#E47656" size={16} />
              </View>
            </TouchableOpacity>
          ))}
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
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 14,
    marginBottom: 14,
  },
  loanType: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1F2937',
  },
  appId: {
    fontSize: 12,
    color: '#6B7280',
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
    color: '#9CA3AF',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  value: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1F2937',
  },
  lenderBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  lenderLabel: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '600',
  },
  lenderValue: {
    fontSize: 12,
    color: '#E47656',
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  footerText: {
    fontSize: 12,
    color: '#E47656',
    fontWeight: '700',
  },
});
