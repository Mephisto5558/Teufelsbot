const
  { readdirSync } = require('fs'),
  { Collection, ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js'),
  event = require('../Events/interactionCreate.js');

let deletedCommandCount = 0;

function equal(a, b) {
  if (
    !a?.toString() && !b?.toString() || a.name == b.name && a.description == b.description && a.type == b.type && a.autocomplete == b.autocomplete &&
    a.value == b.value && (a.options?.length ?? 0) == (b.options?.length ?? 0) && a.channelTypes == b.channelTypes && equal(a.options, b.options) &&
    a.minValue == b.minValue && a.maxValue == b.maxValue && a.required == b.required && equal(a.choices, b.choices)
  ) return true;
}

function format(option) {
  if (option.options) for (let subOption of option.options) subOption = format(subOption);
  if (option.run) return option;

  if (!option.type || !ApplicationCommandOptionType[option.type]) throw Error(`Missing or unknown option.type, got ${option.type}`);
  if (isNaN(option.type)) option.type = ApplicationCommandOptionType[option.type];

  return option;
}

module.exports = async (client, SyncGuild) => {
  await client.ready();

  const skippedCommands = new Collection();
  const applicationCommands = await client.application.commands.fetch(undefined, { guildId: SyncGuild && SyncGuild != '*' ? SyncGuild : undefined });

  if (!SyncGuild || SyncGuild == '*') {
    client.slashCommands = new Collection();

    for (const subFolder of getDirectoriesSync('./Commands')) {
      for (const file of readdirSync(`./Commands/${subFolder}`).filter(file => file.endsWith('.js'))) {
        const command = require(`../Commands/${subFolder}/${file}`);
        let skipped = false;

        command.type = ApplicationCommandType[command.type] || ApplicationCommandType.ChatInput;
        if (!command.slashCommand || command.disabled /*|| (client.botType == 'dev' && !command.beta)*/) continue;

        for (const applicationCommand of applicationCommands) {
          if (!equal(command, applicationCommand[1])) continue;
          client.log(`Skipped Slash Command ${command.name}`);
          skipped = true;
          skippedCommands.set(command.name, command);
          break;
        }
        if (!skipped) {
          client.slashCommands.set(command.name, command);
          for (const alias of command.aliases.slash) client.slashCommands.set(alias, command);
        }
      }
    }

    for (const guild of await client.guilds.fetch()) {
      await client.rateLimitCheck('/applications/:id/commands');

      await client.application.commands.set([], guild[0]);
      client.log(`Cleared Slash Commands for Guild ${guild[0]}`);
    }
  }

  for (const command of client.slashCommands) {
    await client.rateLimitCheck('/applications/:id/commands');

    await client.application.commands.create(format(command[1]), SyncGuild && SyncGuild != '*' ? SyncGuild : null);
    client.log(`Registered Slash Comand ${command[0]}`);
  }

  const commandNames = [...client.slashCommands, ...skippedCommands].map(e => e[0]);
  for (const clientCommand of applicationCommands) {
    if (commandNames.includes(clientCommand[1].name)) continue;

    await client.rateLimitCheck('/applications/:id/commands');

    await client.application.commands.delete(clientCommand[1], SyncGuild && SyncGuild != '*' ? SyncGuild : null);
    client.log(`Deleted Slash Comand ${clientCommand[1].name}`);
    deletedCommandCount++
  }

  if (SyncGuild) return;

  client.log(`Registered ${client.slashCommands.size} Slash Commands`);

  skippedCommands.forEach((v, k) => client.slashCommands.set(k, v));

  client.log(`Skipped ${skippedCommands.size} Slash Commands`);
  client.log(`Deleted ${deletedCommandCount} Slash Commands`);

  client.on('interactionCreate', event.bind(null, client));
  client.log('Loaded Event interactionCreate');
  client.log('Ready to receive slash commands\n');

  client.log(`Ready to serve in ${client.channels.cache.size} channels on ${client.guilds.cache.size} servers, for a total of ${new Set([].concat(...client.guilds.cache.map(g => g.members).map(m => m._cache).map(u => Array.from(u).map(u => u[0])))).size} unique users.\n`);
  console.timeEnd('Starting time');
}