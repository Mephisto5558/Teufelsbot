import { inlineCode } from 'discord.js';
import { Command, CommandType, CooldownType } from '@mephisto5558/command';

export default new Command({
  types: [CommandType.Slash, CommandType.Prefix],
  cooldowns: { [CooldownType.User]: '1s' },
  beta: true,

  async run(lang) {
    return this.customReply(lang(
      'currentPrefixes',
      this.guild.prefixes.map(e => `${inlineCode(e.prefix)} ${e.caseinsensitive ? lang('caseInsensitive') : ''}`).join('\n')
    ));
  }
});