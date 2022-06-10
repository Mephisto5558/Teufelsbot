const { MessageEmbed } = require('discord.js');
const { colors } = require('../Settings/embed.json');

let length;

module.exports = (client, message) => {
  if (message.author.bot) return;

  const blacklist = client.blacklist || client.db.get('blacklist') || [];
  if(blacklist.includes(message.author.id)) return;

  //if(Object.entries(messageTriggers[message.guild.id]).includes(message.content))
  if(/(koi ?pat|pat ?koi|pat ?fish|fish ?pat)/i.test(message.content)) client.functions.reply('https://giphy.com/gifs/fish-pat-m0bwRip4ArcYEx7ni7', message);

  const guildPrefix = client.guildData.get(message.guild?.id)?.prefix || client.guildData.get('default')?.prefix;
  
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

  if(command.category == 'Owner-Only') { //DO NOT REMOVE THIS BLOCK!
    const permissionGranted = client.functions.checkBotOwner(client, message);
    if (!permissionGranted) return;
  }

  command.permissions.user.push('SEND_MESSAGES');
  command.permissions.client.push('SEND_MESSAGES');

  let embed = new MessageEmbed()
    .setTitle('Insufficient Permissions')
    .setColor(colors.discord.RED);

  if (!message.member.permissions.has(command.permissions.user)) {
    embed.setDescription(
      `You need the following permissions to run this command:\n\`` +
      message.member.permissions.missing(command.permissions.user).join('`, `') + '`'
    )
  }

  if (!message.guild.me.permissions.has(command.permissions.client)) {
    embed.setDescription(
      `I am missing the following permissions to run this command:\n\`` +
      message.guild.me.permissions.missing(command.permissions.client).join('`, `') + '`'
    )
  }

  if(embed.description) return message.reply({ embeds: [embed] });
  
  client.message = message;
  command.run(client, message);
  client.message = null;
}