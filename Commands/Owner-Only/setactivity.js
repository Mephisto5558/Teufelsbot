const { ActivityType } = require('discord.js');

module.exports = {
  name: 'setactivity',
  aliases: { prefix: [], slash: [] },
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 0 },
  category: 'Owner-Only',
  slashCommand: false,
  prefixCommand: true,
  dmPermission: true,

  run: async function (lang, client) {
    const args = this.content.split(';');

    const activity = args[0];
    let type = !args[1] ? ActivityType.Playing : ActivityType[Object.keys(ActivityType).find(e => e.toLowerCase() == args[1].toLowerCase())];

    if (isNaN(type)) type = ActivityType[type];

    if (!type && type != 0) return this.customReply(lang('invalidType', Object.keys(ActivityType).filter(e => isNaN(e)).join('`, `')));

    await client.user.setActivity(activity, { type: type });
    client.db.set('botSettings', client.db.get('botSettings').fMerge({ activity: { name: activity, type: type } }));

    this.customReply(activity ? lang('set', { name: activity, type: ActivityType[type] }) : lang('reset'));
  }
};