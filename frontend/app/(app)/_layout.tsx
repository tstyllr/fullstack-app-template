import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/components/molecules/auth-context';

export default function AppLayout() {
   const { isAuthenticated, isLoading } = useAuth();

   // Show nothing while checking authentication status
   if (isLoading) {
      return null;
   }

   // Redirect to login if not authenticated
   if (!isAuthenticated) {
      return <Redirect href="/(auth)/login" />;
   }

   return (
      <Stack>
         <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
         <Stack.Screen name="settings/theme" options={{ headerShown: false }} />
         <Stack.Screen
            name="settings/account"
            options={{ headerShown: false }}
         />
         <Stack.Screen
            name="settings/change-password"
            options={{ headerShown: false }}
         />
         <Stack.Screen
            name="modal"
            options={{ presentation: 'modal', title: 'Modal' }}
         />
      </Stack>
   );
}
