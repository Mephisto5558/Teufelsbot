const
  { EmbedBuilder, Colors } = require('discord.js'),
  { checkForErrors, commandExecutionWrapper } = require('../Utils');

/**@this Message*/
module.exports = async function messageCreate() {
  if (this.client.settings.blacklist?.includes(this.user.id)) return;

  if (this.botType != 'dev' && this.guild) {
    if (this.guild.db.config?.autopublish && this.crosspostable) this.crosspost();

    const mentions = [this.mentions.repliedUser?.id, ...this.mentions.users.keys(), ...this.mentions.roles.flatMap(r => r.members).keys()].filter(e => e && e != this.user.id);
    if (mentions.length) this.client.db.update('guildSettings', `${this.guild.id}.lastMentions`, mentions.reduce((acc, e) => ({ ...acc, [e]: { content: this.content, url: this.url, author: this.author, channel: this.channel.id, createdAt: this.createdAt } }), this.guild.db.lastMentions || {}));
  }

  if (this.user.bot) return;
  if (!this.commandName) return this.guild ? this.runMessages() : null;

  const
    command = this.client.prefixCommands.get(this.commandName),
    /**@type {lang}*/
    lang = this.client.i18n.__.bBind(this.client.i18n, { locale: this.guild?.db.config?.lang ?? this.guild?.localeCode, backupPath: 'events.command' }),
    errorKey = await checkForErrors.call(this, command, lang);

  if (errorKey === true) return;
  else if (errorKey) return this.customReply({ embeds: [new EmbedBuilder({ description: lang(...errorKey), color: Colors.Red })] }, 1e4);

  return commandExecutionWrapper.call(this, command, 'prefix', lang);
};
