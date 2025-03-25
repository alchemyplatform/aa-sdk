const {getDefaultConfig} = require('@react-native/metro-config');

const path = require('path');

// Find the project and workspace directories
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot, projectRoot];

// Add aliases for file-system import based modules
const ALIASES = {
	"@noble/hashes/crypto": path.resolve(
		workspaceRoot,
		"node_modules/@noble/hashes/crypto.js"
	),
};

// to the real shared packages name.

// config.watchFolders = [projectRoot, ...Object.values(monorepoPackages)];

// Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'account-kit/rn-signer/node_modules'),
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
  ...require('node-libs-react-native'),
  crypto: require.resolve('crypto-browserify'),
  stream: require.resolve('stream-browserify'),
};

// Important to allow importing package exports
config.resolver.unstable_enablePackageExports = true;

config.resolver.unstable_conditionNames = [
	"browser",
	"require",
	"react-native",
];

module.exports = config;
