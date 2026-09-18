const { getDefaultConfig } = require("expo/metro-config");
const { resolve } = require("path");

const config = getDefaultConfig(__dirname);

// ── Workspace module resolution ────────────────────────────────────────
// Metro's project root is packages/mobile/. In a Bun workspace, packages
// installed via `npx expo install` may end up in packages/mobile/node_modules
// while hoisted deps live at the workspace root node_modules/. Tell Metro
// to search both so every install path resolves correctly.
const workspaceRoot = resolve(__dirname, "../..");

config.watchFolders = [workspaceRoot];
config.resolver = {
  ...config.resolver,
  nodeModulesPaths: [resolve(__dirname, "node_modules"), resolve(workspaceRoot, "node_modules")],
};

// ── tslib ─────────────────────────────────────────────────────────────
// pdf-lib (the scan → PDF builder) is compiled against tslib and imports its helpers by
// name. tslib's package exports point an `import` at `modules/index.js`, which re-exports a
// CJS file through a default import — under Metro that default lands as `undefined` and
// every helper destructured from it blows up at bundle start ("Cannot destructure property
// '__extends' of 'tslib.default'"), taking the whole app down. Point every `tslib` request
// straight at the ES module build, which has no interop hop.
const tslibEs6 = require.resolve("tslib/tslib.es6.js", { paths: [__dirname] });
const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "tslib") return { type: "sourceFile", filePath: tslibEs6 };
  return (defaultResolveRequest ?? context.resolveRequest)(context, moduleName, platform);
};

module.exports = config;
