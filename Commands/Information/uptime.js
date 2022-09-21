module.exports = {
  name: 'uptime',
  aliases: { prefix: [], slash: [] },
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 100 },
  category: 'Information',
  slashCommand: false,
  prefixCommand: true,

  run: function (lang, { functions }) { this.customReply(lang('message', functions.uptime(true).formatted)) }
}