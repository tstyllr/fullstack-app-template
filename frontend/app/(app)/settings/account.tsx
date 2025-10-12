import { StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import * as Haptics from 'expo-haptics';

import { ThemedButton } from '@/components/atoms/themed-button';
import { ThemedDialog } from '@/components/molecules/themed-dialog';
import { SettingItem } from '@/components/molecules/setting-item';
import { useAuth } from '@/components/molecules/auth-context';
import { logout as logoutApi } from '@/lib/api/auth';
import { Spacing } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { ResponsiveContainer } from '@/components/atoms/responsive-container';
import { showApiError } from '@/lib/utils/toast';

export default function AccountScreen() {
   const router = useRouter();
   const { user, logout, refreshToken } = useAuth();
   const destructiveColor = useThemeColor({}, 'destructive');
   const [showLogoutDialog, setShowLogoutDialog] = useState(false);
   const [isLoggingOut, setIsLoggingOut] = useState(false);

   const handleLogout = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setShowLogoutDialog(true);
   };

   const confirmLogout = async () => {
      setIsLoggingOut(true);
      try {
         // Call backend logout API if refreshToken exists
         if (refreshToken) {
            await logoutApi({ refreshToken });
         }
      } catch (error) {
         console.error('Logout API error:', error);
         // 显示错误提示，但继续本地登出
         showApiError(error, '退出登录失败');
         // Continue with local logout even if API call fails
      } finally {
         // Clear local auth state
         await logout();
         setIsLoggingOut(false);
         setShowLogoutDialog(false);
      }
   };

   const cancelLogout = () => {
      setShowLogoutDialog(false);
   };

   return (
      <>
         <ScrollView>
            <ResponsiveContainer>
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
                  onPress={() =>
                     router.push('/settings/change-password' as any)
                  }
               />

               <ThemedButton
                  style={styles.logoutButton}
                  title="退出登录"
                  loading={isLoggingOut}
                  variant="outline"
                  onPress={handleLogout}
                  lightColor={destructiveColor}
                  darkColor={destructiveColor}
                  lightBorderColor={destructiveColor}
                  darkBorderColor={destructiveColor}
               />
            </ResponsiveContainer>
         </ScrollView>

         <ThemedDialog
            visible={showLogoutDialog}
            onClose={cancelLogout}
            title="退出登录"
            description="确定要退出登录吗？"
            primaryButton={{
               text: '退出',
               onPress: confirmLogout,
               loading: isLoggingOut,
            }}
            secondaryButton={{
               text: '取消',
               onPress: cancelLogout,
            }}
         />
      </>
   );
}

const styles = StyleSheet.create({
   logoutButton: {
      marginTop: Spacing.lg,
      marginHorizontal: Spacing.md,
   },
});
