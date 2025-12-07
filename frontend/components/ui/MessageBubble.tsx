import { YStack, Text } from 'tamagui';
import Markdown from 'react-native-markdown-display';
import { useColorScheme } from 'react-native';

interface MessageBubbleProps {
   role: 'user' | 'assistant';
   content: string;
}

export function MessageBubble({ role, content }: MessageBubbleProps) {
   const colorScheme = useColorScheme();
   const isDark = colorScheme === 'dark';

   const isUser = role === 'user';

   const markdownStyles = {
      body: {
         color: isUser ? '#ffffff' : isDark ? '#ffffff' : '#000000',
      },
      code_inline: {
         backgroundColor: isUser
            ? 'rgba(255,255,255,0.2)'
            : isDark
              ? 'rgba(255,255,255,0.1)'
              : 'rgba(0,0,0,0.05)',
         color: isUser ? '#ffffff' : isDark ? '#ffffff' : '#000000',
         padding: 4,
         borderRadius: 4,
         fontFamily: 'monospace',
      },
      code_block: {
         backgroundColor: isUser
            ? 'rgba(255,255,255,0.2)'
            : isDark
              ? 'rgba(255,255,255,0.1)'
              : 'rgba(0,0,0,0.05)',
         color: isUser ? '#ffffff' : isDark ? '#ffffff' : '#000000',
         padding: 12,
         borderRadius: 8,
         fontFamily: 'monospace',
      },
      fence: {
         backgroundColor: isUser
            ? 'rgba(255,255,255,0.2)'
            : isDark
              ? 'rgba(255,255,255,0.1)'
              : 'rgba(0,0,0,0.05)',
         color: isUser ? '#ffffff' : isDark ? '#ffffff' : '#000000',
         padding: 12,
         borderRadius: 8,
         fontFamily: 'monospace',
      },
      heading1: {
         fontSize: 24,
         fontWeight: 'bold' as any,
         color: isUser ? '#ffffff' : isDark ? '#ffffff' : '#000000',
      },
      heading2: {
         fontSize: 20,
         fontWeight: 'bold' as any,
         color: isUser ? '#ffffff' : isDark ? '#ffffff' : '#000000',
      },
      heading3: {
         fontSize: 18,
         fontWeight: 'bold' as any,
         color: isUser ? '#ffffff' : isDark ? '#ffffff' : '#000000',
      },
      strong: {
         fontWeight: 'bold' as any,
         color: isUser ? '#ffffff' : isDark ? '#ffffff' : '#000000',
      },
      em: {
         fontStyle: 'italic' as any,
         color: isUser ? '#ffffff' : isDark ? '#ffffff' : '#000000',
      },
      table: {
         borderWidth: 1,
         borderColor: isUser
            ? 'rgba(255,255,255,0.3)'
            : isDark
              ? 'rgba(255,255,255,0.2)'
              : 'rgba(0,0,0,0.1)',
         borderRadius: 4,
      },
      tr: {
         borderBottomWidth: 1,
         borderColor: isUser
            ? 'rgba(255,255,255,0.3)'
            : isDark
              ? 'rgba(255,255,255,0.2)'
              : 'rgba(0,0,0,0.1)',
      },
      th: {
         padding: 8,
         fontWeight: 'bold' as any,
         backgroundColor: isUser
            ? 'rgba(255,255,255,0.1)'
            : isDark
              ? 'rgba(255,255,255,0.05)'
              : 'rgba(0,0,0,0.03)',
      },
      td: {
         padding: 8,
      },
      blockquote: {
         backgroundColor: isUser
            ? 'rgba(255,255,255,0.1)'
            : isDark
              ? 'rgba(255,255,255,0.05)'
              : 'rgba(0,0,0,0.03)',
         borderLeftWidth: 4,
         borderLeftColor: isUser
            ? 'rgba(255,255,255,0.5)'
            : isDark
              ? 'rgba(255,255,255,0.3)'
              : 'rgba(0,0,0,0.2)',
         paddingLeft: 12,
         paddingVertical: 8,
         marginVertical: 8,
      },
      link: {
         color: isUser ? '#93c5fd' : '#3b82f6',
         textDecorationLine: 'underline' as any,
      },
      list_item: {
         color: isUser ? '#ffffff' : isDark ? '#ffffff' : '#000000',
      },
   };

   return (
      <YStack
         alignSelf={isUser ? 'flex-end' : 'flex-start'}
         maxWidth="80%"
         marginVertical="$2"
         marginHorizontal="$3"
      >
         <YStack
            backgroundColor={isUser ? '$blue10' : isDark ? '$gray5' : '$gray3'}
            padding="$3"
            borderRadius="$4"
         >
            <Markdown style={markdownStyles}>{content}</Markdown>
         </YStack>
         <Text
            fontSize="$1"
            color="$gray10"
            marginTop="$1"
            alignSelf={isUser ? 'flex-end' : 'flex-start'}
         >
            {isUser ? '你' : 'AI'}
         </Text>
      </YStack>
   );
}
