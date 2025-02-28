const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

// Find the project and workspace directories
const projectRoot = __dirname;
// This can be replaced with `find-yarn-workspace-root`
const monorepoRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo
config.watchFolders = [projectRoot, monorepoRoot];

// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
	path.resolve(projectRoot, "node_modules"),
	path.resolve(monorepoRoot, "node_modules"),
	path.resolve(monorepoRoot, "account-kit/rn-signer/node_modules"),
];

// Force Metro to resolve (sub)dependencies only from the `nodeModulesPaths`
// config.resolver.disableHierarchicalLookup = true;

config.resolver.extraNodeModules = {
	...config.resolver.extraNodeModules,
	...require("node-libs-react-native"),
	crypto: require.resolve("crypto-browserify"),
	stream: require.resolve("stream-browserify"),
};

module.exports = config;
