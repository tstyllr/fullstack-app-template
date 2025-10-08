import { Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedView } from '@/components/atoms/themed-view';
import { ThemedText } from '@/components/atoms/themed-text';
import { IconSymbol } from '@/components/atoms/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Spacing } from '@/constants/theme';

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
         <ThemedView style={styles.content}>
            {icon && (
               <ThemedView style={styles.iconContainer}>
                  <IconSymbol name={icon} size={24} color={iconColor} />
               </ThemedView>
            )}
            <ThemedView style={styles.textContainer}>
               <ThemedText style={styles.title}>{title}</ThemedText>
               {subtitle && (
                  <ThemedText style={[styles.subtitle, { color: iconColor }]}>
                     {subtitle}
                  </ThemedText>
               )}
            </ThemedView>
            {showArrow && (
               <IconSymbol name="chevron.right" size={20} color={iconColor} />
            )}
         </ThemedView>
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
      fontSize: 16,
   },
   subtitle: {
      fontSize: 14,
      marginTop: Spacing.xs,
   },
});
