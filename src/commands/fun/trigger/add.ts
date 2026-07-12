import type TriggerSubcommand from './';

import { inlineCode } from 'discord.js';
import { CommandOption, OptionType } from '@mephisto5558/command';


/** @type {TriggerSubcommand} */
export default new CommandOption({
  name: 'add',
  type: OptionType.Subcommand,
  options: [
    {
      name: 'trigger',
      type: OptionType.String,
      required: true
    },
    {
      name: 'response',
      type: OptionType.String,
      required: true
    },
    { name: 'wildcard', type: OptionType.Boolean }
  ],

  async run(lang, oldData) {
    const
      id = Math.max(...Object.keys(oldData).map(Number), 0) || 0 + 1,
      data = {
        trigger: this.options.getString('trigger', true),
        response: this.options.getString('response', true).replaceAll('/n', '\n'),
        wildcard: this.options.getBoolean('wildcard') ?? true
      };

    await this.guild.updateDB(`triggers.${id}`, data);
    return this.editReply(lang('saved', inlineCode(data.trigger)));
  }
});