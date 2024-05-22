/** @this {import('discord.js').Guild}*/
module.exports = async function guildDelete() {
  log.debug(`Left guild: ${this.id}`);
  await this.updateDB('leftAt', new Date());
};