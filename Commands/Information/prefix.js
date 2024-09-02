module.exports = new MixedCommand({
  cooldowns: { user: 1000 },
  beta: true,

  run: async function (lang) {
    const
      prefixesKey = this.client.botType == 'dev' ? 'betaBotPrefixes' : 'prefixes',
      currentPrefixes = (this.guild.db.config[prefixesKey] ?? this.client.defaultSettings.config[prefixesKey]).map(e => `\`${e.prefix}\` ${e.caseinsensitive ? lang('caseInsensitive') : ''}`);

    return this.customReply(lang('currentPrefixes', currentPrefixes.join('\n')));
  }
});