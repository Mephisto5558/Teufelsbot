/* eslint-disable sonarjs/cognitive-complexity, custom/cyclomatic-complexity, max-depth, @typescript-eslint/no-unsafe-argument
 -- will be fixed when commands are moved to their own lib */

const
  { Events } = require('discord.js'),
  { readdir } = require('node:fs/promises'),
  { resolve } = require('node:path'),
  { errorHandler, filename, formatCommand, getDirectories, slashCommandsEqual } = require('#Utils');

/** @this {Client} */
module.exports = async function slashCommandHandler() {
  await this.awaitReady();

  const applicationCommands = this.application.commands.fetch({ withLocalizations: true });

  this.slashCommands.clear();
  for (const subFolder of await getDirectories('./Commands')) {
    for (const file of await readdir(`./Commands/${subFolder}`, { withFileTypes: true })) {
      if (!file.name.endsWith('.js') && !file.isDirectory()) continue;

      const filePath = resolve(file.parentPath, file.name);

      /** @type {Omit<command<'slash', boolean, false>, 'name' | 'category'> | undefined} */
      let commandFile;
      try { commandFile = require(filePath); }
      catch (err) {
        if (err.code != 'MODULE_NOT_FOUND') throw err;
      }

      if (!commandFile?.slashCommand) continue;

      /** @type {command<'slash', boolean, true>} */
      let command;
      try { command = formatCommand(commandFile, filePath, `commands.${subFolder.toLowerCase()}.${filename(file.name)}`, this.i18n); }
      catch (err) {
        if (this.botType == 'dev') throw err;
        log.error(`Error on formatting command file ${filePath}:\n`, err);

        commandFile.skip = true;
        this.slashCommands.set(commandFile.name, commandFile);
        continue;
      }

      if (!command.disabled && !command.skip) {
        for (const [, applicationCommand] of await applicationCommands) {
          if (!slashCommandsEqual(command, applicationCommand)) continue;

          log(`Skipped Slash Command ${command.name}`);

          command.skip = true;
          command.id = applicationCommand.id;
          break;
        }
      }

      this.slashCommands.set(command.name, command);
      for (const alias of command.aliases?.slash ?? []) this.slashCommands.set(alias, { ...command, name: alias, aliasOf: command.name });
    }
  }

  let registeredCommandCount = 0;
  for (const [, command] of this.slashCommands) {
    if (command.skip) continue;
    if (command.disabled) {
      if (!this.config.hideDisabledCommandLog) log(`Skipped Disabled Slash Command ${command.name}`);
      continue;
    }
    if (this.botType == 'dev' && !command.beta) {
      if (!this.config.hideNonBetaCommandLog) log(`Skipped Non-Beta Slash Command ${command.name}`);
      continue;
    }

    try {
      command.id = (await this.application.commands.create(command)).id;

      log(`Registered Slash Command ${command.name}` + (command.aliasOf ? ` (Alias of ${command.aliasOf})` : ''));
      registeredCommandCount++;
    }
    catch (err) {
      if (this.botType == 'dev') throw err;
      log.error(`Error on registering command ${command.name}:\n`, err);
    }
  }

  log(`Registered ${registeredCommandCount} Slash Commands`);
  log(`Skipped ${this.slashCommands.filter(e => e.skip && delete e.skip).size} Slash Commands`);

  let deletedCommandCount = 0;
  for (const [, command] of await applicationCommands) {
    const cmd = this.slashCommands.get(command.aliasOf ?? command.name);
    if (cmd && !cmd.disabled && (this.botType != 'dev' || cmd.beta)) continue;

    try {
      await this.application.commands.delete(command);

      log(`Deleted Slash Command ${command.name}`);
      deletedCommandCount++;
    }
    catch (err) {
      if (this.botType == 'dev') throw err;
      log.error(`Error on deleting command ${command.name}:\n`, err);
    }
  }
  log(`Deleted ${deletedCommandCount} Slash Commands`);

  /* eslint-disable-next-line @typescript-eslint/strict-void-return -- this cannot be cleanly resolved. */
  this.on(Events.InteractionCreate, async interaction => {
    try { await require('../Events').interactionCreate.call(interaction); }
    catch (err) { await errorHandler.call(this, err, interaction); }
  });

  log('Loaded Event interactionCreate')('Ready to receive slash commands');
};