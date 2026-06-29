import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';;
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useLoanStore, LenderOffer } from '../../store/loanStore';
import Header from '../../components/Header';
import OfferCard from '../../components/OfferCard';
import { EmptyState } from '../../components/FeedbackStates';
import { Tag } from 'lucide-react-native';
import { useTheme } from '../../lib/theme';
import { useTranslation } from '../../lib/i18n';

export default function CompareOffersScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { applications, selectOffer, offers: storeOffers } = useLoanStore();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { t } = useTranslation();

  const appId = id as string;
  const application = applications.find((app) => app.id === appId);

  if (!application) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title={t("Lender Offers")} />
        <EmptyState
          title={t("Application Not Found")}
          description={t("We could not locate application with ID: {{appId}}").replace('{{appId}}', appId)}
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
        latePaymentCharges: t('1% per month'),
        foreclosureCharges: t('Nil')
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
        latePaymentCharges: t('2% per month'),
        foreclosureCharges: t('3%')
      }
    ];
  }

  const handleAcceptOffer = (offer: LenderOffer) => {
    Alert.alert(
      t('Accept Offer'),
      t('Are you sure you want to accept the loan offer from {{bankName}}?').replace('{{bankName}}', offer.bankName),
      [
        { text: t('Cancel'), style: 'cancel' },
        { 
          text: t('Accept'), 
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
      t('{{bankName}} Offer Specifications').replace('{{bankName}}', offer.bankName),
      `• ${t('Interest Rate')}: ${offer.interestRate}% p.a.\n• ${t('APR')}: ${offer.apr}%\n• ${t('Processing Fee')}: ₹${offer.processingFee.toLocaleString('en-IN')}\n• ${t('Cooling Period')}: ${offer.coolingPeriodDays} ${t('Days')}\n• ${t('Foreclosure Charges')}: ${offer.foreclosureCharges}\n• ${t('Late Charges')}: ${offer.latePaymentCharges}`,
      [{ text: t('Close'), style: 'cancel' }]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title={t("Lender Matches")} />
      
      {offers.length === 0 ? (
        <EmptyState
          title={t("Fetching Lenders")}
          description={t("Please wait while lenders evaluate your profile credit score...")}
          icon={<Tag color={colors.textMuted} size={48} />}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <View style={styles.summaryBox}>
            <Text style={styles.summaryTitle}>{t("Credit Limit Matches")}</Text>
            <Text style={styles.summaryText}>
              {t("We matched application **{{appId}}** for ₹{{amount}} with the following RBI-regulated bank options.")
                .replace('{{appId}}', appId)
                .replace('{{amount}}', application.amount.toLocaleString('en-IN'))}
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

const getStyles = (colors: any) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 20,
  },
  summaryBox: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  summaryText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
    fontWeight: '500',
  },
});
