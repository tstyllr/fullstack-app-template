import React from 'react';
import {
   DrawerContentScrollView,
   DrawerItem,
   DrawerContentComponentProps,
} from '@react-navigation/drawer';
import { YStack } from 'tamagui';
import { Settings } from '@tamagui/lucide-icons';
import { useRouter } from 'expo-router';

export function CustomDrawerContent(props: DrawerContentComponentProps) {
   const router = useRouter();

   return (
      <DrawerContentScrollView {...props}>
         <YStack flex={1} padding="$4">
            <DrawerItem
               label="设置"
               icon={({ color, size }) => (
                  <Settings color={color} size={size} />
               )}
               onPress={() => {
                  props.navigation.closeDrawer();
                  router.push('/(app)/settings');
               }}
               activeBackgroundColor="#007AFF20"
               activeTintColor="#007AFF"
            />
         </YStack>
      </DrawerContentScrollView>
   );
}
