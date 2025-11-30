import { Card, XStack, YStack, Text } from 'tamagui';
import { ReactNode } from 'react';

interface FeatureCardProps {
   icon: ReactNode;
   title: string;
   description: string;
   iconColor?: string;
}

export function FeatureCard({
   icon,
   title,
   description,
   iconColor,
}: FeatureCardProps) {
   return (
      <Card
         bordered
         padding="$3"
         pressStyle={{ scale: 0.98 }}
         animation="quick"
         hoverStyle={{ borderColor: '$blue8' }}
      >
         <XStack space="$3" alignItems="center">
            {icon}
            <YStack flex={1}>
               <Text fontWeight="bold">{title}</Text>
               <Text color="$gray11" fontSize="$3">
                  {description}
               </Text>
            </YStack>
         </XStack>
      </Card>
   );
}
