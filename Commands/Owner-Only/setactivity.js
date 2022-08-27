const { ActivityType } = require('discord.js');

module.exports = {
  name: 'setactivity',
  aliases: { prefix: [], slash: [] },
  description: `sets the bot's activity`,
  usage: 'PREFIX Command: setactivity <activity>;[type]',
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 0 },
  category: 'Owner-Only',
  slashCommand: false,
  prefixCommand: true,

  run: async (message, lang, client) => {

    message.args = message.content.split(';');

    const activity = message.args[0];
    let type = !message.args[1] ? ActivityType.Playing : ActivityType[Object.keys(ActivityType).find(e => e.toLowerCase() == message.args[1].toLowerCase())];
    type = isNaN(type) ? ActivityType[type] : type;

    if (!type && type != 0) return client.functions.reply(
      lang('invalidType', Object.keys(ActivityType).filter(e => isNaN(e)).join('`, `')), message
    );

    await client.user.setActivity(activity, { type: type });
    await client.db.set('botSettings', await client.db.get('botSettings').merge({ activity: { name: activity, type: type } }));

    message.customreply(activity ? lang('success', activity, ActivityType[type]) : lang('reset'));
  }
}