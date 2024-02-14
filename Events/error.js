const { errorHandler } = require('../Utils');

/**
 * @this {Error}
 * @param {Client}client
 * @returns {Promise<void>}*/
module.exports = function error(client) {
  return errorHandler.call(client, this);
};