import type { AutocompleteInteraction } from 'discord.js';
import type { CommandOption } from '@mephisto5558/command';

type TriggerSubcommand = CommandOption<['slash'], boolean, {
  oldData: triggers;
  query: string;
}>;
export default TriggerSubcommand;

export type triggers = NonNullable<NonNullable<Database['guildSettings'][Snowflake]>['triggers']>;
export type triggersArray = [keyof triggers, NonNullable<triggers[keyof triggers]>];

export function findTriggerId(query: string, data: triggers): keyof triggers | undefined;
export function triggerQuery(this: AutocompleteInteraction): string;