import { StyleSheet } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import ChatBot from '@/components/chat/ChatBot';

export default function HomeScreen() {
   return (
      <ThemedView style={styles.container}>
         <ChatBot />
      </ThemedView>
   );
}

const styles = StyleSheet.create({
   container: {
      flex: 1,
   },
});
