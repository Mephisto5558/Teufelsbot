const
  { ActivityType } = require('discord.js'),
  guildCreate = require('./guildCreate');

/** @this {Client<true>}*/
module.exports = async function ready() {
  this.user.setActivity(this.settings.activity ?? { name: '/help', type: ActivityType.Playing });
  log('Ready to receive prefix commands');

  await this.guilds.fetch();
  for (const [guildId, guild] of Object.entries(this.db.get('guildSettings'))) {
    if (!guild.leftAt && !this.guilds.cache.has(guildId))
      void this.db.update('guildSettings', `${guildId}.leftAt`, new Date());
  }

  for (const [guildId, guild] of this.guilds.cache)
    if (!this.db.get('guildSettings', guildId)) void guildCreate.call(guild);
};