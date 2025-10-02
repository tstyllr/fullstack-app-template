import { useState } from 'react';
import { StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { sendMessage } from '@/lib/api/chat';
import ChatInput, { type ChatFormData } from './ChatInput';
import ChatMessages, { type Message } from './ChatMessages';
import TypingIndicator from './TypingIndicator';

const ChatBot = () => {
   const [messages, setMessages] = useState<Message[]>([]);
   const [isBotTyping, setIsBotTyping] = useState(false);
   const [error, setError] = useState('');
   const [previousResponseId, setPreviousResponseId] = useState(
      crypto.randomUUID()
   );

   const onSubmit = async ({ prompt }: ChatFormData) => {
      try {
         setMessages((prev) => [...prev, { content: prompt, role: 'user' }]);
         setIsBotTyping(true);
         setError('');

         // Haptic feedback on user message send
         await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

         const data = await sendMessage({
            prompt,
            previousResponseId,
         });

         setMessages((prev) => [
            ...prev,
            { content: data.message, role: 'bot' },
         ]);
         setPreviousResponseId(data.responseId as any);

         // Haptic feedback on bot response
         await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success
         );
      } catch (error) {
         console.error(error);
         setError('Something went wrong, try again!');
         await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Error
         );
      } finally {
         setIsBotTyping(false);
      }
   };

   return (
      <ThemedView style={styles.container}>
         <ThemedView style={styles.messagesContainer}>
            <ChatMessages messages={messages} />
            {isBotTyping && <TypingIndicator />}
            {error && <ThemedText style={styles.error}>{error}</ThemedText>}
         </ThemedView>
         <ChatInput onSubmit={onSubmit} />
      </ThemedView>
   );
};

const styles = StyleSheet.create({
   container: {
      flex: 1,
   },
   messagesContainer: {
      flex: 1,
   },
   error: {
      color: '#ef4444',
      paddingHorizontal: 16,
      paddingVertical: 8,
   },
});

export default ChatBot;
