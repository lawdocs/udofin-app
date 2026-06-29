import "../global.css";
import { Stack, useRouter, useSegments } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ActivityIndicator, View } from 'react-native';
import { useTheme } from '../lib/theme';

const queryClient = new QueryClient();

function InitialLayout() {
  const router = useRouter();
  const segments = useSegments();
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;

        if (session) {
          // Check profile for onboarding completion AND biometrics preference
          const { data: profile } = await supabase
            .from('profiles')
            .select('pin, biometrics_enabled')
            .eq('id', session.user.id)
            .single();

          if (!mounted) return;

          const inTabs = segments[0] === '(tabs)';
          const onBiometricLock = segments[0] === 'biometric-lock';
          const onAuthPage = !segments.length || (segments[0] as string) === 'index' || (segments[0] as string) === 'onboarding';

          if (profile?.pin) {
            // Onboarding complete — always require lock screen for existing users
            if (onAuthPage) {
              router.replace('/biometric-lock');
            }
          } else if (!profile?.pin && inTabs) {
            // Onboarding not complete but somehow in tabs — send back
            router.replace('/');
          }
        } else {
          // No session — ensure they can't access protected routes
          const inTabs = segments[0] === '(tabs)';
          const isProtected = inTabs || segments[0] === 'edit-profile' || segments[0] === 'settings' || segments[0] === 'documents' || segments[0] === 'privacy-consent' || segments[0] === 'change-mobile' || segments[0] === 'change-pin' || segments[0] === 'change-password' || segments[0] === 'support';
          if (isProtected) {
            router.replace('/');
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        if (mounted) setInitializing(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      const inTabs = segments[0] === '(tabs)';
      const onAuthPage = !segments.length || (segments[0] as string) === 'index' || (segments[0] as string) === 'onboarding';

      if (session) {
        // Query profile to see if onboarding was completed
        const { data: profile } = await supabase
          .from('profiles')
          .select('pin, biometrics_enabled')
          .eq('id', session.user.id)
          .single();

        if (!mounted) return;

        if (profile?.pin && onAuthPage) {
          router.replace('/biometric-lock');
        }
      } else {
        // Logged out
        const isProtected = inTabs || segments[0] === 'edit-profile' || segments[0] === 'settings' || segments[0] === 'documents' || segments[0] === 'privacy-consent' || segments[0] === 'change-mobile' || segments[0] === 'change-pin' || segments[0] === 'change-password' || segments[0] === 'support';
        if (isProtected) {
          router.replace('/');
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [segments]);

  const { colors } = useTheme();

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      {/* Biometric lock screen — no swipe-back gesture */}
      <Stack.Screen name="biometric-lock" options={{ headerShown: false, gestureEnabled: false }} />
    </Stack>
  );
}

import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <InitialLayout />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
