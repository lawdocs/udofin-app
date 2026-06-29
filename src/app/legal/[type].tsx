import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { ShieldCheck } from 'lucide-react-native';
import Header from '../../components/Header';
import { useTheme } from '../../lib/theme';
import { useTranslation } from '../../lib/i18n';

// Static legal document content keyed by type — covers all hierarchy items
const LEGAL_CONTENT: Record<string, { title: string; lastUpdated: string; sections: { heading: string; body: string }[] }> = {
  'cookie-policy': {
    title: 'Cookie Policy',
    lastUpdated: 'June 2025',
    sections: [
      {
        heading: '1. What are Cookies?',
        body: 'Cookies are small data files stored on your device when you use our web platform. Our native mobile app does not use browser cookies but may use equivalent device storage (AsyncStorage, SecureStore) for session management.',
      },
      {
        heading: '2. What We Store',
        body: 'We store: session tokens (for keeping you logged in), language preferences, theme settings, and draft form data. We do not use third-party advertising cookies or tracking pixels.',
      },
      {
        heading: '3. Your Control',
        body: 'You can clear app storage at any time from Settings → App Settings. Clearing storage will log you out and reset all preferences. You cannot opt out of session tokens as they are required for authentication.',
      },
      {
        heading: '4. Contact',
        body: 'For questions about data storage practices, contact privacy@udofin.com.',
      },
    ],
  },
  'privacy-policy': {
    title: 'Privacy Policy',
    lastUpdated: 'June 2025',
    sections: [
      {
        heading: '1. Information We Collect',
        body: 'We collect information you provide during registration and loan application including name, mobile number, PAN, Aadhaar (masked), income details, and employment information. We also collect device metadata, usage analytics, and consent records.',
      },
      {
        heading: '2. How We Use Your Data',
        body: 'Your data is used to: (a) match you with RBI-registered lenders, (b) perform soft credit bureau inquiries, (c) verify identity per KYC norms, (d) send loan status updates and notifications, and (e) comply with RBI Digital Lending Guidelines 2022.',
      },
      {
        heading: '3. Data Sharing',
        body: 'We share your data only with: partner lenders for loan processing, CIBIL/Experian for soft credit checks, and regulatory authorities when legally required. We do not sell your personal data to third parties for marketing.',
      },
      {
        heading: '4. Data Retention',
        body: 'In accordance with RBI guidelines, loan-related records are retained for a minimum of 5 years post loan closure. You may request account deletion — all non-regulatory data will be purged within 30 days under the DPDP Act, 2023.',
      },
      {
        heading: '5. Your Rights (DPDP Act 2023)',
        body: 'You have the right to: access your stored data, correct inaccuracies, withdraw consent (subject to ongoing legal obligations), and request erasure. Contact our Grievance Officer at grievance@udofin.com.',
      },
      {
        heading: '6. Security',
        body: 'We use industry-standard AES-256 encryption for data at rest, TLS 1.2+ for data in transit, and conduct regular security audits. Sensitive fields like PAN and Aadhaar are stored in masked format.',
      },
    ],
  },
  'terms': {
    title: 'Terms & Conditions',
    lastUpdated: 'June 2025',
    sections: [
      {
        heading: '1. Platform Nature',
        body: 'Udofin is a digital lending marketplace platform. We are NOT a lender. We facilitate connections between borrowers and RBI-regulated lenders. Loan decisions and disbursements are made solely by the partner lender.',
      },
      {
        heading: '2. Eligibility',
        body: 'You must be an Indian resident, 21 years or older, with a valid PAN and Aadhaar to use this platform. By registering, you confirm that the information provided is accurate and truthful.',
      },
      {
        heading: '3. User Obligations',
        body: 'You agree to: provide accurate KYC information, not misrepresent income or employment, promptly repay EMIs as per your loan agreement, and not use Udofin for illegal financial activities.',
      },
      {
        heading: '4. Loan Agreement',
        body: 'The binding loan agreement is between you and the partner lender — not Udofin. Read the Key Fact Statement (KFS) carefully before signing. You have a 3-day cooling-off period to cancel a sanctioned loan without penalty.',
      },
      {
        heading: '5. Fees',
        body: 'Udofin charges no direct fees to borrowers for platform usage. Partner lenders may charge processing fees, which will be disclosed in the KFS before you accept any offer.',
      },
      {
        heading: '6. Limitation of Liability',
        body: 'Udofin is not liable for lender decisions, disbursement delays, interest rate changes, or credit bureau report inaccuracies. Our liability is limited to the extent permitted by applicable law.',
      },
      {
        heading: '7. Governing Law',
        body: 'These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Bengaluru, Karnataka.',
      },
    ],
  },
  'responsible-lending': {
    title: 'Responsible Lending Policy',
    lastUpdated: 'June 2025',
    sections: [
      {
        heading: 'Our Commitment',
        body: 'Udofin is committed to responsible digital lending in accordance with RBI\'s Fair Practices Code and Digital Lending Guidelines 2022. We actively discourage over-leveraging and promote financial wellness.',
      },
      {
        heading: 'Suitability Assessment',
        body: 'Our platform uses FOIR (Fixed Obligation to Income Ratio) and bureau data to ensure borrowers are not matched with loans beyond their repayment capacity. We recommend loans where total EMI obligations are below 50% of net income.',
      },
      {
        heading: 'Transparent Pricing',
        body: 'All partner lenders are required to disclose the Annual Percentage Rate (APR), processing fees, prepayment charges, and penal interest in the Key Fact Statement before loan execution. There are no hidden charges.',
      },
      {
        heading: 'No Predatory Practices',
        body: 'We do not partner with lenders that engage in coercive recovery practices, charge usurious interest rates above state moneylending act limits, or target economically vulnerable borrowers with unsuitable products.',
      },
      {
        heading: 'Grievance Redressal',
        body: 'Every complaint is acknowledged within 24 hours and resolved within 30 days. Unresolved grievances can be escalated to RBI\'s Sachet portal or the Banking Ombudsman at no cost to the borrower.',
      },
      {
        heading: 'Financial Literacy',
        body: 'We provide free educational resources (EMI Calculator, Credit Score Estimator, Loan Guides) to help borrowers make informed decisions before they apply.',
      },
    ],
  },
};

export default function LegalScreen() {
  const { type } = useLocalSearchParams<{ type: string }>();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { t } = useTranslation();

  const doc = LEGAL_CONTENT[type ?? ''] ?? {
    title: 'Document Not Found',
    lastUpdated: '',
    sections: [{ heading: '', body: 'This document is not available.' }],
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title={t(doc.title)} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <View style={styles.metaCard}>
          <ShieldCheck color={colors.primary} size={18} />
          <View>
            <Text style={styles.metaTitle}>{t(doc.title)}</Text>
            <Text style={styles.metaDate}>{t('Last updated: {{date}}').replace('{{date}}', doc.lastUpdated)}</Text>
          </View>
        </View>

        {doc.sections.map((section, i) => (
          <View key={i} style={styles.section}>
            {section.heading ? (
              <Text style={styles.sectionHeading}>{t(section.heading)}</Text>
            ) : null}
            <Text style={styles.sectionBody}>{t(section.body)}</Text>
          </View>
        ))}

        <View style={styles.footerBox}>
          <Text style={styles.footerText}>
            {t('For questions about this document, contact us at legal@udofin.com')}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 20, paddingBottom: 40 },
  metaCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: colors.primaryLight, borderRadius: 16, padding: 16, marginBottom: 24,
  },
  metaTitle: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: 2 },
  metaDate: { fontSize: 12, color: colors.textMuted, fontWeight: '600' },
  section: { marginBottom: 22 },
  sectionHeading: {
    fontSize: 15, fontWeight: '800', color: colors.text, marginBottom: 8, lineHeight: 22,
  },
  sectionBody: {
    fontSize: 14, color: colors.textSecondary, lineHeight: 22, fontWeight: '500',
  },
  footerBox: {
    backgroundColor: colors.surface, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: colors.surfaceBorder, marginTop: 8,
  },
  footerText: { fontSize: 11, color: colors.textMuted, lineHeight: 16, textAlign: 'center', fontWeight: '500' },
});
