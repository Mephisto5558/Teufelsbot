const { MessageEmbed } = require('discord.js');
const embedConfig = require('../Settings/embed.json').colors;
let length;

module.exports = (client, message) => {
  if (message.author.bot) return;
  message.content = message.content.replace('<@!', '<@');
  
  let guildPrefix = client.guildData.get(message.guild?.id)?.prefix || client.guildData.get('default')?.prefix

  if(message.content.startsWith(guildPrefix)) length = guildPrefix.length;
  else if(message.content.startsWith(`<@${client.user.id}>`)) length = `<@${client.user.id}>`.length;
  else return;

  message.content = message.content.slice(length).trim();
  message.args = message.content.split(' ').slice(0);

  const commandName = message.args.shift().toLowerCase();
  const commandAlias = client.aliases.get(commandName);
  let command = client.commands.get(commandName);

  if (!command) {
    if (!commandAlias) return;
    command = client.commands.get(commandAlias)
  };

  command.permissions.user.push('SEND_MESSAGES');
  command.permissions.client.push('SEND_MESSAGES');

  let embed = new MessageEmbed()
    .setTitle('Insufficient Permissions')
    .setColor(embedConfig.discord.RED);

  if (!message.member.permissions.has(command.permissions.user)) {
    embed.setDescription(
      `You need the following permissions to run this command:\n` +
      command.permissions.user.toString().replace(',', ', ')
    )
  };

  if (!message.guild.me.permissions.has(command.permissions.client)) {
    embed.setDescription(
      `I need the following permissions to run this command:\n` +
      command.permissions.client.toString().replace(',', ', ')
    )
  };

  if(embed.description) return message.reply({ embeds: [embed], ephemeral: true });
  
  client.message = message;
  command.run(client, message);
  client.message = null;
}