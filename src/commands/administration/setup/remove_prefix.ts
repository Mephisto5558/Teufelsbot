import { inlineCode } from 'discord.js';
import { CommandOption, OptionType } from '@mephisto5558/command';

import type { CommandType } from '@mephisto5558/command';


export default CommandOption.create<readonly [CommandType.Slash]>()({
  name: 'remove_prefix',
  type: OptionType.Subcommand,
  options: [
    {
      name: 'prefix',
      type: OptionType.String,
      autocompleteOptions() { return this.guild.db.config.prefixes?.[this.client.botType]?.map(e => e.prefix) ?? []; },
      strictAutocomplete: true,
      required: true
    }
  ],

  async run(lang) {
    const prefix = this.options.getString('prefix', true);

    if (this.guild.prefixes.length < 2) await this.guild.deleteDB(`config.prefixes.${this.client.botType}`);
    else await this.guild.updateDB(`config.prefixes.${this.client.botType}`, this.guild.prefixes.filter(e => e.prefix != prefix));

    return this.customReply(lang('removed', inlineCode(prefix)));
  }
});