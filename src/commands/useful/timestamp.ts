import { TimestampStyles, inlineCode } from 'discord.js';
import { AllContexts, Command, CommandType, OptionType } from '@mephisto5558/command';
import { toMS } from 'type-better-ms';
import { timeValidator, timeFormatter: { timestamp }, toMs: { yearToMs } } from '#utils';

const MAX_YEAR_MS = yearToMs(2e5); /* eslint-disable-line @typescript-eslint/no-magic-numbers -- range limit */

export default new Command({
  types: [CommandType.Slash, CommandType.Prefix],
  contexts: AllContexts,
  options: [{
    name: 'time',
    type: OptionType.String,
    autocompleteOptions: timeValidator,
    strictAutocomplete: true
  }],

  async run(lang) {
    const offset = toMS(this.options?.getString('time') ?? this.args?.[0] ?? '1ms');
    if (!offset) {
      const helpcmd = this.client.commandManager.get('help');
      return this.customReply(lang('invalid', helpcmd.mention()));
    }

    const time = this.createdTimestamp + offset;
    if (Math.abs(time) > MAX_YEAR_MS) return this.customReply(lang('outOfRange'));

    const stamp = timestamp(time, TimestampStyles.RelativeTime);
    return this.customReply(lang('success', { time: stamp, raw: inlineCode(stamp) }));
  }
});