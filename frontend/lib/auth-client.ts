import { createAuthClient } from 'better-auth/react';
import { expoClient } from '@better-auth/expo/client';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

// 获取API基础URL（开发环境默认使用localhost:3000）
const getBaseURL = () => {
   // 从环境变量获取API URL
   const apiUrl = process.env.EXPO_PUBLIC_API_URL;

   if (apiUrl) {
      return apiUrl;
   }

   // 开发环境默认配置
   if (__DEV__) {
      // 在真机上需要使用电脑的局域网IP，而不是localhost
      // 在模拟器上可以使用localhost
      return 'http://localhost:3000';
   }

   // 生产环境需要配置实际的API地址
   return 'https://your-production-api.com';
};

/**
 * Better Auth 客户端配置
 * 用于Expo React Native应用的认证管理
 */
export const authClient = createAuthClient({
   baseURL: getBaseURL(),
   plugins: [
      expoClient({
         // App scheme - 需要与 app.json 中的 scheme 一致
         scheme: 'fullstackapp',
         // SecureStore 存储前缀
         storagePrefix: 'fullstackapp_auth',
         // 使用 expo-secure-store 安全存储 token
         storage: SecureStore,
      }),
   ],
});

// 导出常用的认证方法，方便使用
export const { useSession, signIn, signOut, signUp } = authClient;
