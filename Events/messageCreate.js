const
  { EmbedBuilder, Colors, ChannelType, PermissionFlagsBits } = require('discord.js'),
  { I18nProvider, cooldowns, permissionTranslator, errorHandler, getOwnerOnlyFolders } = require('../Utils'),
  { replyOnDisabledCommand, replyOnNonBetaCommand } = require('../config.json'),
  ownerOnlyFolders = getOwnerOnlyFolders();

let prefixLength;

/**@this {import('discord.js').Message}*/
module.exports = async function messageCreate() {
  if (this.client.settings.blacklist?.includes(this.user.id)) return;
  if (this.crosspostable && this.guild.db?.config?.autopublish) this.crosspost();
  if (this.guild) {
    const mentions = [this.mentions.repliedUser?.id, ...this.mentions.users.keys(), ...this.mentions.roles.flatMap(r => r.members.keys())].filter(e => e && e != this.user.id);
    if (mentions.length) this.client.db.update('guildSettings', `${this.guild.id}.lastMentions`, mentions.reduce((acc, e) => ({ ...acc, [e]: { content: this.content, url: this.url, author: this.author, channel: this.channel.id, createdAt: this.createdAt } }), this.guild.db.lastMentions || {}));
  }

  if (this.user.bot) return;

  const
    { config = {}, economy = {} } = this.guild?.db ?? {},
    locale = config.lang ?? this.guild?.localeCode,
    { caseinsensitive } = config[this.client.botType == 'dev' ? 'betaBotPrefix' : 'prefix'] ?? {};

  let guildPrefix = this.client.botType == 'dev' ? config.betaBotPrefix?.prefix || this.client.defaultSettings.config.betaBotPrefix : config.prefix?.prefix || this.client.defaultSettings.config.prefix;
  if (caseinsensitive) guildPrefix = guildPrefix.toLowerCase();

  if ((caseinsensitive ? this.content.toLowerCase() : this.content).startsWith(guildPrefix)) prefixLength = guildPrefix.length;
  else if (this.content.startsWith(`<@${this.client.user.id}>`)) prefixLength = this.client.user.id.length + 3;
  else {
    if (!this.guild) return;
    this.runMessages();
    return this.runEco();
  }

  this.args = this.content.replaceAll('<@!', '<@').slice(prefixLength).trim().split(' ');
  this.commandName = this.args.shift().toLowerCase();
  this.content = this.args.join(' ');

  const command = this.client.prefixCommands.get(this.commandName);

  if (command) {
    if (command.disabled) return replyOnDisabledCommand === false ? void 0 : this.reply(I18nProvider.__({ locale }, 'events.commandDisabled'));
    if (ownerOnlyFolders.includes(command.category.toLowerCase()) && this.user.id != this.client.application.owner.id) return this.runMessages(); //DO NOT REMOVE THIS LINE!
    if (!command.dmPermission && this.channel.type == ChannelType.DM) return this.reply(I18nProvider.__({ locale }, 'events.guildCommandOnly'));
    if (this.client.botType == 'dev' && !command.beta) return replyOnNonBetaCommand === false ? void 0 : this.reply(I18nProvider.__({ locale }, 'events.nonBetaCommand'));
  }
  else if (this.client.slashCommands.get(this.commandName)) return this.reply(I18nProvider.__({ locale }, 'events.slashCommandOnly'));

  const lang = I18nProvider.__.bBind(I18nProvider, { locale, backupPath: `commands.${command.category.toLowerCase()}.${command.name}` });
  const disabledList = this.guild?.db.commandSettings?.[command.aliasOf || command.name]?.disabled || {};

  if (disabledList.members && disabledList.members.includes(this.user.id)) return this.customReply(lang('events.notAllowed.member'), 1e4);
  if (disabledList.channels && disabledList.channels.includes(this.channel.id)) return this.customReply(lang('events.notAllowed.channel'), 1e4);
  if (disabledList.roles && this.member.roles?.cache.some(e => disabledList.roles.includes(e.id))) return this.customReply(lang('events.notAllowed.role'), 1e4);

  const cooldown = cooldowns.call(this, command);

  if (cooldown && !this.client.botType == 'dev') return this.customReply(lang('events.cooldown', cooldown), 1e4);
  if (command.requireEconomy && (!economy?.enable || !economy[this.user.id]?.gaining?.chat))
    return this.customReply(!economy?.enable ? lang('events.economyDisabled') : lang('events.economyNotInitialized'), 3e4);

  if (this.guild) {
    const userPermsMissing = this.member.permissionsIn(this.channel).missing([...(command.permissions?.user || []), PermissionFlagsBits.SendMessages]);
    const botPermsMissing = this.guild.members.me.permissionsIn(this.channel).missing([...(command.permissions?.client || []), PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks]);

    if (botPermsMissing.length || userPermsMissing.length) {
      const embed = new EmbedBuilder({
        title: lang('events.permissionDenied.embedTitle'),
        color: Colors.Red,
        description: lang(`events.permissionDenied.embedDescription${userPermsMissing.length ? 'User' : 'Bot'}`, { permissions: permissionTranslator(botPermsMissing.length ? botPermsMissing : userPermsMissing).join('`, `') })
      });

      if (botPermsMissing.includes('SendMessages')) return this.user.send({ content: `${this.channel.name} in ${this.guild.name}`, embeds: [embed] });
      return this.reply({ embeds: [embed] });
    }
  }

  try {
    command.run.call(this, lang)?.catch(err => errorHandler.call(this.client, err, this, lang));
    if (this.client.botType != 'dev') this.client.db.update('botSettings', `stats.${command.name}`, this.client.settings.stats?.[command.name] + 1 || 1);
  } catch (err) { errorHandler.call(this.client, err, this, lang); }
};