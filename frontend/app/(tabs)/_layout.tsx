import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/atoms/haptic-tab';
import { IconSymbol } from '@/components/atoms/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
   const colorScheme = useColorScheme();

   return (
      <Tabs
         screenOptions={{
            tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
            headerShown: false,
            tabBarButton: HapticTab,
         }}
      >
         <Tabs.Screen
            name="index"
            options={{
               title: '首页',
               tabBarIcon: ({ color }) => (
                  <IconSymbol size={28} name="house.fill" color={color} />
               ),
            }}
         />
         <Tabs.Screen
            name="setting"
            options={{
               title: '设置',
               tabBarIcon: ({ color }) => (
                  <IconSymbol size={28} name="gear.circle.fill" color={color} />
               ),
            }}
         />
         <Tabs.Screen
            name="theme"
            options={{
               href: null, // 不在 tab bar 中显示
               title: '主题',
            }}
         />
      </Tabs>
   );
}
