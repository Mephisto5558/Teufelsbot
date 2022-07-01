const { MessageEmbed } = require('discord.js');
const { colors } = require('../Settings/embed.json');

let length;

module.exports = async (client, message) => {
  if(message.channel.type == 'DM') return;
  
  const blacklist = client.blacklist || await client.db.get('blacklist') || [];
  if(blacklist.includes(message.author.id)) return;

  if (message.crosspostable && await client.db.get('settings')[message.guild.id]?.autoPublish) message.crosspost();
  
  if (
    message.author.bot ||
    (command.category.toLowerCase() == 'owner-only' && message.author.id != client.owner)  //DO NOT REMOVE THIS LINE!
  ) return;

  //if(Object.entries(messageTriggers[message.guild.id]).includes(message.content))
  if(/(koi ?pat|pat ?koi|pat ?fish|fish ?pat)/i.test(message.content)) client.functions.reply('https://giphy.com/gifs/fish-pat-m0bwRip4ArcYEx7ni7', message);

  const guildPrefix = await client.db.get('settings')[message.guild.id]?.prefix || await client.db.get('settings').default.prefix;
  
  message.content = message.content.replace(/<@!/g, '<@');

  if(message.content.startsWith(guildPrefix)) length = guildPrefix.length;
  else if(message.content.startsWith(`<@${client.user.id}>`)) length = `<@${client.user.id}>`.length;
  else return;

  message.content = message.content.slice(length).trim();
  message.args = message.content.split(' ');

  const commandName = message.args.shift().toLowerCase();
  const command = client.commands.get(commandName) || client.commands.get(client.aliases.get(commandName));

  if (!command) return;

  message.content = message.args.join(' ');

  const userPerms = message.member.permissionsIn(message.channel).missing([...command.permissions.user, 'SEND_MESSAGES']);
  const botPerms = message.guild.me.permissionsIn(message.channel).missing([...command.permissions.client, 'SEND_MESSAGES']);

  const embed = new MessageEmbed()
    .setTitle('Insufficient Permissions')
    .setColor(colors.discord.RED);

  if (userPerms.length) {
    embed.setDescription(
      `You need the following permissions in this channel to run this command:\n\`` +
      userPerms.join('`, `') + '`'
    )
  }
  else if (botPerms.length) {
    embed.setDescription(
      `I need the following permissions in this channel to run this command:\n\`` +
      botPerms.join('`, `') + '`'
    )
  }

  if(embed.description) return message.reply({ embeds: [embed] });
  
  client.message = message;
  command.run(client, message);
  client.message = null;
}