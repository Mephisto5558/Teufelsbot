const { EmbedBuilder, Colors, ChannelType, PermissionFlagsBits } = require('discord.js');

module.exports = async (client, message) => {
  let prefixLength;
  if (message.channel.type == ChannelType.DM) return;

  const { blacklist } = await client.db.get('botSettings');
  if (blacklist?.includes(message.author.id)) return;

  const { config, triggers } = await client.db.get('guildSettings')[message.guild.id] || {};

  if (message.crosspostable && config?.autopublish) message.crosspost();
  if (message.author.bot) return;

  const guildPrefix = config?.prefix || await client.db.get('guildSettings').default.config.prefix;

  message.content = message.content.replace(/<@!/g, '<@');

  for (const trigger of triggers?.filter(e => message.content?.toLowerCase()?.includes(e.trigger.toLowerCase())) || [])
    client.functions.reply(trigger.response, message);

  if (/(koi|fish)[_\s]?pat|pat[_\s]?(koi|fish)/i.test(message.content)) client.functions.reply('https://giphy.com/gifs/fish-pat-m0bwRip4ArcYEx7ni7', message);

  if (message.content.startsWith(config?.prefixCaseInsensitive ? guildPrefix.toLowerCase() : guildPrefix)) prefixLength = guildPrefix.length;
  else if (message.content.startsWith(`<@${client.user.id}>`)) prefixLength = client.user.id.length + 3
  else return;

  message.content = message.content.slice(prefixLength).trim();
  message.args = message.content.split(' ');
  message.commandName = message.args.shift().toLowerCase();
  message.content = message.args.join(' ');
  message.user = message.author;

  const command = client.commands.get(message.commandName);
  const lang = await require('../Functions/private/lang')(client, message, command);

  if (!command && client.slashCommands.get(message.commandName)) return client.functions.reply(lang('events.slashCommandOnly'), message);
  if ( //DO NOT REMOVE THIS STATEMENT!
    !command ||
    (command.category.toLowerCase() == 'owner-only' && message.author.id != client.application.owner.id)
  ) return;

  const cooldown = await require('../Functions/private/cooldowns.js')(client, message, command);
  if (cooldown && !client.botType == 'dev') return client.functions.reply(lang('events.cooldown', cooldown), message);

  const userPermsMissing = message.member.permissionsIn(message.channel).missing([...command.permissions.user, PermissionFlagsBits.SendMessages]);
  const botPermsMissing = message.guild.members.me.permissionsIn(message.channel).missing([...command.permissions.client, PermissionFlagsBits.SendMessages]);

  if (botPermsMissing.length || userPermsMissing.length) {
    const embed = new EmbedBuilder({
      title: lang('events.permissionDenied.embedTitle'),
      color: Colors.Red,
      description: lang('events.permissionDenied.embedDescription', userPermsMissing.length ? lang('global.you') : lang('global.i'), (botPermsMissing.length ? botPermsMissing : userPermsMissing).join('`, `'))
    });

    if (botPermsMissing.includes('SendMessages')) return message.author.send({ content: `${message.channel.name} in ${message.guild.name}`, embeds: [embed] });

    return message.reply({ embeds: [embed] });
  }

  try { await command.run(message, lang, client) }
  catch (err) { require('../Functions/private/error_handler.js')(err, client, message, lang) }
}