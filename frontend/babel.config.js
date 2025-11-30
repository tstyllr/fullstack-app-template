module.exports = function (api) {
   api.cache(true);
   return {
      presets: ['babel-preset-expo'],
      plugins: [
         [
            '@tamagui/babel-plugin',
            {
               components: ['tamagui'],
               config: './tamagui.config.ts',
               logTimings: true,
            },
         ],
         // Required for Reanimated web support
         '@babel/plugin-proposal-export-namespace-from',
         // NOTE: react-native-reanimated/plugin must be listed last
         'react-native-reanimated/plugin',
      ],
   };
};
