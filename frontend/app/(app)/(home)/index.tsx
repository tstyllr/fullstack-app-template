import { YStack, Text, Spinner, Button } from 'tamagui';
import { ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { MessageSquare, Plus } from '@tamagui/lucide-icons';
import { useEffect, useRef } from 'react';
import {
   useConversations,
   useCreateConversation,
} from '@/hooks/useConversations';
import { useConversationChat } from '@/hooks/useConversationChat';
import { MessageBubble } from '@/components/ui/MessageBubble';
import { ChatInput } from '@/components/ui/ChatInput';
import { useConversationContext } from '@/contexts/ConversationContext';

export default function HomeScreen() {
   const scrollViewRef = useRef<ScrollView>(null);
   const { currentConversationId, setCurrentConversationId } =
      useConversationContext();

   const { data: conversationsData } = useConversations();
   const createConversation = useCreateConversation();

   const { messages, sendMessage, status, error } = useConversationChat(
      currentConversationId
   );

   // 自动选择第一个会话
   useEffect(() => {
      if (!currentConversationId && conversationsData?.conversations?.length) {
         setCurrentConversationId(conversationsData.conversations[0].id);
      }
   }, [conversationsData, currentConversationId]);

   // 自动滚动到底部
   useEffect(() => {
      if (messages.length > 0) {
         setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
         }, 100);
      }
   }, [messages]);

   const handleCreateNew = async () => {
      try {
         const newConversation = await createConversation.mutateAsync({
            model: 'deepseek/deepseek-chat',
         });
         setCurrentConversationId(newConversation.id);
      } catch (err) {
         console.error('Failed to create conversation:', err);
      }
   };

   const handleSendMessage = (text: string) => {
      if (!currentConversationId) return;
      sendMessage({ text });
   };

   // 头部创建新会话按钮（使用 navigation.setOptions 而不是 router.setParams）
   // 暂时移除，因为 Expo Router 6 的 setParams 不支持函数类型
   // 创建新会话功能通过 Drawer 中的按钮实现

   // 没有会话时显示欢迎界面
   if (!currentConversationId) {
      return (
         <YStack
            flex={1}
            backgroundColor="$background"
            justifyContent="center"
            alignItems="center"
            gap="$4"
            padding="$4"
         >
            <MessageSquare size={64} color="$gray10" />
            <Text fontSize="$6" fontWeight="600" color="$color">
               欢迎使用 AI 聊天助手
            </Text>
            <Text fontSize="$4" color="$gray11" textAlign="center">
               基于 DeepSeek 的智能对话系统
            </Text>
            <Button
               size="$5"
               backgroundColor="$blue10"
               color="white"
               icon={Plus}
               onPress={handleCreateNew}
               pressStyle={{ backgroundColor: '$blue11' }}
               marginTop="$4"
            >
               开始新对话
            </Button>
         </YStack>
      );
   }

   // 错误状态
   if (error) {
      return (
         <YStack
            flex={1}
            backgroundColor="$background"
            justifyContent="center"
            alignItems="center"
            padding="$4"
         >
            <Text color="$red10" fontSize="$5" textAlign="center">
               {error.message}
            </Text>
            <Button
               size="$4"
               marginTop="$4"
               onPress={() => setCurrentConversationId(null)}
            >
               返回
            </Button>
         </YStack>
      );
   }

   return (
      <KeyboardAvoidingView
         style={{ flex: 1 }}
         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
         keyboardVerticalOffset={100}
      >
         <YStack flex={1} backgroundColor="$background">
            {/* 消息列表 */}
            <ScrollView
               ref={scrollViewRef}
               style={{ flex: 1 }}
               contentContainerStyle={{ paddingVertical: 16 }}
            >
               {messages.length === 0 ? (
                  <YStack
                     flex={1}
                     justifyContent="center"
                     alignItems="center"
                     padding="$4"
                     minHeight={400}
                  >
                     <MessageSquare size={48} color="$gray10" />
                     <Text color="$gray11" marginTop="$2" fontSize="$4">
                        开始对话吧
                     </Text>
                  </YStack>
               ) : (
                  messages.map((message) => {
                     // 从 message.parts 中提取文本内容
                     const textContent = message.parts
                        .filter((part) => part.type === 'text')
                        .map((part) => (part as any).text)
                        .join('');

                     return (
                        <MessageBubble
                           key={message.id}
                           role={message.role as 'user' | 'assistant'}
                           content={textContent}
                        />
                     );
                  })
               )}

               {/* 加载状态 */}
               {status !== 'ready' && status !== 'error' && (
                  <YStack
                     alignSelf="flex-start"
                     marginVertical="$2"
                     marginHorizontal="$3"
                  >
                     <Spinner size="small" color="$blue10" />
                  </YStack>
               )}
            </ScrollView>

            {/* 输入框 */}
            <ChatInput
               onSend={handleSendMessage}
               disabled={status !== 'ready' || !currentConversationId}
               placeholder={
                  status !== 'ready' && status !== 'error'
                     ? 'AI 正在思考...'
                     : '输入消息...'
               }
            />
         </YStack>
      </KeyboardAvoidingView>
   );
}
