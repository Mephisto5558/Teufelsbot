const
  { EmbedBuilder, Colors, ChannelType, PermissionFlagsBits, Message } = require('discord.js'), // eslint-disable-line no-unused-vars
  I18nProvider = require('../Functions/private/I18nProvider.js'),
  cooldowns = require('../Functions/private/cooldowns.js');

/**@this {Message} */
module.exports = async function messageCreate() {
  let prefixLength;

  const defaultSettings = this.client.db.get('guildSettings').default;
  const { blacklist, stats = {} } = this.client.db.get('botSettings');
  if (blacklist?.includes(this.author.id)) return;

  const { config, triggers, economy, afkMessages } = this.client.db.get('guildSettings')[this.guild?.id] || {};
  const locale = config?.lang || this.guild?.preferredLocale.slice(0, 2) || defaultSettings.config.lang;

  if (this.crosspostable && config?.autopublish) this.crosspost();
  if (this.author.bot) return;

  const guildPrefix = config?.prefix?.prefix || defaultSettings.config.prefix;

  this.content = this.content.replaceAll('<@!', '<@');

  const runMessages = async () => {
    if (this.client.botType != 'dev' && !(await cooldowns.call(this, { name: 'triggers', cooldowns: { user: 1000 } }))) {
      for (const trigger of triggers?.filter(e => this.content?.toLowerCase()?.includes(e.trigger.toLowerCase())) || [])
        this.customReply(trigger.response);
    }

    const userSettings = this.client.db.get('userSettings');
    const afk = afkMessages?.[this.author.id]?.message ? afkMessages[this.author.id] : userSettings[this.author.id]?.afkMessage;
    if (afk?.message) {
      this.client.db.update('userSettings', `${this.author.id}.afkMessage`, {});
      this.client.db.update('guildSettings', `${this.guild.id}.afkMessages.${this.author.id}`, {});
      if (this.member.moderatable && this.member.nickname?.startsWith('[AFK] ')) this.member.setNickname(this.member.nickname.substring(6));
      this.customReply(I18nProvider.__({ locale }, 'events.afkEnd', afk.createdAt));
    }

    if (!(await cooldowns.call(this, { name: 'afkMsg', cooldowns: { user: 1000 } }))) {
      for (const member of this.mentions.members.filter((_, e) => (afkMessages?.[e]?.message || userSettings[e]?.afkMessage?.message) && e != this.author.id).values()) {
        const afkMsg = afkMessages?.[member.id] || userSettings[member.id]?.afkMessage;
        this.customReply(I18nProvider.__({ locale }, 'events.afkMsg', { member: member.displayName.startsWith('[AFK] ') ? member.displayName.substring(6) : member.displayName, message: afkMsg.message, timestamp: afkMsg.createdAt }));
      }
    }
  };

  if (this.content.startsWith(config?.prefix?.caseinsensitive ? guildPrefix.toLowerCase() : guildPrefix)) prefixLength = guildPrefix.length;
  else if (this.content.startsWith(`<@${this.client.user.id}>`)) prefixLength = this.client.user.id.length + 3;
  else {
    runMessages();
    const eco = economy?.[this.author.id];
    if (
      this.channel.type != ChannelType.DM && economy?.enable && eco?.gaining?.chat && eco.currency < eco.currencyCapacity &&
      this.content.length > (economy.config?.gaining?.chat?.min_message_length ?? defaultSettings.economy.gaining.chat.min_message_length) &&
      this.content.length < (economy.config?.gaining?.chat?.max_message_length ?? defaultSettings.economy.gaining.chat.max_message_length) &&
      !(economy.config.blacklist?.channel?.includes(this.channel.id) || economy.config.blacklist?.users?.includes(this.user.id) || this.member.roles.cache.hasAny(economy.config.blacklist?.roles)) &&
      !(await cooldowns.call(this, { name: 'economy', cooldowns: { user: 20000 } }))
    ) {
      const currency = parseFloat((eco.currency + eco.gaining.chat + eco.skills.currency_bonus_absolute.lvl ** 2 + eco.gaining.chat * eco.skills.currency_bonus_percentage.lvl ** 2 / 100).limit(0, eco.currencyCapacity).toFixed(3));

      this.client.db.update('guildSettings', `${this.guild.id}.economy.${this.author.id}`, { currency });
    }
    return;
  }

  this.args = this.content.slice(prefixLength).trim().split(' ');
  this.commandName = this.args.shift().toLowerCase();
  this.content = this.args.join(' ');
  this.user = this.author;

  const command = this.client.prefixCommands.get(this.commandName);

  if (command && !command.dmPermission && this.channel.type == ChannelType.DM) return this.customReply(I18nProvider.__({ locale }, 'events.guildCommandOnly'));
  if (!command && this.client.slashCommands.get(this.commandName)) return this.customReply(I18nProvider.__({ locale }, 'events.slashCommandOnly'));
  if ( //DO NOT REMOVE THIS STATEMENT!
    !command || (command.category.toLowerCase() == 'owner-only' && this.author.id != this.client.application.owner.id)
  ) return runMessages();

  const lang = I18nProvider.__.bind(I18nProvider, { locale, backupPath: `commands.${command.category.toLowerCase()}.${command.name}` });

  const cooldown = await cooldowns.call(this, command);
  if (cooldown && !this.client.botType == 'dev') return this.customReply(lang('events.cooldown', cooldown));

  if (command.requireEconomy) {
    if (!economy?.enable) return this.customReply(lang('events.economyDisabled'), 30000);
    if (!economy?.[this.author.id]?.gaining?.chat) return this.customReply(lang('events.economyNotInitialized'), 30000);
  }

  const userPermsMissing = this.member.permissionsIn(this.channel).missing([...command.permissions.user, PermissionFlagsBits.SendMessages]);
  const botPermsMissing = this.guild.members.me.permissionsIn(this.channel).missing([...command.permissions.client, PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks]);

  if (botPermsMissing.length || userPermsMissing.length) {
    const embed = new EmbedBuilder({
      title: lang('events.permissionDenied.embedTitle'),
      color: Colors.Red,
      description: lang(`events.permissionDenied.embedDescription${userPermsMissing.length ? 'User' : 'Bot'}`, { permissions: (botPermsMissing.length ? botPermsMissing : userPermsMissing).join('`, `') })
    });

    if (botPermsMissing.includes('SendMessages')) return this.author.send({ content: `${this.channel.name} in ${this.guild.name}`, embeds: [embed] });

    return this.reply({ embeds: [embed] });
  }

  try {
    command.run.call(this, lang, this.client)?.catch(err => require('../Functions/private/error_handler.js').call(this.client, err, this, lang));
    if (this.client.botType != 'dev') this.client.db.update('botSettings', `stats.${command.name}`, stats[command.name] + 1 || 1);
  } catch (err) { require('../Functions/private/error_handler.js').call(this.client, err, this, lang); }
};