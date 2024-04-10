const { readdir } = require('node:fs/promises');

/**
 * @param {string}path
 * @returns {Promise<string[]>} directory names*/
module.exports = async function getDirectories(path) {
  return (await readdir(path, { withFileTypes: true })).reduce((acc, e) => e.isDirectory() ? [...acc, e.name] : acc, []);
};