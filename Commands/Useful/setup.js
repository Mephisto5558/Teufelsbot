const { Command } = require('reconlx');

module.exports = new Command({
  name: 'setup',
  alias: [],
  description: 'Sets the slash commands up.',
  usage: '',
  permissions: { client: [], user: ['MANAGE_GUILD'] },
  cooldowns: { global: 0, user: 30000 },
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
      const s = client.slashCommands.size * 10;

      await interaction.editReply(
        `Syncing ${client.slashCommands.size} Slash Commands...\n` +
        `This will take about ${s > 60 ? (s - (s %= 60)) / 60 + 'm,' : ''} ${s}s.`
      );

      client.log(`syncing slash commands with guild ${interaction.guild.id}`);
      await interaction.guild.commands.set([]);
      await require('../../Handlers/slash_command_handler.js')(client, interaction.guild);

      interaction.followUp(
        `<@${interaction.user.id}>\n` +
        'Finished syncing.'
      )
    }

  }
})