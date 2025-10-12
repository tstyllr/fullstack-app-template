import { Colors } from '@/constants/theme';
import { useColorScheme } from './use-color-scheme';

export default function useThemeColors() {
   const colorScheme = useColorScheme();
   const colors = Colors[colorScheme ?? 'light'];
   return colors;
}
