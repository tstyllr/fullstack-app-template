import { StyleSheet, ViewStyle } from 'react-native';
import { ThemedView } from './themed-view';
import { Layout } from '@/constants/theme';
import { useResponsive } from '@/hooks/use-responsive';

type MaxWidthSize = keyof typeof Layout.maxWidth;

interface ResponsiveContainerProps {
   children: React.ReactNode;
   /**
    * 最大宽度尺寸，默认为 'md' (768px)
    * - 'sm': 640px（适合聊天、消息列表等）
    * - 'md': 768px（适合表单、设置页面等）
    * - 'lg': 1024px（适合内容页面、列表等）
    * - 'xl': 1280px（适合仪表盘、数据展示等）
    */
   maxWidth?: MaxWidthSize;
   /**
    * 自定义样式
    */
   style?: ViewStyle;
   /**
    * 是否启用水平内边距（默认 true）
    */
   enableHorizontalPadding?: boolean;
}

/**
 * 响应式容器组件
 *
 * 在移动优先设计的基础上，为 Web 平台提供最大宽度约束和居中布局
 *
 * 使用场景：
 * - 包裹页面主要内容，防止在大屏幕上过度拉伸
 * - 在移动端表现为全宽容器
 * - 在 Web 端表现为最大宽度约束的居中容器
 *
 * @example
 * ```tsx
 * <ResponsiveContainer maxWidth="md">
 *   <YourContent />
 * </ResponsiveContainer>
 * ```
 */
export function ResponsiveContainer({
   children,
   maxWidth = 'md',
   style,
   enableHorizontalPadding = true,
}: ResponsiveContainerProps) {
   const { shouldConstrainWidth } = useResponsive();

   return (
      <ThemedView style={styles.wrapper}>
         <ThemedView
            style={[
               styles.container,
               shouldConstrainWidth && {
                  maxWidth: Layout.maxWidth[maxWidth],
                  width: '100%',
               },
               enableHorizontalPadding && styles.padding,
               style,
            ]}
         >
            {children}
         </ThemedView>
      </ThemedView>
   );
}

const styles = StyleSheet.create({
   wrapper: {
      flex: 1,
      alignItems: 'center', // 在 Web 上居中容器
   },
   container: {
      flex: 1,
      width: '100%',
   },
   padding: {
      paddingHorizontal: 16,
   },
});
