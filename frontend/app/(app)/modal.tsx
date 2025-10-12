import { Link } from 'expo-router';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/atoms/themed-text';
import { ThemedCard } from '@/components/atoms/themed-card';

export default function ModalScreen() {
   return (
      <ThemedCard style={styles.container}>
         <ThemedText type="title">This is a modal</ThemedText>
         <Link href="/" dismissTo style={styles.link}>
            <ThemedText type="link">Go to home screen</ThemedText>
         </Link>
      </ThemedCard>
   );
}

const styles = StyleSheet.create({
   container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
   },
   link: {
      marginTop: 15,
      paddingVertical: 15,
   },
});
