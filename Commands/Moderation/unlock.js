// The current commandHandler and slashCommandHandler implementations modify the cached command directly.

/** @param {string} module */
function requireUncached(module) {
  const
    moduleId = require.resolve(module),
    cachedModule = require.cache[moduleId];

  /* eslint-disable-next-line @typescript-eslint/no-dynamic-delete */
  delete require.cache[moduleId];
  const newModule = require(module);
  require.cache[moduleId] = cachedModule;

  return newModule;
}

module.exports = requireUncached('./lock');