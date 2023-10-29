const { ActivityType } = require('discord.js');

module.exports = {
  name: 'setactivity',
  slashCommand: false,
  prefixCommand: true,
  dmPermission: true,

  /**@this Message @param {lang}lang*/
  run: async function (lang) {
    const args = this.content.split(';');

    const activity = args[0];
    let type = !args[1] ? ActivityType.Playing : ActivityType[Object.keys(ActivityType).find(e => e.toLowerCase() == args[1].toLowerCase())];

    if (isNaN(type)) type = ActivityType[type];

    if (!type && type != 0) return this.customReply(lang('invalidType', Object.keys(ActivityType).filter(e => isNaN(e)).join('`, `')));

    await this.client.user.setActivity(activity, { type: type });
    await this.client.db.update('botSettings', 'activity', { name: activity, type });

    return this.customReply(activity ? lang('set', { name: activity, type: ActivityType[type] }) : lang('reset'));
  }
};