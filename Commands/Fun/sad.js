const
  { Command, commandTypes } = require('@mephisto5558/command'),

  responseList = ['D:', ':c', 'qwq', ':C', 'q_q', ':/'];

module.exports = new Command({
  types: [commandTypes.prefix],
  dmPermission: true,

  async run() { return this.customReply(responseList.random()); }
});