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
config.resolver.disableHierarchicalLookup = true;

config.resolver.extraNodeModules = {
	...config.resolver.extraNodeModules,
	crypto: require.resolve("react-native-get-random-values"),
	stream: require.resolve("stream-browserify"),
};

// Important to allow importing package exports
config.resolver.unstable_enablePackageExports = true;

config.resolver.unstable_conditionNames = [
	"browser",
	"require",
	"react-native",
];

module.exports = config;
