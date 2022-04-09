const { Command } = require("reconlx");

module.exports = new Command({
  name: 'uptime',
  aliases: [],
  description: `shows the bot's uptime`,
  userPermissions: [],
  category : "Information",
  slashCommand: false,
  run: async (client, message, interaction) => {
    let totalSeconds = (client.uptime / 1000);
    let days = Math.floor(totalSeconds / 86400);
    totalSeconds %= 86400;
    let hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = Math.floor(totalSeconds % 60);

    client.functions.reply(`The bot is online since ${days}d, ${hours}h, ${minutes}min and ${seconds}s.`, message)
  }
})