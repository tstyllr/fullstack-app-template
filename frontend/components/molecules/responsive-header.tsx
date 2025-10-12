import { StyleSheet, Pressable, Platform, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/atoms/themed-text';
import { IconSymbol } from '@/components/atoms/icon-symbol';
import { useResponsive } from '@/hooks/use-responsive';
import { Spacing, Layout, Typography } from '@/constants/theme';
import useThemeColors from '@/hooks/use-theme-colors';

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
   const colors = useThemeColors();

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
      <View
         style={[
            styles.container,
            {
               paddingTop: insets.top,
               backgroundColor: colors.background,
            },
         ]}
      >
         <View style={styles.wrapper}>
            <View
               style={[
                  styles.contentContainer,
                  shouldConstrainWidth && {
                     maxWidth: Layout.maxWidth[maxWidth],
                     width: '100%',
                  },
               ]}
            >
               {/* 左侧返回按钮 */}
               <View style={styles.leftSection}>
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
                           color={colors.icon}
                        />
                     </Pressable>
                  )}
               </View>

               {/* 中间标题 */}
               <View style={styles.centerSection}>
                  {title && (
                     <ThemedText type="defaultSemiBold" numberOfLines={1}>
                        {title}
                     </ThemedText>
                  )}
               </View>

               {/* 右侧操作按钮 */}
               <View style={styles.rightSection}>{rightButton}</View>
            </View>

            {/* 分割线 */}
            <View
               style={[
                  styles.divider,
                  {
                     backgroundColor: colors.border,
                  },
                  shouldConstrainWidth && {
                     maxWidth: Layout.maxWidth[maxWidth],
                     width: '100%',
                  },
               ]}
            />
         </View>
      </View>
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
