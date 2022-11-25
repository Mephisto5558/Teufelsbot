module.exports = {
  name: 'restart',
  slashCommand: false,
  prefixCommand: true,
  dmPermission: true,
  beta: true,

  run: async function (lang) {
    this.client.log(`Restarting bot, initiated by user '${this.user.tag}'...`);
    await this.customReply(lang('message'));

    process.exit(0);
  }
};