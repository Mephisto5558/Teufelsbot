const { Command } = require('reconlx');

module.exports = new Command({
  name: 'force-sync',
  alias: [],
  description: 'Force-Syncs the slash commands with your guild',
  permissions: { client: [], user: ['MANAGE_GUILD'] },
  cooldowns: { global: 0, user: 30000 },
  category: 'Others',
  slashCommand: true,
  prefixCommand: false,
  beta: true,

  run: async(client, _, interaction) => {
    await interaction.editReply(`Syncing ${client.slashCommands.size} Slash Commands...\nThis takes about 10s per command.`);
    
    await client.off('interactionCreate', client._events.interactionCreate);
    
    client.log(`Force syncing slash commands with guild '${interaction.guild.name}', initiated by user ${interaction.user.tag}`);

    await require('../../Handlers/slash_command_handler.js')(client, interaction.guild);
    interaction.editReply(`<@${interaction.user.id}>\n Finished syncing.`);
  }
})