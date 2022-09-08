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
    { name: 'new_prefix',  type: 'String' },
    { name: 'case_insensitive', type: 'Boolean' }
  ],

  run: async (message, lang, { db }) => {
    const newPrefix = message.content || message.options?.getString('new_prefix');
    const prefixCaseInsensitive = message.options?.getBoolean('case_insensitive') ?? false;
    const oldData = db.get('guildSettings');

    if (newPrefix && message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      const newData = oldData.fMerge({ [message.guild.id]: { config: { prefix: { prefix: newPrefix, caseinsensitive: prefixCaseInsensitive } } } });
      db.set('guildSettings', newData);

      message.customReply(lang('saved', newPrefix));
    }
    else {
      const currentPrefix = oldData[message.guild.id]?.config?.prefix?.prefix || oldData.default.config.prefix;
      if (!currentPrefix) throw new Error('No Default Prefix Found in DB');

      const msg = lang('currentPrefix', currentPrefix) + (oldData[message.guild.id]?.config?.prefix?.caseinsensitive ? lang('caseInsensitive') : '');

      message.customReply(msg);
    }

  }
}