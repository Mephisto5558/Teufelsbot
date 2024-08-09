const commandExecutionWrapper = require('../commandExecutionWrapper.js');

/** @type {import('.').advice}*/
module.exports = function advice(lang) {
  void this.update({ components: [] });

  return commandExecutionWrapper.call(this, this.client.slashCommands.get('advice'), 'component', lang);
};