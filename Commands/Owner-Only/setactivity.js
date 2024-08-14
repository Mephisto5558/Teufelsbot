const { ActivityType } = require('discord.js');

/** @type {command<'prefix', false>}*/
module.exports = {
  slashCommand: false,
  prefixCommand: true,
  dmPermission: true,
  options: [
    {
      name: 'activity',
      type: 'String',
      required: true
    },
    {
      name: 'type',
      type: 'String',
      choices: [...new Set(Object.entries(ActivityType).flat().map(String))]
    }
  ],

  run: async function (lang) {
    const
      args = this.content.split(';'),
      activity = args.shift();

    let type = args[0] ? ActivityType[Object.keys(ActivityType).find(e => e.toLowerCase() == args[0].toLowerCase())] : ActivityType.Playing;

    if (Number.isNaN(Number.parseInt(type))) type = ActivityType[type];

    // if (!type && type != 0) return this.customReply(lang('invalidType', Object.keys(ActivityType).filter(Number).join('`, `')));

    this.client.user.setActivity({ name: activity, type });
    await this.client.db.update('botSettings', 'activity', { name: activity, type });

    return this.customReply(activity ? lang('set', { name: activity, type: ActivityType[type] }) : lang('reset'));
  }
};