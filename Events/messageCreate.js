const
  { LimitedCollection, EmbedBuilder, Colors, ChannelType, PermissionFlagsBits } = require('discord.js'),
  { I18nProvider, cooldowns, permissionTranslator, errorHandler, getOwnerOnlyFolders } = require('../Utils'),
  ownerOnlyFolders = getOwnerOnlyFolders(),
  saveToMentionsCache = (msg, userId) => msg.guild.mentionsCache.get(userId)?.set(msg.id, msg) ?? msg.guild.mentionsCache.set(userId, new LimitedCollection({ maxSize: 20 }, [[msg.id, msg]]));

let prefixLength;

async function runEco({ economy: { gaining: defaultGaining } }, economy = {}) {
  const { gaining, currency, currencyCapacity, skills } = economy[this.user.id] || {};
  const { config = {} } = economy;

  if (
    this.channel.type != ChannelType.DM && economy.enable && gaining?.chat && currency < currencyCapacity &&
    this.content.length > (config.gaining?.chat?.min_message_length ?? defaultGaining.chat.min_message_length) &&
    this.content.length < (config.gaining?.chat?.max_message_length ?? defaultGaining.chat.max_message_length) &&
    !(config.blacklist?.channel?.includes(this.channel.id) || config.blacklist?.users?.includes(this.user.id) || this.member.roles.cache.hasAny(config.blacklist?.roles)) &&
    !(await cooldowns.call(this, { name: 'economy', cooldowns: { user: 2e4 } }))
  ) {
    const currency = parseFloat((currency + gaining.chat + skills.currency_bonus_absolute.lvl ** 2 + gaining.chat * skills.currency_bonus_percentage.lvl ** 2 / 100).limit(0, currencyCapacity).toFixed(3));
    this.client.db.update('guildSettings', `${this.guild.id}.economy.${this.user.id}`, { currency });
  }
}

async function runMessages(locale) {
  const
    originalContent = this.content = this.content.replaceAll('<@!', '<@'),
    { afkMessages } = this.guild.db,
    countingData = this.guild.db.counting?.[this.channel.id];

  if (this.client.botType != 'dev' && this.guild.db.triggers?.length && !(await cooldowns.call(this, { name: 'triggers', cooldowns: { user: 1000 } })))
    for (const trigger of this.guild.db.triggers.filter(e => originalContent?.toLowerCase()?.includes(e.trigger.toLowerCase())) || [])
      this.customReply(trigger.response);
  else if (originalContent.includes(this.client.user.id) && !(await cooldowns.call(this, { name: 'botMentionReaction', cooldowns: { user: 5000 } })))
    this.react('👀');

  if (this.client.botType != 'dev' && countingData && Number(originalContent)) {
    if (countingData.lastNumber + 1 == originalContent && countingData.lastAuthor != this.user.id) {
      this.client.db.update('guildSettings', `${this.guild.id}.counting.${this.channel.id}`, { lastNumber: countingData.lastNumber + 1, lastAuthor: this.user.id });
      this.react('✅');
    }
    else {
      this.react('❌');

      if (countingData?.lastNumber != 0) {
        this.client.db.update('guildSettings', `${this.guild.id}.counting.${this.channel.id}`, { user: null, lastNumber: 0 });
        this.reply(I18nProvider.__({ locale }, 'events.counting.error', countingData.lastNumber) + I18nProvider.__({ locale }, countingData.lastNumber + 1 != originalContent ? 'events.counting.wrongNumber' : 'events.counting.sameUserTwice'));
      }
    }
  }

  const afk = afkMessages?.[this.user.id]?.message ? afkMessages[this.user.id] : this.user.db.afkMessage;
  if (afk?.message && !originalContent.toLowerCase().includes('--afkignore')) {
    this.client.db.update('userSettings', `${this.user.id}.afkMessage`, {});
    this.client.db.update('guildSettings', `${this.guild.id}.afkMessages.${this.user.id}`, {});
    if (this.member.moderatable && this.member.nickname?.startsWith('[AFK] ')) this.member.setNickname(this.member.nickname.substring(6));
    this.customReply(I18nProvider.__({ locale }, 'events.afkEnd', afk.createdAt));
  }

  if (!(await cooldowns.call(this, { name: 'afkMsg', cooldowns: { user: 10000 } })))
    for (const member of this.mentions.members.filter(member => member.id != this.user.id && (afkMessages?.[member.id]?.message || member.user.db.afkMessage?.message))) {
      const { message, createdAt } = afkMessages?.[member.id]?.message ? afkMessages[member.id] : member.user.db.afkMessage;
      this.customReply(I18nProvider.__({ locale }, 'events.afkMsg', {
        member: member.nickname?.startsWith('[AFK] ') ? member.displayName.substring(6) : member.displayName,
        message, timestamp: createdAt
      }));
    }
}

/**@this {import('discord.js').Message}*/
module.exports = async function messageCreate() {
  if (this.client.settings.blacklist?.includes(this.user.id)) return;
  if (this.crosspostable && this.guild.db?.config?.autopublish) this.crosspost();

  for (const [id] of this.mentions.users.filter(e => e.id != this.user.id)) saveToMentionsCache(this, id);
  this.mentions.roles.each(r => r.members.each(e => saveToMentionsCache(this, e.id)));
  if (this.user.bot) return;

  const
    { config, economy } = this.guild.db,
    locale = this.guild.localeCode,
    guildPrefix = this.client.botType == 'dev' ? config?.betaBotPrefix?.prefix || this.guild.defaultSettings.config.betaBotPrefix : config?.prefix?.prefix || this.guild.defaultSettings.config.prefix;

  if (
    this.client.botType == 'dev' && this.content.startsWith(config?.betaBotPrefix?.caseinsensitive ? guildPrefix.toLowerCase() : guildPrefix) ||
    this.content.startsWith(config?.prefix?.caseinsensitive ? guildPrefix.toLowerCase() : guildPrefix)
  ) prefixLength = guildPrefix.length;
  else if (this.content.startsWith(`<@${this.client.user.id}>`)) prefixLength = this.client.user.id.length + 3;
  else {
    runMessages.call(this, locale);
    return runEco.call(this, this.guild.defaultSettings, economy);
  }

  this.args = this.content.slice(prefixLength).trim().split(' ');
  this.commandName = this.args.shift().toLowerCase();
  this.content = this.args.join(' ');

  const command = this.client.prefixCommands.get(this.commandName);
  if (command && !command.dmPermission && this.channel.type == ChannelType.DM) return this.customReply(I18nProvider.__({ locale }, 'events.guildCommandOnly'));
  if (!command && this.client.slashCommands.get(this.commandName)) return this.customReply(I18nProvider.__({ locale }, 'events.slashCommandOnly'));
  if ( //DO NOT REMOVE THIS STATEMENT!
    !command || (ownerOnlyFolders.includes(command.category.toLowerCase()) && this.user.id != this.client.application.owner.id)
  ) return runMessages.call(this, { locale });

  const lang = I18nProvider.__.bBind(I18nProvider, { locale, backupPath: `commands.${command.category.toLowerCase()}.${command.name}` });
  const disabledList = this.guild.db.commandSettings?.[command.aliasOf || command.name]?.disabled || {};

  if (disabledList.members && disabledList.members.includes(this.user.id)) return this.customReply(lang('events.notAllowed.member'), 1e4);
  if (disabledList.channels && disabledList.channels.includes(this.channel.id)) return this.customReply(lang('events.notAllowed.channel'), 1e4);
  if (disabledList.roles && this.member.roles.cache.some(e => disabledList.roles.includes(e.id))) return this.customReply(lang('events.notAllowed.role'), 1e4);

  const cooldown = await cooldowns.call(this, command);

  if (cooldown && !this.client.botType == 'dev') return this.customReply(lang('events.cooldown', cooldown), 1e4);
  if (command.requireEconomy && (!economy?.enable || !economy?.[this.user.id]?.gaining?.chat))
    return this.customReply(!economy?.enable ? lang('events.economyDisabled') : lang('events.economyNotInitialized'), 3e4);

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

  try {
    command.run.call(this, lang)?.catch(err => errorHandler.call(this.client, err, this, lang));
    if (this.client.botType != 'dev') this.client.db.update('botSettings', `stats.${command.name}`, this.client.settings.stats?.[command.name] + 1 || 1);
  } catch (err) { errorHandler.call(this.client, err, this, lang); }
};