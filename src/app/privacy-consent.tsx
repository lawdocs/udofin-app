import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';;
import Header from '../components/Header';
import { Shield, Eye, Lock, RefreshCw } from 'lucide-react-native';
import { useTheme } from '../lib/theme';
import { useTranslation } from '../lib/i18n';

export default function PrivacyConsentScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { t } = useTranslation();

  // DPDP Consent permissions
  const [smsConsent, setSmsConsent] = useState(true);
  const [locationConsent, setLocationConsent] = useState(true);
  const [notificationConsent, setNotificationConsent] = useState(true);

  const handleSmsToggle = (value: boolean) => {
    if (!value) {
      Alert.alert(
        t('Revoke SMS Consent?'),
        t('WARNING: Revoking SMS access will prevent our automated underwriting engine from evaluating credit limits, resulting in a potential reduction of matching lender offers.'),
        [
          { text: t('Cancel'), style: 'cancel', onPress: () => setSmsConsent(true) },
          { text: t('Revoke Anyway'), onPress: () => setSmsConsent(false) },
        ]
      );
    } else {
      setSmsConsent(true);
    }
  };

  const handleLocationToggle = (value: boolean) => {
    if (!value) {
      Alert.alert(
        t('Revoke Location Consent?'),
        t('Revoking location permissions may require you to upload additional physical address proofs (e.g. rent agreement or utility bills) to satisfy KYC rules.'),
        [
          { text: t('Cancel'), style: 'cancel', onPress: () => setLocationConsent(true) },
          { text: t('Revoke Anyway'), onPress: () => setLocationConsent(false) },
        ]
      );
    } else {
      setLocationConsent(true);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title={t("Consent Dashboard")} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* DPDP Header */}
        <View style={styles.dpdpBanner}>
          <Shield color={colors.primary} size={24} />
          <View style={{ flex: 1 }}>
            <Text style={styles.dpdpTitle}>{t("DPDP Act, 2023 Compliance")}</Text>
            <Text style={styles.dpdpText}>
              {t("In accordance with the Digital Personal Data Protection Act, you possess full rights to request logs of, restrict, or revoke any authorization parameters.")}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>{t("MANAGE DATA ACCESS")}</Text>
        <View style={styles.card}>
          {/* SMS */}
          <View style={styles.consentItem}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.consentTitle}>{t("Financial SMS Access")}</Text>
              <Text style={styles.consentDesc}>
                {t("Used by the eligibility engine to calculate income levels from transaction alert messages. We never read personal chat logs.")}
              </Text>
            </View>
            <Switch
              value={smsConsent}
              onValueChange={handleSmsToggle}
              trackColor={{ false: colors.surfaceBorder, true: colors.primaryBorder }}
              thumbColor={smsConsent ? colors.primary : colors.surface}
            />
          </View>

          <View style={styles.divider} />

          {/* Location */}
          <View style={styles.consentItem}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.consentTitle}>{t("GPS Proximity Verification")}</Text>
              <Text style={styles.consentDesc}>
                {t("Used to verify your current device coordinates against Aadhaar proof addresses during identity verification checks.")}
              </Text>
            </View>
            <Switch
              value={locationConsent}
              onValueChange={handleLocationToggle}
              trackColor={{ false: colors.surfaceBorder, true: colors.primaryBorder }}
              thumbColor={locationConsent ? colors.primary : colors.surface}
            />
          </View>

          <View style={styles.divider} />

          {/* Notifications */}
          <View style={styles.consentItem}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.consentTitle}>{t("Push Notifications Alert")}</Text>
              <Text style={styles.consentDesc}>
                {t("Allows us to prompt you for EMI repayments, statement availability, and urgent lender redressals.")}
              </Text>
            </View>
            <Switch
              value={notificationConsent}
              onValueChange={setNotificationConsent}
              trackColor={{ false: colors.surfaceBorder, true: colors.primaryBorder }}
              thumbColor={notificationConsent ? colors.primary : colors.surface}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>{t("REGULATORY DOCUMENTATION")}</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.docRow} onPress={() => Alert.alert(t('Privacy Policy'), t('Opening Privacy Policy...'))}>
            <Eye color={colors.textSecondary} size={18} />
            <Text style={styles.docText}>{t("Read full Privacy Policy")}</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.docRow} onPress={() => Alert.alert(t('Terms of Service'), t('Opening Terms of Service...'))}>
            <Lock color={colors.textSecondary} size={18} />
            <Text style={styles.docText}>{t("Terms and Conditions")}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.logText}>
          {t("Last consent log update: Today, {{time}}. Shared securely under token #UD-{{token}}.")
            .replace('{{time}}', new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }))
            .replace('{{token}}', String(Math.floor(100000 + Math.random() * 900000)))}
        </Text>

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
  dpdpBanner: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: colors.primaryBorder,
    marginBottom: 24,
    gap: 12,
    alignItems: 'center',
  },
  dpdpTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 2,
  },
  dpdpText: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 15,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 1.5,
    marginBottom: 12,
    marginTop: 8,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
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
    color: colors.text,
    marginBottom: 2,
  },
  consentDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
    lineHeight: 14,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
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
    color: colors.text,
  },
  logText: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    fontWeight: '600',
    paddingHorizontal: 16,
    lineHeight: 16,
    marginTop: 10,
    marginBottom: 20,
  },
});
