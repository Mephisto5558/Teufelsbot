module.exports = function checkTarget(member, lang) {
  if (member.id == this.member.id) return lang('cantPunishSelf');
  if (member.roles?.highest.comparePositionTo(this.member.roles.highest) > -1 && this.guild.ownerId != this.user.id) return lang('global.noPermUser');
  if (!member.bannable) return lang('global.noPermBot');
};