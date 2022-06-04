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
  options: [
    {
      name: 'sync',
      description: 'force syncs my slash commands with your guild',
      type: 'SUB_COMMAND'
    }
  ],

  run: async (client, _, interaction) => {

    switch (interaction.options.getSubcommand()) {
      case 'sync':
        await interaction.editReply(`Syncing ${client.slashCommands.size} Slash Commands...\nThis takes about 20s per command.`);
        client.log(`Force syncing slash commands with guild '${interaction.guild.name}', initiated by user ${interaction.user.tag}`);

        await client.off('interactionCreate', client._events.interactionCreate);
        await require('../../Handlers/slash_command_handler.js')(client, interaction.guild);

        interaction.followUp(`<@${interaction.user.id}>\nFinished syncing.`);
        break;
    }
  }
})