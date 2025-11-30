import { Link } from 'expo-router';
import { YStack, H1, Text, Button } from 'tamagui';
import { Home } from '@tamagui/lucide-icons';

export default function NotFoundScreen() {
   return (
      <YStack
         flex={1}
         backgroundColor="$background"
         justifyContent="center"
         alignItems="center"
         padding="$4"
         space="$4"
      >
         <H1 fontSize="$10">404</H1>
         <Text fontSize="$6" color="$gray11">
            页面未找到
         </Text>
         <Text color="$gray11" textAlign="center">
            抱歉，您访问的页面不存在
         </Text>
         <Link href="/(tabs)" asChild>
            <Button icon={<Home size={20} />} theme="blue">
               返回首页
            </Button>
         </Link>
      </YStack>
   );
}
