const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

// Find the project and workspace directories
const projectRoot = __dirname;
// This can be replaced with `find-yarn-workspace-root`
const monorepoRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Add aliases for file-system import based modules
const ALIASES = {
	"@noble/hashes/crypto": path.resolve(
		monorepoRoot,
		"node_modules/@noble/hashes/crypto.js"
	),
};

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

// Default to file-based module resolution for file-system import based modules
config.resolver.resolveRequest = (context, moduleName, platform) => {
	if (ALIASES[moduleName]) {
		return {
			filePath: ALIASES[moduleName],
			type: "sourceFile",
		};
	}
	return context.resolveRequest(context, moduleName, platform);
};

config.resolver.extraNodeModules = {
	...config.resolver.extraNodeModules,
	crypto: require.resolve('crypto-browserify'),
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
