/** @this {import('discord.js').ClientEvents['guildDelete'][0]} */
module.exports = async function guildDelete() {
  log.debug(`Left guild: ${this.id}`);
  await this.updateDB('leftAt', new Date());
};