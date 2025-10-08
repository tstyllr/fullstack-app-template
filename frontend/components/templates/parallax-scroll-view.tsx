import type { PropsWithChildren, ReactElement } from 'react';
import { StyleSheet, Pressable } from 'react-native';
import Animated, {
   interpolate,
   useAnimatedRef,
   useAnimatedStyle,
   useScrollOffset,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/atoms/themed-view';
import { IconSymbol } from '@/components/atoms/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Spacing } from '@/constants/theme';

const HEADER_HEIGHT = 250;

type Props = PropsWithChildren<{
   headerImage: ReactElement;
   headerBackgroundColor: { dark: string; light: string };
   showBackButton?: boolean;
}>;

export default function ParallaxScrollView({
   children,
   headerImage,
   headerBackgroundColor,
   showBackButton = false,
}: Props) {
   const backgroundColor = useThemeColor({}, 'background');
   const colorScheme = useColorScheme() ?? 'light';
   const router = useRouter();
   const insets = useSafeAreaInsets();
   const scrollRef = useAnimatedRef<Animated.ScrollView>();
   const scrollOffset = useScrollOffset(scrollRef);

   const handleBackPress = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      router.back();
   };
   const headerAnimatedStyle = useAnimatedStyle(() => {
      return {
         transform: [
            {
               translateY: interpolate(
                  scrollOffset.value,
                  [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
                  [-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.75]
               ),
            },
            {
               scale: interpolate(
                  scrollOffset.value,
                  [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
                  [2, 1, 1]
               ),
            },
         ],
      };
   });

   return (
      <Animated.ScrollView
         ref={scrollRef}
         style={{ backgroundColor, flex: 1 }}
         scrollEventThrottle={16}
      >
         <Animated.View
            style={[
               styles.header,
               { backgroundColor: headerBackgroundColor[colorScheme] },
               headerAnimatedStyle,
            ]}
         >
            {headerImage}
            {showBackButton && (
               <Pressable
                  onPress={handleBackPress}
                  style={({ pressed }) => [
                     styles.backButton,
                     {
                        top: insets.top + Spacing.md,
                        backgroundColor:
                           colorScheme === 'dark'
                              ? 'rgba(255, 255, 255, 0.15)'
                              : 'rgba(0, 0, 0, 0.1)',
                        opacity: pressed ? 0.6 : 1,
                     },
                  ]}
               >
                  <IconSymbol
                     name="chevron.left"
                     size={24}
                     color={colorScheme === 'dark' ? '#fff' : '#000'}
                  />
               </Pressable>
            )}
         </Animated.View>
         <ThemedView style={styles.content}>{children}</ThemedView>
      </Animated.ScrollView>
   );
}

const styles = StyleSheet.create({
   container: {
      flex: 1,
   },
   header: {
      height: HEADER_HEIGHT,
      overflow: 'hidden',
   },
   content: {
      flex: 1,
      padding: 32,
      gap: 16,
      overflow: 'hidden',
   },
   backButton: {
      position: 'absolute',
      left: Spacing.md,
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
   },
});
