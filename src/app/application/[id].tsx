import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Share } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useLoanStore } from '../../store/loanStore';
import Header from '../../components/Header';
import StatusBadge from '../../components/StatusBadge';
import Timeline from '../../components/Timeline';
import { EmptyState } from '../../components/FeedbackStates';
import { Sparkles, FileSignature, Landmark, Share2, ClipboardList } from 'lucide-react-native';

export default function ApplicationDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { applications } = useLoanStore();

  const application = applications.find((app) => app.id === id);

  if (!application) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="Application Status" />
        <EmptyState
          title="Application Not Found"
          description={`We could not locate any application with identifier: ${id}`}
        />
      </SafeAreaView>
    );
  }

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Udofin Loan Application ${application.id} Status: ${application.status.toUpperCase()}`,
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Application Status"
        rightElement={
          <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
            <Share2 color="#E47656" size={20} />
          </TouchableOpacity>
        }
      />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Info Card Header */}
        <View style={styles.summaryCard}>
          <View style={styles.row}>
            <View>
              <Text style={styles.loanType}>{application.loanType}</Text>
              <Text style={styles.appId}>{application.id}</Text>
            </View>
            <StatusBadge status={application.status} />
          </View>
          
          <View style={styles.divider} />

          <View style={styles.statsRow}>
            <View>
              <Text style={styles.label}>AMOUNT REQUESTED</Text>
              <Text style={styles.val}>₹{application.amount.toLocaleString('en-IN')}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.label}>SUBMITTED ON</Text>
              <Text style={styles.val}>{application.date}</Text>
            </View>
          </View>
        </View>

        {/* Dynamic Action Calls (Alert cards based on current status) */}
        {application.status === 'offers' && (
          <TouchableOpacity
            style={[styles.alertCard, { borderColor: '#8B5CF6', backgroundColor: '#FBFBFF' }]}
            onPress={() => router.push(`/compare-offers/${application.id}` as any)}
            activeOpacity={0.9}
          >
            <View style={[styles.alertIconBg, { backgroundColor: '#F3E8FF' }]}>
              <Sparkles color="#7C3AED" size={22} />
            </View>
            <View style={styles.alertContent}>
              <Text style={[styles.alertTitle, { color: '#7C3AED' }]}>Offers Received!</Text>
              <Text style={styles.alertDesc}>
                We matched you with 3 registered banks. Tap to compare interest rates and EMIs.
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {application.status === 'selected' && (
          <TouchableOpacity
            style={[styles.alertCard, { borderColor: '#E47656', backgroundColor: '#FFFBF9' }]}
            onPress={() => router.push(`/kfs/${application.id}` as any)}
            activeOpacity={0.9}
          >
            <View style={[styles.alertIconBg, { backgroundColor: '#FFF5F2' }]}>
              <Landmark color="#E47656" size={22} />
            </View>
            <View style={styles.alertContent}>
              <Text style={[styles.alertTitle, { color: '#E47656' }]}>Selected Lender Terms</Text>
              <Text style={styles.alertDesc}>
                {application.lender} selected. Please review the Key Fact Statement (KFS) to continue.
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {application.status === 'agreement' && (
          <TouchableOpacity
            style={[styles.alertCard, { borderColor: '#EF4444', backgroundColor: '#FFFDFD' }]}
            onPress={() => router.push(`/agreement/${application.id}` as any)}
            activeOpacity={0.9}
          >
            <View style={[styles.alertIconBg, { backgroundColor: '#FEE2E2' }]}>
              <FileSignature color="#DC2626" size={22} />
            </View>
            <View style={styles.alertContent}>
              <Text style={[styles.alertTitle, { color: '#DC2626' }]}>Sign Loan Agreement</Text>
              <Text style={styles.alertDesc}>
                Terms are accepted. Please provide your digital signature to authorize disbursement.
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Timeline Checklist */}
        <Text style={styles.sectionTitle}>APPLICATION TIMELINE</Text>
        <View style={styles.timelineWrapper}>
          <Timeline currentStatus={application.status} />
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
  shareBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FFF5F2',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#EAEAEA',
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
    color: '#1F2937',
  },
  appId: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  val: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1F2937',
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
    color: '#4B5563',
    lineHeight: 16,
    fontWeight: '500',
  },

  // Timeline
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  timelineWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    marginBottom: 20,
  },
});
