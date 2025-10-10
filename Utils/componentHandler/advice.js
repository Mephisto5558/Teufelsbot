/** @import { advice } from '.' */

const commandExecutionWrapper = require('../commandExecutionWrapper');

/** @type {advice} */
module.exports = async function advice(lang) {
  await this.update({ components: [] });
  return commandExecutionWrapper.call(this, this.client.slashCommands.get(this.customId), 'component', lang);
};