import { Button, ButtonProps } from 'tamagui';

export function ThemeButton(props: ButtonProps) {
   return (
      <Button
         theme="blue"
         pressStyle={{ scale: 0.95 }}
         animation="quick"
         {...props}
      />
   );
}
