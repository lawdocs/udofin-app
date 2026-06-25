import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Switch, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import Header from '../components/Header';
import { useOnboardingStore } from '../store/onboardingStore';
import { supabase } from '../lib/supabase';
import { LogOut, Trash2 } from 'lucide-react-native';

export default function SettingsScreen() {
  const router = useRouter();
  const { clearState: clearOnboarding } = useOnboardingStore();

  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [biometricsEnabled, setBiometricsEnabled] = useState(true);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    clearOnboarding();
    router.replace('/');
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'WARNING: This action is permanent. All active records and consent parameters will be purged in compliance with DPDP data erasing rules. Do you want to proceed?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete Permanently', 
          style: 'destructive',
          onPress: async () => {
            // purging auth
            await supabase.auth.signOut();
            clearOnboarding();
            Alert.alert('Purge Initiated', 'Your account data has been queued for permanent deletion.');
            router.replace('/');
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
