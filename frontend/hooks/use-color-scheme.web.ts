import { useContext, useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';
import { ThemeContext } from '@/components/molecules/theme-context';

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web
 */
export function useColorScheme() {
   const themeContext = useContext(ThemeContext);
   const systemColorScheme = useRNColorScheme();
   const [hasHydrated, setHasHydrated] = useState(false);

   useEffect(() => {
      setHasHydrated(true);
   }, []);

   // 如果在 ThemeProvider 内部，使用其提供的 colorScheme
   if (themeContext) {
      // 在 hydration 之前返回 'light' 避免闪烁
      if (!hasHydrated) {
         return 'light';
      }
      return themeContext.colorScheme;
   }

   // 否则回退到系统主题
   if (hasHydrated) {
      return systemColorScheme;
   }

   return 'light';
}
