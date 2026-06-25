import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useLoanStore, LenderOffer } from '../../store/loanStore';
import Header from '../../components/Header';
import Button from '../../components/Button';
import ProfileCard from '../../components/ProfileCard';
import { Landmark, Info } from 'lucide-react-native';

export default function OfferDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { applications, offers: storeOffers } = useLoanStore();

  const appId = id as string;
  const application = applications.find((app) => app.id === appId);

  if (!application) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="Offer Details" />
        <View style={styles.center}><Text>Application Not Found</Text></View>
      </SafeAreaView>
    );
  }

  // Find offer details
  let offer: LenderOffer | undefined;
  const offersList = storeOffers[appId] || [];
  offer = offersList.find((o) => o.id === application.selectedOfferId);

  // Fallback mock if not explicitly found
  if (!offer) {
    offer = {
      id: 'OFF-MOCK',
      bankName: application.lender || 'Selected Bank Partner',
      bankLogo: '🏦',
      amount: application.amount,
      interestRate: 11.25,
      apr: 12.4,
      emi: Math.round((application.amount * 1.12) / application.tenure),
      tenure: application.tenure,
      processingFee: 2000,
      coolingPeriodDays: 3,
      latePaymentCharges: '2% per month',
      foreclosureCharges: '3%'
    };
  }

  const handleProceed = () => {
    router.push(`/kfs/${appId}` as any);
  };

  const loanTerms = [
    { label: 'Lender Partner', value: offer.bankName },
    { label: 'Loan Limit', value: `₹${offer.amount.toLocaleString('en-IN')}` },
    { label: 'Monthly EMI Installment', value: `₹${offer.emi.toLocaleString('en-IN')}` },
    { label: 'Tenure Period', value: `${offer.tenure} Months` },
    { label: 'Interest Rate p.a.', value: `${offer.interestRate}%` },
    { label: 'Annual Percentage Rate (APR)', value: `${offer.apr}%` },
  ];

  const chargeTerms = [
    { label: 'Processing Fees', value: `₹${offer.processingFee.toLocaleString('en-IN')}` },
    { label: 'Late Payment Penalties', value: offer.latePaymentCharges },
    { label: 'Foreclosure Options', value: offer.foreclosureCharges },
    { label: 'Cooling-off Period', value: `${offer.coolingPeriodDays} Days` },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Selected Offer Terms" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Banner */}
        <View style={styles.bankBanner}>
          <Text style={styles.bankLogo}>{offer.bankLogo}</Text>
          <View>
            <Text style={styles.bankTitle}>{offer.bankName}</Text>
            <Text style={styles.bankSubtitle}>Approved Matching Lender</Text>
          </View>
        </View>

        {/* Details lists */}
        <ProfileCard title="FINANCIAL LOAN PARAMETERS" items={loanTerms} />
        
        <ProfileCard title="CHARGES & COOLING DETAILS" items={chargeTerms} />

        {/* Regulatory Info */}
        <View style={styles.regulatoryBox}>
          <Info color="#1E3A8A" size={18} />
          <Text style={styles.regulatoryText}>
            This offer conforms to the Digital Lending Directions, 2025 issued by the Reserve Bank of India.
          </Text>
        </View>

      </ScrollView>

      {/* Accept button footer */}
      <View style={styles.footer}>
        <Button title="Proceed to KFS Statement" onPress={handleProceed} />
      </View>
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bankBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    marginBottom: 20,
    gap: 16,
  },
  bankLogo: {
    fontSize: 42,
  },
  bankTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1F2937',
  },
  bankSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    marginTop: 2,
  },
  regulatoryBox: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 16,
    gap: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  regulatoryText: {
    flex: 1,
    fontSize: 12,
    color: '#1E40AF',
    fontWeight: '600',
    lineHeight: 16,
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
});
