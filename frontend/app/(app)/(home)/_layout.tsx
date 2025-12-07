import { Drawer } from 'expo-router/drawer';
import { CustomDrawerContent } from '@/components/ui';
import { ConversationProvider } from '@/contexts/ConversationContext';

export default function HomeLayout() {
   return (
      <ConversationProvider>
         <Drawer
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            screenOptions={{
               headerShown: true,
               drawerPosition: 'left',
            }}
         >
            <Drawer.Screen
               name="index"
               options={{
                  title: 'AI 聊天助手',
                  drawerItemStyle: { display: 'none' },
               }}
            />
         </Drawer>
      </ConversationProvider>
   );
}
