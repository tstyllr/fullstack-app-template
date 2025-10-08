import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
   createContext,
   useContext,
   useState,
   useEffect,
   ReactNode,
} from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';

export type ThemeMode = 'system' | 'light' | 'dark';
export type ColorScheme = 'light' | 'dark';

interface ThemeContextType {
   themeMode: ThemeMode;
   colorScheme: ColorScheme;
   setThemeMode: (mode: ThemeMode) => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(
   undefined
);

const THEME_STORAGE_KEY = 'theme-preference';

export function ThemeProvider({ children }: { children: ReactNode }) {
   const systemColorScheme = useSystemColorScheme();
   const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
   const [isLoaded, setIsLoaded] = useState(false);

   // 计算实际使用的 colorScheme
   const colorScheme: ColorScheme =
      themeMode === 'system' ? (systemColorScheme ?? 'light') : themeMode;

   // 从 AsyncStorage 加载主题设置
   useEffect(() => {
      AsyncStorage.getItem(THEME_STORAGE_KEY)
         .then((value) => {
            if (value && ['system', 'light', 'dark'].includes(value)) {
               setThemeModeState(value as ThemeMode);
            }
            setIsLoaded(true);
         })
         .catch(() => {
            setIsLoaded(true);
         });
   }, []);

   // 设置主题并保存到 AsyncStorage
   const setThemeMode = (mode: ThemeMode) => {
      setThemeModeState(mode);
      AsyncStorage.setItem(THEME_STORAGE_KEY, mode).catch((error) => {
         console.error('Failed to save theme preference:', error);
      });
   };

   // 在加载完成前不渲染子组件，避免闪烁
   if (!isLoaded) {
      return null;
   }

   return (
      <ThemeContext.Provider value={{ themeMode, colorScheme, setThemeMode }}>
         {children}
      </ThemeContext.Provider>
   );
}

export function useTheme() {
   const context = useContext(ThemeContext);
   if (context === undefined) {
      throw new Error('useTheme must be used within a ThemeProvider');
   }
   return context;
}
