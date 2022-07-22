const { Command } = require('reconlx');

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

  run: async ({ db, functions }, message, interaction) => {
    if (interaction) {
      message = interaction;
      message.content = interaction.options?.getString('new_prefix');
    }

    if (message.content && message.member.permissions.has('MANAGE_GUILD')) {
      const oldData = await db.get('settings');

      const newData = Object.merge(oldData, { [message.guild.id]: { config: { prefix: message.content } } });
      await db.set('settings', newData);

      if (interaction) interaction.editReply(`My prefix has been changed to \`${message.content}\``);
      else client.functions.reply(`My prefix has been changed to \`${message.content}\``, message);
    }
    else {
      const currentPrefix = await db.get('settings')[message.guild.id]?.config?.prefix || await db.get('settings').default.config.prefix;
      const msg = currentPrefix ? `My current prefix is \`${currentPrefix}\`` : '[FATAL] Please message the dev immediately `NoDefaultPrefixFound`!';

      interaction ? interaction.editReply(msg) : functions.reply(msg, message);
    }

  }
})