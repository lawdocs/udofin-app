import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useLoanStore, LenderOffer } from '../../store/loanStore';
import Header from '../../components/Header';
import Button from '../../components/Button';
import ProfileCard from '../../components/ProfileCard';
import { Check, Info } from 'lucide-react-native';

export default function KFSScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { applications, updateApplicationStatus, offers: storeOffers } = useLoanStore();
  const [accepted, setAccepted] = useState(false);

  const appId = id as string;
  const application = applications.find((app) => app.id === appId);

  if (!application) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="Key Fact Statement (KFS)" />
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
    if (!accepted) {
      Alert.alert('Consent Required', 'Please confirm you have read the Key Fact Statement.');
      return;
    }
    // Update status to agreement
    updateApplicationStatus(appId, 'agreement');
    router.push(`/agreement/${appId}` as any);
  };

  const keyFacts = [
    { label: 'Lender Identity', value: offer.bankName },
    { label: 'Approved Loan Principal', value: `₹${offer.amount.toLocaleString('en-IN')}` },
    { label: 'Net Disbursed Amount (Est.)', value: `₹${(offer.amount - offer.processingFee).toLocaleString('en-IN')}` },
    { label: 'Total Repayment Cost (Est.)', value: `₹${(offer.emi * offer.tenure).toLocaleString('en-IN')}` },
    { label: 'Total Interest Charge (Est.)', value: `₹${((offer.emi * offer.tenure) - offer.amount).toLocaleString('en-IN')}` },
    { label: 'Lending Rate Type', value: 'Fixed Rate' },
  ];

  const statutoryFacts = [
    { label: 'Annual Percentage Rate (APR)', value: `${offer.apr}%` },
    { label: 'Installment Frequency', value: 'Monthly' },
    { label: 'Individual EMI Amount', value: `₹${offer.emi.toLocaleString('en-IN')}` },
    { label: 'Total EMI Count', value: `${offer.tenure} Months` },
    { label: 'Recovery Cooling-off Period', value: `${offer.coolingPeriodDays} Days` },
    { label: 'Default Penalty charges', value: offer.latePaymentCharges },
    { label: 'Pre-closure Charges', value: offer.foreclosureCharges },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Key Fact Statement (KFS)" />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Callout */}
        <View style={styles.kfsCallout}>
          <Info color="#B45309" size={20} />
          <View style={{ flex: 1 }}>
            <Text style={styles.kfsCalloutTitle}>RBI COMPLIANT SUMMARY</Text>
            <Text style={styles.kfsCalloutText}>
              Lenders must present this standard KFS detailing all charges before contract execution.
            </Text>
          </View>
        </View>

        {/* Fact Tables */}
        <ProfileCard title="BASIC LOAN ATTRIBUTES" items={keyFacts} />
        
        <ProfileCard title="COST OF CREDIT & APR BREAKDOWN" items={statutoryFacts} />

        {/* Checkbox Section */}
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setAccepted(!accepted)}
          activeOpacity={0.8}
        >
          <View style={[styles.checkboxCircle, accepted && styles.checkboxChecked]}>
            {accepted && <Check color="#FFFFFF" size={14} strokeWidth={3} />}
          </View>
          <Text style={styles.checkboxText}>
            I have read, understood, and accept the Key Fact Statement (KFS) terms and statutory disclosures.
          </Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Action button footer */}
      <View style={styles.footer}>
        <Button 
          title="Sign & Agree" 
          onPress={handleProceed} 
          disabled={!accepted}
        />
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
  kfsCallout: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 20,
    gap: 12,
  },
  kfsCalloutTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#92400E',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  kfsCalloutText: {
    fontSize: 12,
    color: '#B45309',
    lineHeight: 16,
    fontWeight: '600',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginVertical: 10,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    marginBottom: 24,
  },
  checkboxCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#C7C7CC',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#E47656',
    borderColor: '#E47656',
  },
  checkboxText: {
    flex: 1,
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
    lineHeight: 18,
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
});
