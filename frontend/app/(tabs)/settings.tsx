import {
   YStack,
   H1,
   Text,
   Button,
   Card,
   XStack,
   Switch,
   ScrollView,
} from 'tamagui';
import { Moon, Sun, Info } from '@tamagui/lucide-icons';
import { useState } from 'react';
import { useColorScheme } from 'react-native';
import { authClient } from '@/lib/auth-client';

export default function SettingsScreen() {
   const colorScheme = useColorScheme();
   const [notificationsEnabled, setNotificationsEnabled] = useState(true);

   return (
      <ScrollView backgroundColor="$background">
         <YStack flex={1} paddingHorizontal="$4" paddingTop="$6">
            <YStack space="$4">
               <H1>设置</H1>

               <YStack space="$3">
                  <Card bordered padding="$4">
                     <XStack justifyContent="space-between" alignItems="center">
                        <XStack space="$3" alignItems="center" flex={1}>
                           {colorScheme === 'dark' ? (
                              <Moon size={24} color="$blue10" />
                           ) : (
                              <Sun size={24} color="$yellow10" />
                           )}
                           <YStack flex={1}>
                              <Text fontWeight="bold">当前主题</Text>
                              <Text color="$gray11" fontSize="$3">
                                 {colorScheme === 'dark'
                                    ? '深色模式'
                                    : '浅色模式'}
                              </Text>
                           </YStack>
                        </XStack>
                     </XStack>
                  </Card>

                  <Card bordered padding="$4">
                     <XStack justifyContent="space-between" alignItems="center">
                        <XStack space="$3" alignItems="center" flex={1}>
                           <Info size={24} color="$gray10" />
                           <YStack flex={1}>
                              <Text fontWeight="bold">通知</Text>
                              <Text color="$gray11" fontSize="$3">
                                 接收应用通知
                              </Text>
                           </YStack>
                        </XStack>
                        <Switch
                           size="$3"
                           checked={notificationsEnabled}
                           onCheckedChange={setNotificationsEnabled}
                        >
                           <Switch.Thumb animation="quick" />
                        </Switch>
                     </XStack>
                  </Card>

                  <Card bordered padding="$4" backgroundColor="$blue2">
                     <YStack space="$2">
                        <Text fontWeight="bold" color="$blue11">
                           关于本应用
                        </Text>
                        <Text color="$gray11" fontSize="$3">
                           这是一个使用 Expo + Tamagui 构建的全栈应用模板
                        </Text>
                        <Text color="$gray11" fontSize="$3">
                           版本: 1.0.0
                        </Text>
                     </YStack>
                  </Card>
               </YStack>

               <Button theme="blue">保存设置</Button>
               <Button
                  theme="red"
                  onPress={() => {
                     authClient.signOut();
                  }}
               >
                  退出登陆
               </Button>
            </YStack>
         </YStack>
      </ScrollView>
   );
}
