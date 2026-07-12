import { AllContexts, Command, CommandType } from '@mephisto5558/command';

const responseList = ['D:', ':c', 'qwq', ':C', 'q_q', ':/'];

export default new Command({
  types: [CommandType.Prefix],
  contexts: AllContexts,

  async run() { return this.customReply(responseList.random()); }
});