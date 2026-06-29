import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';;
import { useRouter } from 'expo-router';
import Header from '../components/Header';
import Button from '../components/Button';
import { supabase } from '../lib/supabase';
import { Eye, EyeOff } from 'lucide-react-native';
import { useTheme } from '../lib/theme';
import { useTranslation } from '../lib/i18n';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { t } = useTranslation();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Password strength check — returns colour and label
  const getStrength = (pwd: string): { label: string; color: string; width: string } => {
    if (pwd.length === 0) return { label: '', color: colors.surfaceBorder, width: '0%' };
    if (pwd.length < 6) return { label: t('Weak'), color: colors.danger, width: '25%' };
    if (pwd.length < 10) return { label: t('Fair'), color: '#F59E0B', width: '50%' };
    if (!/[A-Z]/.test(pwd) || !/[0-9]/.test(pwd)) return { label: t('Good'), color: '#3B82F6', width: '75%' };
    return { label: t('Strong'), color: '#10B981', width: '100%' };
  };

  const strength = getStrength(newPassword);

  const handleSave = async () => {
    if (newPassword.length < 6) {
      Alert.alert(t('Too Short'), t('Password must be at least 6 characters.'));
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert(t('Mismatch'), t('Passwords do not match.'));
      return;
    }

    setSaving(true);
    try {
      // Uses Supabase's updateUser to change password for the current session
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      Alert.alert(t('Password Updated'), t('Your password has been changed successfully.'), [
        { text: t('OK'), onPress: () => router.back() }
      ]);
    } catch (e: any) {
      Alert.alert(t('Error'), e.message || t('Could not change password. Please try again.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title={t("Change Password")} />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

        <Text style={styles.description}>
          {t("Set a strong password for your account. You will need this if you log in via email.")}
        </Text>

        {/* New Password */}
        <View style={styles.formGroup}>
          <Text style={styles.inputLabel}>{t("NEW PASSWORD")}</Text>
          <View style={styles.passwordRow}>
            <TextInput
              style={styles.textInput}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!showNew}
              autoCapitalize="none"
              placeholder={t("Enter new password")}
              placeholderTextColor={colors.textMuted}
            />
            <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowNew(!showNew)}>
              {showNew
                ? <EyeOff color={colors.textMuted} size={18} />
                : <Eye color={colors.textMuted} size={18} />
              }
            </TouchableOpacity>
          </View>

          {/* Password strength indicator */}
          {newPassword.length > 0 && (
            <View style={styles.strengthContainer}>
              <View style={styles.strengthBar}>
                <View style={[styles.strengthFill, { width: strength.width as any, backgroundColor: strength.color }]} />
              </View>
              <Text style={[styles.strengthLabel, { color: strength.color }]}>{strength.label}</Text>
            </View>
          )}
        </View>

        {/* Confirm Password */}
        <View style={styles.formGroup}>
          <Text style={styles.inputLabel}>{t("CONFIRM NEW PASSWORD")}</Text>
          <View style={styles.passwordRow}>
            <TextInput
              style={styles.textInput}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirm}
              autoCapitalize="none"
              placeholder={t("Repeat new password")}
              placeholderTextColor={colors.textMuted}
            />
            <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowConfirm(!showConfirm)}>
              {showConfirm
                ? <EyeOff color={colors.textMuted} size={18} />
                : <Eye color={colors.textMuted} size={18} />
              }
            </TouchableOpacity>
          </View>
          {/* Mismatch hint */}
          {confirmPassword.length > 0 && newPassword !== confirmPassword && (
            <Text style={styles.mismatchHint}>{t("Passwords do not match")}</Text>
          )}
        </View>

      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={saving ? t('Updating...') : t('Update Password')}
          onPress={handleSave}
          disabled={saving || newPassword.length < 6 || newPassword !== confirmPassword}
        />
      </View>
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
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 28,
    fontWeight: '500',
  },
  formGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 1,
    marginBottom: 10,
  },
  passwordRow: {
    position: 'relative',
  },
  textInput: {
    borderWidth: 1.5,
    borderColor: colors.surfaceBorder,
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    paddingRight: 48,
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  eyeBtn: {
    position: 'absolute',
    right: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 10,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 4,
    backgroundColor: colors.divider,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 4,
  },
  strengthLabel: {
    fontSize: 11,
    fontWeight: '700',
    width: 48,
  },
  mismatchHint: {
    marginTop: 6,
    fontSize: 12,
    color: colors.danger,
    fontWeight: '600',
  },
  footer: {
    padding: 24,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
  },
});
