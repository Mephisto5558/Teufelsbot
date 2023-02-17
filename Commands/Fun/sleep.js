module.exports = {
  name: 'sleep',
  slashCommand: false,
  prefixCommand: true,
  dmPermission: true,

  run: function (lang) { return this.customReply(lang('responseList', this.member.customName)); }
};