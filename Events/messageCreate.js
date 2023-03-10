const
  { EmbedBuilder, Colors, ChannelType, PermissionFlagsBits } = require('discord.js'),
  { I18nProvider, cooldowns, permissionTranslator, errorHandler, getOwnerOnlyFolders } = require('../Utils'),
  { replyOnDisabledCommand, replyOnNonBetaCommand } = require('../config.json'),
  ownerOnlyFolders = getOwnerOnlyFolders(),
  errorEmbed = new EmbedBuilder({ color: Colors.Red });

/**@this {import('discord.js').Message}*/
module.exports = async function messageCreate() {
  if (this.client.settings.blacklist?.includes(this.user.id)) return;
  if (this.crosspostable && this.guild.db?.config?.autopublish) this.crosspost();
  if (this.guild) {
    const mentions = [this.mentions.repliedUser?.id, ...this.mentions.users.keys(), ...this.mentions.roles.flatMap(r => r.members.keys())].filter(e => e && e != this.user.id);
    if (mentions.length) this.client.db.update('guildSettings', `${this.guild.id}.lastMentions`, mentions.reduce((acc, e) => ({ ...acc, [e]: { content: this.content, url: this.url, author: this.author, channel: this.channel.id, createdAt: this.createdAt } }), this.guild.db.lastMentions || {}));
  }

  if (this.user.bot) return;
  if (!this.commandName) return this.guild ? this.runMessages().runEco() : null;

  const
    { config = {}, economy = {}, commandSettings = {} } = this.guild?.db ?? {},
    command = this.client.prefixCommands.get(this.commandName),
    lang = I18nProvider.__.bBind(I18nProvider, { locale: config.lang ?? this.guild?.localeCode, backupPath: command ? `commands.${command.category.toLowerCase()}.${command.name}` : null });

  if (command) {
    if (command.disabled) return replyOnDisabledCommand === false ? void 0 : this.customReply({ embeds: [errorEmbed.setDescription(lang('events.commandDisabled'))] }, 1e4);
    if (ownerOnlyFolders.includes(command.category.toLowerCase()) && this.user.id != this.client.application.owner.id) return this.runMessages(); //DO NOT REMOVE THIS LINE!
    if (!command.dmPermission && this.channel.type == ChannelType.DM) return this.customReply({ embeds: [errorEmbed.setDescription(lang('events.guildCommandOnly'))] }, 1e4);
    if (this.client.botType == 'dev' && !command.beta) return replyOnNonBetaCommand === false ? void 0 : this.customReply({ embeds: [errorEmbed.setDescription(lang('events.nonBetaCommand'))] }, 1e4);
  }
  else return this.client.slashCommands.get(this.commandName) ? this.customReply({ embeds: [errorEmbed.setDescription(lang('events.slashCommandOnly'))] }, 1e4) : this.runMessages();

  const disabledList = commandSettings[command.aliasOf || command.name]?.disabled || {};
  if (disabledList.members && disabledList.members.includes(this.user.id)) return this.customReply({ embeds: [errorEmbed.setDescription(lang('events.notAllowed.member'))] }, 1e4);
  if (disabledList.channels && disabledList.channels.includes(this.channel.id)) return this.customReply({ embeds: [errorEmbed.setDescription(lang('events.notAllowed.channel'))] }, 1e4);
  if (disabledList.roles && this.member.roles?.cache.some(e => disabledList.roles.includes(e.id))) return this.customReply({ embeds: [errorEmbed.setDescription(lang('events.notAllowed.role'))] }, 1e4);

  const cooldown = cooldowns.call(this, command);
  if (cooldown && !this.client.botType == 'dev') return this.customReply({ embeds: [errorEmbed.setDescription(lang('events.cooldown', cooldown))] }, 1e4);
  if (command.requireEconomy && (!economy?.enable || !economy[this.user.id]?.gaining?.chat))
    return this.customReply({ embeds: [errorEmbed.setDescription(lang(economy?.enable ? 'events.economyNotInitialized' : 'events.economyDisabled'), 3e4)] });

  if (this.guild) {
    const userPermsMissing = this.member.permissionsIn(this.channel).missing([...(command.permissions?.user || []), PermissionFlagsBits.SendMessages]);
    const botPermsMissing = this.guild.members.me.permissionsIn(this.channel).missing([...(command.permissions?.client || []), PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks]);

    if (botPermsMissing.length || userPermsMissing.length) {
      errorEmbed.data.title = lang('events.permissionDenied.embedTitle');
      errorEmbed.data.description = lang(`events.permissionDenied.embedDescription${userPermsMissing.length ? 'User' : 'Bot'}`, { permissions: permissionTranslator(botPermsMissing.length ? botPermsMissing : userPermsMissing).join('`, `') });

      if (botPermsMissing.includes('SendMessages')) return this.user.send({ content: `${this.guild.name}: ${this.channel.name}`, embeds: [errorEmbed] });
      return this.reply({ embeds: [errorEmbed.setTitle()] });
    }
  }

  try {
    command.run.call(this, lang)?.catch(err => errorHandler.call(this.client, err, this, lang));
    if (this.client.botType != 'dev') this.client.db.update('botSettings', `stats.${command.name}`, this.client.settings.stats?.[command.name] + 1 || 1);
  } catch (err) { errorHandler.call(this.client, err, this, lang); }
};