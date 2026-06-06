/** @import { advice } from '.' */

/** @type {advice} */
module.exports = async function advice(lang) {
  await this.update({ components: [] });
  return this.client.commandManager.get(this.customId).runWrapper(this, lang.provider, lang.config.locale);
};