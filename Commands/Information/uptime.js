const { Command } = require('reconlx');

module.exports = new Command({
  name: 'uptime',
  aliases: [],
  description: `shows the bot's uptime`,
  usage: 'PREFIX Command: uptime',
  permissions: { client: [], user: [] },
  cooldowns: { global: '', user: '' },
  category: 'Information',
  slashCommand: false,
  prefixCommand: true,

  run: async(client, message) => {
    let data;

    let totalSeconds = (Date.now() - client.startTime) / 1000
    const days = Math.floor(totalSeconds / 86400);
    totalSeconds %= 86400;
    const hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);

    if(days) data = `${days} days, ${hours} hours, ${minutes} minutes and ${seconds}`;
    else if(hours) data = `${hours} hours, ${minutes} minutes and ${seconds}`;
    else if(minutes) data = `${minutes} minutes and ${seconds}`;

    client.functions.reply(`The bot has been online for exactly ${data || seconds || 0} seconds.`, message);
  }
})