/** @import { ClientEvents } from 'discord.js' */

const { errorHandler } = require('#utils');

/**
 * @this {ClientEvents['error'][0]}
 * @param {Client} client */
module.exports = function error(client) {
  return void errorHandler.call(client, this);
};