import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';;
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useLoanStore, LenderOffer } from '../../store/loanStore';
import Header from '../../components/Header';
import Button from '../../components/Button';
import ProfileCard from '../../components/ProfileCard';
import { Landmark, Info } from 'lucide-react-native';
import { useTheme } from '../../lib/theme';
import { useTranslation } from '../../lib/i18n';

export default function OfferDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { applications, offers: storeOffers } = useLoanStore();
  
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { t } = useTranslation();

  const appId = id as string;
  const application = applications.find((app) => app.id === appId);

  if (!application) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title={t("Offer Details")} />
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
    router.push(`/kfs/${appId}` as any);
  };

  const loanTerms = [
    { label: t('Lender Partner'), value: offer.bankName },
    { label: t('Loan Limit'), value: `₹${offer.amount.toLocaleString('en-IN')}` },
    { label: t('Monthly EMI Installment'), value: `₹${offer.emi.toLocaleString('en-IN')}` },
    { label: t('Tenure Period'), value: t('{{months}} Months').replace('{{months}}', String(offer.tenure)) },
    { label: t('Interest Rate p.a.'), value: `${offer.interestRate}%` },
    { label: t('Annual Percentage Rate (APR)'), value: `${offer.apr}%` },
  ];

  const chargeTerms = [
    { label: t('Processing Fees'), value: `₹${offer.processingFee.toLocaleString('en-IN')}` },
    { label: t('Late Payment Penalties'), value: offer.latePaymentCharges },
    { label: t('Foreclosure Options'), value: offer.foreclosureCharges },
    { label: t('Cooling-off Period'), value: t('{{days}} Days').replace('{{days}}', String(offer.coolingPeriodDays)) },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title={t("Selected Offer Terms")} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Banner */}
        <View style={styles.bankBanner}>
          <Text style={styles.bankLogo}>{offer.bankLogo}</Text>
          <View>
            <Text style={styles.bankTitle}>{offer.bankName}</Text>
            <Text style={styles.bankSubtitle}>{t("Approved Matching Lender")}</Text>
          </View>
        </View>

        {/* Details lists */}
        <ProfileCard title={t("FINANCIAL LOAN PARAMETERS")} items={loanTerms} />
        
        <ProfileCard title={t("CHARGES & COOLING DETAILS")} items={chargeTerms} />

        {/* Regulatory Info */}
        <View style={styles.regulatoryBox}>
          <Info color={colors.primary} size={18} />
          <Text style={styles.regulatoryText}>
            {t("This offer conforms to the Digital Lending Directions, 2025 issued by the Reserve Bank of India.")}
          </Text>
        </View>

      </ScrollView>

      {/* Accept button footer */}
      <View style={styles.footer}>
        <Button title={t("Proceed to KFS Statement")} onPress={handleProceed} />
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
  bankBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: 20,
    gap: 16,
  },
  bankLogo: {
    fontSize: 42,
  },
  bankTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.text,
  },
  bankSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  regulatoryBox: {
    flexDirection: 'row',
    backgroundColor: colors.primaryLight,
    padding: 16,
    borderRadius: 16,
    gap: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  regulatoryText: {
    flex: 1,
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    lineHeight: 16,
  },
  footer: {
    padding: 20,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
});
