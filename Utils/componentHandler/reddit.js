/** @import { reddit } from '.' */

/** @type {reddit} */
module.exports = async function reddit(lang, subreddit, type, filterNSFW) {
  this.options = {
    getBoolean: () => filterNSFW == 'true',

    /** @type {(str: string) => boolean} */
    getString: function (str) { return str == 'type' ? type : subreddit; }
  };

  await this.update({ components: [] });

  // Todo: mark this as component command invocation
  return this.client.commandManager.get('reddit').runWrapper(this, lang.provider, lang.config.locale);
};