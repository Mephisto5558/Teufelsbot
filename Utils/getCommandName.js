/** @type {import('.').getCommandName} */
module.exports = function getCommandName(command) {
  const cmd = [...this.slashCommands.values(), ...this.prefixCommands.values()].unique()
    .find(e => e.name == (command.name ?? command));

  return cmd?.aliasOf ?? cmd?.name;
};