const
  { EmbedBuilder, Colors, ChannelType, PermissionFlagsBits } = require('discord.js'),
  I18nProvider = require('../Functions/private/I18nProvider.js');

module.exports = async (client, message) => {
  let prefixLength;
  if (message.channel.type == ChannelType.DM) return;

  const { blacklist } = client.db.get('botSettings');
  if (blacklist?.includes(message.author.id)) return;

  const { config, triggers } = client.db.get('guildSettings')[message.guild.id] || {};

  if (message.crosspostable && config?.autopublish) message.crosspost();
  if (message.author.bot) return;

  const guildPrefix = config?.prefix?.prefix || client.db.get('guildSettings').default.config.prefix;

  message.content = message.content.replaceAll('<@!', '<@');

  for (const trigger of triggers?.filter(e => message.content?.toLowerCase()?.includes(e.trigger.toLowerCase())) || [])
    message.customReply(trigger.response);

  if (/(koi|fish)[_\s]?pat|pat[_\s]?(koi|fish)/i.test(message.content)) message.customReply('https://giphy.com/gifs/fish-pat-m0bwRip4ArcYEx7ni7');

  if (message.content.startsWith(config?.prefix?.caseinsensitive ? guildPrefix.toLowerCase() : guildPrefix)) prefixLength = guildPrefix.length;
  else if (message.content.startsWith(`<@${client.user.id}>`)) prefixLength = client.user.id.length + 3;
  else {
    if (message.content.length > 5) {
      if (!(await require('../Functions/private/cooldowns.js')(client, message, { name: 'economy', cooldowns: { user: 20000 } }))) {
        const eco = client.db.get('guildSettings')[message.guild.id]?.economy?.[message.author.id];
        if (!eco?.gaining?.chat || eco.currency == eco.currencyCapacity) return;

        const currency = parseFloat((eco.currency + eco.gaining.chat + Math.pow(eco.skills.currency_bonus_absolute.lvl, 2) + (eco.gaining.chat * Math.pow(eco.skills.currency_bonus_percentage.lvl, 2) / 100)).limit(0, eco.currencyCapacity).toFixed(3));

        client.db.set('guildSettings', client.db.get('guildSettings').fMerge({
          [message.guild.id]: { economy: { [message.author.id]: { currency } } }
        }));
      }
    }
    return;
  }

  message.args = message.content.slice(prefixLength).trim().split(' ');
  message.commandName = message.args.shift().toLowerCase();
  message.content = message.args.join(' ');
  message.user = message.author;

  const command = client.commands.get(message.commandName);

  if (!command && client.slashCommands.get(message.commandName)) return message.customReply(I18nProvider.__({ locale: config?.lang || message.guild.preferredLocale.slice(0, 2) }, 'events.slashCommandOnly'));
  if ( //DO NOT REMOVE THIS STATEMENT!
    !command ||
    (command.category.toLowerCase() == 'owner-only' && message.author.id != client.application.owner.id)
  ) return;

  const lang = I18nProvider.__.bind(I18nProvider, { locale: config?.lang || message.guild.preferredLocale.slice(0, 2), backUpPath: `commands.${command.category.toLowerCase()}.${command.name}` });

  if (command.category.toLowerCase() == 'economy' && command.name != 'economy' && !client.db.get('guildSettings')[message.guild.id]?.economy?.[message.author.id]?.gaining?.chat)
    return message.customReply(lang('events.economyNotInitialized'), message, 15000);

  const cooldown = await require('../Functions/private/cooldowns.js')(client, message, command);
  if (cooldown && !client.botType == 'dev') return message.customReply(lang('events.cooldown', cooldown));

  const userPermsMissing = message.member.permissionsIn(message.channel).missing([...command.permissions.user, PermissionFlagsBits.SendMessages]);
  const botPermsMissing = message.guild.members.me.permissionsIn(message.channel).missing([...command.permissions.client, PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks]);

  if (botPermsMissing.length || userPermsMissing.length) {
    const embed = new EmbedBuilder({
      title: lang('events.permissionDenied.embedTitle'),
      color: Colors.Red,
      description: lang('events.permissionDenied.embedDescription', { IYou: userPermsMissing.length ? lang('global.you') : lang('global.i'), permissions: (botPermsMissing.length ? botPermsMissing : userPermsMissing).join('`, `') })
    });

    if (botPermsMissing.includes('SendMessages')) return message.author.send({ content: `${message.channel.name} in ${message.guild.name}`, embeds: [embed] });

    return message.reply({ embeds: [embed] });
  }

  try { await command.run(message, lang, client) }
  catch (err) { require('../Functions/private/error_handler.js')(err, client, message, lang) }
}