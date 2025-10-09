import { ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider } from '@/components/molecules/auth-context';
import { ThemeProvider } from '@/components/molecules/theme-context';
import { nativeDarkTheme, nativeLightTheme } from '@/constants/theme';

function RootLayoutNav() {
   const colorScheme = useColorScheme();

   return (
      <NavigationThemeProvider
         value={colorScheme === 'dark' ? nativeDarkTheme : nativeLightTheme}
      >
         <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(app)" />
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
