/**@type {command}*/
module.exports = {
  name: 'selfrole',
  permissions: { client: ['ManageMembers'], user: ['ManageGuild'] },
  slashCommand: true,
  prefixCommand: false,
  ephemeralDefer: true,

  /**@this GuildInteraction*/
  run: function (lang) { return this.customReply(lang('deprecated')); }
};