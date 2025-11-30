import { Stack } from 'expo-router';

/**
 * 认证路由组布局
 * 用于登录、注册等认证相关页面
 * 不显示底部 Tabs 导航栏
 */
export default function AuthLayout() {
   return (
      <Stack
         screenOptions={{
            headerShown: false,
         }}
      />
   );
}
