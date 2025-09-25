/** @type {import('..').commandExecutionWrapper} */
const commandExecutionWrapper = require('../commandExecutionWrapper');

/** @type {import('.').advice} */
module.exports = async function advice(lang) {
  await this.update({ components: [] });

  this.commandName = this.customId;
  return commandExecutionWrapper.call(this, this.client.slashCommands.get(this.customId), 'component', lang);
};