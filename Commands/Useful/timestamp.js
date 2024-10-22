const
  { Duration } = require('better-ms'),
  { timeValidator } = require('#Utils'),
  { yearInSecs } = require('#Utils/timeFormatter'),
  MAX_YEAR_SECS = yearInSecs * 1000 * 2e5; // eslint-disable-line sonarjs/sonar-no-magic-numbers -- 200000y

/** @type {command<'both', false>}*/
module.exports = {
  slashCommand: true,
  prefixCommand: true,
  dmPermission: true,
  options: [{
    name: 'time',
    type: 'String',
    autocompleteOptions() { return timeValidator(this.focused.value); },
    strictAutocomplete: true
  }],

  async run(lang) {
    const { offset } = new Duration(this.options?.getString('time') ?? this.args?.[0] ?? '0.1ms');
    if (!offset) {
      const helpcmd = this.client.application.commands.cache.find(e => e.name == 'help')?.id;
      return this.customReply(lang('invalid', helpcmd ? `</help:${helpcmd}>` : '/help'));
    }

    const time = this.createdTimestamp + offset;
    if (Math.abs(time) > MAX_YEAR_SECS) return this.customReply(lang('outOfRange'));

    return this.customReply(lang('success', { time: Math.round(time / 1000) }));
  }
};