import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calculator, CheckCircle, BarChart3, Star } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Header from '../../components/Header';
import { useTheme } from '../../lib/theme';
import { useTranslation } from '../../lib/i18n';

// Calculator hub entries
const CALCULATORS = [
  {
    id: 'emi',
    title: 'EMI Calculator',
    desc: 'Calculate your monthly EMI for any loan amount, rate, and tenure.',
    icon: Calculator,
    color: '#E47656',
    route: '/calculators/emi',
  },
  {
    id: 'eligibility',
    title: 'Eligibility Calculator',
    desc: 'Find out the maximum loan amount you qualify for based on income.',
    icon: CheckCircle,
    color: '#10B981',
    route: '/calculators/eligibility',
  },
  {
    id: 'interest',
    title: 'Interest Calculator',
    desc: 'Compare simple vs compound interest across different tenures.',
    icon: BarChart3,
    color: '#F59E0B',
    route: '/calculators/interest',
  },
  {
    id: 'credit-score',
    title: 'Credit Score Estimator',
    desc: 'Get an estimated CIBIL score range — no bureau pull, 5 quick questions.',
    icon: Star,
    color: '#6366F1',
    route: '/calculators/credit-score',
  },
];

export default function CalculatorsHubScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title={t('Calculators')} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <Text style={styles.subtitle}>
          {t('Smart tools to plan your finances before you apply for a loan.')}
        </Text>

        {CALCULATORS.map((calc) => {
          const Icon = calc.icon;
          return (
            <TouchableOpacity
              key={calc.id}
              style={styles.card}
              onPress={() => router.push(calc.route as any)}
              activeOpacity={0.85}
            >
              <View style={[styles.iconBox, { backgroundColor: calc.color + '18' }]}>
                <Icon color={calc.color} size={28} />
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{t(calc.title)}</Text>
                <Text style={styles.cardDesc}>{t(calc.desc)}</Text>
              </View>
              <View style={[styles.arrowBadge, { backgroundColor: calc.color + '18' }]}>
                <Text style={[styles.arrowText, { color: calc.color }]}>→</Text>
              </View>
            </TouchableOpacity>
          );
        })}

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>{t('Why use these calculators?')}</Text>
          <Text style={styles.infoText}>
            {t('Plan before you apply — knowing your EMI, eligibility, and credit score estimate helps you pick the right loan product and lender match.')}
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 20, paddingBottom: 40 },
  subtitle: {
    fontSize: 13, color: colors.textSecondary, fontWeight: '500',
    lineHeight: 18, marginBottom: 24,
  },
  card: {
    backgroundColor: colors.surface, borderRadius: 20, padding: 20,
    borderWidth: 1, borderColor: colors.surfaceBorder,
    flexDirection: 'row', alignItems: 'center', gap: 16,
    marginBottom: 14,
  },
  iconBox: {
    width: 56, height: 56, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
  },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: 4 },
  cardDesc: { fontSize: 12, color: colors.textSecondary, fontWeight: '500', lineHeight: 16 },
  arrowBadge: {
    width: 36, height: 36, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
  },
  arrowText: { fontSize: 18, fontWeight: '700' },
  infoCard: {
    backgroundColor: colors.primaryLight, borderRadius: 16, padding: 18, marginTop: 8,
  },
  infoTitle: { fontSize: 14, fontWeight: '800', color: colors.primary, marginBottom: 6 },
  infoText: { fontSize: 12, color: colors.primary, fontWeight: '500', lineHeight: 18 },
});
