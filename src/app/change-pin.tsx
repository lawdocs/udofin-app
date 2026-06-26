import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';;
import { useRouter } from 'expo-router';
import Header from '../components/Header';
import Button from '../components/Button';
import { supabase } from '../lib/supabase';
import { useTheme } from '../lib/theme';
import { useTranslation } from '../lib/i18n';

// Simple helper to hash a PIN before storing (not cryptographic, for lightweight use)
// In production, use a proper hashing library like crypto-js
const hashPin = (pin: string): string => {
  // Basic hash: sum of char codes × position, represented as hex
  // Replace with a real hash in production
  let hash = 0;
  for (let i = 0; i < pin.length; i++) {
    hash = (hash * 31 + pin.charCodeAt(i)) & 0xffffffff;
  }
  return Math.abs(hash).toString(16);
};

/**
 * PinInput — renders 4 individual pin digit boxes.
 * Auto-advances cursor to next box after each digit.
 */
function PinInput({ value, onChange, label, styles }: { value: string; onChange: (v: string) => void; label: string; styles: any }) {
  const inputs = useRef<(TextInput | null)[]>([]);

  const handleChange = (text: string, index: number) => {
    const digit = text.slice(-1); // Only keep last char (in case of paste)
    const newPin = value.split('');
    newPin[index] = digit;
    const joined = newPin.join('').slice(0, 4);
    onChange(joined);

    // Auto-advance to next box
    if (digit && index < 3) {
      inputs.current[index + 1]?.focus();
    }
    // Auto-move back on delete
    if (!digit && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.pinGroup}>
      <Text style={styles.pinLabel}>{label}</Text>
      <View style={styles.pinBoxRow}>
        {[0, 1, 2, 3].map((i) => (
          <TextInput
            key={i}
            ref={(ref) => { inputs.current[i] = ref; }}
            style={[styles.pinBox, value[i] ? styles.pinBoxFilled : {}]}
            value={value[i] ? '●' : ''}
            onChangeText={(text) => handleChange(text, i)}
            keyboardType="number-pad"
            maxLength={1}
            selectTextOnFocus
            caretHidden
          />
        ))}
      </View>
    </View>
  );
}

export default function ChangePinScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { t } = useTranslation();

  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (newPin.length < 4) {
      Alert.alert(t('Invalid PIN'), t('PIN must be exactly 4 digits.'));
      return;
    }
    if (newPin !== confirmPin) {
      Alert.alert(t('PIN Mismatch'), t('New PIN and confirmation do not match.'));
      return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error(t('No active session.'));

      // Verify current PIN against stored hash
      const { data: profile } = await supabase
        .from('profiles')
        .select('pin')
        .eq('id', user.id)
        .single();

      // If a PIN is already set, verify it matches the entered current PIN
      if (profile?.pin && profile.pin !== hashPin(currentPin)) {
        Alert.alert(t('Incorrect PIN'), t('Your current PIN is incorrect. Please try again.'));
        setSaving(false);
        return;
      }

      // Save hashed new PIN to Supabase
      const { error } = await supabase
        .from('profiles')
        .update({ pin: hashPin(newPin), updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (error) throw error;

      Alert.alert(t('PIN Updated'), t('Your new PIN has been set successfully.'), [
        { text: t('OK'), onPress: () => router.back() }
      ]);
    } catch (e: any) {
      Alert.alert(t('Error'), e.message || t('Could not update PIN. Please try again.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title={t("Change PIN")} />
      <View style={styles.container}>

        <Text style={styles.description}>
          {t("Your PIN is used to unlock the app when biometrics are unavailable.")}
          {"\n"}
          {t("Choose a 4-digit PIN you can remember.")}
        </Text>

        {/* Current PIN input */}
        <PinInput value={currentPin} onChange={setCurrentPin} label={t("CURRENT PIN")} styles={styles} />

        {/* New PIN input */}
        <PinInput value={newPin} onChange={setNewPin} label={t("NEW PIN")} styles={styles} />

        {/* Confirm new PIN */}
        <PinInput value={confirmPin} onChange={setConfirmPin} label={t("CONFIRM NEW PIN")} styles={styles} />

        <View style={styles.footer}>
          <Button
            title={saving ? t('Saving...') : t('Set New PIN')}
            onPress={handleSave}
            disabled={saving || newPin.length < 4 || confirmPin.length < 4}
          />
          <TouchableOpacity onPress={() => router.back()} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>{t("Cancel")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    padding: 24,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 32,
    fontWeight: '500',
  },
  pinGroup: {
    marginBottom: 28,
  },
  pinLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  pinBoxRow: {
    flexDirection: 'row',
    gap: 16,
  },
  pinBox: {
    width: 60,
    height: 60,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.surfaceBorder,
    backgroundColor: colors.surface,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  pinBoxFilled: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  footer: {
    marginTop: 'auto',
    gap: 12,
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  cancelText: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '600',
  },
});
