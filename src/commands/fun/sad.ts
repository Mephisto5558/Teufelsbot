const { AllContexts, Command, CommandType } = require('@mephisto5558/command');

const responseList = ['D:', ':c', 'qwq', ':C', 'q_q', ':/'];

module.exports = new Command({
  types: [CommandType.Prefix],
  contexts: AllContexts,

  async run() { return this.customReply(responseList.random()); }
});