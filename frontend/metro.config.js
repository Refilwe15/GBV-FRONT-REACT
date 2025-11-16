const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for web and other file extensions
config.resolver.assetExts.push('db', 'sqlite');
config.resolver.sourceExts.push('jsx', 'js', 'ts', 'tsx', 'json');

// Enable symlinks for better monorepo support
config.resolver.disableHierarchicalLookup = false;

module.exports = config;
