/** @import { ClientEvents } from 'discord.js' */

/** @this {ClientEvents['threadCreate'][0]} */
module.exports = async function threadCreate() {
  return this.joinable ? this.join() : undefined;
};