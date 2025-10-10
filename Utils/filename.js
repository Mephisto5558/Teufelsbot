/** @import { filename } from '.' */

const { basename, extname } = require('node:path');

/** @type {filename} */
module.exports = function getFilename(path) {
  return basename(path, extname(path));
};