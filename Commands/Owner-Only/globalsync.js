const { Command } = require('reconlx');

module.exports = new Command({
  name: 'globalsync',
  aliases: [],
  description: 'syncs my slash commands on all guilds',
  usage: '',
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 0 },
  category: 'Owner-Only',
  slashCommand: false,
  prefixCommand: true,
  beta: true,

  run: async (client, message) => {
    client.log(`Syncing Slash Commands globally...`);

    for (const guild of client.guilds.cache) await client.application.commands.set([], guild[0]);

    await require('../../Handlers/slash_command_handler.js')(client, '*');

    client.functions.reply('Finished Syncing.', message)
  }
})
