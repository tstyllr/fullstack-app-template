import { XStack, Input, Button } from 'tamagui';
import { Send } from '@tamagui/lucide-icons';
import { useState } from 'react';

interface ChatInputProps {
   onSend: (message: string) => void;
   disabled?: boolean;
   placeholder?: string;
}

export function ChatInput({
   onSend,
   disabled = false,
   placeholder = '输入消息...',
}: ChatInputProps) {
   const [input, setInput] = useState('');

   const handleSend = () => {
      const trimmedInput = input.trim();
      if (trimmedInput && !disabled) {
         onSend(trimmedInput);
         setInput('');
      }
   };

   return (
      <XStack
         padding="$3"
         gap="$2"
         backgroundColor="$background"
         borderTopWidth={1}
         borderTopColor="$borderColor"
         alignItems="center"
      >
         <Input
            flex={1}
            size="$4"
            placeholder={placeholder}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={handleSend}
            disabled={disabled}
            backgroundColor="$gray3"
            borderColor="$borderColor"
            placeholderTextColor="$gray10"
            returnKeyType="send"
         />
         <Button
            size="$4"
            icon={Send}
            backgroundColor="$blue10"
            color="white"
            onPress={handleSend}
            disabled={disabled || !input.trim()}
            pressStyle={{ backgroundColor: '$blue11' }}
            opacity={disabled || !input.trim() ? 0.5 : 1}
         >
            发送
         </Button>
      </XStack>
   );
}
