import { Pressable, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/atoms/themed-text';
import { IconSymbol } from '@/components/atoms/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Spacing, Typography } from '@/constants/theme';

interface SettingItemProps {
   icon?: React.ComponentProps<typeof IconSymbol>['name'];
   title: string;
   subtitle?: string;
   onPress: () => void;
   showArrow?: boolean;
}

export function SettingItem({
   icon,
   title,
   subtitle,
   onPress,
   showArrow = true,
}: SettingItemProps) {
   const iconColor = useThemeColor({}, 'icon');
   const borderColor = useThemeColor({}, 'border');

   const handlePress = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
   };

   return (
      <Pressable
         onPress={handlePress}
         style={({ pressed }) => [
            styles.container,
            { borderColor },
            pressed && styles.pressed,
         ]}
      >
         <View style={styles.content}>
            {icon && (
               <View style={styles.iconContainer}>
                  <IconSymbol name={icon} size={24} color={iconColor} />
               </View>
            )}
            <View style={styles.textContainer}>
               <ThemedText style={styles.title}>{title}</ThemedText>
               {subtitle && (
                  <ThemedText style={[styles.subtitle, { color: iconColor }]}>
                     {subtitle}
                  </ThemedText>
               )}
            </View>
            {showArrow && (
               <IconSymbol name="chevron.right" size={20} color={iconColor} />
            )}
         </View>
      </Pressable>
   );
}

const styles = StyleSheet.create({
   container: {
      borderBottomWidth: 1,
   },
   content: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.md,
   },
   pressed: {
      opacity: 0.7,
   },
   iconContainer: {
      marginRight: Spacing.md,
   },
   textContainer: {
      flex: 1,
   },
   title: {
      ...Typography.default,
   },
   subtitle: {
      ...Typography.small,
      marginTop: Spacing.xs,
   },
});
