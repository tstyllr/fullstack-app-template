import type { PropsWithChildren, ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
   interpolate,
   useAnimatedRef,
   useAnimatedStyle,
   useScrollOffset,
} from 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useResponsive } from '@/hooks/use-responsive';
import { Layout } from '@/constants/theme';

const HEADER_HEIGHT = 250;

type Props = PropsWithChildren<{
   headerImage: ReactElement;
   headerBackgroundColor: { dark: string; light: string };
   /**
    * 最大宽度尺寸，默认为 'md' (768px)
    */
   maxWidth?: keyof typeof Layout.maxWidth;
}>;

export default function ParallaxScrollView({
   children,
   headerImage,
   headerBackgroundColor,
   maxWidth = 'md',
}: Props) {
   const backgroundColor = useThemeColor({}, 'background');
   const colorScheme = useColorScheme() ?? 'light';
   const scrollRef = useAnimatedRef<Animated.ScrollView>();
   const scrollOffset = useScrollOffset(scrollRef);
   const { shouldConstrainWidth } = useResponsive();

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
         contentContainerStyle={
            shouldConstrainWidth && styles.scrollContentCenter
         }
      >
         <View
            style={[
               styles.contentWrapper,
               shouldConstrainWidth && {
                  maxWidth: Layout.maxWidth[maxWidth],
                  width: '100%',
               },
            ]}
         >
            <Animated.View
               style={[
                  styles.header,
                  { backgroundColor: headerBackgroundColor[colorScheme] },
                  headerAnimatedStyle,
               ]}
            >
               {headerImage}
            </Animated.View>
            <View style={styles.content}>{children}</View>
         </View>
      </Animated.ScrollView>
   );
}

const styles = StyleSheet.create({
   scrollContentCenter: {
      alignItems: 'center',
   },
   contentWrapper: {
      width: '100%',
   },
   container: {
      flex: 1,
   },
   header: {
      height: HEADER_HEIGHT,
      overflow: 'hidden',
   },
   content: {
      flex: 1,
      overflow: 'hidden',
   },
});
