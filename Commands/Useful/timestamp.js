const { Duration } = require('better-ms');

module.exports = {
  name: 'timestamp',
  aliases: { prefix: [], slash: [] },
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 0 },
  category: 'Useful',
  slashCommand: true,
  prefixCommand: true,
  dmPermission: true,
  options: [{ name: 'time', type: 'String' }], beta: true,

  run: function (lang) {
    const ms = new Duration(this.options?.getString('time') || this.args?.[0] || '0.1ms');
    if (!ms.offset) {
      const helpcmd = this.client.application.commands.cache.find(e => e.name == 'help')?.id;
      return this.customReply(lang('invalid', helpcmd ? `</help:${helpcmd}>` : '/help'));
    }
    this.customReply(lang('success', Math.round(ms.dateFrom(this.createdAt) / 1000)));
  }
};