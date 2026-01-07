/** @import { advice } from '.' */

const { commandExecutionWrapper } = require('@mephisto5558/command');

/** @type {advice} */
module.exports = async function advice(lang) {
  await this.update({ components: [] });
  return commandExecutionWrapper.call(this, this.client.slashCommands.get(this.customId), 'component', lang);
};