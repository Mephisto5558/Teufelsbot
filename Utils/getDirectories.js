const { readdir } = require('node:fs/promises');

/**
 * @param {string}path
 * @returns {Promise<string[]>} directory names*/
module.exports = async path => (await readdir(path, { withFileTypes: true })).reduce((acc, e) => e.isDirectory() ? [...acc, e.name] : acc, []);