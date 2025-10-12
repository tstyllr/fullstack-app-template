import { View, type ViewProps } from 'react-native';

import useThemeColors from '@/hooks/use-theme-colors';

export type ThemedCardProps = ViewProps & {
   lightColor?: string;
   darkColor?: string;
};

export function ThemedCard({
   style,
   lightColor,
   darkColor,
   ...otherProps
}: ThemedCardProps) {
   const colors = useThemeColors();

   return (
      <View
         style={[{ backgroundColor: colors.backgroundSecondary }, style]}
         {...otherProps}
      />
   );
}
