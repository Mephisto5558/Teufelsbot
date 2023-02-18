const
  { Collection, ApplicationCommandType, ApplicationCommandOptionType, PermissionsBitField, ChannelType } = require('discord.js'),
  { readdirSync } = require('fs'),
  { resolve } = require('path'),
  { I18nProvider } = require('../Utils'),
  { HideNonBetaCommandLog, HideDisabledCommandLog } = require('../config.json');

function equal(a, b) {
  if (!a?.toString() && !b?.toString()) return true;
  if (typeof a == 'string' || typeof b == 'string') return a == b;
  if (
    !!a != !!b || a.name != b.name || a.description != b.description || a.type != b.type || a.autocomplete != b.autocomplete || a.dmPermission != b.dmPermission ||
    a.value != b.value || (a.options?.length ?? 0) != (b.options?.length ?? 0) || (a.channelTypes?.length ?? 0) != (b.channelTypes?.length ?? 0) ||
    a.minValue != b.minValue || a.maxValue != b.maxValue || a.minLength != b.minLength || a.maxLength != b.maxLength || !!a.required != !!b.required ||
    !equal(a.choices, b.choices) || a.defaultMemberPermissions?.bitfield != b.defaultMemberPermissions?.bitfield ||
    !equal(a.nameLocalizations, b.nameLocalizations) || !equal(a.description_localizations, b.description_localizations)
  ) return false;

  for (let i = 0; i < (a.options?.length || 0); i++) if (!equal(a.options?.[i], b?.options?.[i])) return false;
  for (const channelType of (a.channelTypes || [])) if (!b.channelTypes.includes(channelType)) return false;

  return true;
}

function format(option, path) {
  if (option.options) option.options = option.options.map(e => format(e, `${path}.options.${e.name}`));

  if (!option.description) option.description = I18nProvider.__({ errorNotFound: true }, `${path}.description`);
  if (option.choices?.length) option.choices = option.choices.map(e => typeof e == 'object' ? e.fMerge({ __SCHandlerCustom: true }) : { name: I18nProvider.__({ undefinedNotFound: true }, `${path}.choices.${e}`) || e, value: e });
  if (option.autocompleteOptions) option.autocomplete = true;

  if (option.description.length > 100) {
    if (!option.disabled) console.warn(`WARN: Description of option "${option.name}" (${path}.description) is too long (max length is 100)! Slicing.`);
    option.description = option.description.substring(0, 100);
  }

  for (const [locale] of [...I18nProvider.availableLocales].filter(([e]) => e != I18nProvider.config.defaultLocale)) {
    if (!option.descriptionLocalizations) option.descriptionLocalizations = {};
    let localeText = I18nProvider.__({ locale, undefinedNotFound: true }, `${path}.description`);
    if (localeText?.length > 100 && !option.disabled) console.warn(`WARN: "${locale}" description localization of option "${option.name}" (${path}.description) is too long (max length is 100)! Slicing.`);

    if (localeText) option.descriptionLocalizations[locale] = localeText?.slice(0, 100);
    else if (!option.disabled) console.warn(`WARN: Missing "${locale}" description localization for option "${option.name}" (${path}.description)`);

    if (option.choices?.length) option.choices.map(e => {
      if (e.__SCHandlerCustom) {
        delete e.__SCHandlerCustom;
        return e;
      }

      if (!e.nameLocalizations) e.nameLocalizations = {};
      let localeText = I18nProvider.__({ locale, undefinedNotFound: true }, `${path}.choices.${e.value}`);
      if (localeText?.length < 2) option.disabled ? void 0 : console.warn(`WARN: Choice name localization ("${e.name}") "${locale}" of option "${option.name}" (${path}.choices.${e.name}) is too short (min length is 2)! Using undefined.`);
      else if (localeText?.length > 32) option.disabled ? void 0 : console.warn(`WARN: Choice name localization ("${e.name}") "${locale}" of option "${option.name}" (${path}.choices.${e.name}) is too long (max length is 32)! Slicing.`);

      if (localeText && localeText.length > 2) e.nameLocalizations[locale] = localeText.slice(0, 32);
      else if (e.name != e.value) option.disabled ? void 0 : console.warn(`WARN: Missing "${locale}" choice name localization for "${e.name}" in option "${option.name}" (${path}.choices.${e.name})`);

      return e;
    });
  }

  if (option.run) {
    if (!option.disabled && !option.run.toString().startsWith('function') && !option.run.toString().startsWith('async function')) throw new Error(`The run function of file "${path}" is not a function. You cannot use arrow functions.`);

    if (!option.type) option.type = ApplicationCommandType.ChatInput;
    else if (!ApplicationCommandType[option.type]) { if (!option.disabled) throw new Error(`Invalid option.type, got "${option.type}" (${path})`); }
    else if (isNaN(option.type)) option.type = ApplicationCommandType[option.type];

    if (!option.usage) option.usage = I18nProvider.__({ undefinedNotFound: true }, `${path}.usage`);
    if (option.permissions?.user?.length) option.defaultMemberPermissions = new PermissionsBitField(option.permissions.user);
    if (!option.dmPermission) option.dmPermission = false;

    return option;
  }

  if (/[A-Z]/.test(option.name)) {
    if (!option.disabled) console.error(`${option.name} (${path}) has uppercase letters! Fixing`);
    option.name = option.name.toLowerCase();
  }

  if (option.channelTypes) option.channelTypes = option.channelTypes?.map(e => {
    if (!ChannelType[e] && ChannelType[e] != 0 && !option.disabled) throw Error(`Invalid option.channelType, got "${e}" (${path})`);
    return isNaN(e) ? ChannelType[e] : e;
  });

  if (!option.type || !ApplicationCommandOptionType[option.type] && !option.disabled) throw Error(`Missing or invalid option.type, got "${option.type}" (${path})`);
  if (isNaN(option.type)) option.type = ApplicationCommandOptionType[option.type];

  if ([ApplicationCommandOptionType.Number, ApplicationCommandOptionType.Integer].includes(option.type) && ('minLength' in option || 'maxLength' in option) && !option.disabled)
    throw new Error(`Number and Integer options do not support "minLength" and "maxLength" (${path})`);
  if (option.type == ApplicationCommandOptionType.String && ('minValue' in option || 'maxValue' in option) && !option.disabled)
    throw new Error(`String options do not support "minValue" and "maxValue" (${path})`);

  return option;
}

module.exports = async function slashCommandHandler(syncGuild) {
  await this.awaitReady();

  let deletedCommandCount = 0, registeredCommandCount = 0;

  const skippedCommands = new Collection();
  const applicationCommands = this.application.commands.fetch(undefined, { guildId: syncGuild && syncGuild != '*' ? syncGuild : undefined });

  if (!syncGuild || syncGuild == '*') {
    this.slashCommands.clear();

    for (const subFolder of getDirectoriesSync('./Commands')) {
      for (const file of readdirSync(`./Commands/${subFolder}`).filter(e => e.endsWith('.js'))) {
        let command = require(`../Commands/${subFolder}/${file}`);
        let skipped = false;

        if (!command.slashCommand) continue;

        command = format(command, `commands.${subFolder.toLowerCase()}.${file.slice(0, -3)}`);
        command.filePath = resolve(`Commands/${subFolder}/${file}`);
        command.category = subFolder;

        for (const [, applicationCommand] of await applicationCommands) {
          if (!syncGuild && (command.disabled || !equal(command, applicationCommand))) continue;
          this.log(`Skipped Slash Command ${command.name}`);
          skipped = true;
          skippedCommands.set(command.name, command);
          break;
        }
        if (!skipped) {
          this.slashCommands.set(command.name, command);
          for (const alias of command.aliases?.slash || []) this.slashCommands.set(alias, { ...command, aliasOf: command.name });
        }
      }
    }
  }

  for (const [commandName, command] of this.slashCommands) {
    if (command.disabled) HideDisabledCommandLog ? void 0 : this.log(`Skipped Disabled Slash Command ${commandName}`);
    else if (this.botType == 'dev' && !command.beta) HideNonBetaCommandLog ? void 0 : this.log(`Skipped Non-Beta Slash Command ${commandName}`);
    else {
      await this.application.commands.create(command, syncGuild && syncGuild != '*' ? syncGuild : null);
      this.log(`Registered Slash Command ${commandName}`);
      registeredCommandCount++;
    }
  }

  const commandNames = [...this.slashCommands, ...skippedCommands].map(e => e[0]);
  for (const [, command] of await applicationCommands) {
    if (commandNames.includes(command.name)) continue;

    await this.application.commands.delete(command, syncGuild && syncGuild != '*' ? syncGuild : null);
    this.log(`Deleted Slash Command ${command.name}`);
    deletedCommandCount++;
  }

  if (syncGuild) return;

  this.log(`Registered ${registeredCommandCount} Slash Commands`);

  for (const skippedCommand of skippedCommands) this.slashCommands.set(...skippedCommand);

  this
    .log(`Skipped ${skippedCommands.size} Slash Commands`)
    .log(`Deleted ${deletedCommandCount} Slash Commands`)
    .on('interactionCreate', args => require('../Events/interactionCreate.js').call(...[].concat(args ?? this)))
    .log('Loaded Event interactionCreate')
    .log('Ready to receive slash commands\n')

    .log(`Ready to serve in ${this.channels.cache.size} channels on ${this.guilds.cache.size} servers.\n`);
  console.timeEnd('Starting time');

  if (this.settings.restartingMsg?.message) {
    try {
      const guild = await this.guilds.fetch(this.settings.restartingMsg.guild);
      const channel = await guild.channels.fetch(this.settings.restartingMsg.channel);
      const message = await channel.messages.fetch(this.settings.restartingMsg.message);
      if (message?.editable) message.edit(I18nProvider.__({ locale: guild.localeCode }, 'commands.owner-only.restart.success'));
    } catch { }

    this.db.update('botSettings', 'settings.restartingMsg', {});
  }
};