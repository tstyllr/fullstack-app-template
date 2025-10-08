import React from 'react';
import {
   StyleSheet,
   Pressable,
   type PressableProps,
   ActivityIndicator,
} from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { ThemedText } from './themed-text';
import { BorderRadius, Spacing } from '@/constants/theme';

export type ThemedButtonProps = PressableProps & {
   title: string;
   variant?: 'primary' | 'secondary' | 'outline';
   loading?: boolean;
   lightColor?: string;
   darkColor?: string;
   lightBackgroundColor?: string;
   darkBackgroundColor?: string;
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
   ...rest
}: ThemedButtonProps) {
   const tintColor = useThemeColor({}, 'tint');
   const defaultBackgroundColor = useThemeColor({}, 'background');
   const customBackgroundColor = useThemeColor(
      { light: lightBackgroundColor, dark: darkBackgroundColor },
      'tint'
   );
   const customTextColor = useThemeColor(
      { light: lightColor, dark: darkColor },
      'text'
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

   let textColor: string;
   if (lightColor || darkColor) {
      textColor = customTextColor;
   } else {
      switch (variant) {
         case 'primary':
            textColor = '#ffffff';
            break;
         case 'secondary':
         case 'outline':
            textColor = tintColor;
            break;
         default:
            textColor = '#ffffff';
      }
   }

   const borderColor = variant === 'outline' ? tintColor : 'transparent';
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
      fontSize: 16,
   },
   disabled: {
      opacity: 0.5,
   },
});
