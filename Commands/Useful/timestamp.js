const
  { TimestampStyles, inlineCode } = require('discord.js'),
  { Command } = require('@mephisto5558/command'),
  { Duration } = require('better-ms'),
  { timeValidator, timeFormatter: { timestamp }, toMs: { yearToMs }, commandMention } = require('#Utils'),

  MAX_YEAR_MS = yearToMs(2e5); /* eslint-disable-line @typescript-eslint/no-magic-numbers -- range limit */

module.exports = new Command({
  types: ['slash', 'prefix'],
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
    if (Math.abs(time) > MAX_YEAR_MS) return this.customReply(lang('outOfRange'));

    const stamp = timestamp(time, TimestampStyles.RelativeTime);
    return this.customReply(lang('success', { time: stamp, raw: inlineCode(stamp) }));
  }
});