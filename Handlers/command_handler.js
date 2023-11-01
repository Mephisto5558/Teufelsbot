const
  { readdir } = require('fs/promises'),
  { resolve } = require('path'),
  { HideDisabledCommandLog, HideNonBetaCommandLog } = require('../config.json');

let enabledCommandCount = 0, disabledCommandCount = 0;

/**@this Client*/
module.exports = async function commandHandler() {
  for (const subFolder of await getDirectories('./Commands')) for (const file of await readdir(`./Commands/${subFolder}`)) {
    if (!file.endsWith('.js')) continue;

    const command = require(`../Commands/${subFolder}/${file}`);
    if (!command?.prefixCommand) continue;
    if (!command.disabled && !command.run?.toString().startsWith('function') && !command.run?.toString().startsWith('async function')) throw new Error(`The run function of file "${command.filePath}" is not a function. You cannot use arrow functions.`);

    command.filePath = resolve(`Commands/${subFolder}/${file}`);
    command.category = subFolder;

    this.prefixCommands.set(command.name, command);
    if (command.disabled) { if (!HideDisabledCommandLog) log(`Loaded Disabled Prefix Command ${command.name}`); }
    else if (!command.beta && this.botType == 'dev') { if (!HideNonBetaCommandLog) log(`Loaded Non-Beta Prefix Command ${command.name}`); }
    else log(`Loaded Prefix Command ${command.name}`);
    command.disabled || (this.botType == 'dev' && !command.beta) ? disabledCommandCount++ : enabledCommandCount++;

    for (const alias of command.aliases?.prefix || []) {
      this.prefixCommands.set(alias, { ...command, name: alias, aliasOf: command.name });
      if (command.disabled) !HideDisabledCommandLog && log(`Loaded Alias ${alias} of Prefix Command ${command.name} (disabled)`);
      else log(`Loaded Alias ${alias} of Prefix Command ${command.name}`);
      command.disabled || (this.botType == 'dev' && !command.beta) ? disabledCommandCount++ : enabledCommandCount++;
    }
  }

  log(`Loaded ${enabledCommandCount} Enabled Prefix Commands`);
  if (!HideDisabledCommandLog) log(`Loaded ${disabledCommandCount} Disabled/Non-Beta Prefix Commands`);
  console.log(); //Empty line
};