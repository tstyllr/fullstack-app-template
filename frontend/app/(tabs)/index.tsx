import { Image } from 'expo-image';
import { Platform, StyleSheet, TouchableOpacity, Alert } from 'react-native';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link } from 'expo-router';
import { useAuth } from '@/components/contexts/auth-context';
import { logout as logoutApi } from '@/lib/api/auth';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function HomeScreen() {
   const { user, logout, refreshToken } = useAuth();
   const colorScheme = useColorScheme();
   const colors = Colors[colorScheme ?? 'light'];

   const handleLogout = async () => {
      try {
         if (refreshToken) {
            await logoutApi({ refreshToken });
         }
         await logout();
      } catch (error: any) {
         Alert.alert('错误', error.error || '登出失败');
      }
   };

   return (
      <ParallaxScrollView
         headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
         headerImage={
            <Image
               source={require('@/assets/images/partial-react-logo.png')}
               style={styles.reactLogo}
            />
         }
      >
         <ThemedView style={styles.titleContainer}>
            <ThemedText type="title">Welcome!</ThemedText>
            <HelloWave />
         </ThemedView>
         <ThemedView style={styles.userContainer}>
            <ThemedText type="subtitle">用户信息</ThemedText>
            <ThemedText>手机号: {user?.phone}</ThemedText>
            <ThemedText>昵称: {user?.name || '未设置'}</ThemedText>
            <ThemedText>管理员: {user?.isAdmin ? '是' : '否'}</ThemedText>
            <TouchableOpacity
               style={[styles.logoutButton, { backgroundColor: colors.tint }]}
               onPress={handleLogout}
            >
               <ThemedText style={styles.logoutButtonText}>退出登录</ThemedText>
            </TouchableOpacity>
         </ThemedView>
         <ThemedView style={styles.stepContainer}>
            <ThemedText type="subtitle">Step 1: Try it</ThemedText>
            <ThemedText>
               Edit{' '}
               <ThemedText type="defaultSemiBold">
                  app/(tabs)/index.tsx
               </ThemedText>{' '}
               to see changes. Press{' '}
               <ThemedText type="defaultSemiBold">
                  {Platform.select({
                     ios: 'cmd + d',
                     android: 'cmd + m',
                     web: 'F12',
                  })}
               </ThemedText>{' '}
               to open developer tools.
            </ThemedText>
         </ThemedView>
         <ThemedView style={styles.stepContainer}>
            <Link href="/modal">
               <Link.Trigger>
                  <ThemedText type="subtitle">Step 2: Explore</ThemedText>
               </Link.Trigger>
               <Link.Preview />
               <Link.Menu>
                  <Link.MenuAction
                     title="Action"
                     icon="cube"
                     onPress={() => alert('Action pressed')}
                  />
                  <Link.MenuAction
                     title="Share"
                     icon="square.and.arrow.up"
                     onPress={() => alert('Share pressed')}
                  />
                  <Link.Menu title="More" icon="ellipsis">
                     <Link.MenuAction
                        title="Delete"
                        icon="trash"
                        destructive
                        onPress={() => alert('Delete pressed')}
                     />
                  </Link.Menu>
               </Link.Menu>
            </Link>

            <ThemedText>
               {`Tap the Explore tab to learn more about what's included in this starter app.`}
            </ThemedText>
         </ThemedView>
         <ThemedView style={styles.stepContainer}>
            <ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText>
            <ThemedText>
               {`When you're ready, run `}
               <ThemedText type="defaultSemiBold">
                  npm run reset-project
               </ThemedText>{' '}
               to get a fresh{' '}
               <ThemedText type="defaultSemiBold">app</ThemedText> directory.
               This will move the current{' '}
               <ThemedText type="defaultSemiBold">app</ThemedText> to{' '}
               <ThemedText type="defaultSemiBold">app-example</ThemedText>.
            </ThemedText>
         </ThemedView>
      </ParallaxScrollView>
   );
}

const styles = StyleSheet.create({
   titleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
   },
   userContainer: {
      gap: 8,
      marginBottom: 16,
      padding: 16,
      borderRadius: 8,
   },
   logoutButton: {
      marginTop: 12,
      height: 44,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
   },
   logoutButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
   },
   stepContainer: {
      gap: 8,
      marginBottom: 8,
   },
   reactLogo: {
      height: 178,
      width: 290,
      bottom: 0,
      left: 0,
      position: 'absolute',
   },
});
