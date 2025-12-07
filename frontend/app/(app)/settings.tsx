import { YStack, Button } from 'tamagui';
import { authClient } from '@/lib/auth-client';

export default function SettingsScreen() {
   return (
      <YStack
         flex={1}
         backgroundColor="$background"
         justifyContent="center"
         alignItems="center"
         padding="$4"
      >
         <Button
            theme="red"
            size="$5"
            onPress={() => {
               authClient.signOut();
            }}
         >
            退出登陆
         </Button>
      </YStack>
   );
}
