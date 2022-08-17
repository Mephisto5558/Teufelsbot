const { Command } = require('reconlx');

module.exports = new Command({
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

  run: async (message, lang, { log, functions }) => {
    log(`Restarting bot, initiated by user '${message.user.tag}'...`);
    await functions.reply(lang('message'), message);

    process.exit(0);
  }
})