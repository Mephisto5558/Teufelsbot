import type { AutocompleteInteraction } from 'discord.js';

type data = {
  options?: SlashCommand['options'];
  run(
    this: ThisParameterType<SlashCommand['run']>,
    lang: Parameters<SlashCommand['run']>[0],
    options: {
      oldData: triggers;
      query: string;
    },
    ...rest: OmitFirstParameter<SlashCommand['run']>
  ): ReturnType<SlashCommand['run']>;
};
export default data;

export type triggers = NonNullable<NonNullable<Database['guildSettings'][Snowflake]>['triggers']>;
export type triggersArray = [keyof triggers, NonNullable<triggers[keyof triggers]>];

export function findTriggerId(query: string, data: triggers): keyof triggers | undefined;
export function triggerQuery(this: AutocompleteInteraction): string;