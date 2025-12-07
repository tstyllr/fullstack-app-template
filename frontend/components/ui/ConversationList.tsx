import { YStack, Text, Spinner, Button } from 'tamagui';
import { MessageSquare, Plus, Trash2 } from '@tamagui/lucide-icons';
import {
   useConversations,
   useDeleteConversation,
} from '@/hooks/useConversations';
import type { Conversation } from '@/hooks/useConversations';
import { TouchableOpacity } from 'react-native';

interface ConversationListProps {
   currentConversationId: string | null;
   onSelectConversation: (conversationId: string) => void;
   onCreateNew: () => void;
}

export function ConversationList({
   currentConversationId,
   onSelectConversation,
   onCreateNew,
}: ConversationListProps) {
   const { data, isLoading, error } = useConversations();
   const deleteConversation = useDeleteConversation();

   const handleDelete = async (conversationId: string, e: any) => {
      e.stopPropagation();
      try {
         await deleteConversation.mutateAsync(conversationId);
         // 如果删除的是当前会话，清空选择
         if (conversationId === currentConversationId) {
            onSelectConversation('');
         }
      } catch (error) {
         console.error('Failed to delete conversation:', error);
      }
   };

   if (isLoading) {
      return (
         <YStack
            flex={1}
            justifyContent="center"
            alignItems="center"
            padding="$4"
         >
            <Spinner size="large" color="$blue10" />
         </YStack>
      );
   }

   if (error) {
      return (
         <YStack
            flex={1}
            justifyContent="center"
            alignItems="center"
            padding="$4"
         >
            <Text color="$red10">加载会话失败</Text>
         </YStack>
      );
   }

   const conversations = data?.conversations || [];

   return (
      <YStack flex={1} backgroundColor="$background">
         {/* 新建按钮 */}
         <YStack
            padding="$4"
            borderBottomWidth={1}
            borderBottomColor="$borderColor"
         >
            <Button
               size="$4"
               backgroundColor="$blue10"
               color="white"
               icon={Plus}
               onPress={onCreateNew}
               pressStyle={{ backgroundColor: '$blue11' }}
            >
               新建会话
            </Button>
         </YStack>

         {/* 会话列表 */}
         <YStack flex={1}>
            {conversations.length === 0 ? (
               <YStack
                  flex={1}
                  justifyContent="center"
                  alignItems="center"
                  padding="$4"
               >
                  <MessageSquare size={48} color="$gray10" />
                  <Text color="$gray10" marginTop="$2">
                     暂无会话
                  </Text>
               </YStack>
            ) : (
               conversations.map((conversation: Conversation) => (
                  <TouchableOpacity
                     key={conversation.id}
                     onPress={() => onSelectConversation(conversation.id)}
                  >
                     <YStack
                        padding="$4"
                        borderBottomWidth={1}
                        borderBottomColor="$borderColor"
                        backgroundColor={
                           currentConversationId === conversation.id
                              ? '$blue3'
                              : '$background'
                        }
                        hoverStyle={{ backgroundColor: '$gray3' }}
                        pressStyle={{ backgroundColor: '$gray4' }}
                        flexDirection="row"
                        justifyContent="space-between"
                        alignItems="center"
                     >
                        <YStack flex={1} gap="$2">
                           <Text
                              fontSize="$5"
                              fontWeight="600"
                              color="$color"
                              numberOfLines={1}
                           >
                              {conversation.title || '新会话'}
                           </Text>
                           {conversation.lastMessage && (
                              <Text
                                 fontSize="$3"
                                 color="$gray11"
                                 numberOfLines={2}
                              >
                                 {conversation.lastMessage}
                              </Text>
                           )}
                           <Text fontSize="$2" color="$gray10">
                              {new Date(
                                 conversation.updatedAt
                              ).toLocaleDateString('zh-CN')}
                           </Text>
                        </YStack>

                        {/* 删除按钮 */}
                        <TouchableOpacity
                           onPress={(e) => handleDelete(conversation.id, e)}
                        >
                           <YStack
                              padding="$2"
                              borderRadius="$2"
                              hoverStyle={{ backgroundColor: '$red3' }}
                              pressStyle={{ backgroundColor: '$red4' }}
                           >
                              <Trash2 size={18} color="$red10" opacity={0.7} />
                           </YStack>
                        </TouchableOpacity>
                     </YStack>
                  </TouchableOpacity>
               ))
            )}
         </YStack>
      </YStack>
   );
}
