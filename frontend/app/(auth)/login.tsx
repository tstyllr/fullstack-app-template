import { useState, useEffect } from 'react';
import {
   ScrollView,
   YStack,
   XStack,
   H1,
   Text,
   Button,
   Input,
   Card,
} from 'tamagui';
import { Phone, Lock, Eye, EyeOff, Mail } from '@tamagui/lucide-icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePhoneStorage } from '@/hooks/usePhoneStorage';
import { useCountdown } from '@/hooks/useCountdown';
import { authClient } from '@/lib/auth-client';
import {
   otpLoginSchema,
   passwordLoginSchema,
   type OtpLoginInput,
   type PasswordLoginInput,
} from '@/lib/schemas/auth.schema';

type LoginMode = 'otp' | 'password';

/**
 * 格式化手机号为国际格式
 * @param phoneNumber - 原始手机号（可能是11位或已带+86前缀）
 * @returns 格式化后的国际格式手机号（+86前缀）
 */
function formatPhoneNumber(phoneNumber: string): string {
   // 如果已经是国际格式（以+开头），直接返回
   if (phoneNumber.startsWith('+')) {
      return phoneNumber;
   }
   // 否则添加+86前缀
   return `+86${phoneNumber}`;
}

/**
 * 登录页面
 *
 * 支持两种登录方式：
 * 1. 手机号 + 短信验证码（OTP）- 无密码登录，首次验证自动注册
 * 2. 手机号 + 密码 - 适用于已设置密码的用户
 *
 * 功能特性：
 * - React Hook Form 表单管理
 * - Zod 实时验证
 * - 记住手机号（AsyncStorage）
 * - 60秒倒计时重发验证码
 * - 密码显示/隐藏切换
 * - 错误提示动画效果
 * - 登录成功自动跳转（通过 useAuthRedirect）
 */
export default function LoginScreen() {
   const [mode, setMode] = useState<LoginMode>('otp');
   const [showPassword, setShowPassword] = useState(false);
   const [isLoading, setIsLoading] = useState(false);
   const [isSendingOtp, setIsSendingOtp] = useState(false);
   const [error, setError] = useState<string | null>(null);

   const {
      savedPhone,
      isLoading: isLoadingPhone,
      savePhone,
   } = usePhoneStorage();
   const countdown = useCountdown(60);

   // OTP 表单
   const otpForm = useForm<OtpLoginInput>({
      resolver: zodResolver(otpLoginSchema),
      defaultValues: {
         phoneNumber: '',
         code: '',
      },
   });

   // 密码表单
   const passwordForm = useForm<PasswordLoginInput>({
      resolver: zodResolver(passwordLoginSchema),
      defaultValues: {
         phoneNumber: '',
         password: '',
      },
   });

   // 加载保存的手机号
   useEffect(() => {
      if (savedPhone && !isLoadingPhone) {
         otpForm.setValue('phoneNumber', savedPhone);
         passwordForm.setValue('phoneNumber', savedPhone);
      }
   }, [savedPhone, isLoadingPhone, otpForm, passwordForm]);

   /**
    * 切换登录模式，重置表单和错误
    */
   const handleModeChange = (newMode: LoginMode) => {
      if (newMode === mode) return;

      // 保留手机号，清除其他字段
      const otpPhone = otpForm.getValues('phoneNumber');
      const passwordPhone = passwordForm.getValues('phoneNumber');
      const currentPhone = otpPhone || passwordPhone;

      setMode(newMode);
      setError(null);

      // 使用 reset 清空表单，然后使用 setValue 确保手机号正确设置
      if (newMode === 'otp') {
         otpForm.reset({ phoneNumber: '', code: '' });
         setTimeout(() => {
            otpForm.setValue('phoneNumber', currentPhone);
         }, 0);
      } else {
         passwordForm.reset({ phoneNumber: '', password: '' });
         setTimeout(() => {
            passwordForm.setValue('phoneNumber', currentPhone);
         }, 0);
      }
   };

   /**
    * 发送短信验证码
    */
   const handleSendOtp = async () => {
      // 先验证手机号
      const phoneNumber = otpForm.getValues('phoneNumber');
      const phoneValidation = await otpForm.trigger('phoneNumber');

      if (!phoneValidation) {
         return;
      }

      setIsSendingOtp(true);
      setError(null);

      try {
         // 调用 Better Auth 发送 OTP 接口
         const response = await fetch(
            `${process.env.EXPO_PUBLIC_API_URL}/api/auth/phone-number/send-otp`,
            {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               credentials: 'include', // 携带 cookie（与其他接口保持一致）
               body: JSON.stringify({
                  phoneNumber: formatPhoneNumber(phoneNumber),
               }),
            }
         );

         if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || '发送验证码失败');
         }

         // 启动倒计时
         countdown.start();

         // 可选：显示成功提示
         console.log('验证码已发送');
      } catch (err) {
         setError(
            err instanceof Error ? err.message : '发送验证码失败，请稍后重试'
         );
      } finally {
         setIsSendingOtp(false);
      }
   };

   /**
    * OTP 登录提交
    */
   const handleOtpLogin = async (data: OtpLoginInput) => {
      setIsLoading(true);
      setError(null);

      try {
         // 使用 Better Auth 客户端方法验证 OTP
         const { data: result, error } = await authClient.phoneNumber.verify({
            phoneNumber: formatPhoneNumber(data.phoneNumber),
            code: data.code,
         });

         if (error) {
            throw new Error(error.message || '验证码错误或已过期');
         }

         // 保存手机号
         await savePhone(data.phoneNumber);

         // 登录成功，useAuthRedirect 会自动处理跳转
         console.log('登录成功', result?.user);
      } catch (err) {
         setError(
            err instanceof Error ? err.message : '登录失败，请检查验证码'
         );
      } finally {
         setIsLoading(false);
      }
   };

   /**
    * 密码登录提交
    */
   const handlePasswordLogin = async (data: PasswordLoginInput) => {
      setIsLoading(true);
      setError(null);

      try {
         // 使用 Better Auth 客户端方法进行密码登录
         const { data: result, error } = await authClient.signIn.phoneNumber({
            phoneNumber: formatPhoneNumber(data.phoneNumber),
            password: data.password,
         });

         if (error) {
            throw new Error(error.message || '手机号或密码错误');
         }

         // 保存手机号
         await savePhone(data.phoneNumber);

         // 登录成功，useAuthRedirect 会自动处理跳转
         console.log('登录成功', result?.user);
      } catch (err) {
         setError(
            err instanceof Error ? err.message : '登录失败，请检查手机号和密码'
         );
      } finally {
         setIsLoading(false);
      }
   };

   /**
    * 表单提交处理
    */
   const handleSubmit = () => {
      if (mode === 'otp') {
         otpForm.handleSubmit(handleOtpLogin)();
      } else {
         passwordForm.handleSubmit(handlePasswordLogin)();
      }
   };

   return (
      <ScrollView flex={1} backgroundColor="$background">
         <YStack padding="$4" paddingTop="$8" gap="$4">
            {/* 顶部标题 */}
            <YStack alignItems="center" gap="$3" paddingVertical="$4">
               <H1 fontSize="$9">登录</H1>
               <Text fontSize="$4" color="$gray11">
                  欢迎使用 Fullstack App
               </Text>
            </YStack>

            {/* 登录模式切换 */}
            <XStack
               gap="$2"
               padding="$2"
               backgroundColor="$gray3"
               borderRadius="$4"
               alignSelf="center"
               width="100%"
               maxWidth={400}
            >
               <Button
                  flex={1}
                  size="$4"
                  theme={mode === 'otp' ? 'blue' : undefined}
                  backgroundColor={mode === 'otp' ? '$blue10' : 'transparent'}
                  color={mode === 'otp' ? 'white' : '$gray11'}
                  onPress={() => handleModeChange('otp')}
                  pressStyle={{ scale: 0.98 }}
               >
                  验证码登录
               </Button>
               <Button
                  flex={1}
                  size="$4"
                  theme={mode === 'password' ? 'blue' : undefined}
                  backgroundColor={
                     mode === 'password' ? '$blue10' : 'transparent'
                  }
                  color={mode === 'password' ? 'white' : '$gray11'}
                  onPress={() => handleModeChange('password')}
                  pressStyle={{ scale: 0.98 }}
               >
                  密码登录
               </Button>
            </XStack>

            {/* 表单区域 */}
            <Card
               bordered
               padding="$5"
               gap="$4"
               width="100%"
               maxWidth={400}
               alignSelf="center"
               elevate
               animation="quick"
               // 错误时的抖动动画
               {...(error && {
                  animation: 'quick',
                  x: 0,
                  onLayout: () => {
                     // 简单的抖动效果（通过快速改变 x 值）
                  },
               })}
            >
               {/* 手机号输入 */}
               <YStack gap="$2">
                  <Text fontSize="$3" fontWeight="600" color="$gray12">
                     手机号
                  </Text>
                  {mode === 'otp' ? (
                     <Controller
                        key="otp-phone"
                        control={otpForm.control}
                        name="phoneNumber"
                        render={({
                           field: { onChange, onBlur, value },
                           fieldState: { error },
                        }) => (
                           <YStack gap="$2">
                              <XStack
                                 alignItems="center"
                                 borderWidth={1}
                                 borderColor={error ? '$red10' : '$gray6'}
                                 borderRadius="$3"
                                 paddingHorizontal="$3"
                                 backgroundColor="$background"
                              >
                                 <Phone size={18} color="$gray10" />
                                 <Input
                                    flex={1}
                                    size="$4"
                                    placeholder="138 0013 8000"
                                    value={value}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    keyboardType="phone-pad"
                                    autoCapitalize="none"
                                    borderWidth={0}
                                    backgroundColor="transparent"
                                 />
                              </XStack>
                              {error && (
                                 <Text fontSize="$2" color="$red10">
                                    {error.message}
                                 </Text>
                              )}
                           </YStack>
                        )}
                     />
                  ) : (
                     <Controller
                        key="password-phone"
                        control={passwordForm.control}
                        name="phoneNumber"
                        render={({
                           field: { onChange, onBlur, value },
                           fieldState: { error },
                        }) => (
                           <YStack gap="$2">
                              <XStack
                                 alignItems="center"
                                 borderWidth={1}
                                 borderColor={error ? '$red10' : '$gray6'}
                                 borderRadius="$3"
                                 paddingHorizontal="$3"
                                 backgroundColor="$background"
                              >
                                 <Phone size={18} color="$gray10" />
                                 <Input
                                    flex={1}
                                    size="$4"
                                    placeholder="138 0013 8000"
                                    value={value}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    keyboardType="phone-pad"
                                    autoCapitalize="none"
                                    borderWidth={0}
                                    backgroundColor="transparent"
                                 />
                              </XStack>
                              {error && (
                                 <Text fontSize="$2" color="$red10">
                                    {error.message}
                                 </Text>
                              )}
                           </YStack>
                        )}
                     />
                  )}
               </YStack>

               {/* OTP 模式：验证码输入 + 发送按钮 */}
               {mode === 'otp' && (
                  <YStack gap="$2">
                     <Text fontSize="$3" fontWeight="600" color="$gray12">
                        验证码
                     </Text>
                     <Controller
                        key="otp-code"
                        control={otpForm.control}
                        name="code"
                        render={({
                           field: { onChange, onBlur, value },
                           fieldState: { error },
                        }) => (
                           <YStack gap="$2">
                              <XStack gap="$2">
                                 <XStack
                                    flex={1}
                                    alignItems="center"
                                    borderWidth={1}
                                    borderColor={error ? '$red10' : '$gray6'}
                                    borderRadius="$3"
                                    paddingHorizontal="$3"
                                    backgroundColor="$background"
                                 >
                                    <Mail size={18} color="$gray10" />
                                    <Input
                                       flex={1}
                                       size="$4"
                                       placeholder="6位验证码"
                                       value={value}
                                       onChangeText={onChange}
                                       onBlur={onBlur}
                                       keyboardType="number-pad"
                                       maxLength={6}
                                       borderWidth={0}
                                       backgroundColor="transparent"
                                    />
                                 </XStack>
                                 <Button
                                    size="$4"
                                    theme="blue"
                                    onPress={handleSendOtp}
                                    disabled={
                                       countdown.isRunning || isSendingOtp
                                    }
                                    opacity={countdown.isRunning ? 0.6 : 1}
                                    minWidth={100}
                                 >
                                    {isSendingOtp
                                       ? '发送中...'
                                       : countdown.isRunning
                                         ? `${countdown.seconds}s`
                                         : '获取验证码'}
                                 </Button>
                              </XStack>
                              {error && (
                                 <Text fontSize="$2" color="$red10">
                                    {error.message}
                                 </Text>
                              )}
                           </YStack>
                        )}
                     />
                  </YStack>
               )}

               {/* 密码模式：密码输入 + 显示/隐藏切换 */}
               {mode === 'password' && (
                  <YStack gap="$2">
                     <Text fontSize="$3" fontWeight="600" color="$gray12">
                        密码
                     </Text>
                     <Controller
                        key="password-input"
                        control={passwordForm.control}
                        name="password"
                        render={({
                           field: { onChange, onBlur, value },
                           fieldState: { error },
                        }) => (
                           <YStack gap="$2">
                              <XStack
                                 alignItems="center"
                                 borderWidth={1}
                                 borderColor={error ? '$red10' : '$gray6'}
                                 borderRadius="$3"
                                 paddingHorizontal="$3"
                                 backgroundColor="$background"
                              >
                                 <Lock size={18} color="$gray10" />
                                 <Input
                                    flex={1}
                                    size="$4"
                                    placeholder="请输入密码"
                                    value={value}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    secureTextEntry={!showPassword}
                                    autoCapitalize="none"
                                    borderWidth={0}
                                    backgroundColor="transparent"
                                 />
                                 <Button
                                    size="$2"
                                    chromeless
                                    onPress={() =>
                                       setShowPassword(!showPassword)
                                    }
                                    icon={showPassword ? EyeOff : Eye}
                                    color="$gray10"
                                 />
                              </XStack>
                              {error && (
                                 <Text fontSize="$2" color="$red10">
                                    {error.message}
                                 </Text>
                              )}
                           </YStack>
                        )}
                     />
                  </YStack>
               )}

               {/* 错误提示 */}
               {error && (
                  <YStack
                     padding="$3"
                     backgroundColor="$red2"
                     borderRadius="$3"
                     borderWidth={1}
                     borderColor="$red7"
                     animation="quick"
                     opacity={1}
                  >
                     <Text fontSize="$3" color="$red11">
                        {error}
                     </Text>
                  </YStack>
               )}

               {/* 登录按钮 */}
               <Button
                  size="$5"
                  theme="blue"
                  backgroundColor="$blue10"
                  onPress={handleSubmit}
                  disabled={isLoading}
                  opacity={isLoading ? 0.6 : 1}
                  pressStyle={{ scale: 0.98 }}
                  marginTop="$2"
               >
                  {isLoading ? '登录中...' : '登录'}
               </Button>
            </Card>
         </YStack>
      </ScrollView>
   );
}
