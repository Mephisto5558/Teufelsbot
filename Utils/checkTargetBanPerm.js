/**@param {import('discord.js').GuildMember}member @returns {string|undefined} error message id to use with I18n*/
module.exports = function checkTarget(member) {
  if (member.id == this.member.id) return 'cantPunishSelf';
  if (!member.bannable) return 'global.noPermBot';
  if (this.guild.ownerId != this.user.id && member.roles?.highest?.position - this.member.roles.highest.position >= 0) return 'global.noPermUser';
};