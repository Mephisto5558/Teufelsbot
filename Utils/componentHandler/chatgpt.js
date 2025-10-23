/** @import { chatgpt } from '.' */

const fetchAPI = require('./chatgpt_fetchAPI');

/** @type {chatgpt} */
module.exports = async function chatgpt(lang, userId, _, model) {
  lang.config.backupPaths[0] = 'commands.premium.chatgpt';

  if (this.user.id != userId) return;

  await this.deferUpdate();
  const [newContent] = await fetchAPI.call(this, lang, model);

  return this.message.edit(newContent);
};