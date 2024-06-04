/** @type {command<'both'>}*/
module.exports = {
  cooldowns: { user: 1000 },
  slashCommand: true,
  prefixCommand: true,
  beta: true,

  run: function (lang) {
    const
      prefixesKey = this.client.botType == 'dev' ? 'betaBotPrefixes' : 'prefixes',
      currentPrefixes = (this.guild.db.config[prefixesKey] ?? this.client.defaultSettings.config[prefixesKey]).map(e => `\`${e.prefix}\` ${e.caseinsensitive ? lang('caseInsensitive') : ''}`);

    return this.customReply(lang('currentPrefixes', currentPrefixes.join('\n')));
  }
};