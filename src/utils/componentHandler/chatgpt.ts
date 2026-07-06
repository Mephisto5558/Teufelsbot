import fetchAPI from './chatgpt_fetchAPI.ts';

import type { ButtonInteraction, ComponentReturnType } from './index.ts';

export default async function chatgpt<
  USER_ID extends Snowflake,
  COMMAND extends 'regenerate',
  MODEL extends string
>(
  this: ButtonInteraction<`chatgpt.${USER_ID}.${COMMAND}.${MODEL}`>,
  lang: lang, userId: USER_ID, _command: COMMAND, model: MODEL
): ComponentReturnType {
  lang.config.backupPaths[0] = 'commands.premium.chatgpt';

  if (this.user.id != userId) return;

  await this.deferUpdate();
  const [newContent] = await fetchAPI.call(this, lang, model);

  return this.message.edit(newContent);
}