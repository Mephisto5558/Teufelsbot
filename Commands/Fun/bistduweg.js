const { Command } = require("reconlx");

module.exports = new Command({
  name: 'bistduweg',
  alias: [],
  description: 'sagt nix wenn er weg is',
  permissions: { client: [], user: [] },
  cooldowns: { global: 200, user: 0 },
  category: 'FUN',
  slashCommand: false,
  prefixCommand: true,

  run: async(client, message) => {

    let response;
    let responseList = [
      'Naiiiiiin D:',
      'Ich würde niemals gehen!',
      null,
      'Bananensaft schmeckt lecker',
      'Ich kann garnicht weg sein, der Meph hält mich in seinem Keller gefangen und zwingt mich hier zu arbeiten! Hilf mir!!!!',
    ];
    
    let random = Math.random() * 100;
    if (random <= 0.1) response = responseList[4];
    else if (random <= 10) response = responseList[3];
    else if (random <= 20) response = responseList[2];
    else if (random <= 60) response = responseList[1];
    else responseList[0];
      
    if(!response) return;
    
    message.channel.send(response);
    
  }
})