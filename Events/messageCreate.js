let length;

module.exports = (client, message) => {
  if (message.author.bot) return;
  message.content = message.content.replace('<@!', '<@');
  
  if(message.content.startsWith(client.prefix)) length = client.prefix.length;
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
  
  client.message = message;
  command.run(client, message);
  client.message = null;
}