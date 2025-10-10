/** @import { getDirectories } from '.' */

const { readdir } = require('node:fs/promises');

/** @type {getDirectories} */
module.exports = async function getDirectories(path) {
  return (await readdir(path, { withFileTypes: true })).reduce((acc, e) => e.isDirectory() ? [...acc, e.name] : acc, []);
};