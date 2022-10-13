const { PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'prefix',
  aliases: { prefix: [], slash: [] },
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 1000 },
  category: 'Information',
  slashCommand: true,
  prefixCommand: true,
  options: [
    { name: 'new_prefix', type: 'String' },
    { name: 'case_insensitive', type: 'Boolean' }
  ],

  run: function (lang, { db }) {
    const newPrefix = this.content || this.options?.getString('new_prefix');
    const prefixCaseInsensitive = this.options?.getBoolean('case_insensitive') ?? false;
    const oldData = db.get('guildSettings');

    if (newPrefix && this.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      db.update('guildSettings', `${this.guild.id}.config.prefix`, { prefix: newPrefix, caseinsensitive: prefixCaseInsensitive });
      this.customReply(lang('saved', newPrefix));
    }
    else {
      const currentPrefix = oldData[this.guild.id]?.config?.prefix?.prefix || oldData.default.config.prefix;
      if (!currentPrefix) throw new Error('No Default Prefix Found in DB');

      const msg = lang('currentPrefix', currentPrefix) + (oldData[this.guild.id]?.config?.prefix?.caseinsensitive ? lang('caseInsensitive') : '');

      this.customReply(msg);
    }

  }
};