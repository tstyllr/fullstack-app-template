import { Platform, useWindowDimensions } from 'react-native';
import { Layout } from '@/constants/theme';

/**
 * 响应式 Hook - 提供屏幕尺寸和平台相关的响应式信息
 * 用于在移动优先设计的基础上适配不同屏幕尺寸
 */
export function useResponsive() {
   const { width } = useWindowDimensions();

   const isWeb = Platform.OS === 'web';
   const isMobile = width < Layout.breakpoints.tablet;
   const isTablet =
      width >= Layout.breakpoints.tablet && width < Layout.breakpoints.desktop;
   const isDesktop = width >= Layout.breakpoints.desktop;

   return {
      width,
      isWeb,
      isMobile,
      isTablet,
      isDesktop,
      // 便捷方法：是否需要容器约束（Web 且非移动尺寸）
      shouldConstrainWidth: isWeb && !isMobile,
   };
}
