import { inlineCode } from 'discord.js';
import { OptionType } from '@mephisto5558/command';
import { triggerSubcommand } from './index.ts';


export default triggerSubcommand({
  name: 'clear',
  type: OptionType.Subcommand,
  options: [{
    name: 'confirmation',
    type: OptionType.String,
    required: true
  }],

  async run(lang, { oldData }) {
    if (this.options.getString('confirmation', true).toLowerCase() != lang('confirmation')) return this.editReply(lang('needConfirm'));
    if (!oldData.__count__) return this.editReply(lang('noneFound'));

    await this.guild.deleteDB('triggers');
    return this.editReply(lang('deletedAll', inlineCode(oldData.__count__.toString())));
  }
});