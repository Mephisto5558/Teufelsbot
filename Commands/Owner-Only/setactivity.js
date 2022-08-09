const { Command } = require('reconlx');
const { ActivityType } = require('discord.js');

module.exports = new Command({
  name: 'setactivity',
  aliases: { prefix: [], slash: [] },
  description: `sets the bot's activity`,
  usage: 'PREFIX Command: setactivity <activity>;[type]',
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 0 },
  category: 'Owner-Only',
  slashCommand: false,
  prefixCommand: true, beta: true,

  run: async (message, client) => {

    message.args = message.content.split(';');

    const activity = message.args[0];
    let type = !message.args[1] ? ActivityType.Playing : ActivityType[Object.keys(ActivityType).find(e => e.toLowerCase() == message.args[1].toLowerCase())];
    type = isNaN(type) ? ActivityType[type] : type;

    if (!type && type != 0) return client.functions.reply(
      'This is not a valid type. Valid types are:\n`' +
      Object.keys(ActivityType).filter(e => isNaN(e)).join('`, `') + '`', message
    );

    await client.user.setActivity(activity, { type: type });
    await client.db.set('botSettings', Object.merge(await client.db.get('botSettings'), { activity: { name: activity, type: type } }));

    client.functions.reply(`Activity set to \`${activity ? `${activity}\` of type \`${ActivityType[type]}` : 'none'}\`.`, message);
  }
})