const
  { Collection, ApplicationCommandType, ApplicationCommandOptionType, PermissionsBitField, ChannelType } = require('discord.js'),
  { readdirSync } = require('fs'),
  I18nProvider = require('../Functions/private/I18nProvider.js');

let deletedCommandCount = 0;

function equal(a, b) {
  if (!a?.toString() && !b?.toString()) return true;
  if (typeof a == 'string' || typeof b == 'string') return a == b;
  if (
    !!a != !!b || a.name != b.name || a.description != b.description || a.type != b.type || a.autocomplete != b.autocomplete ||
    a.value != b.value || (a.options?.length ?? 0) != (b.options?.length ?? 0) || (a.channelTypes?.length ?? 0) != (b.channelTypes?.length ?? 0) ||
    a.minValue != b.minValue || a.maxValue != b.maxValue || a.minLength != b.minLength || a.maxLength != b.maxLength || !!a.required != !!b.required ||
    !equal(a.choices, b.choices) || a.defaultMemberPermissions?.bitfield != b.defaultMemberPermissions?.bitfield ||
    !equal(a.nameLocalizations, b.nameLocalizations) || !equal(a.description_localizations, b.description_localizations)
  ) return;

  for (let i = 0; i < (a.options?.length || 0); i++) if (!equal(a.options?.[i], b?.options?.[i])) return;
  for (let i = 0; i < (a.channelTypes?.length || 0); i++) if (!equal(a.channelTypes?.[i], b.channelTypes?.[i])) return;

  return true;
}

function format(option, path) {
  if (option.options) option.options = option.options.map(e => format(e, `${path}.options.${e.name}`));

  if (!option.description) option.description = I18nProvider.__({ errorNotFound: true }, `${path}.description`);
  if (option.choices?.length) option.choices = option.choices.map(e => { return typeof e != 'string' ? e.fMerge({ __SCHandlerCustom: true }) : { name: I18nProvider.__({ errorNotFound: true }, `${path}.choices.${e}`) || e, value: e } });

  if (option.description.length > 100) {
    console.warn(`WARN: Description of option "${option.name}" (${path}.description) is too long (max length is 100)! Slicing.`);
    option.description = option.description.substring(0, 100);
  }

  for (const [locale] of [...I18nProvider.availableLocales].filter(([e]) => e != I18nProvider.config.defaultLocale)) {
    if (!option.descriptionLocalizations) option.descriptionLocalizations = {};
    let localeText = I18nProvider.__({ locale, undefinedNotFound: true }, `${path}.description`);
    if (localeText?.length > 100) console.warn(`WARN: "${locale}" Description localization of option "${option.name}" (${path}.description) is too long (max length is 100)! Slicing.`);

    if (localeText) option.descriptionLocalizations[locale] = localeText?.slice(0, 100);
    else console.warn(`WARN: Missing "${locale}" description localization for option "${option.name}" (${path}.description)`);

    if (option.choices?.length) option.choices.map(e => {
      if (e.__SCHandlerCustom) {
        delete e.__SCHandlerCustom;
        return e;
      }

      if (!e.nameLocalizations) e.nameLocalizations = {};
      let localeText = I18nProvider.__({ locale, undefinedNotFound: true }, `${path}.choices.${e.value}`);
      if (localeText?.length > 32) console.warn(`WARN: Choice name localization ("${e.name}") "${locale}" of option "${option.name}" (${path}.choices.${e.name}) is too long (max length is 32)! Slicing.`);
      else if (localeText?.length < 2) console.warn(`WARN: Choice name localization ("${e.name}") "${locale}" of option "${option.name}" (${path}.choices.${e.name}) is too short (min length is 2)! Using undefined.`);

      if (localeText && localeText?.length > 2) e.nameLocalizations[locale] = localeText?.slice(0, 32);
      else console.warn(`WARN: Missing "${locale}" choice name localization for "${e.name}" in option "${option.name}" (${path}.choices.${e.name})`);

      return e;
    });
  }

  if (option.run) {
    if (!option.usage) option.usage = I18nProvider.__({ undefinedNotFound: true }, `${path}.usage`);

    if (!option.type) option.type = ApplicationCommandType.ChatInput;
    else if (!ApplicationCommandType[option.type]) throw new Error(`Invalid option.type, got "${option.type}" (${path})`);
    else if (isNaN(option.type)) option.type = ApplicationCommandType[option.type];

    if (option.permissions?.user.length) option.defaultMemberPermissions = new PermissionsBitField(option.permissions?.user);

    return option;
  }

  if (/[A-Z]/.test(option.name)) {
    console.error(`${option.name} (${path})has uppercase letters! Fixing`);
    option.name = option.name.toLowerCase();
  }

  if (option.channelTypes) option.channelTypes = option.channelTypes?.map(e => {
    if (!ChannelType[e] && ChannelType[e] != 0) throw Error(`Invalid option.channelType, got "${e}" (${path})`);
    return isNaN(e) ? ChannelType[e] : e;
  });

  if (!option.type || !ApplicationCommandOptionType[option.type]) throw Error(`Missing or invalid option.type, got "${option.type}" (${path})`);
  if (isNaN(option.type)) option.type = ApplicationCommandOptionType[option.type];

  return option;
}

module.exports = async (client, syncGuild) => {
  await client.functions.ready(client);

  const skippedCommands = new Collection();
  const applicationCommands = client.application.commands.fetch(undefined, { guildId: syncGuild && syncGuild != '*' ? syncGuild : undefined });

  if (!syncGuild || syncGuild == '*') {
    client.slashCommands = new Collection();

    for (const subFolder of getDirectoriesSync('./Commands')) {
      for (const file of readdirSync(`./Commands/${subFolder}`).filter(e => e.endsWith('.js'))) {
        let command = require(`../Commands/${subFolder}/${file}`);
        let skipped = false;

        if (!command.slashCommand || command.disabled || (client.botType == 'dev' && !command.beta)) continue;

        command = format(command, `commands.${subFolder.toLowerCase()}.${file.slice(0, -3)}`);

        for (const [, applicationCommand] of await applicationCommands) {
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
  for (const [, clientCommand] of await applicationCommands) {
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

  client.log(`Ready to serve in ${client.channels.cache.size} channels on ${client.guilds.cache.size} servers.\n`);
  console.timeEnd('Starting time');
}