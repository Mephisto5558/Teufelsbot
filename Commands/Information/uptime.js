const { Command } = require("reconlx");
const axios = require('axios');

let response;
let data;

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

      if(!days || days === 0) {
        data = `${hours} hours, ${minutes} minutes and ${seconds}`;
        if(!hours || hours === 0) {
          data = `${minutes} minutes and ${seconds}`;
          if(!minutes || minutes === 0) {
            data = `${seconds}`;
            if(!days) data = false
            if(days == 0) {
              data = '0'
            }
          }
        }
      }
      data = `The main module has been online for exactly ${data} seconds.`
    };

    formatUptime(client.uptime / 1000);

    if(message) client.functions.reply(data, message);
    else interaction.reply(data);

    if(!response) return;
    formatUptime(response / 1000);

    if(!data) data = 'The music module is offline.'
    else data = data.replace('main module', 'music module');

    if(message) client.functions.reply(data, message);
    else interaction.reply(data)

  }
})