import React from 'react';
import {
   StyleSheet,
   Pressable,
   type PressableProps,
   ActivityIndicator,
} from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { ThemedText } from './themed-text';
import { BorderRadius, Spacing, Typography } from '@/constants/theme';

export type ThemedButtonProps = PressableProps & {
   title: string;
   variant?: 'primary' | 'secondary' | 'outline';
   loading?: boolean;
   lightColor?: string;
   darkColor?: string;
   lightBackgroundColor?: string;
   darkBackgroundColor?: string;
   lightBorderColor?: string;
   darkBorderColor?: string;
};

export function ThemedButton({
   title,
   variant = 'primary',
   loading = false,
   disabled,
   style,
   lightColor,
   darkColor,
   lightBackgroundColor,
   darkBackgroundColor,
   lightBorderColor,
   darkBorderColor,
   ...rest
}: ThemedButtonProps) {
   const tintColor = useThemeColor({}, 'tint');
   const defaultBackgroundColor = useThemeColor({}, 'background');
   const primaryTextColor = useThemeColor({}, 'background'); // 使用背景色作为 primary 按钮的文字色，形成对比
   const customBackgroundColor = useThemeColor(
      { light: lightBackgroundColor, dark: darkBackgroundColor },
      'tint'
   );
   const customTextColor = useThemeColor(
      { light: lightColor, dark: darkColor },
      'textPrimary'
   );
   const customBorderColor = useThemeColor(
      { light: lightBorderColor, dark: darkBorderColor },
      'tint'
   );

   // Determine colors based on variant
   let backgroundColor: string;
   if (lightBackgroundColor || darkBackgroundColor) {
      backgroundColor = customBackgroundColor;
   } else {
      switch (variant) {
         case 'primary':
            backgroundColor = tintColor;
            break;
         case 'secondary':
            backgroundColor = defaultBackgroundColor;
            break;
         case 'outline':
            backgroundColor = 'transparent';
            break;
         default:
            backgroundColor = tintColor;
      }
   }

   let textColor: string = useThemeColor({}, 'textPrimary');
   if (lightColor || darkColor) {
      textColor = customTextColor;
   } else {
      switch (variant) {
         case 'primary':
            textColor = primaryTextColor; // 浅色模式：深色背景+浅色文字，暗黑模式：浅色背景+深色文字
            break;
         case 'secondary':
         case 'outline':
            textColor = tintColor;
            break;
         default:
            break;
      }
   }

   // Determine border color
   let borderColor: string;
   if (lightBorderColor || darkBorderColor) {
      borderColor = customBorderColor;
   } else {
      borderColor = variant === 'outline' ? tintColor : 'transparent';
   }

   const isDisabled = disabled || loading;

   const combinedStyle = ({ pressed }: { pressed: boolean }) => {
      const baseStyles: any[] = [
         styles.button,
         {
            backgroundColor,
            borderColor,
            opacity: pressed ? 0.8 : 1,
         },
      ];

      if (variant === 'outline') {
         baseStyles.push(styles.outlineButton);
      }

      if (isDisabled) {
         baseStyles.push(styles.disabled);
      }

      if (style) {
         baseStyles.push(style);
      }

      return baseStyles;
   };

   return (
      <Pressable style={combinedStyle} disabled={isDisabled} {...rest}>
         {loading ? (
            <ActivityIndicator color={textColor} />
         ) : (
            <ThemedText
               style={[styles.text, { color: textColor }]}
               type="defaultSemiBold"
            >
               {title}
            </ThemedText>
         )}
      </Pressable>
   );
}

const styles = StyleSheet.create({
   button: {
      height: 48,
      borderRadius: BorderRadius.md,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: Spacing.lg,
      marginVertical: Spacing.sm,
   },
   outlineButton: {
      borderWidth: 1,
   },
   text: {
      ...Typography.default,
   },
   disabled: {
      opacity: 0.5,
   },
});
