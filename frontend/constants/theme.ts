/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
   light: {
      text: '#11181C',
      background: '#fff',
      tint: tintColorLight,
      icon: '#687076',
      tabIconDefault: '#687076',
      tabIconSelected: tintColorLight,
      border: '#e1e4e8',
   },
   dark: {
      text: '#ECEDEE',
      background: '#151718',
      tint: tintColorDark,
      icon: '#9BA1A6',
      tabIconDefault: '#9BA1A6',
      tabIconSelected: tintColorDark,
      border: '#30363d',
   },
};

export const Fonts = Platform.select({
   ios: {
      /** iOS `UIFontDescriptorSystemDesignDefault` */
      sans: 'system-ui',
      /** iOS `UIFontDescriptorSystemDesignSerif` */
      serif: 'ui-serif',
      /** iOS `UIFontDescriptorSystemDesignRounded` */
      rounded: 'ui-rounded',
      /** iOS `UIFontDescriptorSystemDesignMonospaced` */
      mono: 'ui-monospace',
   },
   default: {
      sans: 'normal',
      serif: 'serif',
      rounded: 'normal',
      mono: 'monospace',
   },
   web: {
      sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      serif: "Georgia, 'Times New Roman', serif",
      rounded:
         "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
      mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
   },
});

/**
 * 间距系统 - 基于 4px 的倍数，确保在不同平台上的一致性
 */
export const Spacing = {
   xs: 4,
   sm: 8,
   md: 16,
   lg: 24,
   xl: 32,
   xxl: 48,
} as const;

/**
 * 圆角系统 - 统一的圆角规范
 */
export const BorderRadius = {
   sm: 4,
   md: 8,
   lg: 12,
   xl: 16,
   round: 9999, // 完全圆角（用于圆形按钮等）
} as const;
