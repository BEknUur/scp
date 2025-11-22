import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { Role } from '@/enums';
import { View, ActivityIndicator } from 'react-native';

// Initialize i18n
import '@/i18n';

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
      // Allow landing page and auth screens for non-authenticated users
      // Only redirect to login if trying to access protected routes
      if (inConsumerGroup || inSupplierGroup) {
        router.replace('/');
      }
    } else {
      // Redirect based on role
      if (inAuthGroup || segments[0] === undefined) {
        if (user?.role === Role.CONSUMER) {
          router.replace('/(consumer)');
        } else if (user?.role === Role.SUPPLIER_OWNER || user?.role === Role.SUPPLIER_MANAGER || user?.role === Role.SUPPLIER_SALES) {
          router.replace('/(supplier)');
        }
      } else {
        // Check if user is in correct role group
        if (user?.role === Role.CONSUMER && !inConsumerGroup) {
          router.replace('/(consumer)');
        } else if ((user?.role === Role.SUPPLIER_OWNER || user?.role === Role.SUPPLIER_MANAGER || user?.role === Role.SUPPLIER_SALES) && !inSupplierGroup) {
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
        <CartProvider>
          <ToastProvider>
            <RootLayoutNav />
            <StatusBar style="auto" />
          </ToastProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
