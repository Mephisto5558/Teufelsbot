import { CommandOption, OptionType } from '@mephisto5558/command';

import type { CommandType } from '@mephisto5558/command';


export default new CommandOption<readonly [CommandType.Slash]>({
  name: 'wordcounter',
  type: OptionType.Subcommand,
  options: [{
    name: 'enabled',
    type: OptionType.Boolean,
    required: true
  }],

  async run(lang) {
    const enabled = this.options.getBoolean('enabled', true);
    await (this.guild.db.wordCounter
      ? this.guild.updateDB('wordCounter.enabled', enabled)
      : this.guild.updateDB('wordCounter', { enabled, enabledAt: enabled ? undefined : Temporal.Now.instant(), sum: 0, channels: {}, members: {} })
    );

    return this.customReply(lang('success', lang(`global.${enabled ? 'enabled' : 'disabled'}`)));
  }
});