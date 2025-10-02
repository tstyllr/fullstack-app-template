import { useState } from 'react';
import {
   KeyboardAvoidingView,
   Platform,
   Pressable,
   StyleSheet,
   TextInput,
   View,
} from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';

export type ChatFormData = {
   prompt: string;
};

type Props = {
   onSubmit: (data: ChatFormData) => void;
};

const ChatInput = ({ onSubmit }: Props) => {
   const [prompt, setPrompt] = useState('');
   const backgroundColor = useThemeColor({}, 'background');
   const textColor = useThemeColor({}, 'text');
   const borderColor = useThemeColor({}, 'border');

   const handleSubmit = () => {
      if (prompt.trim().length === 0) return;

      onSubmit({ prompt });
      setPrompt('');
   };

   const isValid = prompt.trim().length > 0;

   return (
      <KeyboardAvoidingView
         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
         keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
         <View style={[styles.container, { borderColor }]}>
            <TextInput
               style={[styles.input, { color: textColor, backgroundColor }]}
               value={prompt}
               onChangeText={setPrompt}
               placeholder="Ask anything"
               placeholderTextColor={
                  backgroundColor === '#fff' ? '#9ca3af' : '#6b7280'
               }
               multiline
               maxLength={1000}
               returnKeyType="send"
               onSubmitEditing={handleSubmit}
               blurOnSubmit={false}
            />
            <Pressable
               onPress={handleSubmit}
               disabled={!isValid}
               style={[styles.button, { opacity: isValid ? 1 : 0.5 }]}
            >
               <IconSymbol name="arrow.up" size={20} color="#fff" />
            </Pressable>
         </View>
      </KeyboardAvoidingView>
   );
};

const styles = StyleSheet.create({
   container: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 8,
      borderWidth: 2,
      borderRadius: 24,
      padding: 16,
      margin: 16,
   },
   input: {
      flex: 1,
      fontSize: 16,
      maxHeight: 120,
   },
   button: {
      backgroundColor: '#2563eb',
      borderRadius: 18,
      width: 36,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center',
   },
});

export default ChatInput;
