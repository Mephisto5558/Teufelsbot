module.exports = (client, message) => {
  client.message = message;

  if (message.author.bot) return;
  message.content = message.content.replace('<@!', '<@');
  if (!message.content.startsWith(client.prefix) && !message.content.startsWith(`<@${client.user.id}>`)) return;

  if (message.content.startsWith(client.prefix)) length = client.prefix.length
  else length = `<@${client.user.id}>`.length;

  message.content = message.content.slice(length).trim();
  message.args = message.content.split(' ').slice(0);

  const commandName = message.args.shift().toLowerCase();
  const commandAlias = client.aliases.get(commandName);
  let command = client.commands.get(commandName);

  if (!command) {
    if (!commandAlias) return;
    command = client.commands.get(commandAlias)
  };

  command.run(client, message)
  client.message = null;
}