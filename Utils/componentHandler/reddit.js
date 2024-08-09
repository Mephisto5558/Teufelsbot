/** @type {import('..').commandExecutionWrapper}*/
const commandExecutionWrapper = require('../commandExecutionWrapper.js');

/** @type {import('.').reddit}*/
module.exports = function reddit(lang, subreddit, type, filterNSFW) {
  this.options = {
    getBoolean: () => filterNSFW == 'true',
    getString: str => str == 'type' ? type : subreddit
  };

  void this.update({ components: [] });

  return commandExecutionWrapper.call(this, this.client.slashCommands.get('reddit'), 'component', lang);
};