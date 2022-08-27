module.exports = {
  name: 'uptime',
  aliases: { prefix: [], slash: [] },
  description: "shows the bot's uptime",
  usage: '',
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 100 },
  category: 'Information',
  slashCommand: false,
  prefixCommand: true,

  run: async (message, lang, { functions }) => message.customReply(lang('message', functions.uptime(true).formatted))
}