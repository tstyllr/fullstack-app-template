import {
   YStack,
   H1,
   H2,
   Text,
   Button,
   Card,
   XStack,
   ScrollView,
} from 'tamagui';
import { Heart, Star, Zap } from '@tamagui/lucide-icons';
import { useState } from 'react';
import Animated, {
   useSharedValue,
   useAnimatedStyle,
   withSpring,
} from 'react-native-reanimated';

export default function HomeScreen() {
   const [count, setCount] = useState(0);
   const scale = useSharedValue(1);

   const animatedStyle = useAnimatedStyle(() => {
      return {
         transform: [{ scale: scale.value }],
      };
   });

   const handlePress = () => {
      setCount(count + 1);
      scale.value = withSpring(1.2, {}, () => {
         scale.value = withSpring(1);
      });
   };

   return (
      <ScrollView>
         <YStack
            flex={1}
            backgroundColor="$background"
            paddingHorizontal="$4"
            paddingTop="$6"
            paddingBottom="$6"
         >
            <YStack space="$4">
               <H1>欢迎使用 Tamagui</H1>
               <Text color="$gray11" fontSize="$5">
                  一个全栈应用模板，支持 iOS、Android 和 Web
               </Text>

               <Animated.View style={animatedStyle}>
                  <Card
                     elevate
                     size="$4"
                     bordered
                     backgroundColor="$blue4"
                     marginVertical="$4"
                     padding="$4"
                  >
                     <H2 color="$blue11">点击次数: {count}</H2>
                     <Button
                        onPress={handlePress}
                        marginTop="$3"
                        theme="blue"
                        icon={<Zap size={20} />}
                     >
                        点击我！
                     </Button>
                  </Card>
               </Animated.View>

               <YStack space="$3">
                  <H2>功能特性</H2>

                  <Card bordered padding="$3">
                     <XStack space="$3" alignItems="center">
                        <Heart size={24} color="$red10" />
                        <YStack flex={1}>
                           <Text fontWeight="bold">Tamagui UI</Text>
                           <Text color="$gray11" fontSize="$3">
                              高性能的跨平台组件库
                           </Text>
                        </YStack>
                     </XStack>
                  </Card>

                  <Card bordered padding="$3">
                     <XStack space="$3" alignItems="center">
                        <Star size={24} color="$yellow10" />
                        <YStack flex={1}>
                           <Text fontWeight="bold">Expo Router</Text>
                           <Text color="$gray11" fontSize="$3">
                              基于文件的路由系统
                           </Text>
                        </YStack>
                     </XStack>
                  </Card>

                  <Card bordered padding="$3">
                     <XStack space="$3" alignItems="center">
                        <Zap size={24} color="$blue10" />
                        <YStack flex={1}>
                           <Text fontWeight="bold">动画支持</Text>
                           <Text color="$gray11" fontSize="$3">
                              React Native Reanimated
                           </Text>
                        </YStack>
                     </XStack>
                  </Card>
               </YStack>
            </YStack>
         </YStack>
      </ScrollView>
   );
}
