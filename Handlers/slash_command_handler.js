const
  { readdir } = require('fs/promises'),
  { resolve } = require('path'),
  { I18nProvider, formatSlashCommand, slashCommandsEqual } = require('../Utils'),
  { HideNonBetaCommandLog, HideDisabledCommandLog } = require('../config.json');

/**@this {import('discord.js').Client}*/
module.exports = async function slashCommandHandler() {
  await this.awaitReady();

  const applicationCommands = this.application.commands.fetch({ withLocalizations: true });
  let deletedCommandCount = 0, registeredCommandCount = 0;

  this.slashCommands.clear();

  for (const subFolder of await getDirectories('./Commands')) {
    for (const file of await readdir(`./Commands/${subFolder}`)) {
      if (!file.endsWith('.js')) continue;
      let command = require(`../Commands/${subFolder}/${file}`);

      if (!command.slashCommand) continue;
      try {
        command = formatSlashCommand(command, `commands.${subFolder.toLowerCase()}.${file.slice(0, -3)}`);
        command.filePath = resolve(`Commands/${subFolder}/${file}`);
        command.category = subFolder;
      }
      catch (err) {
        if (this.botType == 'dev') throw err;
        else log.error(`Error on formatting command ${command.name}:\n`, err);

        command.skip = true;
        this.slashCommands.set(command.name, command);
        continue;
      }

      if (!command.disabled && !command.skip) for (const [, applicationCommand] of await applicationCommands) if (slashCommandsEqual(command, applicationCommand)) {
        log(`Skipped Slash Command ${command.name}`);

        command.skip = true;
        command.id = applicationCommand.id;
        break;
      }

      this.slashCommands.set(command.name, command);
      if (command.aliases?.slash) this.slashCommands = this.slashCommands.concat(command.aliases.slash.map(e => [e, { ...command, name: e, aliasOf: command.name }]));
    }
  }

  for (const [, command] of this.slashCommands) {
    if (command.skip) continue;
    if (command.disabled) HideDisabledCommandLog ? void 0 : log(`Skipped Disabled Slash Command ${command.name}`);
    else if (this.botType == 'dev' && !command.beta) HideNonBetaCommandLog ? void 0 : log(`Skipped Non-Beta Slash Command ${command.name}`);
    else {
      try {
        command.id = (await this.application.commands.create(command)).id;

        log(`Registered Slash Command ${command.name}` + (command.aliasOf ? ` (Alias of ${command.aliasOf})` : ''));
        registeredCommandCount++;
      }
      catch (err) {
        if (this.botType == 'dev') throw err;
        else log.error(`Error on registering command ${command.name}:\n`, err);
      }
    }
  }

  for (const [, command] of await applicationCommands) {
    const cmd = this.slashCommands.get(command.aliasOf || command.name);
    if (cmd && !cmd.disabled && (this.botType != 'dev' || cmd.beta)) continue;

    try {
      await this.application.commands.delete(command);

      log(`Deleted Slash Command ${command.name}`);
      deletedCommandCount++;
    }
    catch (err) {
      if (this.botType == 'dev') throw err;
      else log.error(`Error on deleting command ${command.name}:\n`, err);
    }
  }

  this.on('interactionCreate', args => require('../Events/interactionCreate.js').call(...[].concat(args ?? this)));

  log /*eslint-disable no-unexpected-multiline, indent*/
    (`Registered ${registeredCommandCount} Slash Commands`)
    (`Skipped ${this.slashCommands.filter(e => { return e.skip && delete e.skip; }).size} Slash Commands`)
    (`Deleted ${deletedCommandCount} Slash Commands`)
    ('Loaded Event interactionCreate')
    ('Ready to receive slash commands\n')
    (`Ready to serve in ${this.channels.cache.size} channels on ${this.guilds.cache.size} servers.\n`);

  console.timeEnd('Starting time');

  if (this.settings.restartingMsg?.message) {
    try {
      const guild = await this.guilds.fetch(this.settings.restartingMsg.guild);
      const message = await (await guild.channels.fetch(this.settings.restartingMsg.channel)).messages.fetch(this.settings.restartingMsg.message);
      if (message?.editable) message.edit(I18nProvider.__({ locale: guild.localeCode }, 'commands.owner-only.restart.success'));
    } catch { }

    await this.db.delete('botSettings', 'restartingMsg');
  }
};