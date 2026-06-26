import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';;
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useLoanStore } from '../../store/loanStore';
import Header from '../../components/Header';
import Button from '../../components/Button';
import { Check, Edit2 } from 'lucide-react-native';
import { useTheme } from '../../lib/theme';
import { useTranslation } from '../../lib/i18n';

export default function AgreementScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { applications, disburseLoan } = useLoanStore();
  const [accepted, setAccepted] = useState(false);
  const [signed, setSigned] = useState(false);
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { t } = useTranslation();

  const appId = id as string;
  const application = applications.find((app) => app.id === appId);

  if (!application) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title={t("Loan Agreement")} />
        <View style={styles.center}><Text style={{ color: colors.text }}>{t("Application Not Found")}</Text></View>
      </SafeAreaView>
    );
  }

  const handleDisbursement = () => {
    if (!accepted || !signed) {
      Alert.alert(t('Incomplete Actions'), t('Please accept the terms and apply your signature.'));
      return;
    }
    
    // Execute state disbursement
    disburseLoan(appId);
    
    // Move to success
    router.replace(`/loan-success?appId=${appId}`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title={t("Execute Loan Agreement")} />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <Text style={styles.sectionTitle}>{t("LOAN CONTRACT CLAUSES")}</Text>
        
        {/* PDF Contract Viewer Mockup */}
        <View style={styles.pdfViewer}>
          <Text style={styles.contractTitle}>{t("DIGITAL LENDING AGREEMENT")}</Text>
          <Text style={styles.contractSubtitle}>{t("PARTNERS: BROWER & {{lender}}").replace('{{lender}}', application.lender || t('PARTNER BANK'))}</Text>
          
          <ScrollView nestedScrollEnabled style={styles.contractTextContainer}>
            <Text style={styles.clause}>
              {t("1. DISBURSEMENT TERMS: The Lender agrees to disburse the principal amount of ₹{{amount}} directly to the borrower's verified bank account. No pooling of funds is permitted.").replace('{{amount}}', application.amount.toLocaleString('en-IN'))}
            </Text>
            <Text style={styles.clause}>
              {t("2. INTEREST AND REPAYMENT: The borrower agrees to repay the loan principal and accumulated interest of 12.0% p.a. in {{tenure}} monthly installments.").replace('{{tenure}}', String(application.tenure))}
            </Text>
            <Text style={styles.clause}>
              {t("3. PRE-PAYMENT AND FORECLOSURE: The borrower may foreclose the loan account after paying the initial installment subject to terms outlined in the Key Fact Statement.")}
            </Text>
            <Text style={styles.clause}>
              {t("4. RESOLUTION MECHANISM: Any grievance arising out of this digital contract must be directed to grievance@udofin.com for official redressal.")}
            </Text>
            <Text style={styles.clause}>
              {t("5. PRIVACY COMPLIANCE: Data sharing is governed strictly under the provisions of the Digital Personal Data Protection (DPDP) Act, 2023.")}
            </Text>
          </ScrollView>
        </View>

        {/* Checkbox Terms */}
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setAccepted(!accepted)}
          activeOpacity={0.8}
        >
          <View style={[styles.checkboxCircle, accepted && styles.checkboxChecked]}>
            {accepted && <Check color="#FFFFFF" size={14} strokeWidth={3} />}
          </View>
          <Text style={styles.checkboxText}>
            {t("I confirm that I have reviewed the clauses and accept the terms of the Digital Lending Agreement.")}
          </Text>
        </TouchableOpacity>

        {/* Signature Pad Mockup */}
        <Text style={styles.sectionTitle}>{t("DIGITAL AUTHORIZATION SIGNATURE")}</Text>
        <TouchableOpacity
          style={[styles.signaturePad, signed && styles.signaturePadSigned]}
          onPress={() => setSigned(true)}
          activeOpacity={0.7}
        >
          {signed ? (
            <View style={styles.signedContent}>
              <Text style={styles.signatureText}>Mohit Kumar</Text>
              <Text style={styles.signatureMeta}>{t("Electronically signed via Aadhaar eSign OTP")}</Text>
            </View>
          ) : (
            <View style={styles.unsignedContent}>
              <Edit2 color={colors.textMuted} size={24} />
              <Text style={styles.unsignedText}>{t("Tap to apply digital signature")}</Text>
            </View>
          )}
        </TouchableOpacity>

      </ScrollView>

      {/* Action button footer */}
      <View style={styles.footer}>
        <Button 
          title={t("Sign & Request Disbursement")} 
          onPress={handleDisbursement} 
          disabled={!accepted || !signed}
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
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  pdfViewer: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.surfaceBorder,
    padding: 16,
    height: 250,
    marginBottom: 16,
  },
  contractTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.text,
    textAlign: 'center',
  },
  contractSubtitle: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 14,
  },
  contractTextContainer: {
    flex: 1,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: 10,
  },
  clause: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
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
  signaturePad: {
    height: 120,
    borderRadius: 20,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.divider,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  signaturePadSigned: {
    borderColor: colors.primary,
    borderStyle: 'solid',
    backgroundColor: colors.primaryLight,
  },
  unsignedContent: {
    alignItems: 'center',
    gap: 8,
  },
  unsignedText: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '700',
  },
  signedContent: {
    alignItems: 'center',
  },
  signatureText: {
    fontFamily: 'serif',
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    fontStyle: 'italic',
  },
  signatureMeta: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: '700',
    marginTop: 8,
  },
  footer: {
    padding: 20,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
});
