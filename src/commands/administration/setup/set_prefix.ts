import type {CommandType} from '@mephisto5558/command';

import { inlineCode } from 'discord.js';
import { CommandOption, OptionType } from '@mephisto5558/command';

/** @type {CommandOption<readonly [CommandType.Slash]>} */
export default new CommandOption({
  name: 'set_prefix',
  type: OptionType.Subcommand,
  options: [
    {
      name: 'new_prefix',
      type: OptionType.String,
      required: true
    },
    { name: 'case_insensitive', type: OptionType.Boolean }
  ],

  async run(lang) {
    const prefix = this.options.getString('new_prefix', true);

    await this.guild.updateDB(
      `config.prefixes.${this.client.botType}`,
      [{ prefix, caseinsensitive: this.options.getBoolean('case_insensitive') ?? false }]
    );

    return this.customReply(lang('saved', inlineCode(prefix)));
  }
});