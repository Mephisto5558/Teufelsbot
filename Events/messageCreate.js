module.exports = (client, message) => {
  const botMention = new RegExp(`^(<@!?${client.userId}>)`);

  if (message.author.bot) return;
  if (!message.content.startsWith(client.prefix) && !botMention.test(message.content)) return;

  if(message.content.startsWith(client.prefix)) {
    message.args = message.content.slice(client.prefix.length).trim().split(/ +/g)
  }
  else {
    message.args = message.content.replace(/<@!/g, '<@').substring(client.prefix.length).trim().split(/ +/g);
  }
  
  const commandName = message.args.shift().toLowerCase()
  const command = client.commands.get(commandName)
  if (!command) return;

  message.args = message.args.slice(0);
  message.content = message.args.join(' ');
  
  command.run(client, message)
}