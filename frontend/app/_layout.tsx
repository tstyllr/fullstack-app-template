import { Stack } from 'expo-router';
import { TamaguiProvider, Theme } from 'tamagui';
import { useColorScheme } from 'react-native';
import { QueryClientProvider } from '@tanstack/react-query';
import config from '../tamagui.config';
import { queryClient } from '@/lib/query-client';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';

function RootNavigator() {
   // 启用自动认证跳转
   useAuthRedirect();

   return (
      <Stack>
         <Stack.Screen name="(auth)" options={{ headerShown: false }} />
         <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
         <Stack.Screen name="+not-found" options={{ title: '页面未找到' }} />
      </Stack>
   );
}

export default function RootLayout() {
   const colorScheme = useColorScheme();

   return (
      <QueryClientProvider client={queryClient}>
         <TamaguiProvider
            config={config}
            defaultTheme={colorScheme === 'dark' ? 'dark' : 'light'}
         >
            <Theme name={colorScheme === 'dark' ? 'dark' : 'light'}>
               <RootNavigator />
            </Theme>
         </TamaguiProvider>
      </QueryClientProvider>
   );
}
