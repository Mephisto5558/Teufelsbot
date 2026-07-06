import type { ComponentReturnType, GuildButtonInteraction } from './index.ts';

export default async function advice(
  this: GuildButtonInteraction<'advice'>,
  lang: lang
): ComponentReturnType {
  await this.update({ components: [] });
  return this.client.commandManager.get(this.customId)?.runWrapper(this, lang.provider, lang.config.locale);
}