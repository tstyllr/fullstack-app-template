import React from 'react';
import {
   StyleSheet,
   Pressable,
   type PressableProps,
   ActivityIndicator,
} from 'react-native';
import { ThemedText } from './themed-text';
import { BorderRadius, Spacing, Typography } from '@/constants/theme';
import useThemeColors from '@/hooks/use-theme-colors';

export type ThemedButtonProps = PressableProps & {
   title: string;
   variant?: 'primary' | 'secondary' | 'outline';
   loading?: boolean;
};

export function ThemedButton({
   title,
   variant = 'primary',
   loading = false,
   disabled,
   style,
   ...rest
}: ThemedButtonProps) {
   const colors = useThemeColors();

   // Determine colors based on variant
   let backgroundColor: string;
   switch (variant) {
      case 'primary':
         backgroundColor = colors.tint;
         break;
      case 'secondary':
         backgroundColor = colors.background;
         break;
      case 'outline':
         backgroundColor = 'transparent';
         break;
      default:
         backgroundColor = colors.tint;
   }

   let textColor: string;
   switch (variant) {
      case 'primary':
         textColor = colors.background; // 浅色模式：深色背景+浅色文字，暗黑模式：浅色背景+深色文字
         break;
      case 'secondary':
      case 'outline':
         textColor = colors.tint;
         break;
      default:
         textColor = colors.text;
   }

   // Determine border color
   const borderColor = variant === 'outline' ? colors.tint : 'transparent';

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
