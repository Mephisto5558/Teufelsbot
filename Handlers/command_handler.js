const
  { readdir } = require('fs/promises'),
  { resolve } = require('path'),
  { HideDisabledCommandLog, HideNonBetaCommandLog } = require('../config.json');

let enabledCommandCount = 0, disabledCommandCount = 0;

module.exports = async function commandHandler() {
  for (const subFolder of getDirectoriesSync('./Commands')) {
    for (const file of await readdir(`./Commands/${subFolder}`)) {
      if (!file.endsWith('.js')) continue;

      const command = require(`../Commands/${subFolder}/${file}`);
      if (!command?.prefixCommand) continue;

      command.filePath = resolve(`Commands/${subFolder}/${file}`);
      command.category = subFolder;

      if (!command.disabled && !command.run?.toString().startsWith('function') && !command.run?.toString().startsWith('async function')) throw new Error(`The run function of file "${command.filePath}" is not a function. You cannot use arrow functions.`);

      this.prefixCommands.set(command.name, command);
      if (command.disabled) HideDisabledCommandLog ? void 0 : this.log(`Loaded Disabled Prefix Command ${command.name}`);
      else if (!command.beta && this.botType == 'dev') HideNonBetaCommandLog ? void 0 : this.log(`Loaded Non-Beta Prefix Command ${command.name}`);
      else this.log(`Loaded Prefix Command ${command.name}`);
      command.disabled || (this.botType == 'dev' && !command.beta) ? disabledCommandCount++ : enabledCommandCount++;

      for (const alias of command.aliases?.prefix || []) {
        this.prefixCommands.set(alias, { ...command, aliasOf: command.name });
        if (command.disabled) HideDisabledCommandLog ? void 0 : this.log(`Loaded Alias ${alias} of Prefix Command ${command.name} (disabled)`);
        else this.log(`Loaded Alias ${alias} of Prefix Command ${command.name}`);
        command.disabled || (this.botType == 'dev' && !command.beta) ? disabledCommandCount++ : enabledCommandCount++;
      }
    }
  }

  this.log(`Loaded ${enabledCommandCount} Enabled Prefix Commands`);
  if (!HideDisabledCommandLog) this.log(`Loaded ${disabledCommandCount} Disabled/Non-Beta Prefix Commands`);
  console.log(); //Empty line
};