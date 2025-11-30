import { z } from 'zod';

/**
 * 手机号验证规则
 * - 支持11位中国手机号（如：13800138000）
 * - 或国际格式（如：+8613800138000）
 */
export const phoneSchema = z
   .string()
   .min(1, '请输入手机号')
   .regex(
      /^(\+\d{10,15}|1[3-9]\d{9})$/,
      '请输入有效的手机号（如：13800138000）'
   );

/**
 * 短信验证码验证规则
 * - 必须是 6 位数字
 */
export const otpSchema = z
   .string()
   .min(1, '请输入验证码')
   .regex(/^\d{6}$/, '验证码必须是6位数字');

/**
 * 密码验证规则
 * - 最少 8 位字符
 * - 至少包含一个字母和一个数字
 */
export const passwordSchema = z
   .string()
   .min(8, '密码至少需要8位字符')
   .regex(/^(?=.*[A-Za-z])(?=.*\d).+$/, '密码必须包含字母和数字');

/**
 * OTP 登录表单验证规则
 */
export const otpLoginSchema = z.object({
   phoneNumber: phoneSchema,
   code: otpSchema,
});

/**
 * 密码登录表单验证规则
 */
export const passwordLoginSchema = z.object({
   phoneNumber: phoneSchema,
   password: passwordSchema,
});

/**
 * 发送 OTP 验证规则（仅需手机号）
 */
export const sendOtpSchema = z.object({
   phoneNumber: phoneSchema,
});

// 导出类型定义
export type OtpLoginInput = z.infer<typeof otpLoginSchema>;
export type PasswordLoginInput = z.infer<typeof passwordLoginSchema>;
export type SendOtpInput = z.infer<typeof sendOtpSchema>;
