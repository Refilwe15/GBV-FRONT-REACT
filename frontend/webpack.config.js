const createExpoWebpackConfig = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfig(env, argv);
  
  // Customize the config before returning it.
  config.resolve.alias = {
    ...config.resolve.alias,
    'react-native$': 'react-native-web',
    'react-native-maps': 'react-native-web-maps',
  };
  
  return config;
};
