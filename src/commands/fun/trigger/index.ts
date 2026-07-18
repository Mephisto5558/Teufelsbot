import { Command, CommandOption, CommandType, Permission, PermissionType } from '@mephisto5558/command';

import add from './add.ts';
import clear from './clear.ts';
import delete_ from './delete.ts';
import edit from './edit.ts';
import get from './get.ts';

import type { AutocompleteInteraction } from 'discord.js';
import type { ContextType } from '@mephisto5558/command';


export type triggers = NonNullable<NonNullable<Database['guildSettings'][Snowflake]>['triggers']>;
export type triggersArray = [keyof triggers, NonNullable<triggers[keyof triggers]>];


export const findTriggerId = (query: string, data: triggers): keyof triggers | undefined => query in data
  ? query as keyof triggers
  : Object.entries(data).find(([, { trigger }]) => trigger.toLowerCase() == query.toLowerCase())?.[0];

export function triggerQuery(this: AutocompleteInteraction<'cached'>): string[] {
  return Object.entries(this.guild.db.triggers ?? {}).reduce<[string[], (keyof triggers)[]]>((acc, [k, v]) => {
    acc[0].push(v.trigger);
    acc[1].push(k);

    return acc;
  }, [[], []]).flat();
}

export const triggerSubcommand = CommandOption.create<readonly [CommandType.Slash], readonly [ContextType.Guild], {
  oldData: triggers;
  query: string;
}>();


export default new Command({
  types: [CommandType.Slash],
  permissions: { [PermissionType.User]: [Permission.ManageMessages] },
  options: [
    add,
    edit,
    delete_,
    clear,
    get
  ],

  run() {
    const
      oldData = this.guild.db.triggers ?? [],
      query = this.options.getString('query_or_id')?.toLowerCase();

    return { oldData, query };
  }
});