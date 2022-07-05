const
  { Command } = require('reconlx'),
  { REST } = require('@discordjs/rest');

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

    const rest = new REST().setToken(client.keys.token);
    for (const guild of client.guilds.cache) await rest.put(`/applications/${client.userID}/guilds/${guild.id}/commands`, { body: "[]" });

    await require('../../Handlers/slash_command_handler.js')(client, '*');

    client.functions.reply('Finished Syncing.', message)
  }
})
