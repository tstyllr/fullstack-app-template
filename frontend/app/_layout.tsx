import { Stack } from 'expo-router';
import { TamaguiProvider, Theme } from 'tamagui';
import { useColorScheme } from 'react-native';
import config from '../tamagui.config';

export default function RootLayout() {
   const colorScheme = useColorScheme();

   return (
      <TamaguiProvider
         config={config}
         defaultTheme={colorScheme === 'dark' ? 'dark' : 'light'}
      >
         <Theme name={colorScheme === 'dark' ? 'dark' : 'light'}>
            <Stack>
               <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
               <Stack.Screen
                  name="+not-found"
                  options={{ title: '页面未找到' }}
               />
            </Stack>
         </Theme>
      </TamaguiProvider>
   );
}
