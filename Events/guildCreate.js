/** @this {import('discord.js').Guild}*/
module.exports = async function guildCreate() {
  log.debug(`Joined new guild: ${this.id}`);
  if (this.client.botType == 'dev') return;

  if (!this.guild.db.position)
    await this.client.db.update('guildSettings', `${this.id}.position`, (Math.max(...Object.values(this.client.db.get('guildSettings')).map(e => e.position ?? 0)) || 0) + 1);
  if (!this.guild.db.config)
    await this.client.db.update('guildSettings', `${this.id}.config`, {});

  await this.client.db.delete('guildSettings', `${this.id}.leftAt`);
};