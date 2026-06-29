import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';;
import { useRouter } from 'expo-router';
import Header from '../components/Header';
import Button from '../components/Button';
import { supabase } from '../lib/supabase';
import { useTheme } from '../lib/theme';
import { useTranslation } from '../lib/i18n';

export default function EditProfileScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { t } = useTranslation();

  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');         // Primary (read-only, set at signup)
  const [secondaryPhone, setSecondaryPhone] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [designation, setDesignation] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load current profile data from Supabase on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setLoading(false); return; }

        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, mobile, secondary_phone, email')
          .eq('id', user.id)
          .single();

        if (!error && data) {
          setName(data.full_name || '');
          setPhone(data.mobile ? `+91 ${data.mobile}` : '');
          setSecondaryPhone(data.secondary_phone || '');
          setEmail(data.email || user.email || '');
        }
      } catch (e) {
        console.error('[EditProfile] Error loading profile:', e);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleSave = async () => {
    if (name.trim().length < 2) {
      Alert.alert(t('Invalid Entry'), t('Name must be at least 2 characters.'));
      return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error(t('No active session.'));

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: name.trim(),
          secondary_phone: secondaryPhone.trim() || null,
          email: email.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      Alert.alert(t('Profile Saved'), t('Your details have been updated successfully.'), [
        { text: t('OK'), onPress: () => router.back() }
      ]);
    } catch (e: any) {
      Alert.alert(t('Save Failed'), e.message || t('Could not update profile. Please try again.'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title={t("Edit Profile Details")} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <Header title={t("Edit Profile Details")} />
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

          <Text style={styles.sectionTitle}>{t("PERSONAL DETAILS")}</Text>

          <View style={styles.formGroup}>
            <Text style={styles.inputLabel}>{t("FULL NAME")}</Text>
            <TextInput
              style={styles.textInput}
              value={name}
              onChangeText={setName}
              placeholder={t("Enter your full name")}
              placeholderTextColor={colors.textMuted}
            />
          </View>

          {/* Primary mobile — read-only, changed via Change Mobile screen */}
          <View style={styles.formGroup}>
            <Text style={styles.inputLabel}>{t("PRIMARY MOBILE (LOGIN)")}</Text>
            <TextInput
              style={[styles.textInput, styles.disabledInput]}
              value={phone}
              editable={false}
              placeholderTextColor={colors.textMuted}
            />
            <Text style={styles.fieldHint}>{t("To change this, go to Security → Change Mobile Number")}</Text>
          </View>

          {/* Secondary contact number */}
          <View style={styles.formGroup}>
            <Text style={styles.inputLabel}>{t("SECONDARY CONTACT NUMBER")}</Text>
            <TextInput
              style={styles.textInput}
              value={secondaryPhone}
              onChangeText={setSecondaryPhone}
              placeholder="+91 XXXXX XXXXX"
              keyboardType="phone-pad"
              maxLength={13}
              placeholderTextColor={colors.textMuted}
            />
            <Text style={styles.fieldHint}>{t("Optional — not used for login or OTP")}</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.inputLabel}>{t("EMAIL ADDRESS")}</Text>
            <TextInput
              style={styles.textInput}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="your@email.com"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          <Text style={styles.sectionTitle}>{t("EMPLOYER DETAILS")}</Text>

          <View style={styles.formGroup}>
            <Text style={styles.inputLabel}>{t("CURRENT COMPANY")}</Text>
            <TextInput
              style={styles.textInput}
              value={company}
              onChangeText={setCompany}
              placeholder={t("Company name")}
              placeholderTextColor={colors.textMuted}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.inputLabel}>{t("OFFICIAL DESIGNATION")}</Text>
            <TextInput
              style={styles.textInput}
              value={designation}
              onChangeText={setDesignation}
              placeholder={t("Your role / designation")}
              placeholderTextColor={colors.textMuted}
            />
          </View>

        </ScrollView>

        <View style={styles.footer}>
          <Button title={saving ? t('Saving...') : t('Save Updates')} onPress={handleSave} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textMuted,
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
    color: colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1.5,
    borderColor: colors.surfaceBorder,
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  disabledInput: {
    backgroundColor: colors.divider,
    color: colors.textSecondary,
    borderColor: colors.divider,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fieldHint: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 6,
    fontWeight: '500',
  },
  footer: {
    padding: 24,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
  },
});
