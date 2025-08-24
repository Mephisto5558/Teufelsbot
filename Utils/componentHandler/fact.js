/** @type {import('..').commandExecutionWrapper} */
const commandExecutionWrapper = require('../commandExecutionWrapper');

/** @type {import('.').fact} */
module.exports = async function fact(lang) {
  await this.update({ components: [] });
  return commandExecutionWrapper.call(this, this.client.slashCommands.get('fact'), 'component', lang);
};