import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';;
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useLoanStore, LenderOffer } from '../../store/loanStore';
import Header from '../../components/Header';
import Button from '../../components/Button';
import ProfileCard from '../../components/ProfileCard';
import { Check, Info } from 'lucide-react-native';
import { useTheme } from '../../lib/theme';
import { useTranslation } from '../../lib/i18n';

export default function KFSScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { applications, updateApplicationStatus, offers: storeOffers } = useLoanStore();
  const [accepted, setAccepted] = useState(false);
  
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { t } = useTranslation();

  const appId = id as string;
  const application = applications.find((app) => app.id === appId);

  if (!application) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title={t("Key Fact Statement (KFS)")} />
        <View style={styles.center}><Text style={{ color: colors.text }}>{t("Application Not Found")}</Text></View>
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
      bankName: application.lender || t('Selected Bank Partner'),
      bankLogo: '🏦',
      amount: application.amount,
      interestRate: 11.25,
      apr: 12.4,
      emi: Math.round((application.amount * 1.12) / application.tenure),
      tenure: application.tenure,
      processingFee: 2000,
      coolingPeriodDays: 3,
      latePaymentCharges: t('2% per month'),
      foreclosureCharges: t('3%')
    };
  }

  const handleProceed = () => {
    if (!accepted) {
      Alert.alert(t('Consent Required'), t('Please confirm you have read the Key Fact Statement.'));
      return;
    }
    // Update status to agreement
    updateApplicationStatus(appId, 'agreement');
    router.push(`/agreement/${appId}` as any);
  };

  const keyFacts = [
    { label: t('Lender Identity'), value: offer.bankName },
    { label: t('Approved Loan Principal'), value: `₹${offer.amount.toLocaleString('en-IN')}` },
    { label: t('Net Disbursed Amount (Est.)'), value: `₹${(offer.amount - offer.processingFee).toLocaleString('en-IN')}` },
    { label: t('Total Repayment Cost (Est.)'), value: `₹${(offer.emi * offer.tenure).toLocaleString('en-IN')}` },
    { label: t('Total Interest Charge (Est.)'), value: `₹${((offer.emi * offer.tenure) - offer.amount).toLocaleString('en-IN')}` },
    { label: t('Lending Rate Type'), value: t('Fixed Rate') },
  ];

  const statutoryFacts = [
    { label: t('Annual Percentage Rate (APR)'), value: `${offer.apr}%` },
    { label: t('Installment Frequency'), value: t('Monthly') },
    { label: t('Individual EMI Amount'), value: `₹${offer.emi.toLocaleString('en-IN')}` },
    { label: t('Total EMI Count'), value: t('{{months}} Months').replace('{{months}}', String(offer.tenure)) },
    { label: t('Recovery Cooling-off Period'), value: t('{{days}} Days').replace('{{days}}', String(offer.coolingPeriodDays)) },
    { label: t('Default Penalty charges'), value: offer.latePaymentCharges },
    { label: t('Pre-closure Charges'), value: offer.foreclosureCharges },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title={t("Key Fact Statement (KFS)")} />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Callout */}
        <View style={styles.kfsCallout}>
          <Info color="#F59E0B" size={20} />
          <View style={{ flex: 1 }}>
            <Text style={styles.kfsCalloutTitle}>{t("RBI COMPLIANT SUMMARY")}</Text>
            <Text style={styles.kfsCalloutText}>
              {t("Lenders must present this standard KFS detailing all charges before contract execution.")}
            </Text>
          </View>
        </View>

        {/* Fact Tables */}
        <ProfileCard title={t("BASIC LOAN ATTRIBUTES")} items={keyFacts} />
        
        <ProfileCard title={t("COST OF CREDIT & APR BREAKDOWN")} items={statutoryFacts} />

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
            {t("I have read, understood, and accept the Key Fact Statement (KFS) terms and statutory disclosures.")}
          </Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Action button footer */}
      <View style={styles.footer}>
        <Button 
          title={t("Sign & Agree")} 
          onPress={handleProceed} 
          disabled={!accepted}
        />
      </View>
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  kfsCallout: {
    flexDirection: 'row',
    backgroundColor: colors.warningLight,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FDE68A', // Assuming keeping this or use colors.warning border if exists
    marginBottom: 20,
    gap: 12,
  },
  kfsCalloutTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#92400E', // Darker text for warning
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  kfsCalloutText: {
    fontSize: 12,
    color: colors.warning,
    lineHeight: 16,
    fontWeight: '600',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginVertical: 10,
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: 24,
  },
  checkboxCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.divider,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxText: {
    flex: 1,
    fontSize: 12,
    color: colors.text,
    fontWeight: '600',
    lineHeight: 18,
  },
  footer: {
    padding: 20,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
});
