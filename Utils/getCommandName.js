/** @import { getCommandName } from '.' */

/** @type {getCommandName} */
module.exports = function getCommandName(commandName) {
  const cmd = [...this.slashCommands.values(), ...this.prefixCommands.values()].unique()
    .find(e => e.name == commandName);

  return cmd?.aliasOf ?? cmd?.name;
};