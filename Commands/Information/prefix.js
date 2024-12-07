const { msInSecond } = require('#Utils').timeFormatter;

/** @type {command<'both'>}*/
module.exports = {
  cooldowns: { user: msInSecond },
  slashCommand: true,
  prefixCommand: true,
  beta: true,

  async run(lang) {
    const
      prefixesKey = this.client.botType == 'dev' ? 'betaBotPrefixes' : 'prefixes',
      currentPrefixes = (this.guild.db.config[prefixesKey] ?? this.client.defaultSettings.config[prefixesKey]).map(e => `\`${e.prefix}\` ${e.caseinsensitive ? lang('caseInsensitive') : ''}`);

    return this.customReply(lang('currentPrefixes', currentPrefixes.join('\n')));
  }
};