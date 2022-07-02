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
      let sec = client.slashCommands.size * 10;

      await interaction.editReply(
        `Syncing ${client.slashCommands.size} Slash Commands...\n` +
        `This will take about ${sec > 60 ? (sec - (sec %= 60)) / 60 + 'min,' : ''} ${sec}sec.`
      );

      client.log(`Syncing Slash Commands with guild ${interaction.guild.id}`);
      
      await interaction.guild.commands.set([]);
      await require('../../Handlers/slash_command_handler.js')(client, interaction.guild);

      interaction.followUp(
        `<@${interaction.user.id}>\n` +
        `Finished syncing. Took ${format(message.createdTimestap - Date.now())}`
      )
    }

  }
})