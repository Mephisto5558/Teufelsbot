const { Command, CommandType, DMPermType } = require('@mephisto5558/command');

const responseList = ['D:', ':c', 'qwq', ':C', 'q_q', ':/'];

module.exports = new Command({
  types: [CommandType.Prefix],
  dmPermission: DMPermType.CanBeDM,

  async run() { return this.customReply(responseList.random()); }
});