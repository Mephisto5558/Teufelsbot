const
  { Collection } = require('discord.js'),
  { readdirSync } = require('fs'),
  { resolve } = require('path'),
  { I18nProvider, formatSlashCommand, slashCommandsEqual } = require('../Utils'),
  { HideNonBetaCommandLog, HideDisabledCommandLog } = require('../config.json');

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
      catch (err) {
        if (this.botType == 'dev') throw err;
        else this.error(`Error on formatting command ${command.name}:\n`, err);

        skippedCommands.set(command.name, command);
        continue;
      }

      if (!command.disabled && !skipped) for (const [, applicationCommand] of await applicationCommands) {
        if (!slashCommandsEqual(command, applicationCommand)) continue;
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
      catch (err) {
        if (this.botType == 'dev') throw err;
        else this.error(`Error on registering command ${command.name}:\n`, err);
      }
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
    catch (err) {
      if (this.botType == 'dev') throw err;
      else this.error(`Error on deleting command ${command.name}:\n`, err);
    }
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