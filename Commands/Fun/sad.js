const responseList = ['D:', ':c', 'qwq', ':C', 'q_q', ':/'];

module.exports = {
  name: 'sad',
  category: 'Fun',
  slashCommand: false,
  prefixCommand: true,
  dmPermission: true,

  run: function () { this.customReply(responseList.random()); }
};