import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';

const TypingIndicator = () => {
   const backgroundColor = useThemeColor({}, 'background');
   const textColor = useThemeColor({}, 'text');

   return (
      <View
         style={[
            styles.container,
            {
               backgroundColor:
                  backgroundColor === '#fff' ? '#f3f4f6' : '#374151',
            },
         ]}
      >
         <Dot delay={0} color={textColor} />
         <Dot delay={200} color={textColor} />
         <Dot delay={400} color={textColor} />
      </View>
   );
};

type DotProps = {
   delay: number;
   color: string;
};

const Dot = ({ delay, color }: DotProps) => {
   const opacity = useRef(new Animated.Value(0.3)).current;

   useEffect(() => {
      const animation = Animated.loop(
         Animated.sequence([
            Animated.timing(opacity, {
               toValue: 1,
               duration: 600,
               delay,
               useNativeDriver: true,
            }),
            Animated.timing(opacity, {
               toValue: 0.3,
               duration: 600,
               useNativeDriver: true,
            }),
         ])
      );

      animation.start();

      return () => animation.stop();
   }, [delay, opacity]);

   return (
      <Animated.View
         style={[styles.dot, { backgroundColor: color, opacity }]}
      />
   );
};

const styles = StyleSheet.create({
   container: {
      flexDirection: 'row',
      alignSelf: 'flex-start',
      gap: 4,
      paddingHorizontal: 12,
      paddingVertical: 12,
      borderRadius: 12,
   },
   dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
   },
});

export default TypingIndicator;
