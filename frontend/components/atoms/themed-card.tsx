import { View, type ViewProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

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
   const backgroundColor = useThemeColor(
      { light: lightColor, dark: darkColor },
      'backgroundSecondary'
   );

   return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
