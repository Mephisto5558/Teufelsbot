const
  { EmbedBuilder, Colors, ChannelType, PermissionFlagsBits } = require('discord.js'),
  I18nProvider = require('../Functions/private/I18nProvider.js');

module.exports = async function messageCreate() {
  let prefixLength;
  if (this.channel.type == ChannelType.DM) return;

  const { blacklist, stats = {} } = this.client.db.get('botSettings');
  if (blacklist?.includes(this.author.id)) return;

  const { config, triggers, economy } = this.client.db.get('guildSettings')[this.guild.id] || {};

  if (this.crosspostable && config?.autopublish) this.crosspost();
  if (this.author.bot) return;

  const guildPrefix = config?.prefix?.prefix || this.client.db.get('guildSettings').default.config.prefix;

  this.content = this.content.replaceAll('<@!', '<@');

  const runTriggers = () => {
    if (this.client.botType != 'dev')
      for (const trigger of triggers?.filter(e => this.content?.toLowerCase()?.includes(e.trigger.toLowerCase())) || [])
        this.customReply(trigger.response);
  };

  if (this.content.startsWith(config?.prefix?.caseinsensitive ? guildPrefix.toLowerCase() : guildPrefix)) prefixLength = guildPrefix.length;
  else if (this.content.startsWith(`<@${this.client.user.id}>`)) prefixLength = this.client.user.id.length + 3;
  else {
    runTriggers();
    const eco = economy?.[this.author.id];
    if (
      economy?.enable && eco?.gaining?.chat && eco.currency < eco.currencyCapacity &&
      this.content.length > (economy.config?.gaining?.chat?.min_message_length ?? this.client.db.get('guildSettings').default.economy.gaining.chat.min_message_length) &&
      this.content.length < (economy.config?.gaining?.chat?.max_message_length ?? this.client.db.get('guildSettings').default.economy.gaining.chat.max_message_length) &&
      !(economy.config.blacklist?.channel?.includes(this.channel.id) || economy.config.blacklist?.users?.includes(this.user.id) || this.member.roles.cache.hasAny(economy.config.blacklist?.roles)) &&
      !(await require('../Functions/private/cooldowns.js').call(this, { name: 'economy', cooldowns: { user: 20000 } }))
    ) {
      const currency = parseFloat((eco.currency + eco.gaining.chat + eco.skills.currency_bonus_absolute.lvl ** 2 + eco.gaining.chat * eco.skills.currency_bonus_percentage.lvl ** 2 / 100).limit(0, eco.currencyCapacity).toFixed(3));

      this.client.db.set('guildSettings', this.client.db.get('guildSettings').fMerge({
        [this.guild.id]: { economy: { [this.author.id]: { currency } } }
      }));
    }
    return;
  }

  this.args = this.content.slice(prefixLength).trim().split(' ');
  this.commandName = this.args.shift().toLowerCase();
  this.content = this.args.join(' ');
  this.user = this.author;

  const command = this.client.prefixCommands.get(this.commandName);

  if (!command && this.client.slashCommands.get(this.commandName)) return this.customReply(I18nProvider.__({ locale: config?.lang || this.guild.preferredLocale.slice(0, 2) }, 'events.slashCommandOnly'));
  if ( //DO NOT REMOVE THIS STATEMENT!
    !command || (command.category.toLowerCase() == 'owner-only' && this.author.id != this.client.application.owner.id)
  ) return runTriggers();

  const lang = I18nProvider.__.bind(I18nProvider, { locale: config?.lang || this.guild.preferredLocale.slice(0, 2), backupPath: `commands.${command.category.toLowerCase()}.${command.name}` });

  const cooldown = await require('../Functions/private/cooldowns.js').call(this, command);
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
      description: lang('events.permissionDenied.embedDescription', { IYou: userPermsMissing.length ? lang('global.you') : lang('global.i'), permissions: (botPermsMissing.length ? botPermsMissing : userPermsMissing).join('`, `') })
    });

    if (botPermsMissing.includes('SendMessages')) return this.author.send({ content: `${this.channel.name} in ${this.guild.name}`, embeds: [embed] });

    return this.reply({ embeds: [embed] });
  }

  command.run.call(this, lang, this.client)
    .then(() => this.client.db.set('botSettings', this.client.db.get('botSettings').fMerge({ stats: { [command.name]: stats[command.name] + 1 || 1 } })))
    .catch(err => require('../Functions/private/error_handler.js').call(this.client, err, this, lang));
};