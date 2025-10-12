import Toast from 'react-native-toast-message';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Toast 工具函数
 * 提供统一的消息提示接口，支持成功、错误、警告和信息提示
 */

interface ToastOptions {
   /**
    * 主标题
    */
   title: string;
   /**
    * 副标题/详细描述（可选）
    */
   message?: string;
   /**
    * 显示时长（毫秒），默认 4000ms
    */
   duration?: number;
   /**
    * 是否启用触觉反馈，默认 true（仅移动端）
    */
   haptics?: boolean;
}

/**
 * 显示成功提示
 * @example
 * showSuccess({ title: '操作成功', message: '数据已保存' })
 */
export function showSuccess(options: ToastOptions) {
   const { title, message, duration = 4000, haptics = true } = options;

   if (haptics && Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
   }

   Toast.show({
      type: 'success',
      text1: title,
      text2: message,
      visibilityTime: duration,
      position: 'top',
   });
}

/**
 * 显示错误提示
 * @example
 * showError({ title: '操作失败', message: '请检查网络连接' })
 */
export function showError(options: ToastOptions) {
   const { title, message, duration = 4000, haptics = true } = options;

   if (haptics && Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
   }

   Toast.show({
      type: 'error',
      text1: title,
      text2: message,
      visibilityTime: duration,
      position: 'top',
   });
}

/**
 * 显示警告提示
 * @example
 * showWarning({ title: '注意', message: '当前操作可能影响数据' })
 */
export function showWarning(options: ToastOptions) {
   const { title, message, duration = 4000, haptics = true } = options;

   if (haptics && Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
   }

   Toast.show({
      type: 'warning',
      text1: title,
      text2: message,
      visibilityTime: duration,
      position: 'top',
   });
}

/**
 * 显示信息提示
 * @example
 * showInfo({ title: '提示', message: '验证码已发送到您的手机' })
 */
export function showInfo(options: ToastOptions) {
   const { title, message, duration = 4000, haptics = true } = options;

   if (haptics && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
   }

   Toast.show({
      type: 'info',
      text1: title,
      text2: message,
      visibilityTime: duration,
      position: 'top',
   });
}

/**
 * 从错误对象中提取错误信息
 * 支持多种错误格式：axios 错误、标准 Error、自定义错误对象
 */
export function extractErrorMessage(error: any): string {
   // Axios 错误格式
   if (error?.response?.data?.error) {
      return error.response.data.error;
   }

   // 自定义错误对象
   if (error?.error) {
      return error.error;
   }

   // 标准 Error 对象
   if (error?.message) {
      return error.message;
   }

   // 字符串错误
   if (typeof error === 'string') {
      return error;
   }

   // 默认错误信息
   return '操作失败，请稍后重试';
}

/**
 * 便捷函数：显示 API 错误
 * 自动从错误对象中提取错误信息
 * @example
 * try {
 *   await someApi()
 * } catch (error) {
 *   showApiError(error, '登录失败')
 * }
 */
export function showApiError(error: any, defaultTitle = '操作失败') {
   const message = extractErrorMessage(error);
   showError({
      title: defaultTitle,
      message,
   });
}
