import { StyleSheet, Pressable, ScrollView, View } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/atoms/themed-text';
import { ThemedCard } from '@/components/atoms/themed-card';
import { IconSymbol } from '@/components/atoms/icon-symbol';
import { ResponsiveContainer } from '@/components/atoms/responsive-container';
import { useTheme, ThemeMode } from '@/components/molecules/theme-context';
import { Spacing, BorderRadius, Typography } from '@/constants/theme';
import useThemeColors from '@/hooks/use-theme-colors';

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
   const colors = useThemeColors();

   const handleSelectTheme = (mode: ThemeMode) => {
      if (mode !== themeMode) {
         Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
         setThemeMode(mode);
      }
   };

   return (
      <ScrollView>
         <ResponsiveContainer>
            <View style={styles.optionsContainer}>
               {THEME_OPTIONS.map((option) => {
                  const isSelected = themeMode === option.mode;
                  return (
                     <Pressable
                        key={option.mode}
                        onPress={() => handleSelectTheme(option.mode)}
                        style={({ pressed }) => [
                           styles.option,
                           {
                              borderColor: isSelected
                                 ? colors.tint
                                 : colors.border,
                              borderWidth: isSelected ? 2 : 1,
                           },
                           pressed && styles.optionPressed,
                        ]}
                     >
                        <ThemedCard style={styles.optionContent}>
                           <ThemedCard style={styles.optionLeft}>
                              <ThemedCard
                                 style={[
                                    styles.iconContainer,
                                    {
                                       backgroundColor: isSelected
                                          ? colors.tint + '20'
                                          : 'transparent',
                                    },
                                 ]}
                              >
                                 <IconSymbol
                                    name={option.icon}
                                    size={28}
                                    color={
                                       isSelected ? colors.tint : colors.icon
                                    }
                                 />
                              </ThemedCard>
                              <ThemedCard style={styles.textContainer}>
                                 <ThemedText
                                    type="defaultSemiBold"
                                    style={[
                                       styles.optionTitle,
                                       {
                                          color: isSelected
                                             ? colors.tint
                                             : undefined,
                                       },
                                    ]}
                                 >
                                    {option.title}
                                 </ThemedText>
                                 <ThemedText
                                    style={[
                                       styles.optionDescription,
                                       { color: colors.icon },
                                    ]}
                                 >
                                    {option.description}
                                 </ThemedText>
                              </ThemedCard>
                           </ThemedCard>
                           {isSelected && (
                              <IconSymbol
                                 name="checkmark.circle.fill"
                                 size={24}
                                 color={colors.tint}
                                 style={styles.checkIcon}
                              />
                           )}
                        </ThemedCard>
                     </Pressable>
                  );
               })}
            </View>
         </ResponsiveContainer>
      </ScrollView>
   );
}

const styles = StyleSheet.create({
   optionsContainer: {
      gap: Spacing.md,
      padding: Spacing.md,
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
      ...Typography.default,
   },
   optionDescription: {
      ...Typography.small,
      marginTop: Spacing.xs,
   },
   checkIcon: {
      marginLeft: Spacing.sm,
   },
});
