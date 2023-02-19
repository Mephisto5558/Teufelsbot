const
  { Collection } = require('discord.js'),
  { readdirSync } = require('fs'),
  { resolve } = require('path'),
  { I18nProvider, formatSlashCommand } = require('../Utils'),
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

/**@this {import('discord.js').Client}*/
module.exports = async function slashCommandHandler() {
  await this.awaitReady();

  let deletedCommandCount = 0, registeredCommandCount = 0;

  const skippedCommands = new Collection();
  const applicationCommands = this.application.commands.fetch();

  this.slashCommands.clear();

  for (const subFolder of getDirectoriesSync('./Commands')) {
    for (const file of readdirSync(`./Commands/${subFolder}`)) {
      if (!file.endsWith('.js')) continue;
      let command = require(`../Commands/${subFolder}/${file}`);
      let skipped = false;

      if (!command.slashCommand) continue;
      try {
        command = formatSlashCommand(command, `commands.${subFolder.toLowerCase()}.${file.slice(0, -3)}`);
        command.filePath = resolve(`Commands/${subFolder}/${file}`);
        command.category = subFolder;
      }
      catch (err) { this.error(`Error on formatting command ${command.name}:\n`, err); }

      if (!command.disabled) for (const [, applicationCommand] of await applicationCommands) {
        if (!equal(command, applicationCommand)) continue;
        this.log(`Skipped Slash Command ${command.name}`);
        skipped = true;

        command.id = applicationCommand.id;
        skippedCommands.set(command.name, command);
        break;
      }

      if (!skipped) {
        this.slashCommands.set(command.name, command);
        if (command.aliases?.slash) this.slashCommands = this.slashCommands.concat(command.aliases.slash.map(e => [e, { ...command, name: e, aliasOf: command.name }]));
      }
    }
  }

  for (const [commandName, command] of this.slashCommands) {
    if (command.disabled) HideDisabledCommandLog ? void 0 : this.log(`Skipped Disabled Slash Command ${commandName}`);
    else if (this.botType == 'dev' && !command.beta) HideNonBetaCommandLog ? void 0 : this.log(`Skipped Non-Beta Slash Command ${commandName}`);
    else {
      try {
        const { id } = await this.application.commands.create(command);
        command.id = id;

        this.log(`Registered Slash Command ${commandName}`);
        registeredCommandCount++;
      }
      catch (err) { this.error(`Error on registering command ${command.name}:\n`, err); }
    }
  }

  const commandNames = [...this.slashCommands, ...skippedCommands].map(e => e[0]);
  for (const [, command] of await applicationCommands) {
    if (commandNames.includes(command.name)) continue;

    try {
      await this.application.commands.delete(command);

      this.log(`Deleted Slash Command ${command.name}`);
      deletedCommandCount++;
    }
    catch (err) { this.error(`Error on deleting command ${command.name}:\n`, err); }
  }
  
  this.log(`Registered ${registeredCommandCount} Slash Commands`);

  this.slashCommands = this.slashCommands.concat(skippedCommands);

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
      const message = await (await guild.channels.fetch(this.settings.restartingMsg.channel)).messages.fetch(this.settings.restartingMsg.message);
      if (message?.editable) message.edit(I18nProvider.__({ locale: guild.localeCode }, 'commands.owner-only.restart.success'));
    } catch { }

    this.db.update('botSettings', 'settings.restartingMsg', {});
  }
};