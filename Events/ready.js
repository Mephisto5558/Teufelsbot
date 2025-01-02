const
  { ActivityType } = require('discord.js'),
  guildCreate = require('./guildCreate');

/** @this {import('discord.js').ClientEvents['ready'][0]} */
module.exports = async function ready() {
  await this.application.emojis.fetch(); // Required for global.getEmoji() to work

  this.user.setActivity(this.settings.activity ?? { name: '/help', type: ActivityType.Playing });
  log('Ready to receive prefix commands');

  await this.guilds.fetch();
  for (const [guildId, guild] of Object.entries(this.db.get('guildSettings'))) {
    if (!guild.leftAt && !this.guilds.cache.has(guildId))
      void this.db.update('guildSettings', `${guildId}.leftAt`, new Date());
  }

  for (const [, guild] of this.guilds.cache) {
    if (!('config' in guild.db)) void guildCreate.call(guild);

    void this.db.delete('guildSettings', `${guild.id}.leftAt`);
  }
};