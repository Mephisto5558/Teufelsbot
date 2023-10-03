const
  { EmbedBuilder, Colors, } = require('discord.js'),
  { I18nProvider, errorHandler, checkForErrors } = require('../Utils');

/**@this {import('discord.js').Message}*/
module.exports = async function messageCreate() {
  if (this.crosspostable && this.guild.db?.config?.autopublish) this.crosspost();
  if (this.botType != 'dev' && this.guild) {
    const mentions = [this.mentions.repliedUser?.id, ...this.mentions.users.keys(), ...this.mentions.roles.flatMap(r => r.members).keys()].filter(e => e && e != this.user.id);
    if (mentions.length) await this.client.db.update('guildSettings', `${this.guild.id}.lastMentions`, mentions.reduce((acc, e) => ({ ...acc, [e]: { content: this.content, url: this.url, author: this.author, channel: this.channel.id, createdAt: this.createdAt } }), this.guild.db.lastMentions || {}));
  }

  if (this.user.bot) return;
  if (!this.commandName) return this.guild ? this.runMessages() : null;

  const
    command = this.client.prefixCommands.get(this.commandName),
    lang = I18nProvider.__.bBind(I18nProvider, { locale: this.guild?.db.config.lang ?? this.guild?.localeCode, backupPath: 'events.command' }),
    errorKey = await checkForErrors.call(this, command, lang);
    
  if (errorKey === true) return;
  else if (errorKey) return this.customReply({ embeds: [new EmbedBuilder({ description: lang(...errorKey), color: Colors.Red })] }, 1e4);

  const cmdLang = I18nProvider.__.bBind(I18nProvider, { locale: this.guild?.db.config.lang ?? this.guild?.localeCode, backupPath: command ? `commands.${command.category.toLowerCase()}.${command.aliasOf ?? command.name}` : null });
  
  try {
    command.run.call(this, cmdLang)?.catch(err => errorHandler.call(this.client, err, this, lang));
    if (this.client.botType != 'dev') await this.client.db.update('botSettings', `stats.${command.name}`, this.client.settings.stats?.[command.name] + 1 || 1);
  } catch (err) { errorHandler.call(this.client, err, this, lang); }
};