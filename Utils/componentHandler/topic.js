const commandExecutionWrapper = require('../commandExecutionWrapper.js');

/** this.customId: `topic`
 * @this import('discord.js').ButtonInteraction @param {lang}lang*/
module.exports = function topic(lang) {
  lang.__boundArgs__[0].backupPath = 'commands.fun.topic';

  this.update({ components: [] });

  return commandExecutionWrapper.call(this, this.client.slashCommands.get('topic'), 'component', lang);
};