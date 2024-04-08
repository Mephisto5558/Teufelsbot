const { ActivityType } = require('discord.js');

/** @this {Client}*/
module.exports = async function ready() {
  this.user.setActivity(this.settings.activity ?? { name: '/help', type: ActivityType.Playing });
  log('Ready to receive prefix commands');

  await this.guilds.fetch();
  for (const [guildId, guild] of Object.entries(this.db.get('guildSettings'))) {
    if (!guild.leftAt && !this.guilds.cache.has(guildId))
      this.db.update('guildSettings', `${guildId}.leftAt`, new Date());
  }
};