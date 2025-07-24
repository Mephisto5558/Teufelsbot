/** @type {import('..').commandExecutionWrapper} */
const commandExecutionWrapper = require('../commandExecutionWrapper.js');

/** @type {import('.').reddit} */
module.exports = async function reddit(lang, subreddit, type, filterNSFW) {
  this.options = {
    getBoolean: () => filterNSFW == 'true',

    /** @type {(str: string) => boolean} */
    getString: function (str) { return str == 'type' ? type : subreddit; }
  };

  await this.update({ components: [] });
  return commandExecutionWrapper.call(this, this.client.slashCommands.get('reddit'), 'component', lang);
};