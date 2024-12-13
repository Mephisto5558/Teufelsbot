/** @type {import('..').commandExecutionWrapper} */
const commandExecutionWrapper = require('../commandExecutionWrapper.js');

/** @type {import('.').topic} */
module.exports = async function topic(lang) {
  await this.update({ components: [] });
  return commandExecutionWrapper.call(this, this.client.slashCommands.get('topic'), 'component', lang);
};