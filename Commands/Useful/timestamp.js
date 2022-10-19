const
  { Duration } = require('better-ms'),
  yearLimit = 6249223180800000; //200000y

module.exports = {
  name: 'timestamp',
  aliases: { prefix: [], slash: [] },
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 0 },
  category: 'Useful',
  slashCommand: true,
  prefixCommand: true,
  dmPermission: true,
  options: [{ name: 'time', type: 'String' }],

  run: function (lang) {
    const ms = new Duration(this.options?.getString('time') || this.args?.[0] || '0.1ms');
    if (!ms.offset) {
      const helpcmd = this.client.application.commands.cache.find(e => e.name == 'help')?.id;
      return this.customReply(lang('invalid', helpcmd ? `</help:${helpcmd}>` : '/help'));
    }

    const time = this.createdTimestamp + ms.offset;
    if (time != time.limit({ min: -yearLimit, max: yearLimit })) return this.customReply(lang('outOfRange'));

    this.customReply(lang('success', { time: Math.round(time / 1000) }));
  }
};