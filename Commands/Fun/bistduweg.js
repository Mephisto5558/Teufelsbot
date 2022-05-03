const { Command } = require("reconlx");

let random = Math.random() * 100;
let response;
let responseList = [
  'Naiiiiiin D:',
  'Ich würde niemals gehen!',
  'Bananensaft schmeckt lecker',
  'Ich kann garnicht weg sein, der Meph hält mich in seinem Keller gefangen und zwingt mich hier zu arbeiten! Hilf mir!!!!',
];   

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
    if (random <= 0.1) response = responseList[4]; //0,1%
    else if (random <= 10) return; //9,9%
    else if (random <= 20) response = responseList[2]; //10%
    else if (random <= 50) response = responseList[1]; //30%
    else responseList[0]; //70%
    
    client.functions.reply(response, message);
  }
})