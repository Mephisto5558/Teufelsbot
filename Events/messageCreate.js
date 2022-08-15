const { EmbedBuilder, Colors, ChannelType, PermissionFlagsBits } = require('discord.js');

module.exports = async (client, message) => {
  if (message.channel.type == ChannelType.DM) return;

  const { blacklist } = await client.db.get('botSettings');
  if (blacklist?.includes(message.author.id)) return;

  const guildSettings = await client.db.get('guildSettings')[message.guild.id];

  if (message.crosspostable && guildSettings?.config?.autopublish) message.crosspost();
  if (message.author.bot) return;

  message.content = message.content.replace(/<@!/g, '<@');

  for (const trigger of guildSettings?.triggers?.filter(e => message.content?.toLowerCase()?.includes(e.trigger.toLowerCase())) || [])
    client.functions.reply(trigger.response, message);
  if (/(koi ?pat|pat ?koi|pat ?fish|fish ?pat)/i.test(message.content)) client.functions.reply('https://giphy.com/gifs/fish-pat-m0bwRip4ArcYEx7ni7', message);

  const guildPrefix = guildSettings?.config?.prefix || await client.db.get('guildSettings').default.config.prefix;

  let prefixLength;
  if (message.content.startsWith(guildPrefix)) prefixLength = guildPrefix.length;
  else if (message.content.startsWith(`<@${client.user.id}>`)) prefixLength = client.user.id.length + 3
  else return;

  message.content = message.content.slice(prefixLength).trim();
  message.args = message.content.split(' ');
  message.user = message.author;

  message.commandName = message.args.shift().toLowerCase();
  const command = client.commands.get(message.commandName);

  if (!command && client.slashCommands.get(message.commandName)) return client.functions.reply(lang('events.slashCommandOnly'), message);
  if ( //DO NOT REMOVE THIS BLOCK!
    !command ||
    (command.category.toLowerCase() == 'owner-only' && message.author.id != client.application.owner.id)
  ) return;

  const lang = await require('../Functions/private/lang')(client, message, command);

  const cooldown = await require('../Functions/private/cooldowns.js')(client, message, command);
  if (cooldown && !client.botType == 'dev') return client.functions.reply(lang('events.cooldown', cooldown), message);

  message.content = message.args.join(' ');

  const userPermsMissing = message.member.permissionsIn(message.channel).missing([...command.permissions.user, PermissionFlagsBits.SendMessages]);
  const botPermsMissing = message.guild.members.me.permissionsIn(message.channel).missing([...command.permissions.client, PermissionFlagsBits.SendMessages]);

  if (botPermsMissing.length || userPermsMissing.length) {
    const embed = new EmbedBuilder({
      title: lang('events.permissionDenied.embedTitle'),
      color: Colors.Red,
      description: lang('events.permissionDenied.embedDescription', userPermsMissing.length ? lang('global.you') : lang('global.i'), (botPermsMissing.length ? botPermsMissing : userPermsMissing).join('`, `'))
    });

    if (message.guild.members.me.permissionsIn(message.channel).missing(PermissionFlagsBits.SendMessages)) return message.author.send({ content: `${message.channel.name} in ${message.guild.name}`, embeds: [embed] });
    return message.reply({ embeds: [embed] });
  }

  try { await command.run(message, lang, client) }
  catch (err) { require('../Functions/private/error_handler.js')(err, client, message, lang) }
}