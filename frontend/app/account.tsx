import { StyleSheet, Alert, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import ParallaxScrollView from '@/components/templates/parallax-scroll-view';
import { ThemedText } from '@/components/atoms/themed-text';
import { ThemedView } from '@/components/atoms/themed-view';
import { IconSymbol } from '@/components/atoms/icon-symbol';
import { SettingItem } from '@/components/molecules/setting-item';
import { useAuth } from '@/components/molecules/auth-context';
import { logout as logoutApi } from '@/lib/api/auth';
import { Fonts, Spacing, BorderRadius } from '@/constants/theme';

export default function AccountScreen() {
   const router = useRouter();
   const { user, logout, refreshToken } = useAuth();

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
      <ParallaxScrollView
         headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
         showBackButton={true}
         headerImage={
            <IconSymbol
               size={310}
               color="#808080"
               name="person.circle.fill"
               style={styles.headerImage}
            />
         }
      >
         <ThemedView style={styles.titleContainer}>
            <ThemedText
               type="title"
               style={{
                  fontFamily: Fonts.rounded,
               }}
            >
               账号设置
            </ThemedText>
         </ThemedView>

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
            onPress={() => router.push('/change-password')}
         />

         {/* Logout Button */}
         <ThemedView style={styles.section}>
            <TouchableOpacity
               onPress={handleLogout}
               style={[styles.logoutButton, { borderColor: '#ff3b30' }]}
            >
               <ThemedText style={styles.logoutButtonText}>退出登录</ThemedText>
            </TouchableOpacity>
         </ThemedView>
      </ParallaxScrollView>
   );
}

const styles = StyleSheet.create({
   headerImage: {
      color: '#808080',
      bottom: -90,
      left: -35,
      position: 'absolute',
   },
   titleContainer: {
      flexDirection: 'row',
      gap: Spacing.sm,
      marginBottom: Spacing.md,
   },
   section: {
      marginBottom: Spacing.lg,
   },
   sectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: Spacing.sm,
      marginLeft: Spacing.xs,
      opacity: 0.6,
   },
   infoContainer: {
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      overflow: 'hidden',
   },
   infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.md,
      borderTopWidth: 1,
      borderTopColor: 'transparent',
   },
   infoLabel: {
      fontSize: 16,
   },
   infoValue: {
      fontSize: 16,
      opacity: 0.6,
   },
   settingsSection: {
      borderRadius: BorderRadius.lg,
      overflow: 'hidden',
   },
   logoutButton: {
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      paddingVertical: Spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
   },
   logoutButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#ff3b30',
   },
});
