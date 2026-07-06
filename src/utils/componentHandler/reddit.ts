import type { ButtonInteraction, ComponentReturnType } from './index.ts';

export default async function reddit<
  SUBREDDIT extends string, TYPE extends string, FILTER_NSFW extends `${boolean}`
>(
  this: ButtonInteraction<`reddit.${SUBREDDIT}.${TYPE}.${FILTER_NSFW}`>,
  lang: lang, subreddit: SUBREDDIT, type: TYPE, filterNSFW: FILTER_NSFW
): ComponentReturnType {
  this.options = {
    getBoolean: (): boolean => filterNSFW == 'true',
    getString: (str: string): string => (str == 'type' ? type : subreddit)
  };

  await this.update({ components: [] });
  return this.client.commandManager.get('reddit')?.runWrapper(this, lang.provider, lang.config.locale);
}