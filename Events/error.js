const { errorHandler } = require('#Utils');

/**
 * @this {Error}
 * @param {Client}client */
module.exports = function error(client) {
  return void errorHandler.call(client, this);
};