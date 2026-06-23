import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform, TextInput, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Check } from 'lucide-react-native';

export default function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  
  // Step 1 State
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const languages = ['English', 'Hindi', 'Marathi', 'Tamil', 'Telugu'];

  // Step 2 State
  const [mobileNumber, setMobileNumber] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);

  // Step 3 State
  const [email, setEmail] = useState('');

  // Step 4 State
  const [pin, setPin] = useState(['', '', '', '']);
  const [confirmPin, setConfirmPin] = useState(['', '', '', '']);
  const [isConfirming, setIsConfirming] = useState(false);

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      // Flow complete, go to dashboard
      router.replace('/dashboard');
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      router.back();
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
            style={[styles.optionCard, selectedLanguage === lang && styles.optionCardSelected]}
            onPress={() => setSelectedLanguage(lang)}
            activeOpacity={0.7}
          >
            <Text style={[styles.optionText, selectedLanguage === lang && styles.optionTextSelected]}>
              {lang}
            </Text>
            {selectedLanguage === lang && (
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
              }}
            />
          ))}
        </View>
      )}

      {!otpSent ? (
        <TouchableOpacity style={styles.secondaryButton} onPress={() => setOtpSent(true)}>
          <Text style={styles.secondaryButtonText}>Send OTP</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.textButton} onPress={() => setOtpSent(false)}>
          <Text style={styles.textButtonText}>Resend Code</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Email Verification</Text>
      <Text style={styles.stepSubtitle}>Establish a secure recovery method</Text>

      <TouchableOpacity style={styles.googleButton}>
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ChevronLeft color="#333" size={24} />
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${(step / 4) * 100}%` }]} />
        </View>
        <Text style={styles.stepIndicator}>{step} / 4</Text>
      </View>

      {/* Main Content Area */}
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
      </ScrollView>

      {/* Footer / Continue Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.primaryButton} onPress={handleNext} activeOpacity={0.8}>
          <Text style={styles.primaryButtonText}>
            {step === 4 ? 'Complete Setup' : 'Continue'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    height: Platform.OS === 'web' ? '100vh' : '100%',
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
