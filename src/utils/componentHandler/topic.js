/** @import { topic } from './' */

/** @type {topic} */
module.exports = async function topic(lang) {
  await this.update({ components: [] });

  return this.client.commandManager.get(this.customId).runWrapper(this, lang.provider, lang.config.locale);
};