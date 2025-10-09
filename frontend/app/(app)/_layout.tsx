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
         <Stack.Screen name="settings/theme" options={{ title: '主题' }} />
         <Stack.Screen
            name="settings/account"
            options={{ title: '账号设置' }}
         />
         <Stack.Screen
            name="settings/change-password"
            options={{ title: '修改密码' }}
         />
         <Stack.Screen
            name="modal"
            options={{ presentation: 'modal', title: 'Modal' }}
         />
      </Stack>
   );
}
