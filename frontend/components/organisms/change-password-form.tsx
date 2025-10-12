import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ThemedInput } from '@/components/atoms/themed-input';
import { ThemedButton } from '@/components/atoms/themed-button';
import { Spacing } from '@/constants/theme';
import { sendCode } from '@/lib/api/auth';

// 表单数据类型
interface FormData {
   phone: string; // 手机号码
   code: string; // 手机验证码
   password: string; // 密码
   confirm: string; // 确认密码
}

// 组件属性
interface ChangePasswordFormProps {
   phone: string; // 手机号码
   onSubmitFormData: (data: FormData) => void | Promise<void>;
}

// Zod 验证 schema
const changePasswordSchema = z
   .object({
      phone: z.string().min(1, '手机号码不能为空'),
      code: z.string().min(1, '验证码不能为空'),
      password: z
         .string()
         .min(6, '密码至少需要6位')
         .max(20, '密码最多20位')
         .regex(/^[A-Za-z\d]+$/, '密码只能包含数字和字母'),
      confirm: z.string().min(1, '确认密码不能为空'),
   })
   .refine((data) => data.password === data.confirm, {
      message: '两次输入的密码不一致',
      path: ['confirm'],
   });

export function ChangePasswordForm({
   phone,
   onSubmitFormData,
}: ChangePasswordFormProps) {
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [countdown, setCountdown] = useState(0);
   const [isSending, setIsSending] = useState(false);
   const timerRef = useRef<any>(null);

   const {
      control,
      handleSubmit,
      formState: { errors },
   } = useForm<FormData>({
      resolver: zodResolver(changePasswordSchema),
      defaultValues: {
         phone,
         code: '',
         password: '',
         confirm: '',
      },
   });

   const onSubmit = async (data: FormData) => {
      try {
         setIsSubmitting(true);
         await onSubmitFormData(data);
      } catch (error) {
         console.error('提交表单失败:', error);
      } finally {
         setIsSubmitting(false);
      }
   };

   // 倒计时效果
   useEffect(() => {
      if (countdown > 0) {
         timerRef.current = setTimeout(() => {
            setCountdown(countdown - 1);
         }, 1000);
      }
      return () => {
         if (timerRef.current) {
            clearTimeout(timerRef.current);
         }
      };
   }, [countdown]);

   // 发送验证码
   const handleSendCode = async () => {
      if (isSending || countdown > 0) return;

      try {
         setIsSending(true);
         await sendCode({ phone });
         setCountdown(60);
         Alert.alert('成功', '验证码已发送，请注意查收');
      } catch (error: any) {
         const errorMessage =
            error?.response?.data?.error || error?.message || '发送验证码失败';
         Alert.alert('错误', errorMessage);
      } finally {
         setIsSending(false);
      }
   };

   return (
      <View>
         {/* 手机号码 - 只读 */}
         <Controller
            control={control}
            name="phone"
            render={({ field: { value } }) => (
               <ThemedInput
                  label="手机号码"
                  value={value}
                  editable={false}
                  placeholder="手机号码"
               />
            )}
         />

         {/* 验证码 */}
         <Controller
            control={control}
            name="code"
            render={({ field: { onChange, onBlur, value } }) => (
               <ThemedInput
                  label="验证码"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="请输入验证码"
                  keyboardType="number-pad"
                  error={errors.code?.message}
                  rightButton={
                     <ThemedButton
                        title={
                           countdown > 0
                              ? `${countdown}秒后重试`
                              : isSending
                                ? '发送中...'
                                : '发送验证码'
                        }
                        onPress={handleSendCode}
                        disabled={isSending || countdown > 0}
                        style={styles.sendButton}
                     />
                  }
               />
            )}
         />

         {/* 新密码 */}
         <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
               <ThemedInput
                  label="新密码"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="请输入新密码（6-20位数字或字母）"
                  secureTextEntry
                  autoCapitalize="none"
                  error={errors.password?.message}
               />
            )}
         />

         {/* 确认密码 */}
         <Controller
            control={control}
            name="confirm"
            render={({ field: { onChange, onBlur, value } }) => (
               <ThemedInput
                  label="确认新密码"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="请再次输入新密码"
                  secureTextEntry
                  autoCapitalize="none"
                  error={errors.confirm?.message}
               />
            )}
         />

         {/* 提交按钮 */}
         <ThemedButton
            title="修改密码"
            onPress={handleSubmit(onSubmit)}
            loading={isSubmitting}
            disabled={isSubmitting}
         />
      </View>
   );
}

const styles = StyleSheet.create({
   sendButton: {
      paddingHorizontal: Spacing.sm,
      minWidth: 0,
   },
});
