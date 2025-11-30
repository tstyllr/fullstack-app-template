import { YStack, H1, Text, Button } from 'tamagui';
import { LogIn } from '@tamagui/lucide-icons';

/**
 * 登录页面（占位）
 * 暂时只显示提示信息，不实现具体的登录功能
 */
export default function LoginScreen() {
   return (
      <YStack
         flex={1}
         backgroundColor="$background"
         padding="$4"
         justifyContent="center"
         alignItems="center"
         gap="$4"
      >
         <YStack alignItems="center" gap="$2">
            <LogIn size={64} color="$blue10" />
            <H1 fontSize="$8">登录页面</H1>
         </YStack>

         <YStack width="100%" maxWidth={400} gap="$3" paddingVertical="$6">
            <Text fontSize="$5" textAlign="center" color="$gray11">
               此页面为认证功能占位页面
            </Text>
            <Text fontSize="$4" textAlign="center" color="$gray10">
               登录功能将在后续实现
            </Text>
         </YStack>

         <YStack
            width="100%"
            maxWidth={400}
            gap="$2"
            backgroundColor="$gray3"
            padding="$4"
            borderRadius="$4"
         >
            <Text fontSize="$3" fontWeight="bold" color="$gray12">
               功能说明：
            </Text>
            <Text fontSize="$2" color="$gray11">
               • 未认证用户会自动跳转到此页面
            </Text>
            <Text fontSize="$2" color="$gray11">
               • 已认证用户会自动跳转到主页
            </Text>
            <Text fontSize="$2" color="$gray11">
               • Session状态由Better Auth管理
            </Text>
            <Text fontSize="$2" color="$gray11">
               • Token安全存储在SecureStore中
            </Text>
         </YStack>

         <Button size="$5" theme="blue" opacity={0.5} disabled>
            登录功能待实现
         </Button>
      </YStack>
   );
}
