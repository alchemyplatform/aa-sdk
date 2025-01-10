const path = require("path");
const { getDefaultConfig } = require("@react-native/metro-config");
const rnSignerRoot = path.resolve(__dirname, "..");
const projectRoot = __dirname;
// handles the hoisted modules
const repoRoot = path.resolve(__dirname, "../../..");

const config = getDefaultConfig(projectRoot);

const monorepoPackages = {
	"@account-kit/signer": path.resolve(repoRoot, "account-kit/signer"),
	"@aa-sdk/core": path.resolve(repoRoot, "aa-sdk/core"),
	"@account-kit/logging": path.resolve(repoRoot, "account-kit/logging"),
};

config.watchFolders = [
	projectRoot,
	rnSignerRoot,
	...Object.values(monorepoPackages),
];

// Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
	path.resolve(projectRoot, "node_modules"),
	path.resolve(rnSignerRoot, "node_modules"),
	path.resolve(repoRoot, "node_modules"),
];

// Force Metro to resolve (sub)dependencies only from the `nodeModulesPaths`
config.resolver.disableHierarchicalLookup = true;

config.resolver.extraNodeModules = {
	...config.resolver.extraNodeModules,
	...require("node-libs-react-native"),
	...monorepoPackages,
	crypto: require.resolve("crypto-browserify"),
	stream: require.resolve("stream-browserify"),
};

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 */
module.exports = config;
