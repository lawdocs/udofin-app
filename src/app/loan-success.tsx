import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Button from '../components/Button';
import { CheckCircle2 } from 'lucide-react-native';

export default function LoanSuccessScreen() {
  const router = useRouter();
  const { appId } = useLocalSearchParams();

  const handleContinue = () => {
    // Navigate back to tabs home dashboard
    router.replace('/(tabs)/home');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#059669" />
      
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <CheckCircle2 color="#FFFFFF" size={64} strokeWidth={2.5} />
        </View>

        <Text style={styles.title}>Loan Agreement Executed!</Text>
        <Text style={styles.desc}>
          Your loan request is finalized. The lender partner is now transferring the funds directly to your verified bank account.
        </Text>

        <View style={styles.infoCard}>
          <View style={styles.row}>
            <Text style={styles.label}>Application ID</Text>
            <Text style={styles.val}>{appId || 'APP-XXXX'}</Text>
          </View>
          <View style={[styles.row, { borderBottomWidth: 0, paddingBottom: 0, marginBottom: 0 }]}>
            <Text style={styles.label}>Estimated Disbursal</Text>
            <Text style={[styles.val, { color: '#059669' }]}>Instant (Within 10 mins)</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Button title="Go to Dashboard" onPress={handleContinue} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#059669', // Beautiful premium green background
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  desc: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '600',
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
  val: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '800',
  },
  footer: {
    padding: 24,
    backgroundColor: 'transparent',
  },
});
