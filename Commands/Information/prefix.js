const { PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'prefix',
  aliases: { prefix: [], slash: [] },
  description: `shows or changes the guild's bot prefix`,
  usage: 'PREFIX Command: prefix [new prefix]',
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 1000 },
  category: 'Information',
  slashCommand: true,
  prefixCommand: true,
  options: [
    {
      name: 'new_prefix',
      description: 'the new bot prefix for this server.',
      type: 'String',
      required: false
    },
    {
      name: 'case_insensitive',
      description: 'make the new prefix work with lowercase as well as uppercase letters',
      type: 'Boolean',
      required: false
    }
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