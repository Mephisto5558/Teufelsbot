module.exports = {
  name: 'restart',
  slashCommand: false,
  prefixCommand: true,
  dmPermission: true,
  beta: true,

  run: async function (lang) {
    this.client
      .log(`Restarting bot, initiated by user '${this.user.tag}'...`)
      .db.update('botSettings', 'restartingMsg', { guild: this.guild.id, channel: this.channel.id, message: (await this.customReply(lang('message'))).id });

    await sleep(1000);
    process.exit(0);
  }
};