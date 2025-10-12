import React from 'react';
import {
   StyleSheet,
   Text,
   TextInput,
   type TextInputProps,
   View,
} from 'react-native';
import { ThemedText } from './themed-text';
import { BorderRadius, Spacing, Typography } from '@/constants/theme';
import useThemeColors from '@/hooks/use-theme-colors';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type ThemedInputProps = TextInputProps & {
   lightColor?: string;
   darkColor?: string;
   lightBackgroundColor?: string;
   darkBackgroundColor?: string;
   lightBorderColor?: string;
   darkBorderColor?: string;
   label?: string;
   error?: string;
   rightButton?: React.ReactNode;
};

export function ThemedInput({
   style,
   lightColor,
   darkColor,
   lightBackgroundColor,
   darkBackgroundColor,
   lightBorderColor,
   darkBorderColor,
   label,
   error,
   editable = true,
   rightButton,
   ...rest
}: ThemedInputProps) {
   const colors = useThemeColors();
   const colorScheme = useColorScheme();

   return (
      <View style={styles.container}>
         {label && (
            <ThemedText style={styles.label} type="defaultSemiBold">
               {label}
            </ThemedText>
         )}
         <View
            style={[
               styles.inputWrapper,
               { borderColor: error ? colors.destructive : colors.border },
            ]}
         >
            <TextInput
               keyboardAppearance={colorScheme}
               underlineColorAndroid="transparent"
               style={[
                  styles.input,
                  {
                     color: colors.text,
                  },
                  !editable && styles.disabled,
                  rightButton ? styles.inputWithButton : undefined,
                  style,
               ]}
               placeholderTextColor={colors.placeholder}
               editable={editable}
               {...rest}
            />
            {rightButton && (
               <View style={styles.rightButtonContainer}>{rightButton}</View>
            )}
         </View>
         {error && (
            <Text style={[styles.error, { color: colors.destructive }]}>
               {error}
            </Text>
         )}
      </View>
   );
}

const styles = StyleSheet.create({
   container: {
      width: '100%',
      marginBottom: Spacing.md,
   },
   label: {
      marginBottom: Spacing.xs,
   },
   inputWrapper: {
      position: 'relative',
      width: '100%',
      height: Typography.default.fontSize + Spacing.md * 2,
      borderWidth: 1,
      borderRadius: BorderRadius.md,
      paddingHorizontal: Spacing.md,
      justifyContent: 'center',
   },
   input: {
      fontSize: Typography.default.fontSize,
      outlineWidth: 0,
   },
   inputWithButton: {
      paddingRight: 100,
   },
   rightButtonContainer: {
      position: 'absolute',
      right: 0,
      top: 0,
      bottom: 0,
      justifyContent: 'center',
   },
   disabled: {
      opacity: 0.2,
   },
   error: {
      ...Typography.tiny,
      marginTop: Spacing.xs,
   },
});
