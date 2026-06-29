import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Header from '../../components/Header';
import { User, Shield, Settings, FileText, HeartHandshake, LogOut, ChevronRight, Smartphone, Lock, Key, FingerprintPattern } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import { useOnboardingStore } from '../../store/onboardingStore';
import { useTheme } from '../../lib/theme';
import { useTranslation } from '../../lib/i18n';

// Type for profile data fetched from Supabase
type UserProfile = {
  id: string;
  full_name: string | null;
  mobile: string | null;
  secondary_phone: string | null;
  email: string | null;
  biometrics_enabled: boolean;
  notifications_push: boolean;
  notifications_email: boolean;
};

export default function ProfileScreen() {
  const router = useRouter();
  const { clearState: clearOnboarding } = useOnboardingStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  // Fetch real profile data from Supabase on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, mobile, secondary_phone, email, biometrics_enabled, notifications_push, notifications_email')
          .eq('id', user.id)
          .single();

        if (!error && data) {
          setProfile(data as UserProfile);
        }
      } catch (e) {
        console.error('[Profile] Error fetching profile:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    clearOnboarding();
    router.replace('/');
  };

  const displayName = profile?.full_name || profile?.email?.split('@')[0] || t('Borrower');
  const displayPhone = profile?.mobile ? `+91 ${profile.mobile}` : '—';
  const displayEmail = profile?.email || '—';

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top }]}>
      <Header title={t("My Profile")} showBack={false} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Profile Card Header */}
        <TouchableOpacity style={styles.profileHeaderCard} activeOpacity={0.8} onPress={() => router.push('/edit-profile' as any)}>
          <View style={styles.avatar}>
            <Text style={{ fontSize: 36 }}>👤</Text>
          </View>
          {loading ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: 8 }} />
          ) : (
            <>
              <Text style={styles.name}>{displayName}</Text>
              <Text style={styles.phone}>{displayPhone}</Text>
              <Text style={styles.email}>{displayEmail}</Text>
              <Text style={styles.editHint}>{t("Tap to edit profile")}</Text>
            </>
          )}
        </TouchableOpacity>

        {/* ACCOUNT MANAGEMENT */}
        <View style={styles.menuContainer}>
          <Text style={styles.menuSectionTitle}>{t("ACCOUNT MANAGEMENT")}</Text>

          <MenuItem
            icon={<User color={colors.primary} size={20} />}
            title={t("Personal & Employment Details")}
            onPress={() => router.push('/edit-profile' as any)}
            colors={colors}
            styles={styles}
          />
          <MenuItem
            icon={<FileText color={colors.primary} size={20} />}
            title={t("My Documents Vault")}
            onPress={() => router.push('/documents' as any)}
            colors={colors}
            styles={styles}
          />
          <MenuItem
            icon={<Shield color={colors.primary} size={20} />}
            title={t("Privacy & Consent Dashboard")}
            onPress={() => router.push('/privacy-consent' as any)}
            colors={colors}
            styles={styles}
          />
          <MenuItem
            icon={<Smartphone color={colors.primary} size={20} />}
            title={t("Change Mobile Number")}
            onPress={() => router.push('/change-mobile' as any)}
            isLast
            colors={colors}
            styles={styles}
          />
        </View>

        {/* SECURITY */}
        <View style={styles.menuContainer}>
          <Text style={styles.menuSectionTitle}>{t("SECURITY")}</Text>

          <MenuItem
            icon={<Lock color={colors.primary} size={20} />}
            title={t("Change PIN")}
            onPress={() => router.push('/change-pin' as any)}
            colors={colors}
            styles={styles}
          />
          <MenuItem
            icon={<Key color={colors.primary} size={20} />}
            title={t("Change Password")}
            onPress={() => router.push('/change-password' as any)}
            colors={colors}
            styles={styles}
          />
          <MenuItem
            icon={<FingerprintPattern color={colors.primary} size={20} />}
            title={t("Biometric & Security Settings")}
            onPress={() => router.push('/settings' as any)}
            isLast
            colors={colors}
            styles={styles}
          />
        </View>

        {/* NOTIFICATIONS & HELP */}
        <View style={styles.menuContainer}>
          <Text style={styles.menuSectionTitle}>{t("NOTIFICATIONS & HELP")}</Text>

          <MenuItem
            icon={<Settings color={colors.primary} size={20} />}
            title={t("App Settings & Preferences")}
            onPress={() => router.push('/settings' as any)}
            colors={colors}
            styles={styles}
          />
          <MenuItem
            icon={<HeartHandshake color={colors.primary} size={20} />}
            title={t("Support & Raise Complaints")}
            onPress={() => router.push('/support' as any)}
            isLast
            colors={colors}
            styles={styles}
          />
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <LogOut color={colors.danger} size={20} />
          <Text style={styles.logoutText}>{t("Logout")}</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

// Sub component
function MenuItem({ icon, title, onPress, isLast, colors, styles }: any) {
  return (
    <TouchableOpacity style={[styles.menuItem, isLast && styles.menuItemLast]} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.menuLeft}>
        <View style={styles.menuIconWrapper}>{icon}</View>
        <Text style={styles.menuTitle}>{title}</Text>
      </View>
      <ChevronRight color={colors.textMuted} size={18} />
    </TouchableOpacity>
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
  profileHeaderCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: 24,
    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.02)',
    elevation: 1,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primaryBorder,
    marginBottom: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  phone: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 2,
  },
  email: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 2,
  },
  editHint: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 8,
    opacity: 0.8,
  },
  menuContainer: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: 20,
  },
  menuSectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 1.5,
    paddingHorizontal: 8,
    paddingTop: 12,
    paddingBottom: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  // Last item in a section has no bottom border
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuTitle: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '700',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.dangerLight,
    borderRadius: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    marginTop: 8,
  },
  logoutText: {
    color: colors.danger,
    fontWeight: '700',
    fontSize: 15,
  },
});
