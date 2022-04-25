const { Command } = require("reconlx");

module.exports = new Command({
  name: 'uptime',
  aliases: [],
  description: `shows the bot's uptime`,
  userPermissions: [],
  category : "Information",
  slashCommand: false,
  run: async (client, message, interaction) => {
       
    const axios = require('axios')
    let response = {};
    let data;
    let days; let hours; let minutes; let seconds;
    
    try {
      response = await axios.get('https://Teufelswerk-Music-Bot.mephisto5558.repl.co/uptime');
      response = response.data.total;
      
      if(!response) response = false;
    }
    catch { response = false };

    function formatUptime(totalSeconds) {
      let days = Math.floor(totalSeconds / 86400);
      totalSeconds %= 86400;
      let hours = Math.floor(totalSeconds / 3600);
      totalSeconds %= 3600;
      let minutes = Math.floor(totalSeconds / 60);
      let seconds = Math.floor(totalSeconds % 60);
      data = `The main module is online since exactly ${days} days, ${hours} hours, ${minutes} minutes and ${seconds} seconds.`

      if(!days || days === 0) {
        data = `The main module is online since exactly ${hours} hours, ${minutes} minutes and ${seconds} seconds.`;
        if(!hours || hours === 0) {
          data = `The main module is online since exactly ${minutes} minutes and ${seconds} seconds.`;
          if(!minutes || minutes === 0) {
            data = `The main module is online since exactly ${seconds} seconds.`;
            if(!days) data = false
            if(days == 0) {
              data = `The main module is online since exactly 0 seconds.`
            }
          }
        }
      }
    };
    
    formatUptime(client.uptime / 1000);
    
    if(message) client.functions.reply(data, message);
    else interaction.reply(data);
    
    if(!response) return;
    formatUptime(response / 1000);
    if(!data) return;
    data = data.replace('main module', 'music module');
    
    if(message) client.functions.reply(data, message);
    else interaction.reply(data)

  }
})