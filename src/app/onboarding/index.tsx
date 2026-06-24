import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform, TextInput, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Check } from 'lucide-react-native';
import { useOnboardingStore } from '../../store/onboardingStore';
import { supabase } from '../../lib/supabase';

export default function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
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

  // Step 4 State
  const [pin, setPin] = useState(['', '', '', '']);
  const [confirmPin, setConfirmPin] = useState(['', '', '', '']);
  const [isConfirming, setIsConfirming] = useState(false);

  const sendOTP = async () => {
    console.log(`[sendOTP] Attempting to send OTP to: ${mobileNumber}`);
    if (mobileNumber.length !== 10) {
      console.log(`[sendOTP] Invalid mobile number entered: ${mobileNumber}`);
      Alert.alert('Invalid Number', 'Please enter a valid 10-digit mobile number.');
      return false;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      phone: '+91' + mobileNumber,
    });
    setLoading(false);
    
    if (error) {
      console.log(`[sendOTP] Failed to send OTP to +91${mobileNumber}. Error: ${error.message}`);
      Alert.alert('Error', error.message);
      return false;
    } else {
      console.log(`[sendOTP] Successfully sent OTP to +91${mobileNumber}`);
      setOtpSent(true);
      return true;
    }
  };

  const verifyOTP = async () => {
    const otpString = otp.join('');
    console.log(`[verifyOTP] Attempting to verify OTP: ${otpString} for number: ${mobileNumber}`);
    if (otpString.length !== 6) {
      console.log(`[verifyOTP] Invalid OTP length entered: ${otpString}`);
      Alert.alert('Invalid OTP', 'Please enter the 6-digit code.');
      return false;
    }
    setLoading(true);
    const { error, data } = await supabase.auth.verifyOtp({
      phone: '+91' + mobileNumber,
      token: otpString,
      type: 'sms',
    });
    setLoading(false);

    if (error) {
      console.log(`[verifyOTP] Verification failed for OTP: ${otpString}. Error: ${error.message}`);
      Alert.alert('Error', error.message);
      return false;
    } else if (data.session) {
      console.log(`[verifyOTP] Successfully verified OTP: ${otpString} for +91${mobileNumber}`);
      return true;
    }
    console.log(`[verifyOTP] Verification failed: No session returned for OTP: ${otpString}`);
    return false;
  };

  const handleNext = async () => {
    if (step === 2) {
      if (!otpSent) {
        // Send OTP
        await sendOTP();
        return;
      } else {
        // Verify OTP
        const verified = await verifyOTP();
        if (!verified) return;
      }
    }

    if (step === 4) {
      const pinString = isConfirming ? confirmPin.join('') : pin.join('');
      if (pinString.length !== 4 || (!isConfirming && pinString !== confirmPin.join(''))) {
         if (!isConfirming && pinString.length === 4) {
            setIsConfirming(true);
            return;
         }
         Alert.alert('Error', 'PINs do not match or are incomplete.');
         return;
      }
      
      setStorePin(pinString);
      
      // Save profile to Supabase
      setLoading(true);
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        const { error } = await supabase.from('profiles').upsert({
          id: userData.user.id,
          language,
          mobile: mobileNumber,
          email,
          pin: pinString,
        });
        
        setLoading(false);
        if (error) {
          Alert.alert('Error saving profile', error.message);
          return;
        }
      } else {
        setLoading(false);
      }
      
      // Flow complete, go to dashboard
      router.replace('/dashboard');
      return;
    }

    if (step < 4) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step === 4 && isConfirming) {
      setIsConfirming(false);
      setConfirmPin(['', '', '', '']);
      return;
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
      <Text style={styles.stepTitle}>Select Language</Text>
      <Text style={styles.stepSubtitle}>Choose your preferred language to continue</Text>
      
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

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Mobile Verification</Text>
      <Text style={styles.stepSubtitle}>
        {otpSent ? 'Enter the 6-digit code sent to your number' : 'Enter your mobile number to register'}
      </Text>

      {!otpSent ? (
        <View style={styles.inputWrapper}>
          <View style={styles.inputPrefix}>
            <Text style={styles.prefixText}>+91</Text>
          </View>
          <TextInput
            style={styles.textInput}
            placeholder="Mobile Number"
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
              style={styles.otpBox}
              keyboardType="number-pad"
              maxLength={1}
              value={otp[index]}
              onChangeText={(val) => {
                const newOtp = [...otp];
                newOtp[index] = val;
                setOtp(newOtp);
                // Auto-advance logic could go here
              }}
            />
          ))}
        </View>
      )}

      {!otpSent ? (
        <TouchableOpacity style={styles.secondaryButton} onPress={sendOTP} disabled={loading}>
          {loading ? <ActivityIndicator color="#E47656" /> : <Text style={styles.secondaryButtonText}>Send OTP</Text>}
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.textButton} onPress={sendOTP} disabled={loading}>
          <Text style={styles.textButtonText}>Resend Code</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Email Verification</Text>
      <Text style={styles.stepSubtitle}>Establish a secure recovery method</Text>

      <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignIn} disabled={loading}>
        <Text style={styles.googleButtonText}>Continue with Google</Text>
      </TouchableOpacity>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>OR</Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.textInputFull}
          placeholder="Email Address"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          placeholderTextColor="#999"
        />
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>{isConfirming ? 'Confirm PIN' : 'Create Security PIN'}</Text>
      <Text style={styles.stepSubtitle}>
        {isConfirming ? 'Please re-enter your 4-digit PIN' : 'Set a 4-digit PIN for quick access'}
      </Text>

      <View style={styles.pinContainer}>
        {[0, 1, 2, 3].map((index) => (
          <View key={index} style={[styles.pinBox, (isConfirming ? confirmPin[index] : pin[index]) ? styles.pinBoxFilled : null]}>
            <TextInput
              style={styles.pinInput}
              keyboardType="number-pad"
              maxLength={1}
              secureTextEntry
              value={isConfirming ? confirmPin[index] : pin[index]}
              onChangeText={(val) => {
                if (isConfirming) {
                  const newPin = [...confirmPin];
                  newPin[index] = val;
                  setConfirmPin(newPin);
                } else {
                  const newPin = [...pin];
                  newPin[index] = val;
                  setPin(newPin);
                  if (index === 3 && val) {
                    setTimeout(() => setIsConfirming(true), 300);
                  }
                }
              }}
            />
          </View>
        ))}
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
          <View style={[styles.progressBar, { width: `${(step / 4) * 100}%` }]} />
        </View>
        <Text style={styles.stepIndicator}>{step} / 4</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
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
              {step === 4 ? 'Complete Setup' : (step === 2 && !otpSent ? 'Send OTP' : 'Continue')}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    height: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  progressContainer: {
    flex: 1,
    height: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 3,
    marginRight: 16,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#E47656',
    borderRadius: 3,
  },
  stepIndicator: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
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
    color: '#1A1A1A',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#666',
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
    borderColor: '#F0F0F0',
    backgroundColor: '#FAFAFA',
  },
  optionCardSelected: {
    borderColor: '#E47656',
    backgroundColor: '#FFF5F2',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  optionTextSelected: {
    color: '#E47656',
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E47656',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Step 2 & 3: Inputs
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F0F0F0',
    borderRadius: 16,
    backgroundColor: '#FAFAFA',
    overflow: 'hidden',
  },
  inputPrefix: {
    paddingHorizontal: 16,
    paddingVertical: 18,
    backgroundColor: '#F0F0F0',
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
  },
  prefixText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 18,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  textInputFull: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 18,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  secondaryButton: {
    marginTop: 20,
    backgroundColor: '#FFF5F2',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#E47656',
    fontSize: 16,
    fontWeight: 'bold',
  },
  textButton: {
    marginTop: 24,
    alignItems: 'center',
  },
  textButtonText: {
    color: '#E47656',
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
    borderColor: '#F0F0F0',
    borderRadius: 12,
    backgroundColor: '#FAFAFA',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },

  // Step 3: Social
  googleButton: {
    backgroundColor: '#F4F4F4',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#EAEAEA',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#999',
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
    borderColor: '#F0F0F0',
    borderRadius: 16,
    backgroundColor: '#FAFAFA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinBoxFilled: {
    borderColor: '#E47656',
    backgroundColor: '#FFF5F2',
  },
  pinInput: {
    width: '100%',
    height: '100%',
    textAlign: 'center',
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },

  // Footer
  footer: {
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },
  primaryButton: {
    backgroundColor: '#E47656',
    paddingVertical: 18,
    borderRadius: 9999,
    alignItems: 'center',
    shadowColor: '#E47656',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
