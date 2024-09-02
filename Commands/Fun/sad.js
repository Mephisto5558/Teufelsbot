const responseList = ['D:', ':c', 'qwq', ':C', 'q_q', ':/'];

module.exports = new MixedCommand({
  dmPermission: true,

  run: async function () { return this.customReply(responseList.random()); }
});