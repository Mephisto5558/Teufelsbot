const { ActivityType } = require('discord.js');

/** @type {command<'prefix', false>}*/
module.exports = {
  slashCommand: false,
  prefixCommand: true,
  dmPermission: true,

  run: async function (lang) {
    const args = this.content.split(';');

    const activity = args[0];
    let type = args[1] ? ActivityType[Object.keys(ActivityType).find(e => e.toLowerCase() == args[1].toLowerCase())] : ActivityType.Playing;

    if (!Number.parseInt(type)) type = ActivityType[type];

    if (!type && type != 0) return this.customReply(lang('invalidType', Object.keys(ActivityType).filter(e => Number.parseInt(e)).join('`, `')));

    this.client.user.setActivity({ name: activity, type });
    await this.client.db.update('botSettings', 'activity', { name: activity, type });

    return this.customReply(activity ? lang('set', { name: activity, type: ActivityType[type] }) : lang('reset'));
  }
};