const { Command } = require("reconlx");

module.exports = new Command({
  name: 'uptime',
  aliases: [],
  description: `shows the bot's uptime`,
  userPermissions: [],
  category : "Information",
  slashCommand: false,
  run: async (client, message, interaction) => {

    let data;
    let totalSeconds = (client.uptime / 1000);
    let days = Math.floor(totalSeconds / 86400);
    totalSeconds %= 86400;
    let hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = Math.floor(totalSeconds % 60);

    data = `The bot is online since exactly ${days} days, ${hours} hours, ${minutes} minutes and ${seconds} secounds.`
    if(!seconds || secounds === 0) {
      data = `The bot is online since exactly ${days} days, ${hours} hours and ${minutes} minutes.`
      if(!minutes || minutes === 0) {
        data = `The bot is online since exactly ${days} days and ${hours} hours.`
        if(!hours || hours === 0) {
          data = `The bot is online since exactly ${days} days.`
        }
      }
    }
    client.functions.reply(data, message)
  }
})