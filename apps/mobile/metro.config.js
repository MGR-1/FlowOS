const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Watch the whole monorepo, not just this app
config.watchFolders = [workspaceRoot];

// Let Metro find modules in both this app's node_modules and the root's
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

// CRITICAL for pnpm monorepos: force a single resolution tree so packages
// like @flowos/ui-shared can't pull in their own nested copy of react-native
config.resolver.disableHierarchicalLookup = true;

module.exports = config;
