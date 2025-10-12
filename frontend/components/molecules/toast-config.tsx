import React from 'react';
import { StyleSheet } from 'react-native';
import { BaseToast, ErrorToast, InfoToast } from 'react-native-toast-message';
import type { ToastConfigParams } from 'react-native-toast-message';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

/**
 * Toast 配置组件
 * 根据项目主题系统自定义 Toast 样式
 */
export function useToastConfig() {
   const colorScheme = useColorScheme();
   const colors = Colors[colorScheme ?? 'light'];

   return {
      success: (props: ToastConfigParams<any>) => (
         <BaseToast
            {...props}
            style={[
               styles.toast,
               {
                  borderLeftColor: colors.success,
                  backgroundColor: colors.card,
               },
            ]}
            contentContainerStyle={styles.contentContainer}
            text1Style={[styles.text1, { color: colors.text }]}
            text2Style={[styles.text2, { color: colors.textSecondary }]}
            text2NumberOfLines={2}
         />
      ),
      error: (props: ToastConfigParams<any>) => (
         <ErrorToast
            {...props}
            style={[
               styles.toast,
               {
                  borderLeftColor: colors.error,
                  backgroundColor: colors.card,
               },
            ]}
            contentContainerStyle={styles.contentContainer}
            text1Style={[styles.text1, { color: colors.text }]}
            text2Style={[styles.text2, { color: colors.textSecondary }]}
            text2NumberOfLines={2}
         />
      ),
      info: (props: ToastConfigParams<any>) => (
         <InfoToast
            {...props}
            style={[
               styles.toast,
               {
                  borderLeftColor: colors.info,
                  backgroundColor: colors.card,
               },
            ]}
            contentContainerStyle={styles.contentContainer}
            text1Style={[styles.text1, { color: colors.text }]}
            text2Style={[styles.text2, { color: colors.textSecondary }]}
            text2NumberOfLines={2}
         />
      ),
      warning: (props: ToastConfigParams<any>) => (
         <BaseToast
            {...props}
            style={[
               styles.toast,
               {
                  borderLeftColor: colors.warning,
                  backgroundColor: colors.card,
               },
            ]}
            contentContainerStyle={styles.contentContainer}
            text1Style={[styles.text1, { color: colors.text }]}
            text2Style={[styles.text2, { color: colors.textSecondary }]}
            text2NumberOfLines={2}
         />
      ),
   };
}

const styles = StyleSheet.create({
   toast: {
      borderRadius: BorderRadius.md,
      borderLeftWidth: 5,
      shadowColor: '#000',
      shadowOffset: {
         width: 0,
         height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
   },
   contentContainer: {
      paddingHorizontal: Spacing.sm,
      paddingVertical: Spacing.sm,
   },
   text1: {
      ...Typography.defaultSemiBold,
      marginBottom: Spacing.xs,
   },
   text2: {
      ...Typography.small,
   },
});
