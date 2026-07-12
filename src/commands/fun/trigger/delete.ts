import type TriggerSubcommand from './';

import { inlineCode } from 'discord.js';
import { CommandOption, OptionType } from '@mephisto5558/command';
import { findTriggerId, triggerQuery } from './_utils';


/** @type {TriggerSubcommand} */
export default new CommandOption({
  name: 'delete',
  type: OptionType.Subcommand,
  options: [{
    name: 'query_or_id',
    type: OptionType.String,
    autocompleteOptions: triggerQuery
  }],

  async run(lang, { oldData, query }) {
    const id = query ? Number(findTriggerId(query, oldData) ?? -1) : Math.max(...Object.keys(oldData).map(Number));
    if (id < 0) return this.editReply(lang('noneFound'));

    await this.guild.deleteDB(`triggers.${id}`);
    return this.editReply(lang('deletedOne', inlineCode(id)));
  }
});