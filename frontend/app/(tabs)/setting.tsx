import { StyleSheet } from 'react-native';

import ParallaxScrollView from '@/components/templates/parallax-scroll-view';
import { ThemedText } from '@/components/atoms/themed-text';
import { ThemedView } from '@/components/atoms/themed-view';
import { IconSymbol } from '@/components/atoms/icon-symbol';
import { Fonts } from '@/constants/theme';

export default function TabTwoScreen() {
   return (
      <ParallaxScrollView
         headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
         headerImage={
            <IconSymbol
               size={310}
               color="#808080"
               name="gear.circle.fill"
               style={styles.headerImage}
            />
         }
      >
         <ThemedView style={styles.titleContainer}>
            <ThemedText
               type="title"
               style={{
                  fontFamily: Fonts.rounded,
               }}
            >
               设置
            </ThemedText>
         </ThemedView>
      </ParallaxScrollView>
   );
}

const styles = StyleSheet.create({
   headerImage: {
      color: '#808080',
      bottom: -90,
      left: -35,
      position: 'absolute',
   },
   titleContainer: {
      flexDirection: 'row',
      gap: 8,
   },
});
