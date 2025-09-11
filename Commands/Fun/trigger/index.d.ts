import type { AutocompleteInteraction } from 'discord.js';

type fn = NonNullable<command<'slash'>['run']>;

type data = {
  options?: commandOptions<false>[];
  run(
    this: ThisParameterType<fn>,
    lang: Parameters<fn>[0],
    options: {
      oldData: triggers;
      query: string;
    },
    ...rest: OmitFirstParameters<fn>
  ): ReturnType<fn>;
};
export default data;

export type triggers = NonNullable<NonNullable<Database['guildSettings'][Snowflake]>['triggers']>;
export type triggersArray = [keyof triggers, NonNullable<triggers[keyof triggers]>];

export function findTriggerId(query: string, data: triggers): keyof triggers | undefined;
export function triggerQuery(this: AutocompleteInteraction): string;