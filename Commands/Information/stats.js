const { Command } = require("reconlx");
const { MessageEmbed } = require("discord.js");
const fs = require("fs");
//const path = require('path');

module.exports = new Command({
  name: 'stats',
  alias: [],
  description: 'shows some stats of the bot',
  permissions: { client: [], user: [] },
  cooldowns: { global: 0, user: 0 },
  category: 'Information',
  slashCommand: false,
  prefixCommand: true,
  disabled: false,

  run: (client, message) => {

    fs.readFile('./Logs/startCount.log', 'utf8', (err, data) => {
      if(err) {
        work('Starts: 0');
        return console.error(err);
      }
      work(`Starts: ${data}`);
    });

    function work(description) {
      description = description + '\n' +
        `Developer: .̔̏𝗠𝗲𝗽𝗵𝗶𝘀𝘁𝗼#8949`;
    
      let embed = new MessageEmbed()
        .setTitle('Stats')
        .setDescription('More stats are comming soon!\n' + description);

      client.functions.reply({ embeds: [embed] }, message);
    }
  }
})