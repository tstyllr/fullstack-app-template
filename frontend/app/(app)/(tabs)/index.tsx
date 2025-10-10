import { StyleSheet } from 'react-native';
import { ResponsiveContainer } from '@/components/atoms/responsive-container';
import ChatBot from '@/components/organisms/ChatBot';

export default function HomeScreen() {
   return (
      <ResponsiveContainer
         maxWidth="sm"
         enableHorizontalPadding={false}
         style={styles.container}
      >
         <ChatBot />
      </ResponsiveContainer>
   );
}

const styles = StyleSheet.create({
   container: {
      flex: 1,
   },
});
