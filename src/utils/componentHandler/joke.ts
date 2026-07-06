import type { ButtonInteraction, ComponentReturnType } from './index.ts';

export default async function joke<
  API extends string, TYPE extends string, BLACKLIST extends string, MAX_LENGTH extends `${number | null}`
>(
  this: ButtonInteraction<`joke.${API}.${TYPE}.${BLACKLIST}.${MAX_LENGTH}`>,
  lang: lang, api: API, type: TYPE, blacklist: BLACKLIST, maxLength: MAX_LENGTH
): ComponentReturnType {
  this.options = {
    /* eslint-disable unicorn/no-null -- Mimicing discord.js behavior */
    getString: (str: string): string | null => {
      switch (str) {
        case 'api': return api == 'null' ? null : api;
        case 'type': return type == 'null' ? null : type;
        case 'blacklist': return blacklist == 'null' ? null : blacklist;
        default: return null;
      }
    },
    getInteger: (): number | null => maxLength == 'null' ? null : parseInt(maxLength, 10)
    /* eslint-enable unicorn/no-null */
  };

  await this.update({ components: [] });
  return this.client.commandManager.get('joke')?.runWrapper(this, lang.provider, lang.config.locale);
}