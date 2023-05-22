/**@param {import('discord.js').GuildMember}member @returns {string|undefined} error message id to use with I18n*/
module.exports = function checkTarget(member) {
  if (member.id == this.member.id) return 'cantPunishSelf';
  if (member.roles?.highest.comparePositionTo(this.member.roles.highest) > -1 && this.guild.ownerId != this.user.id) return 'global.noPermUser';
  if (!member.bannable) return 'global.noPermBot';
};