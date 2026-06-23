import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ShieldCheck, ArrowRight } from 'lucide-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withDelay, 
  withSpring 
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WelcomeScreen() {
  const fadeAnim = useSharedValue(0);
  const slideAnim = useSharedValue(50);

  useEffect(() => {
    fadeAnim.value = withTiming(1, { duration: 1000 });
    slideAnim.value = withSpring(0, { damping: 12, stiffness: 90 });
  }, []);

  const animatedStyles = useAnimatedStyle(() => {
    return {
      opacity: fadeAnim.value,
      transform: [{ translateY: slideAnim.value }],
    };
  });

  return (
    <SafeAreaView className="flex-1 bg-[#eeeeee]">
      <View className="flex-1 px-6 justify-center">
        
        {/* Logo / Header Section */}
        <Animated.View style={animatedStyles} className="items-center mb-12">
          <View className="bg-black/5 p-4 rounded-full mb-6">
            <ShieldCheck size={48} color="#000000" strokeWidth={1.5} />
          </View>
          <Text className="text-4xl font-extrabold text-black mb-2 text-center">
            Udofin
          </Text>
          <Text className="text-base text-gray-500 text-center px-4 leading-6">
            Your trusted financial partner for instant loans and seamless wealth management.
          </Text>
        </Animated.View>

        {/* Features / Benefits */}
        <Animated.View style={[animatedStyles, { marginTop: 20 }]} className="space-y-6 mb-16">
          {[
            { title: 'Lightning Fast', desc: 'Get approved in minutes, not days.' },
            { title: 'Bank-Grade Security', desc: 'Your data is encrypted and secure.' },
            { title: 'Zero Hidden Fees', desc: 'Transparent pricing, always.' },
          ].map((feature, idx) => (
            <View key={idx} className="flex-row items-center bg-white p-4 rounded-2xl shadow-sm">
              <View className="w-2 h-2 rounded-full bg-black mr-4" />
              <View>
                <Text className="text-black font-bold text-lg">{feature.title}</Text>
                <Text className="text-gray-500 text-sm mt-1">{feature.desc}</Text>
              </View>
            </View>
          ))}
        </Animated.View>

        {/* Call to Action */}
        <Animated.View style={animatedStyles} className="mt-auto mb-8">
          <TouchableOpacity 
            activeOpacity={0.8}
            className="bg-black py-4 px-6 rounded-full flex-row items-center justify-center shadow-lg"
          >
            <Text className="text-white font-bold text-lg mr-2">Get Started</Text>
            <ArrowRight size={20} color="#ffffff" />
          </TouchableOpacity>
          <TouchableOpacity className="mt-6 items-center">
            <Text className="text-gray-600 font-medium">Log in to your account</Text>
          </TouchableOpacity>
        </Animated.View>

      </View>
    </SafeAreaView>
  );
}
