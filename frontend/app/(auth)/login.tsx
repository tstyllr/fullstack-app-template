import React, { useState, useEffect } from 'react';
import {
   View,
   KeyboardAvoidingView,
   Platform,
   ScrollView,
   StyleSheet,
   Alert,
   TouchableOpacity,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ThemedText } from '@/components/atoms/themed-text';
import { ThemedView } from '@/components/atoms/themed-view';
import { ThemedInput } from '@/components/atoms/themed-input';
import { ThemedButton } from '@/components/atoms/themed-button';
import { useAuth } from '@/components/molecules/auth-context';
import { sendCode, loginWithCode, loginWithPassword } from '@/lib/api/auth';
import {
   saveLoginMethod,
   getLoginMethod,
   savePhone,
   getPhone,
   savePassword,
   getPassword,
   saveRememberMe,
   getRememberMe,
   clearSavedCredentials,
} from '@/lib/storage/token-storage';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
   Colors,
   Typography,
   Spacing,
   tintColorLight,
   whiteColor,
} from '@/constants/theme';

// Zod 验证 Schema
const codeLoginSchema = z.object({
   phone: z
      .string()
      .min(11, '请输入11位手机号')
      .max(11, '请输入11位手机号')
      .regex(/^1[3-9]\d{9}$/, '请输入正确的手机号'),
   code: z.string().min(6, '请输入6位验证码').max(6, '请输入6位验证码'),
});

const passwordLoginSchema = z.object({
   phone: z
      .string()
      .min(11, '请输入11位手机号')
      .max(11, '请输入11位手机号')
      .regex(/^1[3-9]\d{9}$/, '请输入正确的手机号'),
   password: z.string().min(6, '密码至少6位'),
});

type CodeLoginForm = z.infer<typeof codeLoginSchema>;
type PasswordLoginForm = z.infer<typeof passwordLoginSchema>;

export default function LoginScreen() {
   const colorScheme = useColorScheme();
   const colors = Colors[colorScheme ?? 'light'];
   const { login } = useAuth();

   const [isCodeMode, setIsCodeMode] = useState(false);
   const [isLoading, setIsLoading] = useState(false);
   const [countdown, setCountdown] = useState(0);
   const [rememberMe, setRememberMe] = useState(false);

   // 验证码模式的表单
   const codeForm = useForm<CodeLoginForm>({
      resolver: zodResolver(codeLoginSchema),
      defaultValues: {
         phone: '',
         code: '',
      },
   });

   // 密码模式的表单
   const passwordForm = useForm<PasswordLoginForm>({
      resolver: zodResolver(passwordLoginSchema),
      defaultValues: {
         phone: '',
         password: '',
      },
   });

   // 加载保存的登录方式和凭据
   useEffect(() => {
      const loadSavedData = async () => {
         // 加载登录方式偏好
         const savedMethod = await getLoginMethod();
         if (savedMethod !== null) {
            setIsCodeMode(savedMethod);
         }

         // 加载记住我偏好
         const remember = await getRememberMe();
         setRememberMe(remember);

         // 如果记住我已启用，加载保存的凭据
         if (remember) {
            const savedPhone = await getPhone();
            if (savedPhone) {
               codeForm.setValue('phone', savedPhone);
               passwordForm.setValue('phone', savedPhone);
            }

            // 仅在密码模式下加载密码
            if (!savedMethod) {
               const savedPassword = await getPassword();
               if (savedPassword) {
                  passwordForm.setValue('password', savedPassword);
               }
            }
         }
      };
      loadSavedData();
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   // 倒计时效果
   useEffect(() => {
      if (countdown > 0) {
         const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
         return () => clearTimeout(timer);
      }
   }, [countdown]);

   // 发送验证码
   const handleSendCode = async () => {
      const phone = codeForm.getValues('phone');

      // 验证手机号
      const result = await codeForm.trigger('phone');
      if (!result) {
         const error = codeForm.formState.errors.phone?.message;
         Alert.alert('错误', error || '请输入正确的手机号');
         return;
      }

      setIsLoading(true);
      try {
         await sendCode({ phone });
         setCountdown(60);
         Alert.alert('成功', '验证码已发送');
      } catch (error: any) {
         Alert.alert('错误', error.error || '发送验证码失败');
      } finally {
         setIsLoading(false);
      }
   };

   // 验证码登录
   const handleLoginWithCode = async (data: CodeLoginForm) => {
      setIsLoading(true);
      try {
         const response = await loginWithCode({
            phone: data.phone,
            code: data.code,
         });
         await login(
            response.accessToken,
            response.refreshToken,
            response.user
         );

         // 保存凭据（如果勾选了记住我）
         if (rememberMe) {
            await savePhone(data.phone);
            await saveRememberMe(true);
         } else {
            await clearSavedCredentials();
         }
      } catch (error: any) {
         Alert.alert('错误', error.error || '登录失败');
      } finally {
         setIsLoading(false);
      }
   };

   // 密码登录
   const handleLoginWithPassword = async (data: PasswordLoginForm) => {
      setIsLoading(true);
      try {
         const response = await loginWithPassword({
            phone: data.phone,
            password: data.password,
         });
         await login(
            response.accessToken,
            response.refreshToken,
            response.user
         );

         // 保存凭据（如果勾选了记住我）
         if (rememberMe) {
            await savePhone(data.phone);
            await savePassword(data.password);
            await saveRememberMe(true);
         } else {
            await clearSavedCredentials();
         }
      } catch (error: any) {
         Alert.alert('错误', error.error || '登录失败');
      } finally {
         setIsLoading(false);
      }
   };

   // 切换登录模式
   const handleSwitchMode = () => {
      const newMode = !isCodeMode;
      setIsCodeMode(newMode);
      setCountdown(0);

      // 同步手机号到另一个表单
      if (newMode) {
         // 切换到验证码模式
         const phone = passwordForm.getValues('phone');
         codeForm.setValue('phone', phone);
      } else {
         // 切换到密码模式
         const phone = codeForm.getValues('phone');
         passwordForm.setValue('phone', phone);
      }

      saveLoginMethod(newMode);
   };

   // 记住我切换
   const handleRememberMeToggle = async () => {
      const newValue = !rememberMe;
      setRememberMe(newValue);

      if (!newValue) {
         await clearSavedCredentials();
      }
   };

   // 渲染发送验证码按钮
   const renderSendCodeButton = () => (
      <ThemedButton
         title={countdown > 0 ? `${countdown}秒后重试` : '发送验证码'}
         variant="primary"
         onPress={handleSendCode}
         disabled={countdown > 0 || isLoading}
         style={styles.sendCodeButton}
      />
   );

   // 渲染复选框
   const renderCheckbox = () => (
      <View
         style={[
            styles.checkbox,
            {
               borderColor: colors.border,
               backgroundColor: rememberMe ? colors.tint : 'transparent',
            },
         ]}
      >
         {rememberMe && (
            <ThemedText
               style={{
                  ...Typography.smallSemiBold,
                  color: colorScheme === 'dark' ? tintColorLight : whiteColor,
               }}
            >
               ✓
            </ThemedText>
         )}
      </View>
   );

   return (
      <KeyboardAvoidingView
         style={styles.container}
         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
         <ScrollView contentContainerStyle={styles.scrollContent}>
            <ThemedView style={styles.content}>
               <ThemedText style={styles.title}>欢迎登录</ThemedText>

               {isCodeMode ? (
                  <React.Fragment key="code-login-mode">
                     {/* 手机号输入 */}
                     <Controller
                        control={codeForm.control}
                        name="phone"
                        render={({
                           field: { onChange, onBlur, value },
                           fieldState: { error },
                        }) => (
                           <ThemedInput
                              placeholder="手机号"
                              value={value}
                              onChangeText={onChange}
                              onBlur={onBlur}
                              keyboardType="phone-pad"
                              maxLength={11}
                              editable={!isLoading}
                              error={error?.message}
                           />
                        )}
                     />

                     {/* 验证码输入（带发送按钮） */}
                     <Controller
                        control={codeForm.control}
                        name="code"
                        render={({
                           field: { onChange, onBlur, value },
                           fieldState: { error },
                        }) => (
                           <ThemedInput
                              placeholder="验证码"
                              value={value}
                              onChangeText={onChange}
                              onBlur={onBlur}
                              keyboardType="number-pad"
                              maxLength={6}
                              editable={!isLoading}
                              error={error?.message}
                              rightButton={renderSendCodeButton()}
                           />
                        )}
                     />

                     {/* 登录按钮 */}
                     <ThemedButton
                        title="登录"
                        onPress={codeForm.handleSubmit(handleLoginWithCode)}
                        loading={isLoading}
                        disabled={isLoading}
                     />
                  </React.Fragment>
               ) : (
                  <React.Fragment key="password-login-mode">
                     {/* 手机号输入 */}
                     <Controller
                        control={passwordForm.control}
                        name="phone"
                        render={({
                           field: { onChange, onBlur, value },
                           fieldState: { error },
                        }) => (
                           <ThemedInput
                              placeholder="手机号"
                              value={value}
                              onChangeText={onChange}
                              onBlur={onBlur}
                              keyboardType="phone-pad"
                              maxLength={11}
                              editable={!isLoading}
                              error={error?.message}
                           />
                        )}
                     />

                     {/* 密码输入 */}
                     <Controller
                        control={passwordForm.control}
                        name="password"
                        render={({
                           field: { onChange, onBlur, value },
                           fieldState: { error },
                        }) => (
                           <ThemedInput
                              placeholder="密码"
                              value={value}
                              onChangeText={onChange}
                              onBlur={onBlur}
                              secureTextEntry
                              editable={!isLoading}
                              error={error?.message}
                           />
                        )}
                     />

                     {/* 登录按钮 */}
                     <ThemedButton
                        title="登录"
                        onPress={passwordForm.handleSubmit(
                           handleLoginWithPassword
                        )}
                        loading={isLoading}
                        disabled={isLoading}
                     />
                  </React.Fragment>
               )}

               {/* 记住我 */}
               <TouchableOpacity
                  style={styles.rememberMeContainer}
                  onPress={handleRememberMeToggle}
                  disabled={isLoading}
               >
                  {renderCheckbox()}
                  <ThemedText style={styles.rememberMeText}>
                     记住{isCodeMode ? '手机号' : '账号密码'}
                  </ThemedText>
               </TouchableOpacity>

               {/* 切换登录模式 */}
               <ThemedButton
                  title={isCodeMode ? '使用密码登录' : '使用验证码登录'}
                  variant="outline"
                  onPress={handleSwitchMode}
                  disabled={isLoading}
               />
            </ThemedView>
         </ScrollView>
      </KeyboardAvoidingView>
   );
}

const styles = StyleSheet.create({
   container: {
      flex: 1,
   },
   scrollContent: {
      flexGrow: 1,
   },
   content: {
      flex: 1,
      padding: Spacing.lg,
      justifyContent: 'center',
   },
   title: {
      ...Typography.title,
      marginBottom: Spacing.xl,
      textAlign: 'center',
   },
   sendCodeButton: {
      minWidth: 80,
   },
   checkbox: {
      width: 20,
      height: 20,
      borderWidth: 2,
      borderRadius: 4,
      marginRight: Spacing.sm,
      justifyContent: 'center',
      alignItems: 'center',
   },
   rememberMeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: Spacing.md,
      marginBottom: Spacing.sm,
   },
   rememberMeText: {
      ...Typography.small,
   },
});
