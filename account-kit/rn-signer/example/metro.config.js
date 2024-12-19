const path = require("path");
const { getDefaultConfig } = require("@react-native/metro-config");
const { getConfig } = require("react-native-builder-bob/metro-config");
const pkg = require("../package.json");

// handles the hoisted modules
const root = path.resolve(__dirname, "..");
const repoRoot = path.resolve(__dirname, "../../..");
const bareExamplePath = path.resolve(
  __dirname,
  "../../../examples/react-native-bare-example"
);
const expoExamplePath = path.resolve(
  __dirname,
  "../../../examples/react-native-expo-example"
);

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 */
const defaultResolver = getDefaultConfig(__dirname).resolver;

module.exports = {
  ...getConfig(getDefaultConfig(__dirname), {
    root,
    pkg,
    project: __dirname,
  }),
  watchFolders: [__dirname, root, repoRoot],
  resolver: {
    ...defaultResolver,
    disableHierarchicalLookup: true,
    nodeModulesPaths: [
      path.resolve(__dirname, "node_modules"),
      path.resolve(repoRoot, "node_modules"),
      path.resolve(root, "node_modules"),
      path.resolve(bareExamplePath, "node_modules"),
      path.resolve(expoExamplePath, "node_modules"),
    ],
  },
};
