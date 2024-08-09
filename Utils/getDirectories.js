const { readdir } = require('node:fs/promises');

/** @type {import('.').getDirectories}*/
module.exports = async function getDirectories(path) {
  return (await readdir(path, { withFileTypes: true })).reduce((acc, e) => e.isDirectory() ? [...acc, e.name] : acc, []);
};