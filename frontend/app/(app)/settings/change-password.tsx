import { StyleSheet, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import ParallaxScrollView from '@/components/templates/parallax-scroll-view';
import { ThemedText } from '@/components/atoms/themed-text';
import { ThemedView } from '@/components/atoms/themed-view';
import { IconSymbol } from '@/components/atoms/icon-symbol';
import { Fonts, Spacing } from '@/constants/theme';
import { ChangePasswordForm } from '@/components/organisms/change-password-form';
import { useAuth } from '@/components/molecules/auth-context';
import { setPassword } from '@/lib/api/auth';

interface FormData {
   phone: string;
   code: string;
   password: string;
   confirm: string;
}

export default function ChangePasswordScreen() {
   const { user } = useAuth();
   const router = useRouter();

   const handleSubmitFormData = async (data: FormData) => {
      try {
         // 调用修改密码 API
         await setPassword({
            phone: data.phone,
            code: data.code,
            password: data.password,
         });

         // 提供触觉反馈
         if (Platform.OS !== 'web') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
         }

         // 显示成功提示
         if (Platform.OS === 'web') {
            window.alert('密码修改成功');
            router.back();
         } else {
            Alert.alert('成功', '密码修改成功', [
               {
                  text: '确定',
                  onPress: () => router.back(),
               },
            ]);
         }
      } catch (error: any) {
         // 提供错误触觉反馈
         if (Platform.OS !== 'web') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
         }

         // 提取错误信息
         const errorMessage =
            error?.response?.data?.error || error?.message || '修改密码失败';

         // 显示错误提示
         if (Platform.OS === 'web') {
            window.alert(errorMessage);
         } else {
            Alert.alert('错误', errorMessage);
         }
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
               name="key.fill"
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
               修改密码
            </ThemedText>
         </ThemedView>

         <ThemedView style={styles.content}>
            <ChangePasswordForm
               phone={user?.phone || ''}
               onSubmitFormData={handleSubmitFormData}
            />
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
   content: {
      paddingVertical: Spacing.lg,
   },
});
