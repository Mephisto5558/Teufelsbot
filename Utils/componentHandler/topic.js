/** @import { topic } from '.' */

const { commandExecutionWrapper } = require('@mephisto5558/command');

/** @type {topic} */
module.exports = async function topic(lang) {
  await this.update({ components: [] });
  return commandExecutionWrapper.call(this, this.client.slashCommands.get('topic'), 'component', lang);
};