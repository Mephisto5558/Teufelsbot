/** @import { topic } from '.' */

const commandExecutionWrapper = require('../commandExecutionWrapper');

/** @type {topic} */
module.exports = async function topic(lang) {
  await this.update({ components: [] });
  return commandExecutionWrapper.call(this, this.client.slashCommands.get('topic'), 'component', lang);
};