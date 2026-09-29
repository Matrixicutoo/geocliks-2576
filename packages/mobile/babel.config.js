/**
 * Metro was transforming the app without a Babel config of its own, which left it on inferred
 * defaults that choke on modern syntax inside dependencies: a static class block in
 * @orpc/client was enough to fail the entire bundle. Naming babel-preset-expo puts every
 * transform the SDK expects back in play, and the static-block plugin is listed outright
 * because the offending file lives in the workspace-root store, outside this package, where
 * the preset's own target detection does not reach it.
 */
module.exports = (api) => {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: ["@babel/plugin-transform-class-static-block"],
  };
};
