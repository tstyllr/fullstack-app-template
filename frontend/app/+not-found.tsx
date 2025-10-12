import { Link, Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/atoms/themed-text';
import { Spacing, Typography } from '@/constants/theme';

export default function NotFoundScreen() {
   return (
      <>
         <Stack.Screen options={{ title: '页面未找到' }} />
         <View style={styles.container}>
            <ThemedText type="title" style={styles.title}>
               404
            </ThemedText>
            <ThemedText style={styles.message}>
               抱歉，您访问的页面不存在
            </ThemedText>
            <Link href={'/(app)/(tabs)' as any} style={styles.link}>
               <ThemedText type="link">返回首页</ThemedText>
            </Link>
         </View>
      </>
   );
}

const styles = StyleSheet.create({
   container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: Spacing.lg,
   },
   title: {
      fontSize: 72,
      fontWeight: 'bold',
      marginBottom: Spacing.md,
   },
   message: {
      ...Typography.default,
      marginBottom: Spacing.xl,
      textAlign: 'center',
   },
   link: {
      marginTop: Spacing.md,
   },
});
