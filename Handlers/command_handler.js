const
  { readdir } = require('node:fs/promises'),
  { resolve } = require('node:path'),
  { getDirectories } = require('../Utils');

let
  enabledCommandCount = 0,
  disabledCommandCount = 0;

/** @this {Client<false>}*/
module.exports = async function commandHandler() {
  for (const subFolder of await getDirectories('./Commands')) {
    for (const file of await readdir(`./Commands/${subFolder}`)) {
      if (!file.endsWith('.js')) continue;

      /** @type {command<'prefix', boolean, true>}*/
      const command = require(`../Commands/${subFolder}/${file}`);
      if (!command?.prefixCommand) continue;
      if (!command.disabled && !command.run?.toString().startsWith('function') && !command.run?.toString().startsWith('async function'))
        throw new Error(`The run function of file "${command.filePath}" is not a function. You cannot use arrow functions.`);

      command.filePath = resolve(`Commands/${subFolder}/${file}`);
      command.category = subFolder.toLowerCase();

      this.prefixCommands.set(command.name, command);
      if (command.disabled) { if (!this.config.hideDisabledCommandLog) log(`Loaded Disabled Prefix Command ${command.name}`); }
      else if (!command.beta && this.botType == 'dev') { if (!this.config.hideNonBetaCommandLog) log(`Loaded Non-Beta Prefix Command ${command.name}`); }
      else log(`Loaded Prefix Command ${command.name}`);

      command.disabled || (this.botType == 'dev' && !command.beta) ? disabledCommandCount++ : enabledCommandCount++;

      for (const alias of command.aliases?.prefix ?? []) {
        this.prefixCommands.set(alias, { ...command, name: alias, aliasOf: command.name });
        if (command.disabled) !this.config.hideDisabledCommandLog && log(`Loaded Alias ${alias} of Prefix Command ${command.name} (disabled)`);
        else log(`Loaded Alias ${alias} of Prefix Command ${command.name}`);
        command.disabled || (this.botType == 'dev' && !command.beta) ? disabledCommandCount++ : enabledCommandCount++;
      }
    }
  }

  log(`Loaded ${enabledCommandCount} Enabled Prefix Commands`);
  if (!this.config.hideDisabledCommandLog) log(`Loaded ${disabledCommandCount} Disabled/Non-Beta Prefix Commands`);
  console.log(); // Empty line
};