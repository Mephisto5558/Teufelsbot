const { readdir } = require('fs/promises');

/**@returns {string[]} directory names*/
module.exports = async path => (await readdir(path, { withFileTypes: true })).reduce((acc, e) => e.isDirectory() ? [...acc, e.name] : acc, []);