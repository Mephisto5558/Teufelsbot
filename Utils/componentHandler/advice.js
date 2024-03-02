const commandExecutionWrapper = require('../commandExecutionWrapper.js');

/**
 * this.customId: `fact`
 * @this {import('discord.js').ButtonInteraction}
 * @param {lang}lang*/
module.exports = function fact(lang) {
  this.update({ components: [] });

  return commandExecutionWrapper.call(this, this.client.slashCommands.get('advice'), 'component', lang);
};