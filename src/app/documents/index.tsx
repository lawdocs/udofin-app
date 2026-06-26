import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';;
import Header from '../../components/Header';
import DocumentCard from '../../components/DocumentCard';
import { useLoanStore } from '../../store/loanStore';
import { useTheme } from '../../lib/theme';
import { useTranslation } from '../../lib/i18n';

export default function DocumentsScreen() {
  const { activeLoan } = useLoanStore();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { t } = useTranslation();

  const handleDownload = (docName: string) => {
    Alert.alert(t('Download Started'), t('Downloading: {{name}}').replace('{{name}}', docName));
  };

  const handlePreview = (docName: string) => {
    Alert.alert(t('Preview Document'), t('Opening document preview for: {{name}}').replace('{{name}}', docName));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title={t("My Document Vault")} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.introBox}>
          <Text style={styles.introTitle}>{t("Secure Documents Vault")}</Text>
          <Text style={styles.introDesc}>
            {t("These documents are accessed strictly on a role-based, logged basis in compliance with the DPDP Act, 2023.")}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>{t("KYC & IDENTITY VERIFICATION")}</Text>
        <DocumentCard
          title={t("PAN Verification Proof")}
          fileName="PAN_XXXX902A_verified.pdf"
          verified={true}
          onDownload={() => handleDownload(t('PAN Card Verified Proof'))}
          onPreview={() => handlePreview(t('PAN Card Verified Proof'))}
        />
        <DocumentCard
          title={t("Aadhaar KYC Profile")}
          fileName="AADHAAR_XXXX1209_verified.pdf"
          verified={true}
          onDownload={() => handleDownload(t('Aadhaar Verification Proof'))}
          onPreview={() => handlePreview(t('Aadhaar Verification Proof'))}
        />

        {activeLoan && (
          <>
            <Text style={styles.sectionTitle}>{t("LOAN ACCOUNT CONTRACTS")}</Text>
            <DocumentCard
              title={t("Digital Loan Agreement")}
              fileName={`${activeLoan.id}_loan_agreement.pdf`}
              verified={true}
              onDownload={() => handleDownload(t('Loan Agreement'))}
              onPreview={() => handlePreview(t('Loan Agreement'))}
            />
            <DocumentCard
              title={t("Key Fact Statement (KFS)")}
              fileName={`${activeLoan.id}_key_fact_statement.pdf`}
              verified={true}
              onDownload={() => handleDownload(t('KFS Statement'))}
              onPreview={() => handlePreview(t('KFS Statement'))}
            />
          </>
        )}

      </ScrollView>
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
  introBox: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: 20,
  },
  introTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  introDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 1.5,
    marginBottom: 12,
    marginTop: 8,
  },
});
