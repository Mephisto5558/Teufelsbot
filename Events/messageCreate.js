const
  { EmbedBuilder, Colors, ChannelType, PermissionFlagsBits } = require('discord.js'),
  { I18nProvider, cooldowns, permissionTranslator, errorHandler, getOwnerOnlyFolders, autocompleteGenerator } = require('../Utils'),
  { replyOnDisabledCommand, replyOnNonBetaCommand } = require('../config.json'),
  ownerOnlyFolders = getOwnerOnlyFolders(),
  errorEmbed = new EmbedBuilder({ color: Colors.Red });

/**@this {import('discord.js').Message}*/
module.exports = async function messageCreate() {
  if (this.client.settings.blacklist?.includes(this.user.id)) return;
  if (this.crosspostable && this.guild.db?.config?.autopublish) this.crosspost();
  if (this.botType != 'dev' && this.guild) {
    const mentions = [this.mentions.repliedUser?.id, ...this.mentions.users.keys(), ...this.mentions.roles.flatMap(r => r.members).keys()].filter(e => e && e != this.user.id);
    if (mentions.length) await this.client.db.update('guildSettings', `${this.guild.id}.lastMentions`, mentions.reduce((acc, e) => ({ ...acc, [e]: { content: this.content, url: this.url, author: this.author, channel: this.channel.id, createdAt: this.createdAt } }), this.guild.db.lastMentions || {}));
  }

  if (this.user.bot) return;
  if (!this.commandName) return this.guild ? this.runMessages() : null;

  const
    { config = {}, commandSettings = {} } = this.guild?.db ?? {},
    command = this.client.prefixCommands.get(this.commandName),
    lang = I18nProvider.__.bBind(I18nProvider, { locale: config.lang ?? this.guild?.localeCode, backupPath: 'events.command' });

  if (command) {
    if (command.disabled) return replyOnDisabledCommand === false ? void 0 : this.customReply({ embeds: [errorEmbed.setDescription(lang('disabled', command.disabledReason || 'Not provided'))] }, 1e4);
    if (ownerOnlyFolders.includes(command.category.toLowerCase()) && this.user.id != this.client.application.owner.id) return this.runMessages(); //DO NOT REMOVE THIS LINE!
    if (!command.dmPermission && this.channel.type == ChannelType.DM) return this.customReply({ embeds: [errorEmbed.setDescription(lang('guildOnly'))] }, 1e4);
    if (this.client.botType == 'dev' && !command.beta) return replyOnNonBetaCommand === false ? void 0 : this.customReply({ embeds: [errorEmbed.setDescription(lang('nonBeta'))] }, 1e4);
  }
  else return this.client.slashCommands.has(this.commandName) ? this.customReply({ embeds: [errorEmbed.setDescription(lang('slashOnly', { name: this.commandName, id: this.client.slashCommands.get(this.commandName).id }))] }, 1e4) : this.runMessages();

  const disabledList = commandSettings[command.aliasOf || command.name]?.disabled || {};
  if (disabledList.members?.includes(this.user.id)) return this.customReply({ embeds: [errorEmbed.setDescription(lang('notAllowed.member'))] }, 1e4);
  if (disabledList.channels?.includes(this.channel.id)) return this.customReply({ embeds: [errorEmbed.setDescription(lang('notAllowed.channel'))] }, 1e4);
  if (disabledList.roles && this.member.roles?.cache.some(e => disabledList.roles.includes(e.id))) return this.customReply({ embeds: [errorEmbed.setDescription(lang('notAllowed.role'))] }, 1e4);
  if (command.category.toLowerCase() == 'nsfw' && !this.channel.nsfw) return this.customReply({ embeds: [errorEmbed.setDescription(lang('nsfw'))] }, 1e4);

  const options = command.options?.flatMap(e => e?.options?.flatMap?.(e => e?.options || e) || e?.options || e) || [];
  for (let i = 0; i < options.length; i++) {
    const { autocomplete, strictAutocomplete, name } = options[i];
    this.focused = { name, value: this.args?.[i] };

    if (autocomplete && strictAutocomplete && this.args?.[i] && !(await autocompleteGenerator.call(this, command, config.lang ?? this.guild?.localeCode))
      .some(e => (e.toLowerCase?.() || e.value.toLowerCase()) === this.args[i].toLowerCase())) {
      return this.customReply({ embeds: [errorEmbed.setDescription(lang('strictAutocompleteNoMatch'))] }, 1e4);
    }
  }

  delete this.focused;

  if (this.client.botType != 'dev') {
    const cooldown = cooldowns.call(this, command);
    if (cooldown) return this.customReply({ embeds: [errorEmbed.setDescription(lang('cooldown', cooldown))] }, 1e4);
  }

  if (this.guild) {
    const userPermsMissing = this.member.permissionsIn(this.channel).missing([...(command.permissions?.user || []), PermissionFlagsBits.SendMessages]);
    const botPermsMissing = this.guild.members.me.permissionsIn(this.channel).missing([...(command.permissions?.client || []), PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks]);

    if (botPermsMissing.length || userPermsMissing.length) {
      errorEmbed.data.title = lang('permissionDenied.embedTitle');
      errorEmbed.data.description = lang(`permissionDenied.embedDescription${userPermsMissing.length ? 'User' : 'Bot'}`, { permissions: permissionTranslator(botPermsMissing.length ? botPermsMissing : userPermsMissing).join('`, `') });

      if (botPermsMissing.includes('SendMessages')) return this.user.send({ content: `${this.guild.name}: ${this.channel.name}`, embeds: [errorEmbed] });
      return this.reply({ embeds: [errorEmbed.setTitle()] });
    }
  }

  const cmdLang = I18nProvider.__.bBind(I18nProvider, { locale: config.lang ?? this.guild?.localeCode, backupPath: command ? `commands.${command.category.toLowerCase()}.${command.aliasOf ?? command.name}` : null });
  try {
    command.run.call(this, cmdLang)?.catch(err => errorHandler.call(this.client, err, this, lang));
    if (this.client.botType != 'dev') await this.client.db.update('botSettings', `stats.${command.name}`, this.client.settings.stats?.[command.name] + 1 || 1);
  } catch (err) { errorHandler.call(this.client, err, this, lang); }
};
