import { StyleSheet, Alert, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { Spacing } from '@/constants/theme';
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
            if (router.canGoBack()) {
               router.back();
            } else {
               router.replace('/settings');
            }
         } else {
            Alert.alert('成功', '密码修改成功', [
               {
                  text: '确定',
                  onPress: () => {
                     if (router.canGoBack()) {
                        router.back();
                     } else {
                        router.replace('/settings');
                     }
                  },
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
      <ScrollView style={styles.container}>
         <ChangePasswordForm
            phone={user?.phone || ''}
            onSubmitFormData={handleSubmitFormData}
         />
      </ScrollView>
   );
}

const styles = StyleSheet.create({
   container: {
      flex: 1,
      paddingVertical: Spacing.md,
   },
});
