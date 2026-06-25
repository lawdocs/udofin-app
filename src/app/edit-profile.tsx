import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import Header from '../components/Header';
import Button from '../components/Button';

import { useOnboardingStore } from '../store/onboardingStore';

export default function EditProfileScreen() {
  const router = useRouter();
  const { email: storeEmail, mobileNumber } = useOnboardingStore();

  // Profile data states
  const [name, setName] = useState(storeEmail ? storeEmail.split('@')[0] : 'Borrower');
  const [phone, setPhone] = useState(mobileNumber ? `+91 ${mobileNumber}` : '+91 XXXXX XXXXX');
  const [email, setEmail] = useState(storeEmail || '');
  const [company, setCompany] = useState('LawDocs Compliance Ltd.');
  const [designation, setDesignation] = useState('Senior Operations Associate');

  const handleSave = () => {
    if (name.trim().length < 2) {
      Alert.alert('Invalid Entry', 'Name is too short.');
      return;
    }

    Alert.alert('Profile Saved', 'Your operational records have been updated successfully.', [
      {
        text: 'OK',
        onPress: () => router.back(),
      }
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Edit Profile Details" />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        
        <Text style={styles.sectionTitle}>PERSONAL DETAILS</Text>
        
        <View style={styles.formGroup}>
          <Text style={styles.inputLabel}>FULL NAME</Text>
          <TextInput
            style={styles.textInput}
            value={name}
            onChangeText={setName}
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.inputLabel}>REGISTERED MOBILE</Text>
          <TextInput
            style={[styles.textInput, styles.disabledInput]}
            value={phone}
            editable={false}
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
          <TextInput
            style={styles.textInput}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            placeholderTextColor="#999"
          />
        </View>

        <Text style={styles.sectionTitle}>EMPLOYER DETAILS</Text>

        <View style={styles.formGroup}>
          <Text style={styles.inputLabel}>CURRENT COMPANY</Text>
          <TextInput
            style={styles.textInput}
            value={company}
            onChangeText={setCompany}
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.inputLabel}>OFFICIAL DESIGNATION</Text>
          <TextInput
            style={styles.textInput}
            value={designation}
            onChangeText={setDesignation}
            placeholderTextColor="#999"
          />
        </View>

      </ScrollView>

      <View style={styles.footer}>
        <Button title="Save Updates" onPress={handleSave} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 1.5,
    marginBottom: 16,
    marginTop: 8,
  },
  formGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1.5,
    borderColor: '#EAEAEA',
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
  },
  disabledInput: {
    backgroundColor: '#F3F4F6',
    color: '#6B7280',
    borderColor: '#F3F4F6',
  },
  footer: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
});
