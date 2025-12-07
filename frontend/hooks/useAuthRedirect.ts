import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useSession } from '@/lib/auth-client';

/**
 * 自动认证跳转 Hook
 *
 * 功能：
 * 1. 未认证用户访问任何页面 → 自动跳转到 /login
 * 2. 已认证用户访问 /login 页面 → 自动跳转到主页 /(app)
 *
 * 在根布局中调用此 Hook 即可实现全局导航守卫
 */
export function useAuthRedirect() {
   const { data: session, isPending } = useSession();
   const segments = useSegments();
   const router = useRouter();

   useEffect(() => {
      // 等待 session 加载完成
      if (isPending) return;

      // 检查当前是否在认证路由组 (auth)
      const inAuthGroup = segments[0] === '(auth)';

      if (!session && !inAuthGroup) {
         // 未认证用户 && 不在认证页面 → 跳转到登录页
         router.replace('/login');
      } else if (session && inAuthGroup) {
         // 已认证用户 && 在认证页面 → 跳转到主页
         router.replace('/(app)');
      }
   }, [session, isPending, segments, router]);

   return {
      isAuthenticated: !!session,
      isLoading: isPending,
   };
}
