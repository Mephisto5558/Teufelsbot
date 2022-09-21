module.exports = {
  name: 'restart',
  aliases: { prefix: [], slash: [] },
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 0 },
  category: 'Owner-Only',
  slashCommand: false,
  prefixCommand: true,
  beta: true,

  run: async function (lang, { log }) {
    log(`Restarting bot, initiated by user '${this.user.tag}'...`);
    await this.customReply(lang('message'));

    process.exit(0);
  }
}