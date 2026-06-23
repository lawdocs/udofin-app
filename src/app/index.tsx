import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, StyleSheet, Platform } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#E47656" />
      
      {/* Main Content Area */}
      <View style={styles.content}>
        
        {/* Logo Container */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>U</Text>
        </View>

        {/* Heading */}
        <Text style={styles.heading}>
          Welcome to{'\n'}Udofin
        </Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Smart lending built for speed{'\n'}and control. Access your{'\n'}credit instantly.
        </Text>
      </View>

      {/* Bottom Button Area */}
      <View style={styles.buttonArea}>
        {/* Outer translucent glow/ring */}
        <View style={styles.buttonOuter}>
          {/* Inner White Button */}
          <TouchableOpacity 
            style={styles.buttonInner}
            activeOpacity={0.9}
            onPress={() => router.push('/onboarding')}
          >
            <Text style={styles.buttonText}>
              Continue to Dashboard
            </Text>
            <ChevronRight color="#E47656" size={22} strokeWidth={3} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E47656',
    width: '100%',
    height: Platform.OS === 'web' ? '100vh' : '100%',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    width: '100%',
  },
  logoContainer: {
    width: 110,
    height: 110,
    backgroundColor: '#F4F4F4',
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logoText: {
    color: '#000',
    fontWeight: '900',
    fontSize: 64,
    letterSpacing: -2,
    marginTop: -8,
  },
  heading: {
    color: '#FFF',
    fontSize: 42,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 48,
    marginBottom: 20,
    letterSpacing: -1,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 28,
    fontWeight: '500',
    paddingHorizontal: 16,
  },
  buttonArea: {
    paddingHorizontal: 24,
    paddingBottom: 48,
    width: '100%',
  },
  buttonOuter: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    padding: 6,
    borderRadius: 9999,
  },
  buttonInner: {
    backgroundColor: '#FFF',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    borderRadius: 9999,
  },
  buttonText: {
    color: '#E47656',
    fontWeight: 'bold',
    fontSize: 18,
    marginRight: 4,
  },
});
