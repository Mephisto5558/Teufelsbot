/** @import { fact } from '.' */

/** @type {fact} */
module.exports = async function fact(lang) {
  await this.update({ components: [] });
  return this.client.commandManager.get(this.customId).runWrapper(this, lang.provider, lang.config.locale);
};