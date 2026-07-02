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

// Single react/react-native version is now enforced via pnpm-workspace.yaml
// overrides, so we don't need to disable hierarchical lookup anymore —
// doing so was blocking Metro from finding legitimately hoisted packages
// (like @expo/metro-runtime) when resolving from inside nested .pnpm folders.

module.exports = config;
