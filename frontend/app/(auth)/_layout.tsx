import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/components/molecules/auth-context';

export default function AuthLayout() {
   const { isAuthenticated, isLoading } = useAuth();

   // Show nothing while checking authentication status
   if (isLoading) {
      return null;
   }

   // Redirect to main app if already authenticated
   if (isAuthenticated) {
      return <Redirect href={'/(app)/(tabs)' as any} />;
   }

   return (
      <Stack
         screenOptions={{
            headerShown: false,
         }}
      >
         <Stack.Screen name="login" />
      </Stack>
   );
}
