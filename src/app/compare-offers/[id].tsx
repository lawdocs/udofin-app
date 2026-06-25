import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useLoanStore, LenderOffer } from '../../store/loanStore';
import Header from '../../components/Header';
import OfferCard from '../../components/OfferCard';
import { EmptyState } from '../../components/FeedbackStates';
import { Tag } from 'lucide-react-native';

export default function CompareOffersScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { applications, selectOffer, offers: storeOffers } = useLoanStore();

  const appId = id as string;
  const application = applications.find((app) => app.id === appId);

  if (!application) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="Lender Offers" />
        <EmptyState
          title="Application Not Found"
          description={`We could not locate application with ID: ${appId}`}
        />
      </SafeAreaView>
    );
  }

  // Get matching offers from store state, fallback to dynamic mocks if not predefined
  let offers: LenderOffer[] = storeOffers[appId] || [];

  if (offers.length === 0 && application) {
    // Generate simple dynamic offers
    const reqAmount = application.amount;
    const reqTenure = application.tenure;
    offers = [
      {
        id: 'OFF-DYN-SBI',
        bankName: 'SBI Matcher',
        bankLogo: '🔵',
        amount: reqAmount,
        interestRate: 10.99,
        apr: 11.9,
        emi: Math.round((reqAmount * 1.1) / reqTenure),
        tenure: reqTenure,
        processingFee: 1500,
        coolingPeriodDays: 5,
        latePaymentCharges: '1% per month',
        foreclosureCharges: 'Nil'
      },
      {
        id: 'OFF-DYN-HDFC',
        bankName: 'HDFC Matcher',
        bankLogo: '🏦',
        amount: reqAmount,
        interestRate: 11.25,
        apr: 12.4,
        emi: Math.round((reqAmount * 1.12) / reqTenure),
        tenure: reqTenure,
        processingFee: 2500,
        coolingPeriodDays: 3,
        latePaymentCharges: '2% per month',
        foreclosureCharges: '3%'
      }
    ];
  }

  const handleAcceptOffer = (offer: LenderOffer) => {
    Alert.alert(
      'Accept Offer',
      `Are you sure you want to accept the loan offer from ${offer.bankName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Accept', 
          onPress: () => {
            selectOffer(appId, offer.id, offer.bankName);
            // Route to offer details or KFS screen directly
            router.push(`/offer-details/${appId}` as any);
          } 
        }
      ]
    );
  };

  const handleViewDetails = (offer: LenderOffer) => {
    // We can show offer parameters
    Alert.alert(
      `${offer.bankName} Offer Specifications`,
      `• Interest Rate: ${offer.interestRate}% p.a.\n• APR: ${offer.apr}%\n• Processing Fee: ₹${offer.processingFee.toLocaleString('en-IN')}\n• Cooling Period: ${offer.coolingPeriodDays} Days\n• Foreclosure Charges: ${offer.foreclosureCharges}\n• Late Charges: ${offer.latePaymentCharges}`,
      [{ text: 'Close', style: 'cancel' }]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Lender Matches" />
      
      {offers.length === 0 ? (
        <EmptyState
          title="Fetching Lenders"
          description="Please wait while lenders evaluate your profile credit score..."
          icon={<Tag color="#9CA3AF" size={48} />}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <View style={styles.summaryBox}>
            <Text style={styles.summaryTitle}>Credit Limit Matches</Text>
            <Text style={styles.summaryText}>
              We matched application **{appId}** for ₹{application.amount.toLocaleString('en-IN')} with the following RBI-regulated bank options.
            </Text>
          </View>

          {offers.map((offer) => (
            <OfferCard
              key={offer.id}
              bankName={offer.bankName}
              bankLogo={offer.bankLogo}
              amount={offer.amount}
              interestRate={offer.interestRate}
              apr={offer.apr}
              emi={offer.emi}
              tenure={offer.tenure}
              processingFee={offer.processingFee}
              onViewDetails={() => handleViewDetails(offer)}
              onAccept={() => handleAcceptOffer(offer)}
            />
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
  summaryBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 4,
  },
  summaryText: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
    fontWeight: '500',
  },
});
