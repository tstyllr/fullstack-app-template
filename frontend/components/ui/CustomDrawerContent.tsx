import React from 'react';
import {
   DrawerContentScrollView,
   DrawerItem,
   DrawerContentComponentProps,
} from '@react-navigation/drawer';
import { YStack, Separator } from 'tamagui';
import { Settings } from '@tamagui/lucide-icons';
import { useRouter } from 'expo-router';
import { ConversationList } from './ConversationList';
import { useConversationContext } from '@/contexts/ConversationContext';
import { useCreateConversation } from '@/hooks/useConversations';

export function CustomDrawerContent(props: DrawerContentComponentProps) {
   const router = useRouter();
   const { currentConversationId, setCurrentConversationId } =
      useConversationContext();
   const createConversation = useCreateConversation();

   const handleSelectConversation = (id: string) => {
      setCurrentConversationId(id);
      props.navigation.closeDrawer();
   };

   const handleCreateNew = async () => {
      try {
         const newConversation = await createConversation.mutateAsync({
            model: 'deepseek/deepseek-chat',
         });
         setCurrentConversationId(newConversation.id);
         props.navigation.closeDrawer();
      } catch (err) {
         console.error('Failed to create conversation:', err);
      }
   };

   return (
      <DrawerContentScrollView
         {...props}
         contentContainerStyle={{ paddingVertical: 0 }}
      >
         <YStack flex={1}>
            {/* 会话列表 */}
            <YStack flex={1}>
               <ConversationList
                  currentConversationId={currentConversationId}
                  onSelectConversation={handleSelectConversation}
                  onCreateNew={handleCreateNew}
               />
            </YStack>

            {/* 分隔线 */}
            <Separator marginVertical="$2" />

            {/* 设置 */}
            <YStack padding="$2">
               <DrawerItem
                  label="设置"
                  icon={({ color, size }) => (
                     <Settings color={color} size={size} />
                  )}
                  onPress={() => {
                     props.navigation.closeDrawer();
                     router.push('/(app)/settings');
                  }}
                  activeBackgroundColor="#007AFF20"
                  activeTintColor="#007AFF"
               />
            </YStack>
         </YStack>
      </DrawerContentScrollView>
   );
}
