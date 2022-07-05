const { Command } = require('reconlx');

module.exports = new Command({
  name: 'setup',
  aliases: [],
  description: 'Sets the slash commands up.',
  usage: '',
  permissions: { client: [], user: ['MANAGE_GUILD'] },
  cooldowns: { guild: 0, user: 10000 },
  category: 'Useful',
  slashCommand: true,
  prefixCommand: false,
  beta: true,
  options: [{
    name: 'sync',
    description: 'force syncs my slash commands with your guild',
    type: 'SUB_COMMAND'
  }],

  run: async (client, _, interaction) => {
    const cmd = interaction.options.getSubcommand();

    if (cmd == 'sync') {
      await require('../../Handlers/slash_command_handler.js')(client, interaction.guild.id);

      interaction.editReply('Finished syncing.');
    }

  }
})