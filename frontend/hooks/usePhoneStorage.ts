import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PHONE_STORAGE_KEY = '@fullstackapp_saved_phone';

/**
 * 记住手机号功能 Hook
 *
 * 使用 AsyncStorage 保存用户上次登录的手机号，
 * 下次打开应用时自动填充
 *
 * @returns {object} 包含保存的手机号、加载状态和保存方法
 */
export function usePhoneStorage() {
   const [savedPhone, setSavedPhone] = useState<string | null>(null);
   const [isLoading, setIsLoading] = useState(true);

   // 组件加载时读取保存的手机号
   useEffect(() => {
      loadSavedPhone();
   }, []);

   /**
    * 从 AsyncStorage 读取保存的手机号
    */
   const loadSavedPhone = async () => {
      try {
         const phone = await AsyncStorage.getItem(PHONE_STORAGE_KEY);
         setSavedPhone(phone);
      } catch (error) {
         console.error('Failed to load saved phone number:', error);
      } finally {
         setIsLoading(false);
      }
   };

   /**
    * 保存手机号到 AsyncStorage
    * @param phoneNumber 要保存的手机号
    */
   const savePhone = async (phoneNumber: string) => {
      try {
         await AsyncStorage.setItem(PHONE_STORAGE_KEY, phoneNumber);
         setSavedPhone(phoneNumber);
      } catch (error) {
         console.error('Failed to save phone number:', error);
      }
   };

   /**
    * 清除保存的手机号
    */
   const clearPhone = async () => {
      try {
         await AsyncStorage.removeItem(PHONE_STORAGE_KEY);
         setSavedPhone(null);
      } catch (error) {
         console.error('Failed to clear phone number:', error);
      }
   };

   return {
      savedPhone,
      isLoading,
      savePhone,
      clearPhone,
   };
}
