import { useRouter } from 'expo-router';
import { ChevronRight, Globe, Moon, Trash2 } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import { useTranslation } from '../lib/i18n';
import { supabase } from '../lib/supabase';
import { useTheme } from '../lib/theme';
import { useLoanStore } from '../store/loanStore';
import { useOnboardingStore } from '../store/onboardingStore';

// Supported languages
const LANGUAGES = ['English', 'Hindi', 'Marathi', 'Tamil', 'Telugu'];
// Supported themes
const THEMES = ['System', 'Light', 'Dark'];

export default function SettingsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors, setThemePreference } = useTheme();
  const styles = getStyles(colors);
  
  const setLanguageGlobal = useOnboardingStore((state) => state.setLanguage);
  const { clearState: clearOnboarding } = useOnboardingStore();
  const { activeLoan, clearStore } = useLoanStore();

  // Toggle states — loaded from Supabase
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [language, setLanguage] = useState('English');
  const [theme, setTheme] = useState('System');
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);


  // Load settings from Supabase on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setLoading(false); return; }
        setUserId(user.id);

        const { data, error } = await supabase
          .from('profiles')
          .select('notifications_push, notifications_email, biometrics_enabled, language, theme')
          .eq('id', user.id)
          .single();

        if (!error && data) {
          setPushEnabled(data.notifications_push ?? true);
          setEmailEnabled(data.notifications_email ?? false);
          setBiometricsEnabled(data.biometrics_enabled ?? false);
          setLanguage(data.language || 'English');
          setTheme(data.theme || 'System');
        }
      } catch (e) {
        console.error('[Settings] Error loading settings:', e);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  // Generic function to persist a single field to Supabase
  const persistSetting = async (field: string, value: boolean | string) => {
    if (!userId) return;
    const { error } = await supabase
      .from('profiles')
      .update({ [field]: value, updated_at: new Date().toISOString() })
      .eq('id', userId);
    if (error) console.error(`[Settings] Failed to save ${field}:`, error.message);
  };

  const handleTogglePush = (val: boolean) => {
    setPushEnabled(val);
    persistSetting('notifications_push', val);
  };

  const handleToggleEmail = (val: boolean) => {
    setEmailEnabled(val);
    persistSetting('notifications_email', val);
  };

  const handleToggleBiometrics = (val: boolean) => {
    setBiometricsEnabled(val);
    persistSetting('biometrics_enabled', val);
    if (val) {
      Alert.alert(
        t('Biometric Unlock Enabled'),
        t('Next time you open the app with an active session, you will be asked to authenticate with Face ID or Fingerprint.'),
      );
    }
  };

  // Cycle to next language in the list
  const handleLanguageChange = () => {
    const idx = LANGUAGES.indexOf(language);
    const next = LANGUAGES[(idx + 1) % LANGUAGES.length];
    setLanguage(next);
    setLanguageGlobal(next); // Update the zustand store immediately for UI to re-render translations
    persistSetting('language', next);
  };

  // Cycle to next theme
  const handleThemeChange = () => {
    const idx = THEMES.indexOf(theme);
    const next = THEMES[(idx + 1) % THEMES.length];
    setTheme(next);
    setThemePreference(next.toLowerCase() as any); // Update the theme provider immediately
    persistSetting('theme', next);
  };

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
      t('Delete Account'),
      t('WARNING: This action is permanent. All active records and consent parameters will be purged in compliance with DPDP data erasing rules. Do you want to proceed?'),
      [
        { text: t('Cancel'), style: 'cancel' },
        { 
          text: t('Delete Permanently'), 
          style: 'destructive',
          onPress: async () => {
            try {
              const { data: { user } } = await supabase.auth.getUser();
              if (user) {
                await supabase.from('profiles').delete().eq('id', user.id);
              }
              await supabase.auth.signOut();
              clearOnboarding();
              clearStore();
              Alert.alert(t('Purge Initiated'), t('Your account data has been completely erased.'));
              router.replace('/');
            } catch {
              Alert.alert(t('Deletion Failed'), t('Failed to request account deletion. Please try again.'));
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title={t("App Settings")} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title={t("App Settings")} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* SECURITY SETTINGS */}
        <Text style={styles.sectionTitle}>{t("SECURITY")}</Text>
        <View style={styles.settingCard}>
          <SettingToggle
            title={t("Biometric Unlock")}
            description={t("Use Face ID or Fingerprint to unlock your dashboard")}
            value={biometricsEnabled}
            onToggle={handleToggleBiometrics}
            colors={colors}
            styles={styles}
          />
        </View>

        {/* PREFERENCES */}
        <Text style={styles.sectionTitle}>{t("PREFERENCES")}</Text>
        <View style={styles.settingCard}>
          {/* Language selector — tapping cycles through languages */}
          <TouchableOpacity style={styles.prefRow} onPress={handleLanguageChange} activeOpacity={0.7}>
            <View style={styles.prefLeft}>
              <Globe color={colors.primary} size={18} style={{ marginRight: 12 }} />
              <View>
                <Text style={styles.prefTitle}>{t("App Language")}</Text>
                <Text style={styles.prefValue}>{t(language)}</Text>
              </View>
            </View>
            <ChevronRight color={colors.textMuted} size={16} />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Theme selector */}
          <View style={[styles.prefRow, { flexDirection: 'column', alignItems: 'stretch' }]}>
            <View style={[styles.prefLeft, { marginBottom: 12 }]}>
              <Moon color={colors.primary} size={18} style={{ marginRight: 12 }} />
              <View>
                <Text style={styles.prefTitle}>{t("App Theme")}</Text>
              </View>
            </View>
            <View style={styles.themeToggleContainer}>
              {THEMES.map((tItem) => (
                <TouchableOpacity
                  key={tItem}
                  style={[
                    styles.themeToggleButton,
                    theme === tItem && styles.themeToggleButtonActive
                  ]}
                  onPress={() => {
                    setTheme(tItem);
                    setThemePreference(tItem.toLowerCase() as any);
                    persistSetting('theme', tItem);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[
                    styles.themeToggleText,
                    theme === tItem && styles.themeToggleTextActive
                  ]}>
                    {t(tItem)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* NOTIFICATION SETTINGS */}
        <Text style={styles.sectionTitle}>{t("NOTIFICATIONS")}</Text>
        <View style={styles.settingCard}>
          <SettingToggle
            title={t("Push Notifications")}
            description={t("Get alerts for EMI deadlines and loan offers")}
            value={pushEnabled}
            onToggle={handleTogglePush}
            colors={colors}
            styles={styles}
          />
          <View style={styles.divider} />
          <SettingToggle
            title={t("Email Notifications")}
            description={t("Receive monthly statements and billing receipts")}
            value={emailEnabled}
            onToggle={handleToggleEmail}
            colors={colors}
            styles={styles}
          />
        </View>

        {/* DANGER ZONE */}
        <Text style={styles.sectionTitle}>{t("DANGER ZONE")}</Text>
        <TouchableOpacity style={[styles.actionRow, styles.dangerRow]} onPress={handleDeleteAccount} activeOpacity={0.7}>
          <View style={styles.actionLeft}>
            <Trash2 color={colors.danger} size={20} />
            <Text style={[styles.actionTitle, { color: colors.danger }]}>{t("Delete Account Permanently")}</Text>
          </View>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

// Toggle row sub-component
function SettingToggle({ title, description, value, onToggle, colors, styles }: any) {
  return (
    <View style={styles.toggleRow}>
      <View style={{ flex: 1, marginRight: 10 }}>
        <Text style={styles.toggleTitle}>{title}</Text>
        <Text style={styles.toggleDesc}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: colors.surfaceBorder, true: colors.primaryBorder }}
        thumbColor={value ? colors.primary : colors.surface}
      />
    </View>
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
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 1.5,
    marginBottom: 12,
    marginTop: 8,
  },
  settingCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
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
    backgroundColor: colors.divider,
  },
  toggleTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  toggleDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
    lineHeight: 14,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
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
    color: colors.text,
  },
  dangerRow: {
    backgroundColor: colors.dangerLight,
    borderColor: colors.dangerBorder,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  prefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  prefLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prefTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  prefValue: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  themeToggleContainer: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 4,
    marginTop: 4,
  },
  themeToggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  themeToggleButtonActive: {
    backgroundColor: colors.surface,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  themeToggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  themeToggleTextActive: {
    color: colors.primary,
    fontWeight: '800',
  },
});
