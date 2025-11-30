import { shorthands } from '@tamagui/shorthands';
import { themes, tokens } from '@tamagui/themes';
import { createTamagui, createFont } from 'tamagui';
import { createAnimations } from '@tamagui/animations-react-native';

// Create system fonts configuration
const systemFont = createFont({
   family: 'System',
   size: {
      1: 11,
      2: 12,
      3: 13,
      4: 14,
      5: 16,
      6: 18,
      7: 20,
      8: 23,
      9: 30,
      10: 46,
      11: 55,
      12: 62,
   },
   lineHeight: {
      1: 17,
      2: 22,
      3: 25,
      4: 25,
      5: 26,
      6: 28,
      7: 30,
      8: 36,
      9: 43,
      10: 55,
      11: 65,
      12: 72,
   },
   weight: {
      1: '300',
      2: '400',
      3: '500',
      4: '600',
      5: '700',
      6: '800',
      7: '900',
   },
   letterSpacing: {
      1: 0,
      2: -0.5,
      3: -1,
      4: -1.5,
      5: -2,
   },
});

// Create Tamagui configuration with system fonts and preset themes
const config = createTamagui({
   tokens,
   themes,
   shorthands,
   fonts: {
      heading: systemFont,
      body: systemFont,
   },
   animations: createAnimations({
      quick: {
         type: 'spring',
         damping: 20,
         mass: 1.2,
         stiffness: 250,
      },
      slow: {
         type: 'spring',
         damping: 20,
         mass: 1.2,
         stiffness: 100,
      },
   }),
});

export type AppConfig = typeof config;

declare module 'tamagui' {
   interface TamaguiCustomConfig extends AppConfig {}
}

export default config;
