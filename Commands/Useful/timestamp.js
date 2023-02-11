const
  { Duration } = require('better-ms'),
  { timeValidator } = require('../../Utils'),
  yearLimit = 62492231808e5; //200000y

module.exports = {
  name: 'timestamp',
  slashCommand: true,
  prefixCommand: true,
  dmPermission: true,
  options: [{
    name: 'time',
    type: 'String',
    autocompleteOptions: function () { return timeValidator(this.focused.value); }
  }],

  run: function (lang) {
    const { offset } = new Duration(this.options?.getString('time') || this.args?.[0] || '0.1ms');
    if (!offset) {
      const helpcmd = this.client.application.commands.cache.find(e => e.name == 'help')?.id;
      return this.customReply(lang('invalid', helpcmd ? `</help:${helpcmd}>` : '/help'));
    }

    const time = this.createdTimestamp + offset;
    if (time != time.limit({ min: -yearLimit, max: yearLimit })) return this.customReply(lang('outOfRange'));

    this.customReply(lang('success', { time: Math.round(time / 1000) }));
  }
};