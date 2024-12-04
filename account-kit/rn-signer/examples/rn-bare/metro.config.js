const path = require("path");
const { getDefaultConfig } = require("@react-native/metro-config");
const { getConfig } = require("react-native-builder-bob/metro-config");
const pkg = require("../../package.json");

const root = path.resolve(__dirname, "../..");
// handles the hoisted modules
const repoRoot = path.resolve(__dirname, "../../../..");

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 */
module.exports = {
  ...getConfig(getDefaultConfig(__dirname), {
    root,
    pkg,
    project: __dirname,
  }),
  watchFolders: [root, repoRoot],
};
