const { PermissionFlagsBits } = require('discord.js');

/**@type {command}*/
module.exports = {
  name: 'prefix',
  cooldowns: { user: 1000 },
  slashCommand: true,
  prefixCommand: true,
  options: [
    { name: 'new_prefix', type: 'String' },
    { name: 'case_insensitive', type: 'Boolean' }
  ],

  /**@this GuildInteraction|GuildMessage*/
  run: async function (lang) {
    const newPrefix = this.content || this.options?.getString('new_prefix');
    const prefixCaseInsensitive = this.options?.getBoolean('case_insensitive') ?? this.guild.db.config?.prefix?.caseinsensitive ?? false;

    if (newPrefix && this.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      await this.client.db.update('guildSettings', `${this.guild.id}.config.${this.client.botType == 'dev' ? 'betaBotP' : 'p'}refix`, { prefix: newPrefix, caseinsensitive: prefixCaseInsensitive });
      return this.customReply(lang('saved', newPrefix));
    }

    const currentPrefix = this.guild.db.config?.prefix?.prefix || this.client.defaultSettings.config.prefix;
    if (!currentPrefix) throw new Error('No Default Prefix Found in DB');
    
    return this.customReply(lang('currentPrefix', currentPrefix) + (prefixCaseInsensitive ? lang('caseInsensitive') : ''));
  }
};