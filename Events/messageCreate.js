const
  { MessageEmbed } = require('discord.js'),
  { colors } = require('../Settings/embed.json');

module.exports = async (client, message) => {
  if (message.channel.type == 'DM') return;

  const blacklist = await client.db.get('blacklist');
  if (blacklist?.includes(message.author.id)) return;

  const guildSettings = await client.db.get('settings')[message.guild.id];

  if (message.crosspostable && guildSettings?.autoPublish) message.crosspost();
  if (message.author.bot) return;

  message.content = message.content.replace(/<@!/g, '<@');

  for (const trigger of guildSettings?.triggers?.filter(e => message.content?.toLowerCase()?.includes(e.trigger.toLowerCase())) || [])
    client.functions.reply(trigger.response, message);
  if (/(koi ?pat|pat ?koi|pat ?fish|fish ?pat)/i.test(message.content)) client.functions.reply('https://giphy.com/gifs/fish-pat-m0bwRip4ArcYEx7ni7', message);

  const guildPrefix = guildSettings?.prefix || await client.db.get('settings').default.prefix;

  const length = message.content.startsWith(guildPrefix) ? guildPrefix.length : message.content.startsWith(`<@${client.user.id}>`) ? `<@${client.user.id}>`.length : 0;
  if (!length) return;

  message.content = message.content.slice(length).trim();
  message.args = message.content.split(' ');

  const commandName = message.args.shift().toLowerCase();
  const command = client.commands.get(commandName);

  if ( //DO NOT REMOVE THIS BLOCK!
    !command ||
    (command.category.toLowerCase() == 'owner-only' && message.author.id != client.application.owner.id)
  ) return;

  const cooldown = await require('../Functions/private/cooldowns.js')(client, message.author, command);
  if (cooldown) return client.functions.reply(`This command is on cooldown! Try again in \`${cooldown}\`s.`, message);

  message.content = message.args.join(' ');

  const userPerms = message.member.permissionsIn(message.channel).missing([...command.permissions.user, 'SEND_MESSAGES']);
  const botPerms = message.guild.me.permissionsIn(message.channel).missing([...command.permissions.client, 'SEND_MESSAGES']);

  if (botPerms.length || userPerms.length) {
    const embed = new MessageEmbed({
      title: 'Insufficient Permissions',
      color: colors.discord.RED,
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