import { codeBlock } from 'discord.js';
import { AllContexts, Command, CommandType, OptionType } from '@mephisto5558/command';
import { constants: { JSON_SPACES } } from '#utils';

export default new Command({
  types: [CommandType.Prefix],
  usage: { examples: 'database a.b.c\n{prefix}{cmdName} database a.<thisguild>.b.<thischannel>.<thisuser>' },
  contexts: AllContexts,
  options: [
    {
      name: 'database',
      type: OptionType.String,
      required: true
    },
    { name: 'key', type: OptionType.String }
  ],
  beta: true,

  async run(lang) {
    const
      path = this.args[1]
        ?.replaceAll(/<thisguild>/gi, this.guild.id)
        .replaceAll(/<thischannel>/gi, this.channel.id)
        .replaceAll(/<this(?:member|user)>/gi, this.user.id),
      result = this.client.db.get(this.args[0], path);

    return this.customReply(result ? codeBlock('json', JSON.stringify(result, undefined, JSON_SPACES)) : lang('notFound'));
  }
});