/* eslint-disable @typescript-eslint/no-deprecated -- will be fixed when commands are moved to their own lib */
const
  { readdir } = require('node:fs/promises'),
  { resolve } = require('node:path'),
  { getDirectories, localizeUsage, formatCommand, filename } = require('#Utils');

let
  enabledCommandCount = 0,
  disabledCommandCount = 0;

/** @this {Client<false>} */
module.exports = async function commandHandler() {
  for (const subFolder of await getDirectories('./Commands')) {
    for (const file of await readdir(`./Commands/${subFolder}`, { withFileTypes: true })) {
      if (!file.name.endsWith('.js') && !file.isDirectory()) continue;

      const filePath = resolve(file.parentPath, file.name);

      /** @type {Omit<command<string, boolean, true>, 'name' | 'category'> | undefined} */
      let commandFile;
      try { commandFile = require(filePath); }
      catch (err) {
        if (err.code != 'MODULE_NOT_FOUND') throw err;
      }

      if (!commandFile?.prefixCommand) continue;

      const command = formatCommand(commandFile, filePath, `commands.${subFolder.toLowerCase()}.${filename(file.name)}`, this.i18n);

      /* For some reason, this alters the slash command as well.
         That's why localizeUsage is only here and not in `Utils/formatSlashCommand.js`. */
      const usage = localizeUsage(command, `commands.${command.category}.${command.name}`, this.i18n);
      command.usage = usage[0];
      command.usageLocalizations = usage[1];

      this.prefixCommands.set(command.name, command);
      if (command.disabled) {
        if (!this.config.hideDisabledCommandLog) log(`Loaded Disabled Prefix Command ${command.name}`);
      }
      else if (command.beta || this.botType != 'dev') log(`Loaded Prefix Command ${command.name}`);
      else if (!this.config.hideNonBetaCommandLog) log(`Loaded Non-Beta Prefix Command ${command.name}`);

      if (command.disabled || (this.botType == 'dev' && !command.beta)) disabledCommandCount++;
      else enabledCommandCount++;

      for (const alias of command.aliases?.prefix ?? []) {
        this.prefixCommands.set(alias, { ...command, name: alias, aliasOf: command.name });
        if (!command.disabled) log(`Loaded Alias ${alias} of Prefix Command ${command.name}`);
        else if (!this.config.hideDisabledCommandLog) log(`Loaded Alias ${alias} of Prefix Command ${command.name} (disabled)`);

        if (command.disabled || (this.botType == 'dev' && !command.beta)) disabledCommandCount++;
        else enabledCommandCount++;
      }
    }
  }

  log(`Loaded ${enabledCommandCount} Enabled Prefix Commands`);
  if (!this.config.hideDisabledCommandLog) log(`Loaded ${disabledCommandCount} Disabled/Non-Beta Prefix Commands`);
  console.log(); // Empty line
};