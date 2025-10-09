/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { DarkTheme, DefaultTheme, Theme } from '@react-navigation/native';
import { Platform } from 'react-native';

export const tintColorLight = '#0a7ea4';
export const tintColorDark = '#fff';
export const whiteColor = '#fff';

export const Colors = {
   light: {
      background: '#fff',
      backgroundSecondary: '#f6f8fa',
      card: '#fff',
      tint: tintColorLight,
      icon: '#687076',
      tabIconDefault: '#687076',
      tabIconSelected: tintColorLight,
      border: '#e1e4e8',
      // 状态颜色
      success: '#28a745',
      error: '#dc3545',
      warning: '#ffc107',
      info: '#17a2b8',
      destructive: '#d73a49',
      // UI 元素
      overlay: 'rgba(0, 0, 0, 0.5)',
      separator: '#d1d5db',
      // 文本层级
      text: '#11181C',
      textSecondary: '#687076',
      textTertiary: '#9BA1A6',
      placeholder: '#adb5bd',
   },
   dark: {
      background: '#151718',
      backgroundSecondary: '#1c1e1f',
      card: '#1c1e1f',
      tint: tintColorDark,
      icon: '#9BA1A6',
      tabIconDefault: '#9BA1A6',
      tabIconSelected: tintColorDark,
      border: '#30363d',
      // 状态颜色
      success: '#3fb950',
      error: '#f85149',
      warning: '#d29922',
      info: '#58a6ff',
      destructive: '#f85149',
      // UI 元素
      overlay: 'rgba(0, 0, 0, 0.7)',
      separator: '#30363d',
      // 文本层级
      text: '#ECEDEE',
      textSecondary: '#9BA1A6',
      textTertiary: '#6e7681',
      placeholder: '#6e7681',
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

/**
 * 文本样式系统 - 统一的排版规范
 */
export const Typography = {
   tiny: {
      fontSize: 12,
      lineHeight: 16,
   },
   small: {
      fontSize: 14,
      lineHeight: 20,
   },
   smallSemiBold: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '600' as const,
   },
   default: {
      fontSize: 16,
      lineHeight: 24,
   },
   defaultSemiBold: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '600' as const,
   },
   link: {
      fontSize: 16,
      lineHeight: 30,
   },
   title: {
      fontSize: 32,
      fontWeight: 'bold' as const,
      lineHeight: 32,
   },
   subtitle: {
      fontSize: 20,
      fontWeight: 'bold' as const,
   },
} as const;

export const nativeDarkTheme: Theme = {
   ...DarkTheme,
   colors: {
      primary: Colors.dark.tint,
      background: Colors.dark.background,
      card: Colors.dark.card,
      text: Colors.dark.text,
      border: Colors.dark.border,
      notification: Colors.dark.destructive,
   },
};

export const nativeLightTheme: Theme = {
   ...DefaultTheme,
   colors: {
      primary: Colors.light.tint,
      background: Colors.light.background,
      card: Colors.light.card,
      text: Colors.light.text,
      border: Colors.light.border,
      notification: Colors.light.destructive,
   },
};
