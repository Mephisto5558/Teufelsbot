import { inlineCode } from 'discord.js';
import { OptionType } from '@mephisto5558/command';
import { findTriggerId, triggerQuery, triggerSubcommand } from './index.ts';

import type { triggersArray } from './index.ts';


export default triggerSubcommand({
  name: 'edit',
  type: OptionType.Subcommand,
  options: [
    {
      name: 'query_or_id',
      type: OptionType.String,
      autocompleteOptions: triggerQuery,
      required: true
    },
    { name: 'trigger', type: OptionType.String },
    { name: 'response', type: OptionType.String },
    { name: 'wildcard', type: OptionType.Boolean }
  ],

  async run(lang, { oldData, query }) {
    if (!oldData.__count__) return this.editReply(lang('noneFound'));

    const
      id = findTriggerId(query, oldData),
      /* eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- false positive */
      { trigger, response, wildcard } = (query && id ? oldData[id] : {}) as triggersArray[1] | Record<keyof triggersArray[1], undefined>;

    if (!id || !trigger) return this.editReply(lang('notFound'));

    const data = {
      trigger: this.options.getString('trigger') ?? trigger,
      response: this.options.getString('response')?.replaceAll('/n', '\n') ?? response,
      wildcard: this.options.getBoolean('wildcard') ?? wildcard
    };

    await this.guild.updateDB(`triggers.${id}`, data);
    return this.editReply(lang('edited', inlineCode(data.trigger)));
  }
});