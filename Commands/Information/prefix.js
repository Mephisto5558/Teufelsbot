const { Command } = require('reconlx');

module.exports = new Command({
  name: 'prefix',
  aliases: [],
  description: `shows or changes the guild's bot prefix`,
  usage: 'PREFIX Command: prefix [new prefix]',
  permissions: { client: [], user: [] },
  cooldowns: { guild: '', user: 10000 },
  category: 'Information',
  slashCommand: true,
  prefixCommand: true,
  options: [{
    name: 'new_prefix',
    description: 'the new bot prefix for this server.',
    type: 'STRING',
    required: false
  }],

  run: async (client, message, interaction) => {
    if (interaction) {
      message = interaction;
      message.content = interaction.options?.getString('new_prefix');
    }

    if (message.content && message.member.permissions.has('MANAGE_GUILD')) {
      const oldData = await client.db.get('prefix');

      const newData = await Object.assign({}, oldData, { [message.guild.id]: message.content });
      await client.db.set('prefix', newData);

      if (interaction) interaction.editReply(`My prefix has been changed to \`${message.content}\``);
      else client.functions.reply(`My prefix has been changed to \`${message.content}\``, message);
    }
    else {
      const currentPrefix = client.db.get('settings')[message.guild.id]?.prefix || client.db.get('settings').default.prefix;
      const msg = `My current prefix is \`${currentPrefix || '\n[FATAL ERROR] Please message the dev immediately `NoDefaultPrefixFound`!\n'}\``;

      interaction ? interaction.editReply(msg) : client.functions.reply(msg, message);
    }

  }
})