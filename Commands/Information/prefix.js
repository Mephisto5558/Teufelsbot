const { Command } = require('reconlx');

module.exports = new Command({
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
    const oldData = await db.get('guildSettings');

    if (newPrefix && message.member.permissions.has('ManageGuild')) {
      const newData = oldData.merge({ [message.guild.id]: { config: { prefix: newPrefix, prefixCaseInsensitive } } });
      await db.set('guildSettings', newData);

      message.customreply(lang('saved', newPrefix));
    }
    else {
      const currentPrefix = oldData[message.guild.id]?.config?.prefix || oldData.default.config.prefix;
      if (!currentPrefix) throw new Error('No Default Prefix Found in DB');

      const msg = lang('currentPrefix', currentPrefix) + prefixCaseInsensitive ? lang('caseInsensitive') : '';

      message.customreply(msg);
    }

  }
})