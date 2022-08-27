module.exports = {
  name: 'restart',
  aliases: { prefix: [], slash: [] },
  description: 'restarts the bot',
  usage: '',
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 0 },
  category: 'Owner-Only',
  slashCommand: false,
  prefixCommand: true,
  beta: true,

  run: async (message, lang, { log }) => {
    log(`Restarting bot, initiated by user '${message.user.tag}'...`);
    await message.customReply(lang('message'));

    process.exit(0);
  }
}