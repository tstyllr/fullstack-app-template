import { StyleSheet, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Spacing } from '@/constants/theme';
import { ChangePasswordForm } from '@/components/organisms/change-password-form';
import { useAuth } from '@/components/molecules/auth-context';
import { setPassword } from '@/lib/api/auth';
import { ResponsiveContainer } from '@/components/atoms/responsive-container';
import { showSuccess, showApiError } from '@/lib/utils/toast';

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

         // 显示成功提示
         showSuccess({
            title: '密码修改成功',
         });

         // 延迟导航，让用户看到成功提示
         setTimeout(() => {
            if (router.canGoBack()) {
               router.back();
            } else {
               router.replace('/settings');
            }
         }, 1000);
      } catch (error: any) {
         // 显示错误提示
         showApiError(error, '修改密码失败');
      }
   };

   return (
      <ScrollView
         keyboardDismissMode="interactive"
         keyboardShouldPersistTaps="handled"
      >
         <ResponsiveContainer>
            <View style={styles.container}>
               <ChangePasswordForm
                  phone={user?.phone || ''}
                  onSubmitFormData={handleSubmitFormData}
               />
            </View>
         </ResponsiveContainer>
      </ScrollView>
   );
}

const styles = StyleSheet.create({
   container: {
      padding: Spacing.md,
   },
});
