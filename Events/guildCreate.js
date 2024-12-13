/** @this {import('discord.js').Guild} */
module.exports = async function guildCreate() {
  log.debug(`Joined new guild: ${this.id}`);
  if (this.client.botType == 'dev') return;

  if (!this.db.position)
    await this.updateDB('position', (Math.max(...Object.values(this.client.db.get('guildSettings')).map(e => e.position)) || 0) + 1);

  if (!('config' in this.db)) await this.updateDB('config', {});

  await this.client.db.delete('guildSettings', `${this.id}.leftAt`);
};