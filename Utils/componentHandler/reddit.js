const commandExecutionWrapper = require('../commandExecutionWrapper.js');

/** this.customId: `reddit.<subreddit>.<type>.<filterNSFW>`
 * @this import('discord.js').ButtonInteraction @param {lang}lang @param {string}subreddit @param {string}type @param {'true'|'false'}filterNSFW*/
module.exports = function reddit(lang, subreddit, type, filterNSFW) {
  lang.__boundArgs__[0].backupPath = 'commands.fun.reddit';

  this.options = {
    getBoolean: () => filterNSFW == 'true',
    getString: str => str == 'type' ? type : subreddit
  };

  this.update({ components: [] });

  return commandExecutionWrapper.call(this, this.client.slashCommands.get('reddit'), 'component', lang);
};