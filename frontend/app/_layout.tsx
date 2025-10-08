import {
   DarkTheme,
   DefaultTheme,
   ThemeProvider as NavigationThemeProvider,
} from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect } from 'react';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/components/molecules/auth-context';
import { ThemeProvider } from '@/components/molecules/theme-context';

export const unstable_settings = {
   anchor: '(tabs)',
};

function RootLayoutNav() {
   const colorScheme = useColorScheme();
   const { isAuthenticated, isLoading } = useAuth();
   const segments = useSegments();
   const router = useRouter();

   useEffect(() => {
      if (isLoading) return;

      const inAuthGroup = segments[0] === '(auth)';

      if (!isAuthenticated && !inAuthGroup) {
         // Redirect to login if not authenticated
         router.replace('/(auth)/login');
      } else if (isAuthenticated && inAuthGroup) {
         // Redirect to main app if authenticated
         router.replace('/(tabs)');
      }
   }, [isAuthenticated, isLoading, segments, router]);

   return (
      <NavigationThemeProvider
         value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
      >
         <Stack>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="theme" options={{ headerShown: false }} />
            <Stack.Screen name="account" options={{ headerShown: false }} />
            <Stack.Screen
               name="change-password"
               options={{ headerShown: false }}
            />
            <Stack.Screen
               name="modal"
               options={{ presentation: 'modal', title: 'Modal' }}
            />
         </Stack>
         <StatusBar style="auto" />
      </NavigationThemeProvider>
   );
}

export default function RootLayout() {
   return (
      <ThemeProvider>
         <AuthProvider>
            <RootLayoutNav />
         </AuthProvider>
      </ThemeProvider>
   );
}
