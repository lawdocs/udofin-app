import "../global.css";
import { Stack, useRouter, useSegments } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ActivityIndicator, View } from 'react-native';
import { useTheme } from '../lib/theme';
import { useAuthStore } from '../store/authStore';

const queryClient = new QueryClient();

function InitialLayout() {
  const router = useRouter();
  const segments = useSegments();
  const [initializing, setInitializing] = useState(true);
  const [initialRoute, setInitialRoute] = useState<string | null>(null);

  const { isAppLocked } = useAuthStore();

  // 1. One-time Initialization
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      console.log("[initAuth] Starting...");
      try {
        console.log("[initAuth] Fetching session...");
        const { data: { session } } = await supabase.auth.getSession();
        console.log("[initAuth] Session fetched:", !!session);
        if (!mounted) return;

        if (session) {
          console.log("[initAuth] Fetching profile for user:", session.user.id);
          const { data: profile } = await supabase
            .from('profiles')
            .select('pin')
            .eq('id', session.user.id)
            .single();
          console.log("[initAuth] Profile fetched, hasPin:", !!profile?.pin);

          if (!mounted) return;
          
          const hasPin = !!profile?.pin;
          
          if (hasPin && isAppLocked) {
            setInitialRoute('/biometric-lock');
          } else if (!hasPin) {
            // Not fully onboarded
            setInitialRoute('/');
          }
        } else {
           setInitialRoute('/');
        }
      } catch (e) {
        console.error("[initAuth] Error:", e);
      } finally {
        console.log("[initAuth] Finally block reached. Setting initializing to false.");
        if (mounted) setInitializing(false);
      }
    };
    
    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      try {
        if (event === 'SIGNED_IN' && session) {
          const { data: profile } = await supabase.from('profiles').select('pin').eq('id', session.user.id).single();
          if (profile?.pin && isAppLocked) {
            router.replace('/biometric-lock');
          }
        } else if (event === 'SIGNED_OUT') {
          router.replace('/');
        }
      } catch (e) {
        // Do not crash the app on auth state change errors — silently log
        console.error('[onAuthStateChange] Error handling auth event:', event, e);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // 2. Continuous Route Protection
  useEffect(() => {
    if (initializing) return;

    if (initialRoute) {
       router.replace(initialRoute as any);
       setInitialRoute(null);
       return;
    }

    const checkRoute = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const inTabs = segments[0] === '(tabs)';
      const isProtected = inTabs || ['edit-profile', 'settings', 'documents', 'privacy-consent', 'change-mobile', 'change-pin', 'change-password', 'support', 'biometric-lock'].includes(segments[0] as string);
      
      if (!session && isProtected) {
        router.replace('/');
      } else if (session && isAppLocked && segments[0] !== 'biometric-lock') {
        router.replace('/biometric-lock');
      }
    };
    
    checkRoute();
  }, [segments, initializing, isAppLocked, initialRoute]);

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
