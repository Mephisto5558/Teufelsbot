import { randomInt } from 'node:crypto';
import { AllContexts, Command, CommandType } from '@mephisto5558/command';

const SIDE_CHANCE = 3000; // 1 in 3000

export default new Command({
  types: [CommandType.Slash, CommandType.Prefix],
  contexts: AllContexts,

  async run(lang) { return this.customReply(lang(randomInt(SIDE_CHANCE) == 0 ? 'side' : 'response')); }
});