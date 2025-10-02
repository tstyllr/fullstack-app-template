import { useEffect, useRef } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { useThemeColor } from '@/hooks/use-theme-color';

export type Message = {
   content: string;
   role: 'user' | 'bot';
};

type Props = {
   messages: Message[];
};

const ChatMessages = ({ messages }: Props) => {
   const flatListRef = useRef<FlatList>(null);
   const backgroundColor = useThemeColor({}, 'background');
   const textColor = useThemeColor({}, 'text');

   useEffect(() => {
      if (messages.length > 0) {
         flatListRef.current?.scrollToEnd({ animated: true });
      }
   }, [messages]);

   const renderMessage = ({ item }: { item: Message }) => {
      const isUser = item.role === 'user';

      return (
         <View
            style={[
               styles.messageContainer,
               isUser ? styles.userMessage : styles.botMessage,
            ]}
         >
            <View
               style={[
                  styles.messageBubble,
                  {
                     backgroundColor: isUser
                        ? '#2563eb'
                        : backgroundColor === '#fff'
                          ? '#f3f4f6'
                          : '#374151',
                  },
               ]}
            >
               <Markdown
                  style={{
                     body: {
                        color: isUser ? '#ffffff' : textColor,
                     },
                     paragraph: {
                        marginTop: 0,
                        marginBottom: 0,
                     },
                  }}
               >
                  {item.content}
               </Markdown>
            </View>
         </View>
      );
   };

   return (
      <FlatList
         ref={flatListRef}
         data={messages}
         renderItem={renderMessage}
         keyExtractor={(_, index) => index.toString()}
         contentContainerStyle={styles.listContainer}
         showsVerticalScrollIndicator={false}
      />
   );
};

const styles = StyleSheet.create({
   listContainer: {
      padding: 16,
      gap: 12,
   },
   messageContainer: {
      flexDirection: 'row',
   },
   userMessage: {
      justifyContent: 'flex-end',
   },
   botMessage: {
      justifyContent: 'flex-start',
   },
   messageBubble: {
      maxWidth: '75%',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 12,
   },
});

export default ChatMessages;
