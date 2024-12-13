/** @type {import('.').checkTargetManageable} */
module.exports = function checkTargetManageable(member) {
  if (member.id == this.member.id) return 'cantPunishSelf';
  if (!member.manageable) return 'global.noPermBot';
  if (this.guild.ownerId != this.user.id && member.roles.highest.position >= this.member.roles.highest.position) return 'global.noPermUser';
};