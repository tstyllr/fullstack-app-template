import { Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';
import { Typography } from '@/constants/theme';

export type ThemedTextProps = TextProps & {
   lightColor?: string;
   darkColor?: string;
   type?:
      | 'tiny'
      | 'small'
      | 'smallSemiBold'
      | 'default'
      | 'defaultSemiBold'
      | 'subtitle'
      | 'link'
      | 'title';
};

export function ThemedText({
   style,
   lightColor,
   darkColor,
   type = 'default',
   ...rest
}: ThemedTextProps) {
   const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

   return (
      <Text
         style={[
            { color },
            type === 'tiny' ? Typography.tiny : undefined,
            type === 'small' ? Typography.small : undefined,
            type === 'smallSemiBold' ? Typography.smallSemiBold : undefined,
            type === 'default' ? Typography.default : undefined,
            type === 'defaultSemiBold' ? Typography.defaultSemiBold : undefined,
            type === 'subtitle' ? Typography.subtitle : undefined,
            type === 'link' ? Typography.link : undefined,
            type === 'title' ? Typography.title : undefined,
            style,
         ]}
         {...rest}
      />
   );
}
