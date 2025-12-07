import { Drawer } from 'expo-router/drawer';
import { CustomDrawerContent } from '@/components/ui';

export default function HomeLayout() {
   return (
      <Drawer
         drawerContent={(props) => <CustomDrawerContent {...props} />}
         screenOptions={{
            headerShown: true,
            drawerPosition: 'left',
         }}
      >
         <Drawer.Screen
            name="index"
            options={{
               title: '首页',
               drawerItemStyle: { display: 'none' },
            }}
         />
      </Drawer>
   );
}
