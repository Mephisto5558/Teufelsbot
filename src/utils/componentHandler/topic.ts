import type { ButtonInteraction, ComponentReturnType } from './index.ts';

export default async function topic(
  this: ButtonInteraction<'topic'>,
  lang: lang
): ComponentReturnType {
  await this.update({ components: [] });

  return this.client.commandManager.get(this.customId)?.runWrapper(this, lang.provider, lang.config.locale);
}