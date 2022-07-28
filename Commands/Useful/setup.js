const { Command } = require('reconlx');

module.exports = new Command({
  name: 'setup',
  aliases: { prefix: [], slash: [] },
  description: 'Sets the slash commands up.',
  usage: '',
  permissions: { client: [], user: ['ManageGuild'] },
  cooldowns: { guild: 0, user: 10000 },
  category: 'Useful',
  slashCommand: true,
  prefixCommand: false,
  beta: true,
  options: [{
    name: 'sync',
    description: 'force syncs my slash commands with your guild',
    type: 'Subcommand'
  }],

  run: async (client, interaction) => {
    const cmd = interaction.options.getSubcommand();

    if (cmd == 'sync') {
      await require('../../Handlers/slash_command_handler.js')(client, interaction.guild.id);

      interaction.editReply('Finished syncing.');
    }

  }
})