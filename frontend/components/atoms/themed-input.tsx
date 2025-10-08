import React from 'react';
import { StyleSheet, TextInput, type TextInputProps, View } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { ThemedText } from './themed-text';
import { BorderRadius, Spacing, Typography } from '@/constants/theme';

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
   const color = useThemeColor(
      { light: lightColor, dark: darkColor },
      'textPrimary'
   );
   const backgroundColor = useThemeColor(
      { light: lightBackgroundColor, dark: darkBackgroundColor },
      'background'
   );
   const borderColor = useThemeColor(
      { light: lightBorderColor, dark: darkBorderColor },
      'border'
   );

   const placeholderColor = useThemeColor({}, 'placeholder'); // Use icon color for placeholder

   return (
      <View style={styles.container}>
         {label && (
            <ThemedText style={styles.label} type="defaultSemiBold">
               {label}
            </ThemedText>
         )}
         <View style={styles.inputWrapper}>
            <TextInput
               style={[
                  styles.input,
                  {
                     color,
                     backgroundColor,
                     borderColor: error ? '#ef4444' : borderColor,
                  },
                  !editable && styles.disabled,
                  rightButton ? styles.inputWithButton : undefined,
                  style,
               ]}
               placeholderTextColor={placeholderColor}
               editable={editable}
               {...rest}
            />
            {rightButton && (
               <View style={styles.rightButtonContainer}>{rightButton}</View>
            )}
         </View>
         {error && (
            <ThemedText
               style={styles.error}
               lightColor="#ef4444"
               darkColor="#f87171"
            >
               {error}
            </ThemedText>
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
   },
   input: {
      ...Typography.default,
      height: 48,
      borderWidth: 1,
      borderRadius: BorderRadius.md,
      paddingHorizontal: Spacing.md,
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
      opacity: 0.6,
   },
   error: {
      ...Typography.tiny,
      marginTop: Spacing.xs,
   },
});
