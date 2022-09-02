module.exports = {
  name: 'sleep',
  aliases: { prefix: [], slash: [] },
  description: 'sends a sleep messsage',
  usage: '',
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 0 },
  category: 'Fun',
  slashCommand: false,
  prefixCommand: true,

  run: (message, lang) => message.customReply(lang('responseList', message.member.displayName))
}