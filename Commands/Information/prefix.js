const { Command } = require("reconlx");

module.exports = new Command({
  name: 'prefix',
  aliases: [],
  description: `changes or shows the guild prefix`,
  permissions: { client: [], user: [] },
  cooldowns: { global: '', user: '10000' },
  category: "Information",
  slashCommand: true,
  prefixCommand: true,
  options: [{
    name: 'new_prefix',
    description: 'the new bot prefix for this server.',
    type: 'STRING',
    required: false
  }],

  run: async (client, message, interaction) => {

    if (message) {
      message.args = message.args.join(' ').trim();
      if(!message.args || !message.member.permissions.has('MANAGE_GUILD'))
        return client.functions.reply(
          `My current prefix is \`${
            client.guildData.get(message.guild.id)?.prefix || client.guildData.get('default')?.prefix || '\n[FATAL ERROR] Please message the dev immediately!\n'
          }\``, message
        );
      
      client.guildData.set(message.guild.id, { prefix: message.args });

      let oldData = await client.db.get('prefix');
      newData = await Object.assign({}, oldData, { [message.guild.id]: message.args });
      await client.db.set('prefix', newData);

      return client.functions.reply(`My prefix has been changed to \`${message.args}\``, message);
    }

    let newPrefix = interaction.options.getString('new_prefix');
    if(!newPrefix) {
      return client.functions.reply(`My current prefix is \`${await client.db.get('prefix'[message.guild.id]) || await client.db.get('prefix.default')})\``, message)
    }

    if (!interaction.member.permissions.has('MANAGE_SERVER')) {
      return interaction.followUp("You don't have the permission change the prefix!")
    }

      client.guildData.set(interaction.guild.id, { prefix: newPrefix });
      
      let oldData = await client.db.get('prefix');
      newData = await Object.assign({}, oldData, { [interaction.guild.id]: newPrefix });
      await client.db.set('prefix', newData);

    interaction.followUp(`My prefix has been changed to \`${newPrefix}\``);

  }
})