import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Switch, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import Header from '../components/Header';
import { useOnboardingStore } from '../store/onboardingStore';
import { useLoanStore } from '../store/loanStore';
import { supabase } from '../lib/supabase';
import { LogOut, Trash2 } from 'lucide-react-native';

export default function SettingsScreen() {
  const router = useRouter();
  const { clearState: clearOnboarding } = useOnboardingStore();
  const { activeLoan, clearStore } = useLoanStore();

  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [biometricsEnabled, setBiometricsEnabled] = useState(true);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    clearOnboarding();
    clearStore();
    router.replace('/');
  };

  const handleDeleteAccount = () => {
    // 1. Verify if user has an active loan with outstanding amount
    if (activeLoan && activeLoan.outstandingAmount > 0) {
      Alert.alert(
        'Deletion Blocked',
        `You have an active loan of ₹${activeLoan.outstandingAmount.toLocaleString('en-IN')} with ${activeLoan.lenderName}. Under the DPDP Act, 2023 and RBI regulations, your personal data cannot be erased while you have active credit obligations. Please repay all outstanding dues before requesting account deletion.`,
        [{ text: 'OK' }]
      );
      return;
    }

    // 2. No active loan, proceed with confirmation dialog
    Alert.alert(
      'Request Account Deletion',
      'WARNING: This action is permanent. All profile records, loan history, and consent parameters will be purged from our servers and downstream partners in compliance with DPDP data erasing rules. Do you want to proceed?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Erase All Data', 
          style: 'destructive',
          onPress: async () => {
            try {
              // Get current user ID
              const { data: { user } } = await supabase.auth.getUser();
              if (user) {
                // Delete user profile from database in compliance with DPDP data erasing rules
                await supabase.from('profiles').delete().eq('id', user.id);
              }
              // Sign out from Supabase
              await supabase.auth.signOut();
              // Reset store states
              clearOnboarding();
              clearStore();
              Alert.alert('Data Purged Successfully', 'Your profile, loan history, and consent parameters have been completely erased from our servers in compliance with the DPDP Act, 2023.');
              router.replace('/');
            } catch {
              Alert.alert('Deletion Failed', 'Failed to request account deletion. Please try again.');
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="App Settings" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <Text style={styles.sectionTitle}>NOTIFICATION PREFERENCES</Text>
        <View style={styles.settingCard}>
          <SettingToggle
            title="Push Notifications"
            description="Get alerts for EMI deadlines and loan offers"
            value={pushEnabled}
            onToggle={setPushEnabled}
          />
          <View style={styles.divider} />
          <SettingToggle
            title="Email Notifications"
            description="Receive monthly statements and billing receipts"
            value={emailEnabled}
            onToggle={setEmailEnabled}
          />
        </View>

        <Text style={styles.sectionTitle}>SECURITY SETTINGS</Text>
        <View style={styles.settingCard}>
          <SettingToggle
            title="Biometric Fingerprint/FaceID"
            description="Unlock Udofin using native biometric hardware"
            value={biometricsEnabled}
            onToggle={setBiometricsEnabled}
          />
        </View>

        <Text style={styles.sectionTitle}>ACCOUNT ACTIONS</Text>
        
        {/* Logout */}
        <TouchableOpacity style={styles.actionRow} onPress={handleLogout} activeOpacity={0.7}>
          <View style={styles.actionLeft}>
            <LogOut color="#4B5563" size={20} />
            <Text style={styles.actionTitle}>Logout</Text>
          </View>
        </TouchableOpacity>

        {/* Delete Account */}
        <TouchableOpacity style={[styles.actionRow, styles.dangerRow]} onPress={handleDeleteAccount} activeOpacity={0.7}>
          <View style={styles.actionLeft}>
            <Trash2 color="#DC2626" size={20} />
            <Text style={[styles.actionTitle, { color: '#DC2626' }]}>Delete Account Permanently</Text>
          </View>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

// Sub components
function SettingToggle({ title, description, value, onToggle }: {
  title: string;
  description: string;
  value: boolean;
  onToggle: (v: boolean) => void;
}) {
  return (
    <View style={styles.toggleRow}>
      <View style={{ flex: 1, marginRight: 10 }}>
        <Text style={styles.toggleTitle}>{title}</Text>
        <Text style={styles.toggleDesc}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#D1D1D6', true: '#FBECE8' }}
        thumbColor={value ? '#E47656' : '#FFFFFF'}
      />
    </View>
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
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 1.5,
    marginBottom: 12,
    marginTop: 8,
  },
  settingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 20,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
  },
  toggleTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  toggleDesc: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
    lineHeight: 14,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    padding: 16,
    marginBottom: 12,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
  },
  dangerRow: {
    backgroundColor: '#FFF1F1',
    borderColor: '#FEE2E2',
  },
});
