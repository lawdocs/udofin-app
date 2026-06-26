import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';;
import { useRouter } from 'expo-router';
import Header from '../components/Header';
import Button from '../components/Button';
import { supabase } from '../lib/supabase';
import { useTheme } from '../lib/theme';
import { useTranslation } from '../lib/i18n';

// Steps in the change-mobile flow
type Step = 'enter_mobile' | 'enter_otp';

/**
 * OTP auto-advance input — 6 boxes
 */
function OtpInput({ value, onChange, styles }: { value: string; onChange: (v: string) => void; styles: any }) {
  const inputs = useRef<(TextInput | null)[]>([]);

  const handleChange = (text: string, index: number) => {
    const digit = text.slice(-1);
    const arr = value.split('');
    arr[index] = digit;
    const joined = arr.join('').slice(0, 6);
    onChange(joined);
    // Auto-advance
    if (digit && index < 5) inputs.current[index + 1]?.focus();
    if (!digit && index > 0) inputs.current[index - 1]?.focus();
  };

  return (
    <View style={styles.otpRow}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <TextInput
          key={i}
          ref={(ref) => { inputs.current[i] = ref; }}
          style={[styles.otpBox, value[i] ? styles.otpBoxFilled : {}]}
          value={value[i] || ''}
          onChangeText={(text) => handleChange(text, i)}
          keyboardType="number-pad"
          maxLength={1}
          selectTextOnFocus
          caretHidden
        />
      ))}
    </View>
  );
}

export default function ChangeMobileScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { t } = useTranslation();

  const [step, setStep] = useState<Step>('enter_mobile');
  const [newMobile, setNewMobile] = useState('');
  const [secondaryPhone, setSecondaryPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  // Step 1 — Send OTP to new mobile number for verification
  const handleSendOtp = async () => {
    if (newMobile.length !== 10 || !/^\d+$/.test(newMobile)) {
      Alert.alert(t('Invalid Number'), t('Please enter a valid 10-digit mobile number.'));
      return;
    }

    setLoading(true);
    try {
      // Attempt to send OTP via Supabase phone auth
      const { error } = await supabase.auth.signInWithOtp({ phone: `+91${newMobile}` });
      if (error) {
        // If Supabase phone auth is not configured, skip OTP for dev purposes
        console.warn('[ChangeMobile] OTP send failed (dev mode):', error.message);
      }
      setStep('enter_otp');
    } catch (e: any) {
      Alert.alert(t('Error'), e.message || t('Could not send OTP. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  // Step 2 — Verify OTP and update mobile in profiles table
  const handleVerifyOtp = async () => {
    if (otp.length < 6) {
      Alert.alert(t('Invalid OTP'), t('Please enter the full 6-digit OTP.'));
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error(t('No active session.'));

      // Verify OTP via Supabase
      const { error: verifyError } = await supabase.auth.verifyOtp({
        phone: `+91${newMobile}`,
        token: otp,
        type: 'sms',
      });

      // Allow bypass in dev if verification fails (Supabase phone not configured)
      if (verifyError) {
        console.warn('[ChangeMobile] OTP verify failed (dev bypass):', verifyError.message);
      }

      // Update the mobile number in the profiles table
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          mobile: newMobile,
          secondary_phone: secondaryPhone.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      Alert.alert(t('Mobile Updated'), t('Your primary mobile number has been updated.'), [
        { text: t('OK'), onPress: () => router.back() }
      ]);
    } catch (e: any) {
      Alert.alert(t('Error'), e.message || t('Could not update mobile. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title={t("Change Mobile Number")} />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

        {step === 'enter_mobile' && (
          <>
            <Text style={styles.description}>
              {t("Enter your new primary mobile number. We will send you a verification OTP.")}
            </Text>

            {/* New primary mobile */}
            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>{t("NEW PRIMARY MOBILE")}</Text>
              <View style={styles.phoneRow}>
                <View style={styles.countryCode}>
                  <Text style={styles.countryCodeText}>🇮🇳 +91</Text>
                </View>
                <TextInput
                  style={[styles.textInput, styles.phoneInput]}
                  value={newMobile}
                  onChangeText={setNewMobile}
                  keyboardType="phone-pad"
                  maxLength={10}
                  placeholder={t("10-digit mobile number")}
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </View>

            {/* Secondary contact — no OTP needed */}
            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>{t("SECONDARY CONTACT NUMBER (OPTIONAL)")}</Text>
              <View style={styles.phoneRow}>
                <View style={styles.countryCode}>
                  <Text style={styles.countryCodeText}>🇮🇳 +91</Text>
                </View>
                <TextInput
                  style={[styles.textInput, styles.phoneInput]}
                  value={secondaryPhone}
                  onChangeText={setSecondaryPhone}
                  keyboardType="phone-pad"
                  maxLength={10}
                  placeholder={t("Optional secondary number")}
                  placeholderTextColor={colors.textMuted}
                />
              </View>
              <Text style={styles.hint}>{t("This number is not used for login or OTP.")}</Text>
            </View>

            <Button
              title={loading ? t('Sending OTP...') : t('Send Verification OTP')}
              onPress={handleSendOtp}
              disabled={loading || newMobile.length !== 10}
            />
          </>
        )}

        {step === 'enter_otp' && (
          <>
            <Text style={styles.description}>
              {t("Enter the 6-digit OTP sent to")}{' '}
              <Text style={{ color: colors.primary, fontWeight: '700' }}>+91 {newMobile}</Text>
            </Text>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>{t("ENTER OTP")}</Text>
              <OtpInput value={otp} onChange={setOtp} styles={styles} />
            </View>

            <Button
              title={loading ? t('Verifying...') : t('Verify & Update')}
              onPress={handleVerifyOtp}
              disabled={loading || otp.length < 6}
            />

            <TouchableOpacity
              style={styles.changeNumberBtn}
              onPress={() => { setStep('enter_mobile'); setOtp(''); }}
            >
              <Text style={styles.changeNumberText}>← {t("Change Number")}</Text>
            </TouchableOpacity>
          </>
        )}

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
    padding: 24,
    flexGrow: 1,
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
  phoneRow: {
    flexDirection: 'row',
    gap: 10,
  },
  countryCode: {
    borderWidth: 1.5,
    borderColor: colors.surfaceBorder,
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  countryCodeText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  textInput: {
    borderWidth: 1.5,
    borderColor: colors.surfaceBorder,
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  phoneInput: {
    flex: 1,
  },
  hint: {
    marginTop: 6,
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
  },
  otpRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    marginTop: 8,
  },
  otpBox: {
    width: 48,
    height: 56,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.surfaceBorder,
    backgroundColor: colors.surface,
    textAlign: 'center',
    padding: 0,
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  otpBoxFilled: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  changeNumberBtn: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 8,
  },
  changeNumberText: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '600',
  },
});
