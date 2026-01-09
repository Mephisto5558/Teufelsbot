const
  { inlineCode } = require('discord.js'),
  { Command } = require('@mephisto5558/command'),
  { msInSecond } = require('#Utils').timeFormatter;

module.exports = new Command({
  types: ['slash', 'prefix'],
  cooldowns: { user: msInSecond },
  beta: true,

  async run(lang) {
    return this.customReply(lang(
      'currentPrefixes',
      this.guild.prefixes.map(e => `${inlineCode(e.prefix)} ${e.caseinsensitive ? lang('caseInsensitive') : ''}`).join('\n')
    ));
  }
});