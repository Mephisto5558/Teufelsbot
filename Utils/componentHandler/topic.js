/** @type {import('..').commandExecutionWrapper}*/
const commandExecutionWrapper = require('../commandExecutionWrapper.js');

/** @type {import('.').topic}*/
module.exports = function topic(lang) {
  void this.update({ components: [] });

  return commandExecutionWrapper.call(this, this.client.slashCommands.get('topic'), 'component', lang);
};