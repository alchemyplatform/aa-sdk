/**
 * Metro Bundler configuration
 * https://facebook.github.io/metro/docs/en/configuration
 *
 * eslint-env node, es6
 */

const { getDefaultConfig } = require("@react-native/metro-config");

const defaultConfig = getDefaultConfig(__dirname);
const { assetExts, sourceExts } = defaultConfig.resolver;

const exclusionList = require("metro-config/src/defaults/exclusionList");
const getWorkspaces = require("get-yarn-workspaces");
const path = require("path");

function getConfig(appDir, options = {}) {
  const workspaces = getWorkspaces(appDir);
  // Add additional Yarn workspace package roots to the module map
  // https://bit.ly/2LHHTP0
  const watchFolders = [
    path.resolve(appDir, "..", "..", "node_modules"),
    ...workspaces.filter((workspaceDir) => workspaceDir.includes("packages")),
  ];
  console.log("watchFolders", watchFolders);

  return {
    watchFolders,
    transformer: {
      babelTransformerPath: require.resolve("react-native-svg-transformer"),
      getTransformOptions: async () => ({
        transform: {
          experimentalImportSupport: false,
          inlineRequires: false,
        },
      }),
    },
    resolver: {
      assetExts: assetExts.filter((ext) => ext !== "svg"),
      sourceExts: [...sourceExts, "svg"],
      extraNodeModules: {
        // Resolve all react-native module imports to the locally-installed version
        "react-native": path.resolve(appDir, "node_modules", "react-native"),

        // Resolve additional nohoist modules depended on by other packages
        "react-native-svg": path.resolve(
          appDir,
          "node_modules",
          "react-native-svg",
        ),

        // Resolve core-js imports to the locally installed version
        "core-js": path.resolve(appDir, "node_modules", "core-js"),
      },
    },
  };
}

module.exports = getConfig(__dirname);
