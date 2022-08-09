const { Command } = require('reconlx');
const { Message } = require('discord.js');

module.exports = new Command({
  name: 'prefix',
  aliases: { prefix: [], slash: [] },
  description: `shows or changes the guild's bot prefix`,
  usage: 'PREFIX Command: prefix [new prefix]',
  permissions: { client: ['EmbedLinks'], user: [] },
  cooldowns: { guild: 0, user: 1000 },
  category: 'Information',
  slashCommand: true,
  prefixCommand: true,
  options: [{
    name: 'new_prefix',
    description: 'the new bot prefix for this server.',
    type: 'String',
    required: false
  }],

  run: async (message, { db, functions }) => {
    const newPrefix = message.content || message.options?.getString('new_prefix');
    const oldData = await db.get('guildSettings');

    if (newPrefix && message.member.permissions.has('ManageGuild')) {
      const newData = Object.merge(oldData, { [message.guild.id]: { config: { prefix: newPrefix } } });
      await db.set('guildSettings', newData);

      if (message instanceof Message) functions.reply(`My prefix has been changed to \`${newPrefix}\``, message);
      else message.editReply(`My prefix has been changed to \`${newPrefix}\``);
    }
    else {
      const currentPrefix = oldData[message.guild.id]?.config?.prefix || oldData.default.config.prefix;
      const msg = currentPrefix ? `My current prefix is \`${currentPrefix}\`` : '[FATAL] Please message the dev immediately `NoDefaultPrefixFound`!';

      message instanceof Message ? functions.reply(msg, message) : message.editReply(msg);
    }

  }
})