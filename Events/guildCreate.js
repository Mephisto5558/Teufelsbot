/** @this import('discord.js').Guild*/
module.exports = async function guildCreate() {
  log.debug(`Joined new guild: ${this.id}`);
  if (this.client.botType == 'dev') return;
  await this.client.db.update('guildSettings', `${this.id}.position`, (Object.values(this.client.db.get('guildSettings')).sort((a, b) => (b?.position || 0) - (a?.position || 0))[0].position || 0) + 1);
};