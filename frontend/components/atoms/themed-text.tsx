import { Text, type TextProps } from 'react-native';

import { Typography } from '@/constants/theme';
import useThemeColors from '@/hooks/use-theme-colors';

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
   const colors = useThemeColors();

   return (
      <Text
         style={[
            { color: colors.text },
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
