/** @type {command<'slash'>}*/
module.exports = {
  name: 'selfrole',
  permissions: { client: ['ManageMembers'], user: ['ManageGuild'] },
  slashCommand: true,
  prefixCommand: false,
  ephemeralDefer: true,

  run: function (lang) { return this.customReply(lang('deprecated')); }
};