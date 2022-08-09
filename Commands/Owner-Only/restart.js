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

  run: async (message, { log, functions }) => {
    log(`Restarting bot, initiated by user '${message.author.tag}'...`);
    await functions.reply('Restarting bot...', message);

    process.exit(0);
  }
})