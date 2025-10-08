import { StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import ParallaxScrollView from '@/components/templates/parallax-scroll-view';
import { ThemedText } from '@/components/atoms/themed-text';
import { ThemedView } from '@/components/atoms/themed-view';
import { IconSymbol } from '@/components/atoms/icon-symbol';
import { useTheme, ThemeMode } from '@/components/molecules/theme-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Spacing, BorderRadius, Fonts } from '@/constants/theme';

interface ThemeOption {
   mode: ThemeMode;
   title: string;
   description: string;
   icon: React.ComponentProps<typeof IconSymbol>['name'];
}

const THEME_OPTIONS: ThemeOption[] = [
   {
      mode: 'system',
      title: '跟随系统',
      description: '根据系统设置自动切换',
      icon: 'circle.lefthalf.filled',
   },
   {
      mode: 'light',
      title: '浅色模式',
      description: '始终使用浅色主题',
      icon: 'sun.max.fill',
   },
   {
      mode: 'dark',
      title: '暗色模式',
      description: '始终使用暗色主题',
      icon: 'moon.fill',
   },
];

export default function ThemeScreen() {
   const { themeMode, setThemeMode } = useTheme();
   const iconColor = useThemeColor({}, 'icon');
   const tintColor = useThemeColor({}, 'tint');
   const borderColor = useThemeColor({}, 'border');

   const handleSelectTheme = (mode: ThemeMode) => {
      if (mode !== themeMode) {
         Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
         setThemeMode(mode);
      }
   };

   return (
      <ParallaxScrollView
         headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
         headerImage={
            <IconSymbol
               size={310}
               color="#808080"
               name="paintbrush.fill"
               style={styles.headerImage}
            />
         }
      >
         <ThemedView style={styles.titleContainer}>
            <ThemedText
               type="title"
               style={{
                  fontFamily: Fonts.rounded,
               }}
            >
               主题
            </ThemedText>
         </ThemedView>

         <ThemedView style={styles.optionsContainer}>
            {THEME_OPTIONS.map((option) => {
               const isSelected = themeMode === option.mode;
               return (
                  <Pressable
                     key={option.mode}
                     onPress={() => handleSelectTheme(option.mode)}
                     style={({ pressed }) => [
                        styles.option,
                        {
                           borderColor: isSelected ? tintColor : borderColor,
                           borderWidth: isSelected ? 2 : 1,
                        },
                        pressed && styles.optionPressed,
                     ]}
                  >
                     <ThemedView style={styles.optionContent}>
                        <ThemedView style={styles.optionLeft}>
                           <ThemedView
                              style={[
                                 styles.iconContainer,
                                 {
                                    backgroundColor: isSelected
                                       ? tintColor + '20'
                                       : 'transparent',
                                 },
                              ]}
                           >
                              <IconSymbol
                                 name={option.icon}
                                 size={28}
                                 color={isSelected ? tintColor : iconColor}
                              />
                           </ThemedView>
                           <ThemedView style={styles.textContainer}>
                              <ThemedText
                                 type="defaultSemiBold"
                                 style={[
                                    styles.optionTitle,
                                    {
                                       color: isSelected
                                          ? tintColor
                                          : undefined,
                                    },
                                 ]}
                              >
                                 {option.title}
                              </ThemedText>
                              <ThemedText
                                 style={[
                                    styles.optionDescription,
                                    { color: iconColor },
                                 ]}
                              >
                                 {option.description}
                              </ThemedText>
                           </ThemedView>
                        </ThemedView>
                        {isSelected && (
                           <IconSymbol
                              name="chevron.right"
                              size={24}
                              color={tintColor}
                              style={styles.checkIcon}
                           />
                        )}
                     </ThemedView>
                  </Pressable>
               );
            })}
         </ThemedView>
      </ParallaxScrollView>
   );
}

const styles = StyleSheet.create({
   headerImage: {
      color: '#808080',
      bottom: -90,
      left: -35,
      position: 'absolute',
   },
   titleContainer: {
      flexDirection: 'row',
      gap: Spacing.sm,
      marginBottom: Spacing.md,
   },
   optionsContainer: {
      gap: Spacing.md,
   },
   option: {
      borderRadius: BorderRadius.lg,
      overflow: 'hidden',
   },
   optionPressed: {
      opacity: 0.7,
   },
   optionContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: Spacing.md,
   },
   optionLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
   },
   iconContainer: {
      width: 56,
      height: 56,
      borderRadius: BorderRadius.md,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: Spacing.md,
   },
   textContainer: {
      flex: 1,
   },
   optionTitle: {
      fontSize: 16,
   },
   optionDescription: {
      fontSize: 14,
      marginTop: Spacing.xs,
   },
   checkIcon: {
      marginLeft: Spacing.sm,
   },
});
