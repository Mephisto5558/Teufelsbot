/** @this {import('discord.js').Guild}*/
module.exports = async function guildDelete() {
  log.debug(`Left guild: ${this.id}`);
  await this.client.db.update('guildSettings', `${this.id}.leftAt`, new Date());
};