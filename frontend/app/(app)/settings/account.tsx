import { StyleSheet, Alert, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { ThemedButton } from '@/components/atoms/themed-button';
import { SettingItem } from '@/components/molecules/setting-item';
import { useAuth } from '@/components/molecules/auth-context';
import { logout as logoutApi } from '@/lib/api/auth';
import { Spacing } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function AccountScreen() {
   const router = useRouter();
   const { user, logout, refreshToken } = useAuth();
   const destructiveColor = useThemeColor({}, 'destructive');
   const backgroundColor = useThemeColor({}, 'background');

   const handleLogout = async () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const performLogout = async () => {
         try {
            // Call backend logout API if refreshToken exists
            if (refreshToken) {
               await logoutApi({ refreshToken });
            }
         } catch (error) {
            console.error('Logout API error:', error);
            // Continue with local logout even if API call fails
         } finally {
            // Clear local auth state
            await logout();
         }
      };

      if (Platform.OS === 'web') {
         // Use browser native confirm dialog for web
         if (window.confirm('确定要退出登录吗？')) {
            await performLogout();
         }
      } else {
         // Use React Native Alert for mobile platforms
         Alert.alert('退出登录', '确定要退出登录吗？', [
            {
               text: '取消',
               style: 'cancel',
            },
            {
               text: '退出',
               style: 'destructive',
               onPress: performLogout,
            },
         ]);
      }
   };

   return (
      <ScrollView style={[styles.container, { backgroundColor }]}>
         <SettingItem
            icon="person.circle.fill"
            title="账号信息"
            subtitle={user?.phone}
            onPress={() => {}}
            showArrow={false}
         />

         <SettingItem
            icon="key.fill"
            title="修改密码"
            subtitle="设置或修改登录密码"
            onPress={() => router.push('/settings/change-password' as any)}
         />

         <ThemedButton
            title="退出登录"
            variant="outline"
            onPress={handleLogout}
            lightColor={destructiveColor}
            darkColor={destructiveColor}
            lightBorderColor={destructiveColor}
            darkBorderColor={destructiveColor}
         />
      </ScrollView>
   );
}

const styles = StyleSheet.create({
   container: { flex: 1, padding: Spacing.md },
});
