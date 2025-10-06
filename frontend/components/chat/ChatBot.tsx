import React, { useState, useCallback, useEffect } from 'react';
import {
   GiftedChat,
   IMessage,
   Bubble,
   MessageText,
   Send,
   InputToolbar,
   SystemMessage,
   AvatarProps,
} from 'react-native-gifted-chat';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useAuth } from '@/components/contexts/auth-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { sendMessage } from '@/lib/api/chat';
import Markdown from 'react-native-markdown-display';

export default function ChatBot() {
   const [messages, setMessages] = useState<IMessage[]>([]);
   const [isTyping, setIsTyping] = useState(false);
   const [previousResponseId, setPreviousResponseId] = useState<
      string | undefined
   >();

   const { user } = useAuth();
   const colorScheme = useColorScheme();
   const isDark = colorScheme === 'dark';

   // Theme colors
   const backgroundColor = useThemeColor({}, 'background');
   const textColor = useThemeColor({}, 'text');
   const tintColor = useThemeColor({}, 'tint');
   const borderColor = useThemeColor({}, 'border');

   useEffect(() => {
      // Add welcome message
      setMessages([
         {
            _id: 'welcome',
            text: "Hello! I'm your AI assistant. How can I help you today?",
            createdAt: new Date(),
            user: {
               _id: 'bot',
               name: 'AI Assistant',
               avatar: '🤖',
            },
            system: false,
         },
      ]);
   }, []);

   const onSend = useCallback(
      async (newMessages: IMessage[] = []) => {
         if (newMessages.length === 0) return;

         const userMessage = newMessages[0];

         // Add user message to chat
         setMessages((previousMessages) =>
            GiftedChat.append(previousMessages, newMessages)
         );

         // Show typing indicator
         setIsTyping(true);

         try {
            // Call the API
            const response = await sendMessage({
               prompt: userMessage.text,
               previousResponseId,
            });

            // Update previousResponseId for conversation continuity
            setPreviousResponseId(response.responseId);

            // Create bot message
            const botMessage: IMessage = {
               _id: response.responseId,
               text: response.message,
               createdAt: new Date(),
               user: {
                  _id: 'bot',
                  name: 'AI Assistant',
                  avatar: '🤖',
               },
            };

            // Add bot message to chat
            setMessages((previousMessages) =>
               GiftedChat.append(previousMessages, [botMessage])
            );
         } catch (error) {
            console.error('Error sending message:', error);

            // Show error message
            const errorMessage: IMessage = {
               _id: `error-${Date.now()}`,
               text: 'Sorry, I encountered an error. Please try again.',
               createdAt: new Date(),
               user: {
                  _id: 'system',
                  name: 'System',
               },
               system: true,
            };

            setMessages((previousMessages) =>
               GiftedChat.append(previousMessages, [errorMessage])
            );
         } finally {
            setIsTyping(false);
         }
      },
      [previousResponseId]
   );

   const renderBubble = (props: any) => {
      return (
         <Bubble
            {...props}
            wrapperStyle={{
               right: {
                  backgroundColor: tintColor,
                  marginVertical: 8,
               },
               left: {
                  backgroundColor: isDark ? '#2d3748' : '#f3f4f6',
                  marginVertical: 8,
               },
            }}
            textStyle={{
               right: {
                  color: isDark ? '#fff' : '#fff',
               },
               left: {
                  color: textColor,
               },
            }}
            renderMessageText={(messageProps) => {
               const { currentMessage } = messageProps;
               if (!currentMessage) return null;

               const isBot = currentMessage.user._id === 'bot';

               if (isBot) {
                  return (
                     <View style={styles.markdownContainer}>
                        <Markdown
                           style={{
                              body: {
                                 color: textColor,
                                 fontSize: 16,
                              },
                              code_inline: {
                                 backgroundColor: isDark
                                    ? '#1a202c'
                                    : '#e2e8f0',
                                 color: textColor,
                                 fontSize: 14,
                                 padding: 4,
                                 borderRadius: 4,
                              },
                              code_block: {
                                 backgroundColor: isDark
                                    ? '#1a202c'
                                    : '#e2e8f0',
                                 color: textColor,
                                 fontSize: 14,
                                 padding: 8,
                                 borderRadius: 4,
                              },
                              fence: {
                                 backgroundColor: isDark
                                    ? '#1a202c'
                                    : '#e2e8f0',
                                 color: textColor,
                                 fontSize: 14,
                                 padding: 8,
                                 borderRadius: 4,
                              },
                           }}
                        >
                           {currentMessage.text}
                        </Markdown>
                     </View>
                  );
               }

               return (
                  <MessageText
                     {...messageProps}
                     textStyle={{
                        left: { color: textColor },
                        right: { color: '#fff' },
                     }}
                  />
               );
            }}
         />
      );
   };

   const renderSend = (props: any) => {
      return (
         <Send
            {...props}
            containerStyle={styles.sendContainer}
            textStyle={{ color: tintColor }}
         />
      );
   };

   const renderInputToolbar = (props: any) => {
      return (
         <InputToolbar
            {...props}
            containerStyle={[
               styles.inputToolbar,
               {
                  backgroundColor: backgroundColor,
                  borderTopColor: borderColor,
               },
            ]}
            primaryStyle={{ alignItems: 'center' }}
            textInputStyle={{ color: textColor }}
         />
      );
   };

   const renderSystemMessage = (props: any) => {
      return (
         <SystemMessage
            {...props}
            textStyle={{
               color: isDark ? '#a0aec0' : '#718096',
            }}
         />
      );
   };

   const renderFooter = () => {
      if (isTyping) {
         return (
            <View style={styles.typingIndicator}>
               <ActivityIndicator size="small" color={tintColor} />
            </View>
         );
      }
      return null;
   };

   const renderAvatar = (props: AvatarProps<IMessage>) => {
      const { currentMessage } = props;
      const avatar = currentMessage?.user?.avatar;

      if (!avatar || typeof avatar === 'function') return null;

      return (
         <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{avatar}</Text>
         </View>
      );
   };

   return (
      <GiftedChat
         messages={messages}
         onSend={(messages) => onSend(messages)}
         user={{
            _id: user?.id || 'user',
            name: user?.phone || 'You',
            avatar: '🐱',
         }}
         renderBubble={renderBubble}
         renderSend={renderSend}
         renderInputToolbar={renderInputToolbar}
         renderSystemMessage={renderSystemMessage}
         renderFooter={renderFooter}
         alwaysShowSend
         isScrollToBottomEnabled={true}
         showUserAvatar={true}
         renderAvatar={renderAvatar}
         placeholder="Type a message..."
         textInputProps={{
            placeholderTextColor: isDark ? '#718096' : '#a0aec0',
         }}
         messagesContainerStyle={{
            backgroundColor: backgroundColor,
         }}
         bottomOffset={0}
      />
   );
}

const styles = StyleSheet.create({
   sendContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'center',
      marginRight: 10,
   },
   inputToolbar: {
      borderTopWidth: 1,
      paddingVertical: 8,
   },
   typingIndicator: {
      paddingHorizontal: 16,
      paddingVertical: 8,
   },
   markdownContainer: {
      paddingHorizontal: 12,
      paddingVertical: 8,
   },
   avatarContainer: {
      marginBottom: 8,
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f0f0f0',
   },
   avatarText: {
      fontSize: 24,
   },
});
