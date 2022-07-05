const
  { MessageEmbed } = require('discord.js'),
  { colors } = require('../Settings/embed.json');

let length;

module.exports = async (client, message) => {
  if (message.channel.type == 'DM') return;

  const blacklist = await client.db.get('blacklist');
  if (blacklist?.includes(message.author.id)) return;

  if (message.crosspostable && await client.db.get('settings')[message.guild.id]?.autoPublish) message.crosspost();

  if (message.author.bot) return;

  //if(Object.entries(messageTriggers[message.guild.id]).includes(message.content))
  if (/(koi ?pat|pat ?koi|pat ?fish|fish ?pat)/i.test(message.content)) client.functions.reply('https://giphy.com/gifs/fish-pat-m0bwRip4ArcYEx7ni7', message);

  const guildPrefix = await client.db.get('settings')[message.guild.id]?.prefix || await client.db.get('settings').default.prefix;

  message.content = message.content.replace(/<@!/g, '<@');

  if (message.content.startsWith(guildPrefix)) length = guildPrefix.length;
  else if (message.content.startsWith(`<@${client.user.id}>`)) length = `<@${client.user.id}>`.length;
  else return;

  message.content = message.content.slice(length).trim();
  message.args = message.content.split(' ');

  const commandName = message.args.shift().toLowerCase();
  const command = client.commands.get(commandName);

  if ( //DO NOT REMOVE THIS BLOCK!
    !command ||
    (command.category.toLowerCase() == 'owner-only' && message.author.id != client.api.applications(client.userID).owner.id)
  ) return;

  const cooldown = await require('../Functions/private/cooldowns.js')(client, message.author, command);
  if(cooldown) return client.functions.reply(`This command is on cooldown! Try again in \`${cooldown}\`s.`, message);

  message.content = message.args.join(' ');

  const userPerms = message.member.permissionsIn(message.channel).missing([...command.permissions.user, 'SEND_MESSAGES']);
  const botPerms = message.guild.me.permissionsIn(message.channel).missing([...command.permissions.client, 'SEND_MESSAGES']);

  const embed = new MessageEmbed({
    title: 'Insufficient Permissions',
    color: colors.discord.RED,
    description:
      `${userPerms.length ? 'You' : 'I'} need the following permissions in this channel to run this command:\n\`` +
      (botPerms.length ? botPerms : userPerms).join('`, `') + '`'
  });

  if (botPerms.length || userPerms.length) return message.reply({ embeds: [embed] });

  client.message = message;
  command.run(client, message);
  client.message = null;
}