const
  { readdirSync } = require('fs'),
  { Collection } = require('discord.js'),
  event = require('../Events/interactionCreate.js');

let
  skippedCommandCount = 0,
  deletedCommandCount = 0;

function equal(a, b) {
  v = i => i?.toString();
  const subTests = [];

  if (
    a.name != b.name || a.description != b.description || v(a.type) != v(b.type) || a.autocomplete != b.autocomplete || !a.options != !b.options ||
    a.channelTypes != b.channelTypes || v(a.minValue) != v(b.minValue) || v(a.maxValue) != v(b.maxValue) || a.required != b.required || !a.choices != !b.choices ||
    a.options?.length != b.options?.length || a.choices?.length != b.choices?.length
  ) return false;

  for (let i = 0; i < a.options?.length; i++) subTests.push(equal(format(a.options[i]), format(b.options[i])));
  for (let i = 0; i < a.choices?.length; i++) subTests.push(v(a.choices[i].name) == v(b.choices[i].name) && v(a.choices[i].value) == v(b.choices[i].value));

  return !subTests.includes(false);
}

function format(option) {
  if (option.options) for (let subOption of option.options) subOption = format(subOption);

  option.type = option.type?.toString()
    .replace('SUB_COMMAND_GROUP', 2).replace('SUB_COMMAND', 1)
    .replace('STRING', 3).replace('INTEGER', 4)
    .replace('BOOLEAN', 5).replace('USER', 6)
    .replace('CHANNEL', 7).replace('ROLE', 8)
    .replace('MENTIONABLE', 9).replace('NUMBER', 10)
    .replace('ATTACHMENT', 11) || 1;

  return option;
}

module.exports = async (client, SyncGuild) => {
  await client.ready();
  const applicationCommands = await client.application.commands.fetch(undefined, { guildId: SyncGuild && SyncGuild != '*' ? SyncGuild : undefined });

  if (!SyncGuild || SyncGuild == '*') {
    client.slashCommands = new Collection();

    for (const subFolder of getDirectoriesSync('./Commands')) {
      for (const file of readdirSync(`./Commands/${subFolder}`).filter(file => file.endsWith('.js'))) {
        const command = require(`../Commands/${subFolder}/${file}`);
        let skipped = false;

        if (!command.type) command.type = 'CHAT_INPUT';
        if (!command.slashCommand || command.disabled || (client.botType == 'dev' && !command.beta)) continue;

        for (const applicationCommand of applicationCommands) {
          if (!equal(command, applicationCommand)) continue;
          client.log(`Skipped Slash Command ${command.name}`);
          skipped = true;
          break;
        }
        if (!skipped) {
          client.slashCommands.set(command.name, command);
          for(const alias of command.aliases.slash) client.slashCommands.set(alias, command);
        }
      }
    }

    for (const guild of await client.guilds.fetch()) {
      await client.rateLimitCheck('/applications/:id/commands');

      if (client.application.commands.fetch(undefined, { guildId: guild[0] }).size) {
        await client.application.commands.set([], guild[0]);
        client.log(`Cleared Slash Commands for Guild ${guild[0]}`);
      }
    }
  }

  for (const command of client.slashCommands) {
    await client.rateLimitCheck('/applications/:id/commands');

    await client.application.commands.create(command[1], SyncGuild && SyncGuild != '*' ? SyncGuild : null);
    client.log(`Registered Slash Comand ${command[1].name}`);
  }

  const commandNames = client.slashCommands.map(e => e.name);
  for (const clientCommand of applicationCommands) {
    if (commandNames.includes(clientCommand[1].name)) continue;

    await client.rateLimitCheck('/applications/:id/commands');

    await client.application.commands.delete(clientCommand[1], SyncGuild && SyncGuild != '*' ? SyncGuild : null);
    client.log(`Deleted Slash Comand ${clientCommand[1].name}`);
    deletedCommandCount++
  }

  if (SyncGuild) return;

  client.log(`Registered ${client.slashCommands.size} Slash Commands`);
  client.log(`Skipped ${skippedCommandCount} Slash Commands`);
  client.log(`Deleted ${deletedCommandCount} Slash Commands`);

  client.on('interactionCreate', event.bind(null, client));
  client.log('Loaded Event interactionCreate');
  client.log('Ready to receive slash commands\n');

  client.log(`Ready to serve in ${client.channels.cache.size} channels on ${client.guilds.cache.size} servers, for a total of ${new Set([].concat(...client.guilds.cache.map(g => g.members).map(m => m._cache).map(u => Array.from(u).map(u => u[0])))).size} unique users.\n`);
  console.timeEnd('Starting time');
}