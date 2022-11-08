module.exports = {
  name: 'sleep',
  slashCommand: false,
  prefixCommand: true,
  dmPermission: true,

  run: function (lang) { this.customReply(lang('responseList', this.member.displayName)); }
};