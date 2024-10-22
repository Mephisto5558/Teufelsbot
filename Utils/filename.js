/* eslint-disable-next-line @typescript-eslint/unbound-method -- not an issue with `node:path`*/
const { basename, extname } = require('node:path');

/** @type {import('.').filename}*/
module.exports = function getFilename(path) {
  return basename(path, extname(path));
};