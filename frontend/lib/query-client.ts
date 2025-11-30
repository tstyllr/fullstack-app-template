import { QueryClient } from '@tanstack/react-query';

/**
 * React Query 客户端配置
 * 用于管理 Better Auth 的 session 状态和其他异步数据
 */
export const queryClient = new QueryClient({
   defaultOptions: {
      queries: {
         // Session 数据缓存时间（5分钟）
         staleTime: 1000 * 60 * 5,
         // 保持数据在后台更新
         refetchOnWindowFocus: true,
         // 失败后重试次数
         retry: 1,
      },
   },
});
