import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useLoanStore } from '../../store/loanStore';
import Header from '../../components/Header';
import Button from '../../components/Button';
import { Check, Edit2 } from 'lucide-react-native';

export default function AgreementScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { applications, disburseLoan } = useLoanStore();
  const [accepted, setAccepted] = useState(false);
  const [signed, setSigned] = useState(false);

  const appId = id as string;
  const application = applications.find((app) => app.id === appId);

  if (!application) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="Loan Agreement" />
        <View style={styles.center}><Text>Application Not Found</Text></View>
      </SafeAreaView>
    );
  }

  const handleDisbursement = () => {
    if (!accepted || !signed) {
      Alert.alert('Incomplete Actions', 'Please accept the terms and apply your signature.');
      return;
    }
    
    // Execute state disbursement
    disburseLoan(appId);
    
    // Move to success
    router.replace(`/loan-success?appId=${appId}`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Execute Loan Agreement" />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <Text style={styles.sectionTitle}>LOAN CONTRACT CLAUSES</Text>
        
        {/* PDF Contract Viewer Mockup */}
        <View style={styles.pdfViewer}>
          <Text style={styles.contractTitle}>DIGITAL LENDING AGREEMENT</Text>
          <Text style={styles.contractSubtitle}>PARTNERS: BROWER & {application.lender || 'PARTNER BANK'}</Text>
          
          <ScrollView nestedScrollEnabled style={styles.contractTextContainer}>
            <Text style={styles.clause}>
              1. DISBURSEMENT TERMS: The Lender agrees to disburse the principal amount of ₹{application.amount.toLocaleString('en-IN')} directly to the borrower's verified bank account. No pooling of funds is permitted.
            </Text>
            <Text style={styles.clause}>
              2. INTEREST AND REPAYMENT: The borrower agrees to repay the loan principal and accumulated interest of 12.0% p.a. in {application.tenure} monthly installments.
            </Text>
            <Text style={styles.clause}>
              3. PRE-PAYMENT AND FORECLOSURE: The borrower may foreclose the loan account after paying the initial installment subject to terms outlined in the Key Fact Statement.
            </Text>
            <Text style={styles.clause}>
              4. RESOLUTION MECHANISM: Any grievance arising out of this digital contract must be directed to grievance@udofin.com for official redressal.
            </Text>
            <Text style={styles.clause}>
              5. PRIVACY COMPLIANCE: Data sharing is governed strictly under the provisions of the Digital Personal Data Protection (DPDP) Act, 2023.
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
            I confirm that I have reviewed the clauses and accept the terms of the Digital Lending Agreement.
          </Text>
        </TouchableOpacity>

        {/* Signature Pad Mockup */}
        <Text style={styles.sectionTitle}>DIGITAL AUTHORIZATION SIGNATURE</Text>
        <TouchableOpacity
          style={[styles.signaturePad, signed && styles.signaturePadSigned]}
          onPress={() => setSigned(true)}
          activeOpacity={0.7}
        >
          {signed ? (
            <View style={styles.signedContent}>
              <Text style={styles.signatureText}>Mohit Kumar</Text>
              <Text style={styles.signatureMeta}>Electronically signed via Aadhaar eSign OTP</Text>
            </View>
          ) : (
            <View style={styles.unsignedContent}>
              <Edit2 color="#9CA3AF" size={24} />
              <Text style={styles.unsignedText}>Tap to apply digital signature</Text>
            </View>
          )}
        </TouchableOpacity>

      </ScrollView>

      {/* Action button footer */}
      <View style={styles.footer}>
        <Button 
          title="Sign & Request Disbursement" 
          onPress={handleDisbursement} 
          disabled={!accepted || !signed}
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
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  pdfViewer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#EAEAEA',
    padding: 16,
    height: 250,
    marginBottom: 16,
  },
  contractTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1F2937',
    textAlign: 'center',
  },
  contractSubtitle: {
    fontSize: 11,
    color: '#E47656',
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 14,
  },
  contractTextContainer: {
    flex: 1,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 10,
  },
  clause: {
    fontSize: 11,
    color: '#4B5563',
    lineHeight: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
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
  signaturePad: {
    height: 120,
    borderRadius: 20,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#C7C7CC',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  signaturePadSigned: {
    borderColor: '#E47656',
    borderStyle: 'solid',
    backgroundColor: '#FFFBF9',
  },
  unsignedContent: {
    alignItems: 'center',
    gap: 8,
  },
  unsignedText: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '700',
  },
  signedContent: {
    alignItems: 'center',
  },
  signatureText: {
    fontFamily: 'serif',
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0D1B2A',
    fontStyle: 'italic',
  },
  signatureMeta: {
    fontSize: 10,
    color: '#E47656',
    fontWeight: '700',
    marginTop: 8,
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
});
