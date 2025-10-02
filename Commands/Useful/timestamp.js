const
  { TimestampStyles, inlineCode } = require('discord.js'),
  { Duration } = require('better-ms'),
  { timeValidator, timeFormatter: { secsInYear, msInSecond, timestamp }, commandMention } = require('#Utils'),
  MAX_YEARS = 2e5,
  MAX_YEAR_SECS = secsInYear * msInSecond * MAX_YEARS;

/** @type {command<'both', false>} */
module.exports = {
  slashCommand: true,
  prefixCommand: true,
  dmPermission: true,
  options: [{
    name: 'time',
    type: 'String',
    autocompleteOptions(query) { return timeValidator(query); },
    strictAutocomplete: true
  }],

  async run(lang) {
    const { offset } = new Duration(this.options?.getString('time') ?? this.args?.[0] ?? '0.1ms');
    if (!offset) {
      const helpcmd = this.client.application.commands.cache.find(e => e.name == 'help')?.id;
      return this.customReply(lang('invalid', helpcmd ? commandMention('help', helpcmd) : '/help'));
    }

    const time = this.createdTimestamp + offset;
    if (Math.abs(time) > MAX_YEAR_SECS) return this.customReply(lang('outOfRange'));

    const stamp = timestamp(time, TimestampStyles.RelativeTime);
    return this.customReply(lang('success', { time: stamp, raw: inlineCode(stamp) }));
  }
};