const { commandExecutionWrapper } = require('../Utils');

/** @this {Message}*/
module.exports = function messageCreate() {
  if (this.client.settings.blacklist?.includes(this.user.id)) return;

  if (this.botType != 'dev' && this.inGuild()) {
    if (this.guild.db.config.autopublish && this.crosspostable) this.crosspost();

    const mentions = [this.mentions.repliedUser?.id, ...this.mentions.users.keys(), ...this.mentions.roles.flatMap(e => e.members).keys()].filter(e => e && e != this.user.id);
    if (mentions.length) {
      this.guild.updateDB('lastMentions', mentions.reduce((acc, e) => (
        { ...acc, [e]: { content: this.content, url: this.url, author: this.author, channel: this.channel.id, createdAt: this.createdAt } }
      ), this.guild.db.lastMentions ?? {}));
    }
  }

  if (this.user.bot) return;
  if (!this.commandName) return this.inGuild() ? this.runMessages() : undefined;

  const
    command = this.client.prefixCommands.get(this.commandName),

    /** @type {lang}*/
    lang = this.client.i18n.__.bBind(this.client.i18n, { locale: this.guild?.db.config.lang ?? this.guild?.localeCode, backupPath: 'events.command' });

  return commandExecutionWrapper.call(this, command, 'prefix', lang);
};