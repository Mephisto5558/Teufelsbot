const { errorHandler } = require('#Utils');

/**
 * @this {import('discord.js').ClientEvents['error'][0]}
 * @param {Client}client */
module.exports = function error(client) {
  return void errorHandler.call(client, this);
};