/** @import { topic } from '.' */

/** @type {topic} */
module.exports = async function topic(lang) {
  await this.update({ components: [] });
  // return commandExecutionWrapper.call(this, this.client.slashCommands.get('topic'), 'component', lang);
  return this.client.commandManager.get(this.customId).runWrapper(this, lang.provider, lang.config.locale);
};