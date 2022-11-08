module.exports = {
  name: 'restart',
  category: 'Owner-Only',
  slashCommand: false,
  prefixCommand: true,
  dmPermission: true,
  beta: true,

  run: async function (lang, { log }) {
    log(`Restarting bot, initiated by user '${this.user.tag}'...`);
    await this.customReply(lang('message'));

    process.exit(0);
  }
};