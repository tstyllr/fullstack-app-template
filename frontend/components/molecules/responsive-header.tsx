import { StyleSheet, Pressable, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { ThemedView } from '@/components/atoms/themed-view';
import { ThemedText } from '@/components/atoms/themed-text';
import { IconSymbol } from '@/components/atoms/icon-symbol';
import { useResponsive } from '@/hooks/use-responsive';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Spacing, Layout, Typography } from '@/constants/theme';

export interface ResponsiveHeaderProps {
   /**
    * 导航栏标题
    */
   title?: string;
   /**
    * 是否显示返回按钮
    */
   showBackButton?: boolean;
   /**
    * 返回按钮点击事件（自定义行为）
    */
   onBackPress?: () => void;
   /**
    * 右侧操作按钮
    */
   rightButton?: React.ReactNode;
   /**
    * 最大宽度约束，默认为 'md'
    */
   maxWidth?: keyof typeof Layout.maxWidth;
}

/**
 * 响应式导航栏组件
 *
 * 特性：
 * - 支持主题系统（light/dark mode）
 * - 响应式设计（移动端全宽，Web 端约束宽度并居中）
 * - 平台适配（使用 Safe Area）
 * - 支持返回按钮、标题、右侧操作按钮
 *
 * @example
 * ```tsx
 * <ResponsiveHeader
 *   title="设置"
 *   showBackButton={true}
 *   rightButton={<CustomButton />}
 *   maxWidth="md"
 * />
 * ```
 */
export function ResponsiveHeader({
   title,
   showBackButton = true,
   onBackPress,
   rightButton,
   maxWidth = 'md',
}: ResponsiveHeaderProps) {
   const router = useRouter();
   const insets = useSafeAreaInsets();
   const { shouldConstrainWidth } = useResponsive();

   const backgroundColor = useThemeColor({}, 'background');
   const borderColor = useThemeColor({}, 'border');
   const textColor = useThemeColor({}, 'text');
   const iconColor = useThemeColor({}, 'icon');

   const handleBackPress = () => {
      if (Platform.OS !== 'web') {
         Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      if (onBackPress) {
         onBackPress();
      } else {
         if (router.canGoBack()) {
            router.back();
         } else {
            router.replace('/');
         }
      }
   };

   return (
      <ThemedView
         style={[
            styles.container,
            {
               paddingTop: insets.top,
               backgroundColor,
            },
         ]}
      >
         <ThemedView style={styles.wrapper}>
            <ThemedView
               style={[
                  styles.contentContainer,
                  shouldConstrainWidth && {
                     maxWidth: Layout.maxWidth[maxWidth],
                     width: '100%',
                  },
               ]}
            >
               {/* 左侧返回按钮 */}
               <ThemedView style={styles.leftSection}>
                  {showBackButton && (
                     <Pressable
                        onPress={handleBackPress}
                        style={({ pressed }) => [
                           styles.backButton,
                           pressed && styles.buttonPressed,
                        ]}
                     >
                        <IconSymbol
                           name="chevron.left"
                           size={24}
                           color={iconColor}
                        />
                     </Pressable>
                  )}
               </ThemedView>

               {/* 中间标题 */}
               <ThemedView style={styles.centerSection}>
                  {title && (
                     <ThemedText
                        type="defaultSemiBold"
                        numberOfLines={1}
                        style={[styles.title, { color: textColor }]}
                     >
                        {title}
                     </ThemedText>
                  )}
               </ThemedView>

               {/* 右侧操作按钮 */}
               <ThemedView style={styles.rightSection}>
                  {rightButton}
               </ThemedView>
            </ThemedView>

            {/* 分割线 */}
            <ThemedView
               style={[
                  styles.divider,
                  {
                     backgroundColor: borderColor,
                  },
                  shouldConstrainWidth && {
                     maxWidth: Layout.maxWidth[maxWidth],
                     width: '100%',
                  },
               ]}
            />
         </ThemedView>
      </ThemedView>
   );
}

const styles = StyleSheet.create({
   container: {
      // 移除了 borderBottomWidth，改为使用单独的分割线元素
   },
   wrapper: {
      alignItems: 'center', // 在 Web 上居中内容
   },
   contentContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: 56, // 标准导航栏高度
      width: '100%',
      paddingHorizontal: Spacing.sm,
   },
   divider: {
      height: StyleSheet.hairlineWidth,
      width: '100%',
   },
   leftSection: {
      flexDirection: 'row',
      alignItems: 'center',
      minWidth: 44, // iOS 推荐的最小可点击区域
      justifyContent: 'flex-start',
   },
   centerSection: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: Spacing.sm,
   },
   rightSection: {
      flexDirection: 'row',
      alignItems: 'center',
      minWidth: 44, // 与左侧保持对称
      justifyContent: 'flex-end',
   },
   backButton: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 22,
   },
   buttonPressed: {
      opacity: 0.6,
   },
   title: {
      ...Typography.defaultSemiBold,
   },
});
