import { Tabs } from 'expo-router';
import { Home, Settings } from '@tamagui/lucide-icons';

export default function TabsLayout() {
   return (
      <Tabs
         screenOptions={{
            tabBarActiveTintColor: '#007AFF',
            headerShown: false,
         }}
      >
         <Tabs.Screen
            name="index"
            options={{
               title: '首页',
               tabBarIcon: ({ color }) => <Home size={24} color={color} />,
            }}
         />
         <Tabs.Screen
            name="settings"
            options={{
               title: '设置',
               tabBarIcon: ({ color }) => <Settings size={24} color={color} />,
            }}
         />
      </Tabs>
   );
}
