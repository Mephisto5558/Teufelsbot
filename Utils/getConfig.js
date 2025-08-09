const configPath = require('node:path').resolve(process.cwd(), 'config.json');

module.exports = function getConfig() {
  return require(configPath);
};