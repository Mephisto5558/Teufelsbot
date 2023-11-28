const responseList = ['D:', ':c', 'qwq', ':C', 'q_q', ':/'];

/**@type {command}*/
module.exports = {
  name: 'sad',
  slashCommand: false,
  prefixCommand: true,
  dmPermission: true,

  run: function () { return this.customReply(responseList.random()); }
};