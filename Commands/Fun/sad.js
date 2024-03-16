const responseList = ['D:', ':c', 'qwq', ':C', 'q_q', ':/'];

/** @type {command<'both', false>}*/
module.exports = {
  slashCommand: false,
  prefixCommand: true,
  dmPermission: true,

  run: function () { return this.customReply(responseList.random()); }
};