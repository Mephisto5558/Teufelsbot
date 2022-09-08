const
  { Collection, ApplicationCommandType, ApplicationCommandOptionType, PermissionsBitField, ChannelType } = require('discord.js'),
  { readdirSync } = require('fs'),
  I18nProvider = require('../Functions/private/I18nProvider.js');
const { options } = require('../Commands/Economy/account.js');

let deletedCommandCount = 0;

function equal(a, b) {
  if (!a?.toString() && !b?.toString()) return true;
  if (typeof a == 'string' || typeof b == 'string') return a == b;
  if (
    a.name != b.name || a.description != b.description || a.type != b.type || a.autocomplete != b.autocomplete ||
    a.value != b.value || (a.options?.length ?? 0) != (b.options?.length ?? 0) || (a.channelTypes?.length ?? 0) != (b.channelTypes?.length ?? 0) ||
    a.minValue != b.minValue || a.maxValue != b.maxValue || a.minLength != b.minLength || a.maxLength != b.maxLength || !!a.required != !!b.required ||
    !equal(a.choices, b.choices) || a.defaultMemberPermissions?.bitfield != b.defaultMemberPermissions?.bitfield
  ) return;

  for (let i = 0; i < (a.options?.length || 0); i++) if (!equal(a.options?.[i], b?.options?.[i])) return;
  for (let i = 0; i < (a.channelTypes?.length || 0); i++) if (!equal(a.channelTypes?.[i], b.channelTypes?.[i])) return;

  return true;
}

function format(option, path) {
  if (option.options) option.options = option.options.map(e => format(e, `${path}.options.${e.name}`));
  if (!option.description) {
    option.description = I18nProvider.__(undefined, `${path}.description`);
    if (!option.description) throw new Error(`Missing option description for option ${option.name}! Expected it in ${path}.description.`);
  }

  if (option.description.length > 100) {
    console.error(`WARN: Description of option ${option.name} is too long (max length is 100)! Slicing.`);
    option.description = option.description.substring(0, 100);
  }

  if (option.choices?.length) option.choices = option.choices.map(e => ({ name: typeof e == 'string' ? I18nProvider.__(undefined, `${path}.choices.${e}`) || e : e, value: e }));

  if (option.run) {
    if (!option.usage) option.usage = I18nProvider.__(undefined, `${path}.usage`);

    if (!option.type) option.type = ApplicationCommandType.ChatInput;
    else if (!ApplicationCommandType[option.type]) throw new Error(`Invalid option.type, got ${option.type}`);
    else if (isNaN(option.type)) option.type = ApplicationCommandType[option.type];

    if (option.permissions?.user.length) option.defaultMemberPermissions = new PermissionsBitField(option.permissions?.user);

    return option;
  }

  if (/[A-Z]/.test(option.name)) {
    console.error(`${option.name} has uppercase letters! Fixing`);
    option.name = option.name.toLowerCase();
  }

  if (option.channelTypes) option.channelTypes = option.channelTypes?.map(e => {
    if (!ChannelType[e] && ChannelType[e] != 0) throw Error(`Invalid option.channelType, got ${e}`);
    return isNaN(e) ? ChannelType[e] : e;
  });

  if (!option.type || !ApplicationCommandOptionType[option.type]) throw Error(`Missing or invalid option.type, got ${option.type}`);
  if (isNaN(option.type)) option.type = ApplicationCommandOptionType[option.type];

  return option;
}

module.exports = async (client, syncGuild) => {
  await client.functions.ready(client);

  const skippedCommands = new Collection();
  const applicationCommands = await client.application.commands.fetch(undefined, { guildId: syncGuild && syncGuild != '*' ? syncGuild : undefined });

  if (!syncGuild || syncGuild == '*') {
    client.slashCommands = new Collection();

    for (const subFolder of getDirectoriesSync('./Commands')) {
      for (const file of readdirSync(`./Commands/${subFolder}`).filter(e => e.endsWith('.js'))) {
        const command = format(require(`../Commands/${subFolder}/${file}`), `commands.${subFolder.toLowerCase()}.${file.slice(0, -3)}`);
        let skipped = false;

        if (!command.slashCommand || command.disabled || (client.botType == 'dev' && !command.beta)) continue;

        for (const [, applicationCommand] of applicationCommands) {
          if (!equal(command, applicationCommand)) continue;
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
      await client.application.commands.set([], guild[0]);
      client.log(`Cleared Slash Commands for Guild ${guild[0]}`);
    }
  }

  for (const [, command] of client.slashCommands) {
    await client.application.commands.create(command, syncGuild && syncGuild != '*' ? syncGuild : null);
    client.log(`Registered Slash Comand ${command.name}`);
  }

  const commandNames = [...client.slashCommands, ...skippedCommands].map(e => e[0]);
  for (const [, clientCommand] of applicationCommands) {
    if (commandNames.includes(clientCommand.name)) continue;

    await client.application.commands.delete(clientCommand, syncGuild && syncGuild != '*' ? syncGuild : null);
    client.log(`Deleted Slash Comand ${clientCommand.name}`);
    deletedCommandCount++
  }

  if (syncGuild) return;

  client.log(`Registered ${client.slashCommands.size} Slash Commands`);

  for (const [, skippedCommand] of skippedCommands) client.slashCommands.set(skippedCommand.name, skippedCommand);

  client.log(`Skipped ${skippedCommands.size} Slash Commands`);
  client.log(`Deleted ${deletedCommandCount} Slash Commands`);

  client.on('interactionCreate', require('../Events/interactionCreate.js').bind(null, client));
  client.log('Loaded Event interactionCreate');
  client.log('Ready to receive slash commands\n');

  client.log(`Ready to serve in ${client.channels.cache.size} channels on ${client.guilds.cache.size} servers, for a total of ${new Set(client.guilds.cache.map(g => Array.from(g.members.cache.filter(e => !e.user.bot).keys())).flat()).size} unique users.\n`);
  console.timeEnd('Starting time'); //(new Set(await client.guilds.fetch()).map((_, e) => Array.from(e.members.cache.filter(e => !e.user.bot).keys())).flat()).size
}