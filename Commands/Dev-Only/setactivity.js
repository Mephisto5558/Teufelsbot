const
  { ActivityType, inlineCode } = require('discord.js'),
  ActivityTypes = Object.fromEntries(Object.entries(ActivityType).map(([k, v]) => [k.toLowerCase(), v]));

/** @type {command<'prefix', false>} */
module.exports = {
  slashCommand: false,
  prefixCommand: true,
  dmPermission: true,
  options: [
    {
      name: 'type',
      type: 'String',
      choices: Object.entries(ActivityType).flatMap(([e]) => e.toLowerCase())
    },
    { name: 'activity', type: 'String' }
  ],

  async run(lang) {
    const activity = {
      type: ActivityTypes[this.args[0]?.toLowerCase()],
      name: this.args.slice(1).join(' ')
    };

    if (!activity.name) {
      await this.client.db.delete('botSettings', 'activity');
      return this.customReply(lang('reset'));
    }

    if (typeof activity.type == 'string') activity.type = ActivityType[activity.type];

    this.client.user.setActivity(activity);
    await this.client.db.update('botSettings', 'activity', activity);

    return this.customReply(lang('set', { name: inlineCode(activity.name), type: inlineCode(ActivityType[activity.type]) }));
  }
};