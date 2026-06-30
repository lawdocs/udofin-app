import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Animated, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';;
import { useRouter } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import { supabase } from '../lib/supabase';
import { FingerprintPattern, Check, ScanFace } from 'lucide-react-native';
import { useTheme } from '../lib/theme';
import { useTranslation } from '../lib/i18n';
import { useAuthStore } from '../store/authStore';

type AuthState = 'idle' | 'authenticating' | 'failed';

export default function BiometricLockScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { t } = useTranslation();
  const { setAppLocked } = useAuthStore();

  const [authState, setAuthState] = useState<AuthState>('idle');
  const [showPinFallback, setShowPinFallback] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [biometricType, setBiometricType] = useState<'fingerprint' | 'face' | 'none'>('none');
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Detect what kind of biometric the device supports and check user preference
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // First check if the user actually enabled biometrics in their settings
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('biometrics_enabled')
            .eq('id', user.id)
            .single();

          if (!profile?.biometrics_enabled) {
            // User explicitly turned off biometrics, force PIN
            setBiometricType('none');
            setShowPinFallback(true);
            return;
          }
        }

        // Critical: First verify the device actually has hardware & is enrolled
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        
        console.log('[BiometricLock] hasHardware:', hasHardware, 'isEnrolled:', isEnrolled);
        
        if (!hasHardware || !isEnrolled) {
          // Device can't do biometrics — go straight to PIN
          console.log('[BiometricLock] No hardware or not enrolled, forcing PIN');
          setBiometricType('none');
          setShowPinFallback(true);
          return;
        }

        // If enabled, check device capabilities
        const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
        console.log('[BiometricLock] Supported types:', types);
        if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          setBiometricType('face');
        } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
          setBiometricType('fingerprint');
        } else {
          setBiometricType('none');
          setShowPinFallback(true); // Skip biometric, go straight to PIN
        }
      } catch (e) {
        console.error('[BiometricLock] Init error:', e);
        setBiometricType('none');
        setShowPinFallback(true);
      } finally {
        setIsLoading(false);
      }
    };
    initializeAuth();
  }, []);

  // Pulse animation for the biometric icon
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.12, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  // Auto-trigger biometric prompt on mount
  useEffect(() => {
    if (biometricType !== 'none') {
      // Small delay to let screen render
      const timer = setTimeout(() => handleBiometricAuth(), 400);
      return () => clearTimeout(timer);
    }
  }, [biometricType]);

  const handleBiometricAuth = async () => {
    setAuthState('authenticating');
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: t('Unlock Udofin'),
        fallbackLabel: t('Use PIN Instead'),
        disableDeviceFallback: true,
        cancelLabel: t('Cancel'),
      });

      if (result.success) {
        // Biometric passed — unlock and go to dashboard
        setAppLocked(false);
        router.replace('/(tabs)/home');
      } else {
        // Log exact error code so we can debug
        console.log('[BiometricLock] Auth failed with error:', result.error);
        setAuthState('failed');
        // Auto-fallback to PIN for any cancel/fallback/permission error
        // Cast to string to handle all error codes including undocumented ones (e.g. from Expo Go)
        const errorCode = result.error as string;
        if (
          errorCode === 'user_fallback' ||
          errorCode === 'system_cancel' ||
          errorCode === 'user_cancel' ||
          errorCode === 'app_cancel' ||
          errorCode === 'not_available' ||
          errorCode === 'not_enrolled' ||
          errorCode === 'lockout' ||
          errorCode === 'lockout_permanent' ||
          errorCode === 'missing_usage_description' // Expo Go limitation — auto-fall to PIN
        ) {
          setShowPinFallback(true);
        }
      }
    } catch (e) {
      console.error('[BiometricLock] Auth error:', e);
      setAuthState('failed');
      setShowPinFallback(true);
    }
  };

  // PIN fallback — handles manual digit entry
  const handlePinDigit = (digit: string) => {
    if (pinInput.length < 4) {
      setPinInput(pinInput + digit);
    }
  };

  const handleSubmit = async () => {
    if (pinInput.length !== 4 || verifying) return;
    setVerifying(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert(t('Session Error'), t('Please log in again.'));
        router.replace('/');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('pin')
        .eq('id', user.id)
        .single();

      // Simple hash (same as in change-pin.tsx)
      let hash = 0;
      for (let i = 0; i < pinInput.length; i++) {
        hash = (hash * 31 + pinInput.charCodeAt(i)) & 0xffffffff;
      }
      const enteredHash = Math.abs(hash).toString(16);

      if (profile?.pin === enteredHash) {
        // PIN correct — unlock and proceed to dashboard
        setAppLocked(false);
        router.replace('/(tabs)/home');
      } else {
        Alert.alert(t('Incorrect PIN'), t('Please try again.'), [
          { text: t('OK'), onPress: () => setPinInput('') }
        ]);
      }
    } catch (e) {
      console.error('[BiometricLock] PIN check error:', e);
      setPinInput('');
    } finally {
      setVerifying(false);
    }
  };

  const handleDelete = () => {
    setPinInput((prev) => prev.slice(0, -1));
  };

  const biometricLabel = biometricType === 'face' ? t('Face ID') : t('Fingerprint');

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>

      {/* Udofin logo / brand */}
      <View style={styles.brandRow}>
        <Text style={styles.brandText}>udofin</Text>
      </View>

      {!showPinFallback ? (
        /* --- Biometric prompt view --- */
        <View style={styles.content}>
          <Text style={styles.title}>{t("Welcome back 👋")}</Text>
          <Text style={styles.subtitle}>
            {t("Use your")} {biometricLabel} {t("to unlock the app")}
          </Text>

          {/* Animated icon */}
          <TouchableOpacity onPress={handleBiometricAuth} activeOpacity={0.8}>
            <Animated.View style={[styles.iconCircle, { transform: [{ scale: pulseAnim }] }]}>
              {biometricType === 'face' ? (
                <ScanFace color={colors.primary} size={52} />
              ) : (
                <FingerprintPattern color={colors.primary} size={52} />
              )}
            </Animated.View>
          </TouchableOpacity>

          {authState === 'authenticating' && (
            <ActivityIndicator color={colors.primary} style={{ marginTop: 16 }} />
          )}
          {authState === 'failed' && (
            <Text style={styles.failText}>{t("Authentication failed. Try again.")}</Text>
          )}

          {/* Tap to retry */}
          {authState !== 'authenticating' && (
            <TouchableOpacity onPress={handleBiometricAuth} style={styles.retryBtn}>
              <Text style={styles.retryText}>{t("Tap to authenticate")}</Text>
            </TouchableOpacity>
          )}

          {/* PIN fallback link */}
          <TouchableOpacity onPress={() => setShowPinFallback(true)} style={styles.pinFallbackLink}>
            <Text style={styles.pinFallbackText}>{t("Use PIN Instead")}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* --- PIN fallback view --- */
        <View style={styles.content}>
          <Text style={styles.title}>{t("Enter your PIN")}</Text>
          <Text style={styles.subtitle}>{t("Use your 4-digit unlock PIN")}</Text>

          {/* PIN dot indicator */}
          <View style={styles.pinDotRow}>
            {[0, 1, 2, 3].map((i) => (
              <View key={i} style={[styles.pinDot, pinInput.length > i ? styles.pinDotFilled : {}]} />
            ))}
          </View>

          {/* Number pad */}
          <View style={styles.numPad}>
            {['1','2','3','4','5','6','7','8','9','check','0','⌫'].map((key, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.numKey, 
                  key === 'check' && { backgroundColor: pinInput.length === 4 ? colors.primary : colors.surfaceBorder }
                ]}
                onPress={() => {
                  if (key === '⌫') handleDelete();
                  else if (key === 'check') handleSubmit();
                  else handlePinDigit(key);
                }}
                disabled={(key === 'check' && pinInput.length !== 4) || verifying}
                activeOpacity={0.7}
              >
                {key === 'check' ? (
                  verifying ? (
                    <ActivityIndicator color={pinInput.length === 4 ? '#FFFFFF' : colors.textMuted} size="small" />
                  ) : (
                    <Check color={pinInput.length === 4 ? '#FFFFFF' : colors.textMuted} size={28} />
                  )
                ) : (
                  <Text style={styles.numKeyText}>{key}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Back to biometric link (if device supports it) */}
          {biometricType !== 'none' && (
            <TouchableOpacity onPress={() => { setShowPinFallback(false); handleBiometricAuth(); }} style={styles.bioLink}>
              <Text style={styles.bioLinkText}>{t("Use")} {biometricLabel} {t("Instead")}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  brandRow: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 8,
  },
  brandText: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: -0.5,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: 60,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 40,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.surfaceBorder,
    marginBottom: 24,
  },
  failText: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 12,
  },
  retryBtn: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 24,
    backgroundColor: colors.primaryLight,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  retryText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  pinFallbackLink: {
    marginTop: 28,
  },
  pinFallbackText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  // PIN pad
  pinDotRow: {
    flexDirection: 'row',
    gap: 18,
    marginBottom: 40,
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.divider,
  },
  pinDotFilled: {
    backgroundColor: colors.primary,
  },
  numPad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: 280,
    gap: 12,
  },
  numKey: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.03)',
    elevation: 1,
  },
  numKeyText: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  bioLink: {
    marginTop: 28,
  },
  bioLinkText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
});
