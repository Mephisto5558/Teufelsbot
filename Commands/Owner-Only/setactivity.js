const { Command } = require("reconlx");

module.exports = new Command({
  name: 'setactivity',
  aliases: [],
  description: `sets the bot's activity`,
  permissions: {client: [], user: []},
  category : "Owner-Only",
  slashCommand: false,
  run: async (client, message, interaction) => {
    
    let permissionGranted = await client.functions.checkBotOwner(client, message)
    if(!permissionGranted) return;
  
    const fs = require("fs");
    const messageArgs0 = message.content.split(";")
    const messageArgs = messageArgs0.map(element => {
      return element.trim();
    });

    let activity = messageArgs[0]
    var type = messageArgs[1]

    if (!type) type = 0;

    const availableTypes = ["playing", "streaming", "listening", "watching", "competing"];
    const numType = type
      .replace('playing', 0).replace('streaming', 1)
      .replace('listening', 2).replace('watching', 3)
      .replace('competing', 5);
  
    const typeIsAvailable = availableTypes.some(element => {
      if (element === type.toLowerCase()) return true;
    });

    if (!typeIsAvailable) {
      return client.functions.reply(`Syntax error: Invalid type "${type}". Available types are:\n\`${availableTypes.toString().replace(/,/g, "\`, \`")}\``, message)
    }

    client.user.setActivity({ name: activity, type: numType });
    client.functions.reply(`Activity set to \`${activity}\` of type \`${type}\``, message)
    
  }
})