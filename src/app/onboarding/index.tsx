import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, TextInput, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';;
import { useRouter } from 'expo-router';
import { ChevronLeft, Check, FingerprintPattern } from 'lucide-react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { useOnboardingStore } from '../../store/onboardingStore';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../lib/theme';
import { useTranslation } from '../../lib/i18n';

export default function OnboardingWizard() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { t } = useTranslation();
  const { setAppLocked } = useAuthStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [biometricType, setBiometricType] = useState<'fingerprint' | 'face' | 'none'>('none');
  
  const { 
    language, setLanguage, 
    mobileNumber, setMobileNumber, 
    email, setEmail, 
    pin: storePin, setPin: setStorePin 
  } = useOnboardingStore();

  const languages = ['English', 'Hindi', 'Marathi', 'Tamil', 'Telugu'];

  // Step 2 State
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef<Array<TextInput | null>>([]);

  // Step 3 State
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtp, setEmailOtp] = useState(['', '', '', '', '', '']);
  const [emailVerified, setEmailVerified] = useState(false);
  const emailOtpRefs = useRef<Array<TextInput | null>>([]);

  // Step 4 State
  const [pin, setPin] = useState(['', '', '', '']);
  const [confirmPin, setConfirmPin] = useState(['', '', '', '']);
  const [isConfirming, setIsConfirming] = useState(false);
  const pinRefs = useRef<Array<TextInput | null>>([]);

  const sendOTP = async () => {
    console.log(`[sendOTP] Attempting to send OTP to: ${mobileNumber}`);
    if (mobileNumber.length !== 10) {
      console.log(`[sendOTP] Invalid mobile number entered: ${mobileNumber}`);
      Alert.alert('Invalid Number', 'Please enter a valid 10-digit mobile number.');
      return false;
    }
    
    // DUMMY OTP IMPLEMENTATION
    console.log(`[sendOTP] DUMMY - Successfully sent OTP to +91${mobileNumber}`);
    setOtpSent(true);
    return true;
  };

  const verifyOTP = async () => {
    const otpString = otp.join('');
    console.log(`[verifyOTP] Attempting to verify OTP: ${otpString} for number: ${mobileNumber}`);
    if (otpString.length !== 6) {
      console.log(`[verifyOTP] Invalid OTP length entered: ${otpString}`);
      Alert.alert('Invalid OTP', 'Please enter the 6-digit code.');
      return false;
    }
    
    // DUMMY OTP IMPLEMENTATION
    console.log(`[verifyOTP] DUMMY - Successfully verified OTP: ${otpString} for +91${mobileNumber}`);
    return true;
  };

  const sendEmailOTP = async () => {
    if (!email || !email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return false;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
    });
    setLoading(false);
    if (error) {
      Alert.alert('Error', error.message);
      return false;
    }
    setEmailOtpSent(true);
    return true;
  };

  const verifyEmailOTP = async () => {
    const otpString = emailOtp.join('');
    if (otpString.length !== 6) {
      Alert.alert('Error', 'Please enter the 6-digit code.');
      return false;
    }
    setLoading(true);
    const { error, data } = await supabase.auth.verifyOtp({
      email,
      token: otpString,
      type: 'email',
    });
    setLoading(false);
    if (error) {
      Alert.alert('Error', error.message);
      return false;
    }
    setEmailVerified(true);
    return true;
  };

  const handleOtpChange = (val: string, index: number) => {
    const cleanVal = val.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = cleanVal;
    setOtp(newOtp);

    if (cleanVal && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleEmailOtpChange = (val: string, index: number) => {
    const cleanVal = val.slice(-1);
    const newOtp = [...emailOtp];
    newOtp[index] = cleanVal;
    setEmailOtp(newOtp);

    if (cleanVal && index < 5) {
      emailOtpRefs.current[index + 1]?.focus();
    }
  };

  const handleEmailOtpKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !emailOtp[index] && index > 0) {
      const newOtp = [...emailOtp];
      newOtp[index - 1] = '';
      setEmailOtp(newOtp);
      emailOtpRefs.current[index - 1]?.focus();
    }
  };

  const handlePinChange = (val: string, index: number) => {
    const cleanVal = val.slice(-1);
    if (isConfirming) {
      const newPin = [...confirmPin];
      newPin[index] = cleanVal;
      setConfirmPin(newPin);

      if (cleanVal && index < 3) {
        pinRefs.current[index + 1]?.focus();
      }
    } else {
      const newPin = [...pin];
      newPin[index] = cleanVal;
      setPin(newPin);

      if (cleanVal) {
        if (index < 3) {
          pinRefs.current[index + 1]?.focus();
        } else {
          setTimeout(() => {
            setIsConfirming(true);
            setConfirmPin(['', '', '', '']);
            pinRefs.current[0]?.focus();
          }, 300);
        }
      }
    }
  };

  const handlePinKeyPress = (key: string, index: number) => {
    const currentPin = isConfirming ? confirmPin : pin;
    
    // Handle backspace when box is empty
    if (key === 'Backspace' && !currentPin[index]) {
      if (index > 0) {
        if (isConfirming) {
          const newPin = [...confirmPin];
          newPin[index - 1] = '';
          setConfirmPin(newPin);
        } else {
          const newPin = [...pin];
          newPin[index - 1] = '';
          setPin(newPin);
        }
        pinRefs.current[index - 1]?.focus();
      } else if (index === 0 && isConfirming) {
        // If they are on the first box of confirm PIN and press backspace,
        // take them back to the create PIN step seamlessly.
        setIsConfirming(false);
        setConfirmPin(['', '', '', '']);
        // Remove the last digit of the original PIN so they can re-type it
        const newPin = [...pin];
        newPin[3] = '';
        setPin(newPin);
        // Add a tiny delay to ensure state update completes before focus
        setTimeout(() => {
          pinRefs.current[3]?.focus();
        }, 50);
      }
    }
  };

  const handleNext = async () => {
    // Step 1: Email Verification (Authentication)
    if (step === 1) {
      if (!emailOtpSent) {
        // Send Email OTP
        await sendEmailOTP();
        return;
      } else if (!emailVerified) {
        // Verify Email OTP
        const verified = await verifyEmailOTP();
        if (!verified) return;

        // Check if returning user
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase.from('profiles').select('pin').eq('id', user.id).single();
          setLoading(false);
          
          if (profile?.pin) {
            // Returning user - they already have a PIN!
            router.replace('/biometric-lock');
            return;
          }
        } else {
          setLoading(false);
        }

        // New user - move to next step
        setStep(step + 1);
        return;
      }
    }

    // Step 2: Language Selection
    if (step === 2) {
      setStep(step + 1);
      return;
    }

    // Step 3: Mobile Verification
    if (step === 3) {
      if (!otpSent) {
        // Send OTP
        await sendOTP();
        return;
      } else {
        // Verify OTP
        const verified = await verifyOTP();
        if (!verified) return;
        
        // Move to create PIN step
        setStep(step + 1);
        return;
      }
    }

    if (step === 4) {
      if (!isConfirming) {
         if (pin.join('').length !== 4) {
            Alert.alert('Error', t('Please enter a 4-digit PIN.'));
            return;
         }
         setIsConfirming(true);
         return;
      } else {
         if (confirmPin.join('').length !== 4) {
            Alert.alert('Error', t('Please confirm your 4-digit PIN.'));
            return;
         }
         if (pin.join('') !== confirmPin.join('')) {
            Alert.alert('Error', t('PINs do not match. Please try again.'));
            setConfirmPin(['', '', '', '']);
            pinRefs.current[0]?.focus();
            return;
         }
      }
      
      const pinString = pin.join('');
      setStorePin(pinString);
      
      // Save profile to Supabase
      setLoading(true);
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        // Hash PIN
        let hash = 0;
        for (let i = 0; i < pinString.length; i++) {
          hash = (hash * 31 + pinString.charCodeAt(i)) & 0xffffffff;
        }
        const hashedPin = Math.abs(hash).toString(16);

        const { error } = await supabase.from('profiles').upsert({
          id: userData.user.id,
          language,
          mobile: mobileNumber,
          email,
          pin: hashedPin,
        });
        
        setLoading(false);
        if (error) {
          Alert.alert('Error saving profile', error.message);
          return;
        }
      } else {
        setLoading(false);
      }
      
      // Check if device supports biometrics
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        setBiometricType('face');
        setStep(5);
        return;
      } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        setBiometricType('fingerprint');
        setStep(5);
        return;
      }
      
      // No biometrics supported, flow complete
      setAppLocked(false);
      router.replace('/(tabs)/home');
      return;
    }

    if (step === 5) {
      setLoading(true);
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
         await supabase.from('profiles').update({ biometrics_enabled: true }).eq('id', userData.user.id);
      }
      setAppLocked(false);
      router.replace('/(tabs)/home');
      return;
    }

    if (step < 5) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step === 4 && isConfirming) {
      setIsConfirming(false);
      setConfirmPin(['', '', '', '']);
      return;
    }
    
    // Step 3 (Mobile) back logic
    if (step === 3) {
      if (otpSent) {
        setOtpSent(false);
        setOtp(['', '', '', '', '', '']);
        return;
      }
    }
    
    // Step 1 (Email) back logic
    if (step === 1) {
      if (emailVerified) {
        setEmailVerified(false);
        return;
      } else if (emailOtpSent) {
        setEmailOtpSent(false);
        setEmailOtp(['', '', '', '', '', '']);
        return;
      }
    }

    if (step > 1) {
      setStep(step - 1);
    } else {
      router.back();
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    setLoading(false);
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      handleNext();
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>{t("Email Verification")}</Text>
      <Text style={styles.stepSubtitle}>
        {!emailOtpSent ? t("Establish a secure recovery method") : t("Enter the 6-digit code sent to your email")}
      </Text>

      {!emailOtpSent ? (
        <>
          <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignIn} disabled={loading}>
            <Text style={styles.googleButtonText}>{t("Continue with Google")}</Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>{t("OR")}</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInputFull}
              placeholder={t("Email Address")}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              placeholderTextColor="#999"
            />
          </View>
        </>
      ) : (
        <View style={styles.otpContainer}>
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <TextInput
              key={`email-otp-${index}`}
              ref={(ref) => {
                emailOtpRefs.current[index] = ref;
              }}
              style={styles.otpBox}
              keyboardType="number-pad"
              maxLength={1}
              value={emailOtp[index]}
              onChangeText={(val) => handleEmailOtpChange(val, index)}
              onKeyPress={({ nativeEvent }) => handleEmailOtpKeyPress(nativeEvent.key, index)}
            />
          ))}
        </View>
      )}
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>{t("Select Language")}</Text>
      <Text style={styles.stepSubtitle}>{t("Choose your preferred language to continue")}</Text>
      
      <View style={styles.optionsContainer}>
        {languages.map((lang) => (
          <TouchableOpacity 
            key={lang} 
            style={[styles.optionCard, language === lang && styles.optionCardSelected]}
            onPress={() => setLanguage(lang)}
            activeOpacity={0.7}
          >
            <Text style={[styles.optionText, language === lang && styles.optionTextSelected]}>
              {lang}
            </Text>
            {language === lang && (
              <View style={styles.checkCircle}>
                <Check color="#FFF" size={16} strokeWidth={3} />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>{t("Mobile Verification")}</Text>
      <Text style={styles.stepSubtitle}>
        {otpSent ? t("Enter the 6-digit code sent to your number") : t("Enter your mobile number to register")}
      </Text>

      {!otpSent ? (
        <View style={styles.inputWrapper}>
          <View style={styles.inputPrefix}>
            <Text style={styles.prefixText}>+91</Text>
          </View>
          <TextInput
            style={styles.textInput}
            placeholder={t("Mobile Number")}
            keyboardType="phone-pad"
            maxLength={10}
            value={mobileNumber}
            onChangeText={setMobileNumber}
            placeholderTextColor="#999"
          />
        </View>
      ) : (
        <View style={styles.otpContainer}>
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                otpRefs.current[index] = ref;
              }}
              style={styles.otpBox}
              keyboardType="number-pad"
              maxLength={1}
              value={otp[index]}
              onChangeText={(val) => handleOtpChange(val, index)}
              onKeyPress={({ nativeEvent }) => handleOtpKeyPress(nativeEvent.key, index)}
            />
          ))}
        </View>
      )}

      {!otpSent ? (
        <TouchableOpacity style={styles.secondaryButton} onPress={sendOTP} disabled={loading}>
          {loading ? <ActivityIndicator color={colors.primary} /> : <Text style={styles.secondaryButtonText}>{t("Send OTP")}</Text>}
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.textButton} onPress={sendOTP} disabled={loading}>
          <Text style={styles.textButtonText}>{t("Resend Code")}</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>{isConfirming ? t("Confirm PIN") : t("Create Security PIN")}</Text>
      <Text style={styles.stepSubtitle}>
        {isConfirming ? t("Please re-enter your 4-digit PIN") : t("Set a 4-digit PIN for quick access")}
      </Text>

      <View style={styles.pinContainer}>
        {[0, 1, 2, 3].map((index) => (
          <View key={index} style={[styles.pinBox, (isConfirming ? confirmPin[index] : pin[index]) ? styles.pinBoxFilled : null]}>
            <TextInput
              ref={(ref) => {
                pinRefs.current[index] = ref;
              }}
              style={styles.pinInput}
              keyboardType="number-pad"
              maxLength={1}
              secureTextEntry
              value={isConfirming ? confirmPin[index] : pin[index]}
              onChangeText={(val) => handlePinChange(val, index)}
              onKeyPress={({ nativeEvent }) => handlePinKeyPress(nativeEvent.key, index)}
            />
          </View>
        ))}
      </View>
    </View>
  );

  const renderStep5 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>{t("Enable Biometrics")}</Text>
      <Text style={styles.stepSubtitle}>
        {t("Use")} {biometricType === 'face' ? t('Face ID') : t('Fingerprint')} {t("to unlock your app securely and instantly.")}
      </Text>
      
      <View style={{ alignItems: 'center', marginTop: 40, marginBottom: 40 }}>
        <View style={styles.iconCircle}>
          <FingerprintPattern color={colors.primary} size={64} />
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ChevronLeft color="#333" size={24} />
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${(step / 5) * 100}%` }]} />
        </View>
        <Text style={styles.stepIndicator}>{step} / 5</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
        {step === 5 && renderStep5()}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.primaryButton, loading && { opacity: 0.7 }]} 
          onPress={handleNext} 
          activeOpacity={0.8}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryButtonText}>
              {step === 5
                ? t('Enable') + ' ' + (biometricType === 'face' ? t('Face ID') : t('Fingerprint'))
                : step === 4 
                ? t('Complete Setup') 
                : step === 3 
                  ? (!otpSent ? t('Send OTP') : t('Verify Mobile'))
                  : step === 2 
                    ? t('Continue')
                    : (!emailOtpSent ? t('Send OTP') : t('Verify Email'))}
            </Text>
          )}
        </TouchableOpacity>

        {step === 5 && (
          <TouchableOpacity 
            style={styles.textButton} 
            onPress={async () => {
               setLoading(true);
               const { data: userData } = await supabase.auth.getUser();
               if (userData?.user) {
                  await supabase.from('profiles').update({ biometrics_enabled: false }).eq('id', userData.user.id);
               }
               setAppLocked(false);
               router.replace('/(tabs)/home');
            }}
            disabled={loading}
          >
            <Text style={styles.textButtonText}>{t("Skip for now")}</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
    height: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  progressContainer: {
    flex: 1,
    height: 6,
    backgroundColor: colors.surfaceBorder,
    borderRadius: 3,
    marginRight: 16,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  stepIndicator: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 32,
    lineHeight: 24,
  },
  
  // Step 1: Language
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.surfaceBorder,
    backgroundColor: colors.surface,
  },
  optionCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  optionTextSelected: {
    color: colors.primary,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Step 2 & 3: Inputs
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.surfaceBorder,
    borderRadius: 16,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  inputPrefix: {
    paddingHorizontal: 16,
    paddingVertical: 18,
    backgroundColor: colors.surfaceBorder,
    borderRightWidth: 1,
    borderRightColor: colors.divider,
  },
  prefixText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 18,
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  textInputFull: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 18,
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  secondaryButton: {
    marginTop: 20,
    backgroundColor: colors.primaryLight,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  textButton: {
    marginTop: 24,
    alignItems: 'center',
  },
  textButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },

  // OTP
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  otpBox: {
    width: '15%',
    aspectRatio: 1,
    borderWidth: 2,
    borderColor: colors.surfaceBorder,
    borderRadius: 12,
    backgroundColor: colors.surface,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 0,
    color: colors.text,
  },

  // Step 3: Social
  googleButton: {
    backgroundColor: colors.surface,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.divider,
  },
  dividerText: {
    marginHorizontal: 16,
    color: colors.textMuted,
    fontWeight: '600',
    fontSize: 14,
  },

  // Step 4: PIN
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 20,
  },
  pinBox: {
    width: 60,
    height: 70,
    borderWidth: 2,
    borderColor: colors.surfaceBorder,
    borderRadius: 16,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinBoxFilled: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  pinInput: {
    width: '100%',
    height: '100%',
    textAlign: 'center',
    padding: 0,
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
  },

  // Footer
  footer: {
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    backgroundColor: colors.background,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 18,
    borderRadius: 9999,
    alignItems: 'center',
    boxShadow: `0px 4px 8px ${colors.primary}4D`,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.surfaceBorder,
  },
});
