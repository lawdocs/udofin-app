import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Switch, Alert, TouchableOpacity } from 'react-native';
import Header from '../components/Header';
import { Shield, Eye, Lock, Calendar, Info } from 'lucide-react-native';
import { useLoanStore } from '../store/loanStore';

export default function PrivacyConsentScreen() {
  const { consents, consentHistory, updateConsent } = useLoanStore();
  const smsConsent = consents.sms;
  const locationConsent = consents.location;
  const notificationConsent = consents.notifications;

  const handleSmsToggle = (value: boolean) => {
    if (!value) {
      Alert.alert(
        'Revoke SMS Consent?',
        'WARNING: Revoking SMS access will prevent our automated underwriting engine from evaluating credit limits, resulting in a potential reduction of matching lender offers.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Revoke Anyway', onPress: () => updateConsent('sms', false) },
        ]
      );
    } else {
      updateConsent('sms', true);
    }
  };

  const handleLocationToggle = (value: boolean) => {
    if (!value) {
      Alert.alert(
        'Revoke Location Consent?',
        'Revoking location permissions may require you to upload additional physical address proofs (e.g. rent agreement or utility bills) to satisfy KYC rules.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Revoke Anyway', onPress: () => updateConsent('location', false) },
        ]
      );
    } else {
      updateConsent('location', true);
    }
  };

  const handleNotificationToggle = (value: boolean) => {
    updateConsent('notifications', value);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Consent Dashboard" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* DPDP Header */}
        <View style={styles.dpdpBanner}>
          <Shield color="#E47656" size={24} />
          <View style={{ flex: 1 }}>
            <Text style={styles.dpdpTitle}>DPDP Act, 2023 Compliance</Text>
            <Text style={styles.dpdpText}>
              In accordance with the Digital Personal Data Protection Act, you possess full rights to request logs of, restrict, or revoke any authorization parameters.
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>MANAGE DATA ACCESS</Text>
        <View style={styles.card}>
          {/* SMS */}
          <View style={styles.consentItem}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.consentTitle}>Financial SMS Access</Text>
              <Text style={styles.consentDesc}>
                Used by the eligibility engine to calculate income levels from transaction alert messages. We never read personal chat logs.
              </Text>
            </View>
            <Switch
              value={smsConsent}
              onValueChange={handleSmsToggle}
              trackColor={{ false: '#D1D1D6', true: '#FBECE8' }}
              thumbColor={smsConsent ? '#E47656' : '#FFFFFF'}
            />
          </View>

          <View style={styles.divider} />

          {/* Location */}
          <View style={styles.consentItem}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.consentTitle}>GPS Proximity Verification</Text>
              <Text style={styles.consentDesc}>
                Used to verify your current device coordinates against Aadhaar proof addresses during identity verification checks.
              </Text>
            </View>
            <Switch
              value={locationConsent}
              onValueChange={handleLocationToggle}
              trackColor={{ false: '#D1D1D6', true: '#FBECE8' }}
              thumbColor={locationConsent ? '#E47656' : '#FFFFFF'}
            />
          </View>

          <View style={styles.divider} />

          {/* Notifications */}
          <View style={styles.consentItem}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.consentTitle}>Push Notifications Alert</Text>
              <Text style={styles.consentDesc}>
                Allows us to prompt you for EMI repayments, statement availability, and urgent lender redressals.
              </Text>
            </View>
            <Switch
              value={notificationConsent}
              onValueChange={handleNotificationToggle}
              trackColor={{ false: '#D1D1D6', true: '#FBECE8' }}
              thumbColor={notificationConsent ? '#E47656' : '#FFFFFF'}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>REGULATORY DOCUMENTATION</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.docRow} onPress={() => Alert.alert('Privacy Policy', 'Opening Privacy Policy...')}>
            <Eye color="#6B7280" size={18} />
            <Text style={styles.docText}>Read full Privacy Policy</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.docRow} onPress={() => Alert.alert('Terms of Service', 'Opening Terms of Service...')}>
            <Lock color="#6B7280" size={18} />
            <Text style={styles.docText}>Terms and Conditions</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>CONSENT AUDIT LEDGER</Text>
        <View style={styles.card}>
          {consentHistory.length === 0 ? (
            <View style={styles.emptyLog}>
              <Info color="#9CA3AF" size={16} />
              <Text style={styles.emptyLogText}>No consent changes logged yet.</Text>
            </View>
          ) : (
            consentHistory.map((log, index) => (
              <View key={log.id}>
                {index > 0 && <View style={styles.divider} />}
                <View style={styles.logItem}>
                  <View style={styles.logRow}>
                    <Text style={styles.logConsentTitle}>
                      {getConsentLabel(log.consentType)}
                    </Text>
                    <View
                      style={[
                        styles.badge,
                        log.action === 'granted' ? styles.badgeSuccess : styles.badgeDanger,
                      ]}
                    >
                      <Text
                        style={[
                          styles.badgeText,
                          log.action === 'granted' ? styles.badgeTextSuccess : styles.badgeTextDanger,
                        ]}
                      >
                        {log.action.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.logMetaRow}>
                    <Calendar color="#9CA3AF" size={12} />
                    <Text style={styles.logMetaText}>{formatLogDate(log.timestamp)}</Text>
                    <Text style={styles.logMetaText}>•</Text>
                    <Text style={styles.logMetaText}>Token: #{log.token}</Text>
                    <Text style={styles.logMetaText}>•</Text>
                    <Text style={styles.logMetaText}>IP: {log.ip}</Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const formatLogDate = (isoStr: string) => {
  const d = new Date(isoStr);
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

const getConsentLabel = (type: string) => {
  switch (type) {
    case 'sms': return 'Financial SMS Access';
    case 'location': return 'GPS Proximity';
    case 'notifications': return 'Push Notification Alerts';
    default: return type;
  }
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FEF8F4',
  },
  scrollContent: {
    padding: 20,
  },
  dpdpBanner: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#FFF0E8',
    marginBottom: 24,
    gap: 12,
    alignItems: 'center',
  },
  dpdpTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#E47656',
    marginBottom: 2,
  },
  dpdpText: {
    fontSize: 11,
    color: '#6B7280',
    lineHeight: 15,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 1.5,
    marginBottom: 12,
    marginTop: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 20,
  },
  consentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  consentTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  consentDesc: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
    lineHeight: 14,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
  },
  docText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
  },
  logText: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
    fontWeight: '600',
    paddingHorizontal: 16,
    lineHeight: 16,
    marginTop: 10,
    marginBottom: 20,
  },
  emptyLog: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 20,
  },
  emptyLogText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  logItem: {
    paddingVertical: 12,
  },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  logConsentTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeSuccess: {
    backgroundColor: '#DEF7EC',
  },
  badgeDanger: {
    backgroundColor: '#FDE8E8',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  badgeTextSuccess: {
    color: '#03543F',
  },
  badgeTextDanger: {
    color: '#9B1C1C',
  },
  logMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logMetaText: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '600',
  },
});
