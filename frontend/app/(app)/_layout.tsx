import { Stack } from 'expo-router';

export default function AppLayout() {
   return (
      <Stack
         screenOptions={{
            headerShown: true,
         }}
      >
         <Stack.Screen
            name="(home)"
            options={{
               headerShown: false,
            }}
         />
         <Stack.Screen
            name="settings"
            options={{
               title: '设置',
            }}
         />
      </Stack>
   );
}
