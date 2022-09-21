module.exports = {
  name: 'sleep',
  aliases: { prefix: [], slash: [] },
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 0 },
  category: 'Fun',
  slashCommand: false,
  prefixCommand: true,

  run: function (lang) { this.customReply(lang('responseList', this.member.displayName)) }
}