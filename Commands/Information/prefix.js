const
  { inlineCode } = require('discord.js'),
  { Command, CommandType, CooldownType } = require('@mephisto5558/command');

module.exports = new Command({
  types: [CommandType.slash, CommandType.prefix],
  cooldowns: { [CooldownType.user]: '1s' },
  beta: true,

  async run(lang) {
    return this.customReply(lang(
      'currentPrefixes',
      this.guild.prefixes.map(e => `${inlineCode(e.prefix)} ${e.caseinsensitive ? lang('caseInsensitive') : ''}`).join('\n')
    ));
  }
});