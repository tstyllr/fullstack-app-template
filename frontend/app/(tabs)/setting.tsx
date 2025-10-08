import { StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import ParallaxScrollView from '@/components/templates/parallax-scroll-view';
import { ThemedText } from '@/components/atoms/themed-text';
import { ThemedView } from '@/components/atoms/themed-view';
import { IconSymbol } from '@/components/atoms/icon-symbol';
import { SettingItem } from '@/components/molecules/setting-item';
import { Fonts, Spacing } from '@/constants/theme';

export default function TabTwoScreen() {
   const router = useRouter();

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

         <ThemedView style={styles.settingsSection}>
            <SettingItem
               icon="paintbrush.fill"
               title="主题"
               subtitle="外观和主题设置"
               onPress={() => router.push('/(tabs)/theme')}
            />
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
      marginBottom: Spacing.md,
   },
   settingsSection: {
      borderRadius: 8,
      overflow: 'hidden',
   },
});
