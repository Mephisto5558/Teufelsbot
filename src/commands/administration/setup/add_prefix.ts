import { inlineCode } from 'discord.js';
import { CommandOption, OptionType } from '@mephisto5558/command';

import type { CommandType } from '@mephisto5558/command';


const MAX_PREFIXES_PER_GUILD = 2;

export default CommandOption.create<readonly [CommandType.Slash]>()({
  name: 'add_prefix',
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
    const
      prefix = this.options.getString('new_prefix', true),
      prefixInDB = this.guild.prefixes.find(e => e.prefix == prefix),
      addedPrefixes = [{ prefix, caseinsensitive: this.options.getBoolean('case_insensitive') ?? prefixInDB?.caseinsensitive ?? false }];

    if (!prefixInDB && (this.guild.db.config.prefixes?.[this.client.botType]?.length ?? 0) >= MAX_PREFIXES_PER_GUILD)
      return this.customReply(lang('limitReached'));

    const prefixes = [...this.guild.db.config.prefixes?.[this.client.botType]?.length ? this.client.prefixes : [], ...addedPrefixes];

    await this.client.db.pushToSet('guildSettings', `${this.guild.id}.config.prefixes.${this.client.botType}`, ...prefixes);
    return this.customReply(lang('saved', inlineCode(prefix)));
  }
});