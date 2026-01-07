/** @import { fact } from '.' */

const { commandExecutionWrapper } = require('@mephisto5558/command');

/** @type {fact} */
module.exports = async function fact(lang) {
  await this.update({ components: [] });
  return commandExecutionWrapper.call(this, this.client.slashCommands.get('fact'), 'component', lang);
};