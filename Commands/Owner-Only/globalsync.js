const
  { Command } = require('reconlx'),
  { Client } = require('discord-slash-commands-client'),
  errorColor = require('chalk').bold.red,
  format = sec => `\`${sec > 60 ? (sec - (sec %= 60)) / 60 + ':' : ''}${Math.round(sec)}\``;

module.exports = new Command({
  name: 'globalsync',
  alias: [],
  description: 'syncs my slash commands on all guilds',
  usage: '',
  permissions: { client: [], user: [] },
  cooldowns: { global: 0, user: 0 },
  category: 'Owner-Only',
  slashCommand: false,
  prefixCommand: true,
  beta: true,

  run: async (client, message) => {
    const commandClient = new Client(client.keys.token, client.userID);
    const clientCommands = await commandClient.getCommands({});

    client.functions.reply(
      `Globally syncing ${client.slashCommands.size} Slash Commands...\n` +
      `This will take between ${format(client.slashCommands.size * 10)} and ${format(client.slashCommands.size * 10 + client.guilds.cache.size * 10)}.`,
      message
    );

    client.log(`Syncing Slash Commands globally...`);

    for (const guild of await client.guilds.fetch()) {
      const guildCommands = await commandClient.getCommands({ guildID: guild[0] });

      let delCommandCount = 0;

      for (const guildCommand of guildCommands) {
        try {
          await commandClient.deleteCommand(guildCommand.id, guild[0]);
          delCommandCount++
        }
        catch (err) {
          console.error(errorColor('[Error Handling] :: Unhandled Slash Command Handler Error/Catch'));
          console.error(err);
          if (err.response.data.errors)
            console.error(errorColor(JSON.stringify(err.response.data, null, 2)));
        }

        if (guildCommands[delCommandCount + 1]) await client.functions.sleep(10000);
      }

      client.log(`Deleted ${delCommandCount} Slash commands for guild ${guild[0]}`);
    }

    let delCommandCount = 0;
    for (const clientCommand of clientCommands) {
      try {
        await commandClient.deleteCommand(clientCommand.id);
        delCommandCount++
      }
      catch (err) {
        console.error(errorColor('[Error Handling] :: Unhandled Slash Command Handler Error/Catch'));
        console.error(err);
        if (err.response.data.errors)
          console.error(errorColor(JSON.stringify(err.response.data, null, 2)));
      }
  
      if (clientCommands[delCommandCount + 1]) await client.functions.sleep(10000);
    }

    client.log(`Deleted ${delCommandCount} Slash commands.\n`);

    await require('../../Handlers/slash_command_handler.js')(client, '*');

    message.channel.send(
      `<@${message.author.id}>\n` +
      `Finished syncing. Took ${format((Date.now() - message.createdTimestamp) / 1000)}`
    )

  }
})
