const responseList = ['D:', ':c', 'qwq', ':C', 'q_q', ':/'];

module.exports = {
  name: 'sad',
  slashCommand: false,
  prefixCommand: true,
  dmPermission: true,

  /**@this Interaction|Message @param {lang}lang*/
  run: function () { return this.customReply(responseList.random()); }
};