module.exports = {
  name: 'sleep',
  category: 'Fun',
  slashCommand: false,
  prefixCommand: true,
  dmPermission: true,

  run: function (lang) { this.customReply(lang('responseList', this.member.displayName)); }
};