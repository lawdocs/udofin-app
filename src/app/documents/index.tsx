import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import Header from '../../components/Header';
import DocumentCard from '../../components/DocumentCard';
import { useLoanStore } from '../../store/loanStore';

export default function DocumentsScreen() {
  const { activeLoan } = useLoanStore();

  const handleDownload = (docName: string) => {
    Alert.alert('Download Started', `Downloading: ${docName}`);
  };

  const handlePreview = (docName: string) => {
    Alert.alert('Preview Document', `Opening document preview for: ${docName}`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="My Document Vault" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.introBox}>
          <Text style={styles.introTitle}>Secure Documents Vault</Text>
          <Text style={styles.introDesc}>
            These documents are accessed strictly on a role-based, logged basis in compliance with the DPDP Act, 2023.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>KYC & IDENTITY VERIFICATION</Text>
        <DocumentCard
          title="PAN Verification Proof"
          fileName="PAN_XXXX902A_verified.pdf"
          verified={true}
          onDownload={() => handleDownload('PAN Card Verified Proof')}
          onPreview={() => handlePreview('PAN Card Verified Proof')}
        />
        <DocumentCard
          title="Aadhaar KYC Profile"
          fileName="AADHAAR_XXXX1209_verified.pdf"
          verified={true}
          onDownload={() => handleDownload('Aadhaar Verification Proof')}
          onPreview={() => handlePreview('Aadhaar Verification Proof')}
        />

        {activeLoan && (
          <>
            <Text style={styles.sectionTitle}>LOAN ACCOUNT CONTRACTS</Text>
            <DocumentCard
              title="Digital Loan Agreement"
              fileName={`${activeLoan.id}_loan_agreement.pdf`}
              verified={true}
              onDownload={() => handleDownload('Loan Agreement')}
              onPreview={() => handlePreview('Loan Agreement')}
            />
            <DocumentCard
              title="Key Fact Statement (KFS)"
              fileName={`${activeLoan.id}_key_fact_statement.pdf`}
              verified={true}
              onDownload={() => handleDownload('KFS Statement')}
              onPreview={() => handlePreview('KFS Statement')}
            />
          </>
        )}

      </ScrollView>
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
  introBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    marginBottom: 20,
  },
  introTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 4,
  },
  introDesc: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 1.5,
    marginBottom: 12,
    marginTop: 8,
  },
});
