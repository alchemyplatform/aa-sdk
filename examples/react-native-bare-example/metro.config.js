const {getDefaultConfig} = require('@react-native/metro-config');

const path = require('path');

// Find the project and workspace directories
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot, projectRoot];

// to the real shared packages name.

// config.watchFolders = [projectRoot, ...Object.values(monorepoPackages)];

// Add all the React Native node_modules paths
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'account-kit/rn-signer/node_modules'),
  path.resolve(workspaceRoot, 'account-kit/rn-signer/example/node_modules'),
  path.resolve(
    workspaceRoot,
    'examples/react-native-expo-example/node_modules',
  ),
];
// Force Metro to resolve (sub)dependencies only from the `nodeModulesPaths`
config.resolver.disableHierarchicalLookup = true;

config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  ...require('node-libs-react-native'),
  crypto: require.resolve('crypto-browserify'),
  stream: require.resolve('stream-browserify'),
};

module.exports = config;
