/** @this {import('discord.js').Guild}*/
module.exports = async function guildCreate() {
  log.debug(`Joined new guild: ${this.id}`);
  if (this.client.botType == 'dev') return;

  await this.client.db.update('guildSettings', `${this.id}.position`, (Math.max(...Object.values(this.client.db.get('guildSettings')).map(e => e.position ?? 0)) || 0) + 1);
  await this.client.db.delete('guildSettings', `${this.id}.leftAt`);
};