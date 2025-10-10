/** @import { ClientEvents } from 'discord.js' */

/** @this {ClientEvents['guildDelete'][0]} */
module.exports = async function guildDelete() {
  if (this.client.guilds.cache.has(this.id)) return; // guild unavailable

  log.debug(`Left guild: ${this.id}`);
  await this.updateDB('leftAt', new Date());
};