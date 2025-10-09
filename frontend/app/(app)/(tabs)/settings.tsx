import { StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import ParallaxScrollView from '@/components/templates/parallax-scroll-view';
import { IconSymbol } from '@/components/atoms/icon-symbol';
import { SettingItem } from '@/components/molecules/setting-item';

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
         <SettingItem
            icon="paintbrush.fill"
            title="主题"
            subtitle="外观和主题设置"
            onPress={() => router.push('/settings/theme' as any)}
         />
         <SettingItem
            icon="person.circle.fill"
            title="账号设置"
            subtitle="账号信息、密码和登录管理"
            onPress={() => router.push('/settings/account' as any)}
         />
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
});
