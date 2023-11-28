const
  { Duration } = require('better-ms'),
  { timeValidator } = require('../../Utils');

/**@type {command}*/
module.exports = {
  name: 'timestamp',
  slashCommand: true,
  prefixCommand: true,
  dmPermission: true,
  options: [{
    name: 'time',
    type: 'String',
    autocompleteOptions: function () { return timeValidator(this.focused.value); },
    strictAutocomplete: true
  }],

  run: function (lang) {
    const { offset } = new Duration(this.options?.getString('time') || this.args?.[0] || '0.1ms');
    if (!offset) {
      const helpcmd = this.client.application.commands.cache.find(e => e.name == 'help')?.id;
      return this.customReply(lang('invalid', helpcmd ? `</help:${helpcmd}>` : '/help'));
    }

    const time = this.createdTimestamp + offset;
    if (time < -62492231808e5 || time > 62492231808e5) return this.customReply(lang('outOfRange')); //200000y

    return this.customReply(lang('success', { time: Math.round(time / 1000) }));
  }
};