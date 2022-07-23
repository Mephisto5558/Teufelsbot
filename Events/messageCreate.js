const { EmbedBuilder, Colors, ChannelType, PermissionFlagsBits } = require('discord.js');

module.exports = async (client, message) => {
  if (message.channel.type == ChannelType.DM) return;

  const blacklist = await client.db.get('blacklist');
  if (blacklist?.includes(message.author.id)) return;

  const guildSettings = await client.db.get('settings')[message.guild.id];

  if (message.crosspostable && guildSettings?.config?.autopublish) message.crosspost();
  if (message.author.bot) return;

  message.content = message.content.replace(/<@!/g, '<@');

  for (const trigger of guildSettings?.triggers?.filter(e => message.content?.toLowerCase()?.includes(e.trigger.toLowerCase())) || [])
    client.functions.reply(trigger.response, message);
  if (/(koi ?pat|pat ?koi|pat ?fish|fish ?pat)/i.test(message.content)) client.functions.reply('https://giphy.com/gifs/fish-pat-m0bwRip4ArcYEx7ni7', message);

  const guildPrefix = guildSettings?.config?.prefix || await client.db.get('settings').default.config.prefix;

  const prefixLength = message.content.startsWith(guildPrefix) ? guildPrefix.length : message.content.startsWith(`<@${client.user.id}>`) ? `<@${client.user.id}>`.length : 0;
  if (!prefixLength) return;

  message.content = message.content.slice(prefixLength).trim();
  message.args = message.content.split(' ')

  const commandName = message.args.shift().toLowerCase();
  const command = client.commands.get(commandName);

  if(!command && client.slashCommands.get(commandName)) return client.functions.reply('This command is only as slash command available!', message);
  if ( //DO NOT REMOVE THIS BLOCK!
    !command ||
    (command.category.toLowerCase() == 'owner-only' && message.author.id != client.application.owner.id)
  ) return;

  const cooldown = await require('../Functions/private/cooldowns.js')(client, message, command);
  if (cooldown && !client.botType == 'dev') return client.functions.reply(`This command is on cooldown! Try again in \`${cooldown}\`s.`, message);

  message.content = message.args.join(' ');

  const userPerms = message.member.permissionsIn(message.channel).missing([...command.permissions.user, PermissionFlagsBits.SendMessages]);
  const botPerms = message.guild.members.me.permissionsIn(message.channel).missing([...command.permissions.client, PermissionFlagsBits.SendMessages]);

  if (botPerms.length || userPerms.length) {
    const embed = new EmbedBuilder({
      title: 'Insufficient Permissions',
      color: Colors.Red,
      description:
        `${userPerms.length ? 'You' : 'I'} need the following permissions in this channel to run this command:\n\`` +
        (botPerms.length ? botPerms : userPerms).join('`, `') + '`'
    });
    return message.reply({ embeds: [embed] });
  }

  client.message = message;
  command.run(client, message);
  client.message = null;
}