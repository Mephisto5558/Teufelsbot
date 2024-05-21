/** @type {command<'both'>}*/
module.exports = {
  cooldowns: { user: 1000 },
  slashCommand: true,
  prefixCommand: true,

  run: function (lang) {
    const currentPrefix = this.guild.db.config.prefix?.prefix ?? this.client.defaultSettings.config.prefix;
    const prefixCaseInsensitive = !!this.guild.db.config.prefix?.caseinsensitive;

    return this.customReply(lang('currentPrefix', currentPrefix) + (prefixCaseInsensitive ? lang('caseInsensitive') : ''));
  }
};