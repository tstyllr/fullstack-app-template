import { useContext } from 'react';
import {
   ColorSchemeName,
   useColorScheme as useSystemColorScheme,
} from 'react-native';
import { ThemeContext } from '@/components/molecules/theme-context';

export function useColorScheme() {
   const themeContext = useContext(ThemeContext);
   const systemColorScheme = useSystemColorScheme();
   const defaultColorScheme: ColorSchemeName = 'light';

   // 如果在 ThemeProvider 内部，使用其提供的 colorScheme
   if (themeContext) {
      return themeContext.colorScheme || defaultColorScheme;
   }

   // 否则回退到系统主题
   return systemColorScheme || defaultColorScheme;
}
