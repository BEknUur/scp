import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { Role } from '@/enums';
import { View, ActivityIndicator } from 'react-native';

function RootLayoutNav() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inConsumerGroup = segments[0] === '(consumer)';
    const inSupplierGroup = segments[0] === '(supplier)';

    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      if (!inAuthGroup) {
        router.replace('/(auth)/login');
      }
    } else {
      // Redirect based on role
      if (inAuthGroup) {
        if (user?.role === Role.CONSUMER) {
          router.replace('/(consumer)');
        } else if (user?.role === Role.SUPPLIER_OWNER) {
          router.replace('/(supplier)');
        }
      } else {
        // Check if user is in correct role group
        if (user?.role === Role.CONSUMER && !inConsumerGroup) {
          router.replace('/(consumer)');
        } else if (user?.role === Role.SUPPLIER_OWNER && !inSupplierGroup) {
          router.replace('/(supplier)');
        }
      }
    }
  }, [isAuthenticated, isLoading, segments, user]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <RootLayoutNav />
        <StatusBar style="auto" />
      </AuthProvider>
    </ThemeProvider>
  );
}
