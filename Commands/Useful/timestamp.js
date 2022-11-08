const
  { Duration } = require('better-ms'),
  timeValidator = require('../../Utils/timeValidator.js'),
  yearLimit = 62492231808e5; //200000y

module.exports = {
  name: 'timestamp',
  category: 'Useful',
  slashCommand: true,
  prefixCommand: true,
  dmPermission: true,
  options: [{
    name: 'time',
    type: 'String',
    autocomplete: true,
    autocompleteOptions: function () { return timeValidator(this.focused.value); }
  }],

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