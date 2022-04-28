const { Command } = require("reconlx");
const axios = require('axios');

module.exports = new Command({
  name: 'uptime',
  aliases: [],
  description: `shows the bot's uptime`,
  permissions: { client: [], user: [] },
  cooldowns: { global: '', user: '' },
  category: "Information",
  slashCommand: false,
  prefixCommand: true,

  run: async(client, message, interaction) => {

    let response;
    let data;

    try {
      response = await axios.get('https://Teufelswerk-Music-Bot.mephisto5558.repl.co/uptime');
      response = response.data.total;
    } catch { response = false };

    function formatUptime(totalSeconds) {
      let days = Math.floor(totalSeconds / 86400);
      totalSeconds %= 86400;
      let hours = Math.floor(totalSeconds / 3600);
      totalSeconds %= 3600;
      let minutes = Math.floor(totalSeconds / 60);
      let seconds = Math.floor(totalSeconds % 60);
      data = `The main module is online since exactly ${days} days, ${hours} hours, ${minutes} minutes and ${seconds} seconds.`

      if (!days || days === 0) {
        data = `The main module is online since exactly ${hours} hours, ${minutes} minutes and ${seconds} seconds.`;
        if (!hours || hours === 0) {
          data = `The main module is online since exactly ${minutes} minutes and ${seconds} seconds.`;
          if (!minutes || minutes === 0) {
            data = `The main module is online since exactly ${seconds} seconds.`;
            if (!days) data = false
            if (days == 0) {
              data = `The main module is online since exactly 0 seconds.`
            }
          }
        }
      }
    };

    formatUptime(client.uptime / 1000);

    if (message) client.functions.reply(data, message);
    else interaction.reply(data);

    if (!response) return;
    formatUptime(response / 1000);

    if (!data) return;
    data = data.replace('main module', 'music module');

    if (message) client.functions.reply(data, message);
    else interaction.reply(data)

  }
})